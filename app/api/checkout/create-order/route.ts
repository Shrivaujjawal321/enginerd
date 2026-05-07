import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { env, hasRazorpay } from "@/lib/env";
import { PLANS, type PlanId } from "@/lib/plans";
import { createOrder } from "@/lib/razorpay";
import { recordPaymentCreated } from "@/lib/subscriptions-store";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { apiCheckoutLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  plan: z.enum(["pro", "career"]),
});

/**
 *  POST /api/checkout/create-order
 *
 *  Server-side step 1 of the Razorpay Checkout flow:
 *    1. Auth-required.
 *    2. Server picks the plan price (never trusts client-supplied amount).
 *    3. Creates a Razorpay Order, stores it as `payments.created`.
 *    4. Returns `{ orderId, amount, currency, keyId }` for the client to
 *       open Razorpay Checkout.
 *
 *  The actual payment + signature verification happens in
 *  `/api/checkout/verify` after the client-side popup completes.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // Rate limit per-user via dedicated checkout tier (10/min). A normal user
  // creates ~1 order at a time; tight ceiling protects Razorpay API quota,
  // payment row spam, and abuse.
  const rl = await apiCheckoutLimiter.limit(`checkout:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  if (!hasRazorpay) {
    return NextResponse.json(
      {
        error: "razorpay_not_configured",
        message:
          "Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in env to enable checkout.",
      },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "validation", details: err instanceof Error ? err.message : "" },
      { status: 400 },
    );
  }

  const plan = PLANS[parsed.plan as PlanId];
  if (!plan || plan.pricePaise <= 0) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  try {
    const order = await createOrder({
      amountPaise: plan.pricePaise,
      currency: "INR",
      receipt: `${userId.slice(0, 8)}-${plan.id}-${Date.now()}`,
      notes: {
        userId,
        plan: plan.id,
        env: env.NODE_ENV,
      },
    });

    await recordPaymentCreated({
      userId,
      razorpayOrderId: order.id,
      plan: plan.id as "pro" | "career",
      amountPaise: plan.pricePaise,
    });

    await logAuditEvent({
      userId,
      event: "checkout.order.created",
      metadata: { orderId: order.id, plan: plan.id, amount: plan.pricePaise },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      plan: plan.id,
      planName: plan.name,
    });
  } catch (err) {
    logger.error("checkout.create.failed", {
      userId,
      err: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
