"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { PLANS } from "@/lib/plans";
import { formatINR } from "@/lib/format";

export function FinalCta() {
  const proPriceInr = formatINR(PLANS.pro.pricePaise);
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2) 60%, rgba(139,92,246,0.2))",
            }}
          />
          <GlassCard
            strong
            className="overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20"
          >
            <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              From zero to placement-ready — in 90 days.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
              Free forever for the basics — DSA, dashboards, all of it. Pro
              from {proPriceInr}/month, less than two coffees. Cancel anytime.
            </p>
            <div className="mt-9 flex justify-center">
              <Link href="/login">
                <Button size="lg">
                  Start your first lesson
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
