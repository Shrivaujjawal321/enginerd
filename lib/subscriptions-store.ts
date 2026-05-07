import "server-only";

import { and, eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  subscriptions,
  payments,
  type SubscriptionRow,
} from "@/lib/db/schema";
import type { PlanId } from "@/lib/plans";

/* ============================================================================
 *  Subscription store — one row per user, mutated by both the success
 *  callback (after `verifyCheckoutSignature`) and the webhook handler.
 *
 *  Every mutation is idempotent — webhooks can fire multiple times for the
 *  same payment, and we mustn't double-grant access OR double-extend
 *  the period.
 * ============================================================================
 */

const PERIOD_MS = 30 * 86_400_000; // monthly default

/**
 *  Cached for 60s with a per-user tag. Subscription state is read on every
 *  authed dashboard request for plan gating, but flips only on activate /
 *  cancel — which both bust the tag.
 */
export async function getActiveSubscription(
  userId: string,
): Promise<SubscriptionRow | null> {
  const cached = unstable_cache(
    () => _getActiveSubscriptionUncached(userId),
    ["sub", userId],
    { revalidate: 60, tags: [`sub:${userId}`] },
  );
  return cached();
}

async function _getActiveSubscriptionUncached(
  userId: string,
): Promise<SubscriptionRow | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
    return row ?? null;
  } catch (err) {
    console.error("[subs] getActive failed", err);
    return null;
  }
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return "free";
  if (sub.status === "cancelled" || sub.status === "incomplete") return "free";
  // Even past_due users keep paid features for the grace period — Phase 9.5
  // will introduce a per-user grace_period_end. For MVP, paid = paid until
  // explicitly cancelled.
  return sub.plan as PlanId;
}

/**
 *  Activate a subscription after Razorpay confirms payment. Called both
 *  from `/api/checkout/verify` and the webhook handler.
 *
 *  Idempotent: if the user is already active on the same plan with a future
 *  period end, only a *new* payment id should extend it. Callers signal a
 *  new payment via `extend: true`. Without `extend`, this is a no-op when
 *  the user is already active and unexpired.
 */
export async function activateSubscription(args: {
  userId: string;
  plan: PlanId;
  razorpayCustomerId?: string | null;
  razorpaySubscriptionId?: string | null;
  periodStart?: Date;
  periodEnd?: Date;
  /** When true, push period end forward by one cycle from the later of
   *  (existing periodEnd, now). Used by /verify and `payment.captured`
   *  webhook only after a successful capture conditional-update. */
  extend?: boolean;
}): Promise<void> {
  if (!hasDatabase) return;
  const now = new Date();
  const existing = await getActiveSubscription(args.userId);

  // Compute the next period end:
  //   - explicit periodEnd wins
  //   - else if extending and existing period is still in the future,
  //     extend from existing.currentPeriodEnd
  //   - else start fresh from now
  let start = args.periodStart ?? now;
  let end: Date;
  if (args.periodEnd) {
    end = args.periodEnd;
  } else if (
    args.extend &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    start = existing.currentPeriodStart ?? now;
    end = new Date(existing.currentPeriodEnd.getTime() + PERIOD_MS);
  } else {
    end = new Date(start.getTime() + PERIOD_MS);
  }

  if (existing) {
    // No-op replay guard: same plan, still active, future period, NOT extending.
    if (
      !args.extend &&
      existing.plan === args.plan &&
      existing.status === "active" &&
      existing.currentPeriodEnd &&
      existing.currentPeriodEnd > now
    ) {
      return;
    }
    await db
      .update(subscriptions)
      .set({
        plan: args.plan,
        status: "active",
        razorpayCustomerId:
          args.razorpayCustomerId ?? existing.razorpayCustomerId,
        razorpaySubscriptionId:
          args.razorpaySubscriptionId ?? existing.razorpaySubscriptionId,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: "false",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, args.userId));
    revalidateTag(`sub:${args.userId}`, "max");
    return;
  }

  await db.insert(subscriptions).values({
    userId: args.userId,
    plan: args.plan,
    status: "active",
    razorpayCustomerId: args.razorpayCustomerId ?? null,
    razorpaySubscriptionId: args.razorpaySubscriptionId ?? null,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: "false",
  });
  revalidateTag(`sub:${args.userId}`, "max");
}

export async function markCancelAtPeriodEnd(
  userId: string,
): Promise<void> {
  if (!hasDatabase) return;
  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: "true", updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));
  revalidateTag(`sub:${userId}`, "max");
}

export async function markCancelled(userId: string): Promise<void> {
  if (!hasDatabase) return;
  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));
  revalidateTag(`sub:${userId}`, "max");
}

/* ---- Payment history ------------------------------------------------ */

export async function recordPaymentCreated(args: {
  userId: string;
  razorpayOrderId: string;
  plan: "pro" | "career";
  amountPaise: number;
}): Promise<void> {
  if (!hasDatabase) return;
  await db
    .insert(payments)
    .values({
      userId: args.userId,
      razorpayOrderId: args.razorpayOrderId,
      plan: args.plan,
      amountPaise: args.amountPaise,
      currency: "INR",
      status: "created",
    })
    .onConflictDoNothing();
}

/**
 *  Mark a payment as captured. Conditional on `status='created'` so replays
 *  (webhook retries, double success-handlers) become no-ops.
 *
 *  Returns the updated row when this call did the transition, or `null`
 *  when the row was already captured / failed / missing. Callers MUST
 *  gate any downstream side-effects (subscription activation, audit,
 *  analytics) on a non-null return.
 */
export async function recordPaymentCaptured(args: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  method?: string | null;
}): Promise<typeof payments.$inferSelect | null> {
  if (!hasDatabase) return null;
  const rows = await db
    .update(payments)
    .set({
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
      status: "captured",
      method: args.method ?? null,
      capturedAt: new Date(),
    })
    .where(
      and(
        eq(payments.razorpayOrderId, args.razorpayOrderId),
        eq(payments.status, "created"),
      ),
    )
    .returning();
  return rows[0] ?? null;
}

export async function recordPaymentFailed(args: {
  razorpayOrderId: string;
  reason: string;
}): Promise<void> {
  if (!hasDatabase) return;
  // Only created → failed; don't overwrite captured rows on a stale webhook.
  await db
    .update(payments)
    .set({ status: "failed", failureReason: args.reason })
    .where(
      and(
        eq(payments.razorpayOrderId, args.razorpayOrderId),
        eq(payments.status, "created"),
      ),
    );
}

export async function listUserPayments(userId: string, limit = 20) {
  if (!hasDatabase) return [];
  return db.query.payments.findMany({
    where: eq(payments.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}
