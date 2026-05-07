import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { payments } from "@/lib/db/schema";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import {
  activateSubscription,
  recordPaymentCaptured,
  recordPaymentFailed,
} from "@/lib/subscriptions-store";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { track } from "@/lib/analytics-server";
import { apiCheckoutLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 *  POST /api/checkout/verify
 *
 *  Step 2 of the Razorpay Checkout flow. The client forwards the popup's
 *  three success fields here. We verify the HMAC signature server-side —
 *  this is the ONLY trustworthy way to know the payment cleared.
 *
 *  On valid signature:
 *    1. Mark `payments` row as captured.
 *    2. Activate the user's subscription.
 *    3. Audit + analytics.
 *
 *  Idempotent — replay attacks return early since the payment row's
 *  `razorpay_payment_id` unique index would conflict.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // 10/min via checkout tier — verification is part of the success flow;
  // spam-proof and shares the budget with create-order so a brute-force
  // signature replay can't bypass via the other endpoint.
  const rl = await apiCheckoutLimiter.limit(`verify:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "validation", details: err instanceof Error ? err.message : "" },
      { status: 400 },
    );
  }

  const valid = verifyCheckoutSignature({
    orderId: parsed.razorpay_order_id,
    paymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
  });

  if (!valid) {
    logger.warn("checkout.verify.bad_signature", {
      userId,
      orderId: parsed.razorpay_order_id,
    });
    waitUntil(
      recordPaymentFailed({
        razorpayOrderId: parsed.razorpay_order_id,
        reason: "signature_mismatch",
      }),
    );
    waitUntil(
      logAuditEvent({
        userId,
        event: "checkout.signature.invalid",
        metadata: { orderId: parsed.razorpay_order_id },
      }),
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "no_database" }, { status: 503 });
  }

  // Look up the order to know which plan was being purchased + that it
  // belongs to this user (defense-in-depth — Razorpay's `notes.userId`
  // would also tell us, but DB is the local source of truth).
  let order: typeof payments.$inferSelect | null = null;
  try {
    order =
      (await db.query.payments.findFirst({
        where: eq(payments.razorpayOrderId, parsed.razorpay_order_id),
      })) ?? null;
  } catch {
    // ignore — handled below
  }

  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }
  if (order.userId !== userId) {
    logger.warn("checkout.verify.user_mismatch", {
      userId,
      orderUserId: order.userId,
      orderId: order.razorpayOrderId,
    });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Conditional: only proceeds when the row is still in 'created' state.
  // If the webhook already captured it, this is a no-op and we DO NOT
  // re-activate the subscription — preventing double-extend on replays.
  const captured = await recordPaymentCaptured({
    razorpayOrderId: parsed.razorpay_order_id,
    razorpayPaymentId: parsed.razorpay_payment_id,
    razorpaySignature: parsed.razorpay_signature,
    method: null, // populated by webhook with `payment.captured` event
  });

  if (!captured) {
    // Already captured (by webhook or a concurrent verify call) — return
    // the current activation state without re-extending.
    return NextResponse.json({
      ok: true,
      plan: order.plan,
      alreadyActivated: true,
    });
  }

  // Activation is correctness-critical — keep it awaited so the response
  // doesn't claim success before plan flip is durable.
  await activateSubscription({
    userId,
    plan: order.plan as "pro" | "career",
    extend: true,
  });

  // Audit + analytics deferred — no user impact if they take an extra 100ms.
  waitUntil(
    logAuditEvent({
      userId,
      event: "checkout.activated",
      metadata: {
        plan: order.plan,
        orderId: parsed.razorpay_order_id,
        paymentId: parsed.razorpay_payment_id,
      },
    }),
  );
  waitUntil(
    track({
      distinctId: userId,
      event: "auth.signup", // reusing typed event — Phase 9.5 add 'subscription.activated'
      properties: {
        plan: order.plan,
        amount_paise: order.amountPaise,
        provider: "razorpay",
      },
    }),
  );

  return NextResponse.json({
    ok: true,
    plan: order.plan,
    activatedAt: new Date().toISOString(),
  });
}
