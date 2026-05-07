import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

import { auth } from "@/auth";
import { markCancelAtPeriodEnd } from "@/lib/subscriptions-store";
import { logAuditEvent } from "@/lib/audit";
import { apiMutationLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 *  POST /api/subscription/cancel
 *
 *  Marks the user's subscription `cancel_at_period_end = true`. They keep
 *  paid features until the current period ends; the renewal webhook
 *  (`subscription.cancelled` from Razorpay) finalizes the cancellation.
 *
 *  We don't immediately revoke access — that would be a refund question,
 *  handled separately from the dashboard.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // Mutation tier (30/min) — cancel is a deliberate action; the mutation
  // ceiling caps probing without blocking a confused user retrying.
  const rl = await apiMutationLimiter.limit(`cancel:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  await markCancelAtPeriodEnd(userId);
  waitUntil(
    logAuditEvent({ userId, event: "subscription.cancel.requested" }),
  );

  return NextResponse.json({
    ok: true,
    message:
      "Cancellation scheduled. You keep Pro features until the period ends.",
  });
}
