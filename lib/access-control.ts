import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  PLANS,
  planMeets,
  type PlanId,
} from "@/lib/plans";
import { getUserPlan } from "@/lib/subscriptions-store";

/* ============================================================================
 *  Plan gating helpers — server-side only.
 *
 *  Usage in a Server Component:
 *
 *    export default async function PremiumPage() {
 *      await requirePlan("pro");      // redirects to /billing if free
 *      return <PaidContent />;
 *    }
 *
 *  Usage as a soft check:
 *
 *    const plan = await getCurrentUserPlan();
 *    if (planMeets(plan, "pro")) { ... show upgrade-only block ... }
 * ============================================================================
 */

/** Plan of the currently-signed-in user. Returns "free" when no session. */
export async function getCurrentUserPlan(): Promise<PlanId> {
  const session = await auth();
  if (!session?.user?.id) return "free";
  return getUserPlan(session.user.id);
}

/**
 *  Hard gate. Use in any Server Component that should be locked behind
 *  a paid plan. Redirects to `/billing?upgrade=<plan>` for the user to see
 *  why they were bounced.
 */
export async function requirePlan(plan: PlanId): Promise<void> {
  const actual = await getCurrentUserPlan();
  if (!planMeets(actual, plan)) {
    redirect(`/billing?upgrade=${plan}`);
  }
}

/** Friendly plan label for UI strings. */
export function planLabel(plan: PlanId): string {
  return PLANS[plan].name;
}
