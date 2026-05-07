import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Calendar, GitCommit } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import { listCycles } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Every cycle EngiNerd has shipped — audits, decisions, retracted claims, and verified outcomes. Built in public.",
};

export const revalidate = 3600;

/**
 *  /changelog — public timeline of every cycle the tech-team agentic system
 *  has shipped. Each entry is a card linking to a per-cycle detail page that
 *  renders the full report. The whole purpose: surface the ~22 weeks of
 *  disciplined-shipping work we already have, since that record is the
 *  single strongest portfolio signal on the platform.
 */
export default async function ChangelogPage() {
  const cycles = await listCycles();

  const total = cycles.length;
  const latestDate = cycles[0]?.date;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 border-b border-white/[0.06] pb-8">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
          <GitCommit className="h-3 w-3" />
          Built in public
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Changelog
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
          Every cycle EngiNerd has shipped — what we audited, what we decided,
          which audit claims we retracted on verification, and what landed
          green. The tech-team is a multi-agent improvement loop; this is its
          public record.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-400">
              Cycles shipped
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
              {total}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-400">
              Latest
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
              {latestDate ?? "—"}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs uppercase tracking-wider text-slate-400">
              Cadence
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
              ~1 / day
            </dd>
          </div>
        </dl>
      </header>

      <ol className="space-y-4">
        {cycles.map((cycle) => (
          <li key={cycle.number}>
            <Link
              href={`/changelog/${cycle.number}`}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-2xl"
            >
              <GlassCard className="p-5 transition-colors group-hover:border-white/15 group-hover:bg-white/[0.04] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-xs font-bold text-violet-100"
                    >
                      {cycle.number}
                    </span>
                    <div>
                      <h2 className="text-base font-semibold leading-tight text-slate-50 sm:text-lg">
                        {cycle.title}
                      </h2>
                      {cycle.date ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {cycle.date}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-100" />
                </div>
                {cycle.themePreview ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {cycle.themePreview}
                  </p>
                ) : null}
              </GlassCard>
            </Link>
          </li>
        ))}
      </ol>

      {total === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-slate-300">
          <p>No cycles published yet.</p>
        </GlassCard>
      ) : null}
    </div>
  );
}
