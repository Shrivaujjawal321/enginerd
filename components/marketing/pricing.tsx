"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/marketing/upgrade-button";
import { PLANS } from "@/lib/plans";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------- *
 *  Pricing — driven by `lib/plans.ts` (single source of truth).
 *  Free tier links to /login. Pro + Career use UpgradeButton which opens
 *  Razorpay Checkout via /api/checkout/create-order.
 * ----------------------------------------------------------------------- */

const ORDER: Array<keyof typeof PLANS> = ["free", "pro", "career"];

function formatPrice(paise: number): { amount: string; period: string } {
  if (paise === 0) return { amount: "₹0", period: "forever" };
  return { amount: formatINR(paise), period: "/ month" };
}

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Pricing students actually respect.
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Free forever. Pro {formatINR(PLANS.pro.pricePaise)}/month — less
            than two coffees. Career tier when you&apos;re serious about
            offers.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {ORDER.map((id, i) => {
            const tier = PLANS[id];
            const { amount, period } = formatPrice(tier.pricePaise);
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn("relative", tier.popular && "lg:scale-[1.03]")}
              >
                {tier.popular ? (
                  <div className="absolute inset-x-0 -top-3 flex justify-center">
                    <Badge
                      variant="gradient"
                      className="px-3 py-1 text-[11px] uppercase tracking-wider"
                    >
                      Most popular
                    </Badge>
                  </div>
                ) : null}
                <GlassCard
                  strong={tier.popular}
                  className={cn(
                    "flex h-full flex-col p-8",
                    tier.popular && "ring-glow-primary",
                  )}
                >
                  <h3 className="text-lg font-semibold text-slate-100">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{tier.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-slate-50">
                      {amount}
                    </span>
                    <span className="text-sm text-slate-400">{period}</span>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {tier.id === "free" ? (
                      <Link href="/login">
                        <Button variant="glass" className="w-full">
                          Start free
                        </Button>
                      </Link>
                    ) : (
                      <UpgradeButton
                        plan={tier.id as "pro" | "career"}
                        planName={tier.name}
                        variant={tier.popular ? "primary" : "glass"}
                      >
                        Upgrade to {tier.name}
                      </UpgradeButton>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          All payments are processed by{" "}
          <a
            href="https://razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Razorpay
          </a>
          . UPI, cards, netbanking, wallets — no card data touches our servers.
        </p>
      </div>
    </section>
  );
}
