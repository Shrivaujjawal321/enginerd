import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";
import { PLANS, type PlanId } from "@/lib/plans";
import { formatDate, formatINR } from "@/lib/format";
import {
  getActiveSubscription,
  listUserPayments,
} from "@/lib/subscriptions-store";

export const metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline"> = {
  active: "success",
  trialing: "success",
  past_due: "warning",
  cancelled: "outline",
  incomplete: "warning",
  captured: "success",
  created: "outline",
  failed: "warning",
  refunded: "outline",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [subscription, history] = await Promise.all([
    getActiveSubscription(session.user.id),
    listUserPayments(session.user.id, 20),
  ]);

  const plan = (subscription?.plan ?? "free") as PlanId;
  const planDef = PLANS[plan];
  const isPaid = plan !== "free";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Billing
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Your plan, payment history, and subscription controls — all in one
          place.
        </p>
      </header>

      {/* ===== Current plan card ======================================== */}
      <GlassCard strong className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-lg shadow-violet-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Current plan
              </p>
              <h2 className="mt-0.5 flex items-center gap-2 text-xl font-semibold text-slate-50">
                {planDef.name}
                {subscription ? (
                  <Badge
                    variant={
                      STATUS_VARIANT[subscription.status] ?? "outline"
                    }
                  >
                    {subscription.status}
                  </Badge>
                ) : null}
                {subscription?.cancelAtPeriodEnd === "true" ? (
                  <Badge variant="warning">Cancelling at period end</Badge>
                ) : null}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{planDef.tagline}</p>
              {isPaid && subscription?.currentPeriodEnd ? (
                <p className="mt-1 text-xs text-slate-400">
                  Renews on {formatDate(subscription.currentPeriodEnd)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {isPaid ? (
              <CancelSubscriptionButton />
            ) : (
              <Link href="/#pricing">
                <Button>
                  Upgrade
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2">
          {planDef.features.map((f) => (
            <div
              key={f}
              className="flex items-start gap-2 text-sm text-slate-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ===== Trust signals (Razorpay + PCI + GST) ==================== */}
      <GlassCard className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                256-bit TLS
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Every checkout call is encrypted end-to-end. We never see your
                card or UPI credentials.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Razorpay · PCI-DSS Level 1
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Payments handled by India&apos;s most-used gateway. Same
                infrastructure that processes Swiggy, Zomato, and CRED.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-300">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                GST invoice + 7-day refund
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Every paid plan ships a GSTIN-tagged invoice. See{" "}
                <Link
                  href="/refunds"
                  className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
                >
                  refund policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ===== Payment history ========================================== */}
      <section>
        <header className="mb-3 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Payment history
          </h2>
        </header>
        <GlassCard className="overflow-hidden p-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white shadow-lg shadow-violet-500/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <p className="text-base text-slate-200">No payments yet.</p>
              <p className="max-w-xs text-sm text-slate-400">
                You&apos;re on the Free tier. Upgrade to Pro to unlock the AI
                mentor and every roadmap.
              </p>
              <Link href="/#pricing" className="mt-1">
                <Button>
                  View plans
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-white/[0.03]">
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-2.5 text-left">Date</th>
                    <th className="px-4 py-2.5 text-left">Plan</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-left">Method</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-white/[0.04] text-slate-300"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                        {formatDate(p.capturedAt ?? p.createdAt)}
                      </td>
                      <td className="px-4 py-3 capitalize">{p.plan}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-100">
                        {formatINR(p.amountPaise)}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase text-slate-400">
                        {p.method ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={STATUS_VARIANT[p.status] ?? "outline"}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </section>

      {/* ===== Footer notes — links to legal surfaces =================== */}
      <p className="text-center text-xs text-slate-400">
        Questions about a charge?{" "}
        <Link
          href="/contact"
          className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          Contact us
        </Link>
        {" "}— we reply within 1 working day. By upgrading you agree to our{" "}
        <Link
          href="/terms"
          className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          Terms
        </Link>
        {" "}and{" "}
        <Link
          href="/privacy"
          className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
