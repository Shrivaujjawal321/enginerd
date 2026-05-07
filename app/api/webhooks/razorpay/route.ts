import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  payments,
  razorpayWebhookEvents,
  subscriptions,
} from "@/lib/db/schema";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  activateSubscription,
  markCancelled,
  recordPaymentCaptured,
  recordPaymentFailed,
} from "@/lib/subscriptions-store";
import { logger } from "@/lib/logger";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 *  POST /api/webhooks/razorpay
 *
 *  Razorpay-signed event handler. Configure in
 *  Razorpay Dashboard → Settings → Webhooks → Add webhook
 *    - URL:       https://enginerd.in/api/webhooks/razorpay
 *    - Events:    payment.captured, payment.failed,
 *                 subscription.charged, subscription.cancelled
 *    - Secret:    paste into RAZORPAY_WEBHOOK_SECRET
 *
 *  This is the source of truth for payment state — even if the user closes
 *  the browser before /api/checkout/verify fires, this webhook confirms
 *  the captured payment within seconds.
 *
 *  SECURITY: We never trust `notes.userId` / `notes.plan` from Razorpay
 *  payloads — those are user-controlled metadata. We always look up our own
 *  `payments` row by `razorpayOrderId` and use its server-stored userId/plan.
 */

type RazorpayWebhook = {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method?: string;
        notes?: Record<string, string>;
        error_description?: string;
      };
    };
    subscription?: {
      entity: {
        id: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // Razorpay signs the *raw* body — we MUST read it as text first, before
  // any JSON parse. NextRequest's `text()` returns the original bytes.
  const rawBody = await req.text();

  if (!verifyWebhookSignature({ rawBody, signature })) {
    logger.warn("razorpay.webhook.bad_signature", {
      length: rawBody.length,
    });
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  logger.info("razorpay.webhook.received", { event: event.event });

  if (!hasDatabase) {
    // 200 — Razorpay retries 3xx/5xx. Don't make them retry forever just
    // because our DB is unconfigured.
    return NextResponse.json({ ok: true, db: "unconfigured" });
  }

  // Event-id idempotency: dedupe at the delivery level so a transient DB
  // error AFTER capture but BEFORE activation can't get re-applied on retry.
  // Razorpay sends `x-razorpay-event-id`; if missing, hash the body.
  const eventId =
    req.headers.get("x-razorpay-event-id") ??
    `body:${createHash("sha256").update(rawBody).digest("hex").slice(0, 32)}`;
  try {
    const inserted = await db
      .insert(razorpayWebhookEvents)
      .values({ eventId, eventType: event.event })
      .onConflictDoNothing()
      .returning({ id: razorpayWebhookEvents.eventId });
    if (inserted.length === 0) {
      // Already processed — return 200 fast so Razorpay stops retrying.
      return NextResponse.json({ ok: true, replay: true });
    }
  } catch (err) {
    // Idempotency table failure shouldn't block a real payment. Log and proceed.
    logger.warn("razorpay.webhook.idempotency_table_failed", {
      err: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const p = event.payload.payment?.entity;
        if (!p) break;

        // Look up OUR row by order_id (server-trusted). Never use notes.
        const order = await db.query.payments.findFirst({
          where: eq(payments.razorpayOrderId, p.order_id),
        });
        if (!order) {
          logger.warn("razorpay.webhook.payment.unknown_order", {
            orderId: p.order_id,
            paymentId: p.id,
          });
          // 200 — don't make Razorpay retry an order we never created.
          break;
        }

        // Validate the captured amount + currency match what we asked for.
        if (
          p.amount !== order.amountPaise ||
          (p.currency ?? "INR") !== (order.currency ?? "INR")
        ) {
          logger.warn("razorpay.webhook.payment.amount_mismatch", {
            orderId: p.order_id,
            expectedPaise: order.amountPaise,
            actualPaise: p.amount,
            expectedCurrency: order.currency,
            actualCurrency: p.currency,
          });
          // Treat as fraud signal — don't activate.
          break;
        }

        // Idempotent capture: only proceeds if row was 'created'.
        const captured = await recordPaymentCaptured({
          razorpayOrderId: p.order_id,
          razorpayPaymentId: p.id,
          razorpaySignature: signature, // webhook sig, NOT checkout sig
          method: p.method ?? null,
        });

        if (!captured) {
          // Already captured by /api/checkout/verify or a previous webhook —
          // no-op so we don't double-extend the period.
          logger.info("razorpay.webhook.payment.already_captured", {
            orderId: p.order_id,
          });
          break;
        }

        // First time seeing this capture — extend the user's plan.
        await activateSubscription({
          userId: order.userId,
          plan: order.plan as "pro" | "career",
          extend: true,
        });
        waitUntil(
          logAuditEvent({
            userId: order.userId,
            event: "webhook.payment.captured",
            metadata: {
              paymentId: p.id,
              plan: order.plan,
              amount: p.amount,
            },
          }),
        );
        break;
      }

      case "payment.failed": {
        const p = event.payload.payment?.entity;
        if (!p) break;
        const order = await db.query.payments.findFirst({
          where: eq(payments.razorpayOrderId, p.order_id),
        });
        if (!order) break;
        await recordPaymentFailed({
          razorpayOrderId: p.order_id,
          reason: p.error_description ?? "unknown",
        });
        waitUntil(
          logAuditEvent({
            userId: order.userId,
            event: "webhook.payment.failed",
            metadata: { paymentId: p.id, reason: p.error_description },
          }),
        );
        break;
      }

      case "subscription.charged": {
        // Renewal — extends the current period by another month.
        const sub = event.payload.subscription?.entity;
        if (!sub) break;
        // Look up by razorpaySubscriptionId — server-trusted lookup.
        const localSub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.razorpaySubscriptionId, sub.id),
        });
        if (!localSub) {
          logger.warn("razorpay.webhook.subscription.unknown", {
            subscriptionId: sub.id,
          });
          break;
        }
        await activateSubscription({
          userId: localSub.userId,
          plan: localSub.plan as "pro" | "career",
          razorpaySubscriptionId: sub.id,
          extend: true,
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;
        const localSub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.razorpaySubscriptionId, sub.id),
        });
        if (!localSub) break;
        await markCancelled(localSub.userId);
        waitUntil(
          logAuditEvent({
            userId: localSub.userId,
            event: "webhook.subscription.cancelled",
            metadata: { subscriptionId: sub.id },
          }),
        );
        break;
      }

      default:
        logger.info("razorpay.webhook.unhandled", { event: event.event });
    }
  } catch (err) {
    logger.error("razorpay.webhook.process.failed", {
      event: event.event,
      err: err instanceof Error ? err.message : String(err),
    });
    // 500 → Razorpay retries with backoff. Good for transient DB errors.
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
