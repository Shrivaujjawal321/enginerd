"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { Roadmap, Subject } from "@/lib/mock-data/types";

// Reviews tab dropped — fake testimonials gone. Real reviews ship in
// Phase 9 along with the rating + ratings-aggregation pipeline.
const TABS = ["Overview", "Curriculum"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  roadmap: Roadmap;
  subjects: Subject[];
};

export function RoadmapTabs({ roadmap, subjects }: Props) {
  const [active, setActive] = React.useState<Tab>("Curriculum");
  const [openSubject, setOpenSubject] = React.useState<string | null>(
    subjects[0]?.slug ?? null,
  );

  return (
    <section className="space-y-6">
      <div role="tablist" className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              active === tab
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Overview" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <GlassCard className="p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-100">
              Why this roadmap?
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              {roadmap.whyThis.map((reason) => (
                <li key={reason} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            <h4 className="mt-7 text-base font-semibold text-slate-100">
              Skills you&apos;ll gain
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {roadmap.skills.map((skill) => (
                <Badge key={skill} variant="glass">
                  {skill}
                </Badge>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-base font-semibold text-slate-100">
              Companies hiring for this role
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Recent openings tagged to this roadmap.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {roadmap.companies.map((slug) => (
                <Link
                  key={slug}
                  href={`/careers/${slug}`}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-white/[0.05] text-[10px] font-bold uppercase text-slate-200">
                    {slug.slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium capitalize text-slate-100">
                    {slug}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}

      {active === "Curriculum" ? (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const expanded = openSubject === subject.slug;
            return (
              <GlassCard key={subject.slug} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSubject(expanded ? null : subject.slug)
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02]"
                  aria-expanded={expanded}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-xs font-semibold text-white",
                        subject.iconAccent,
                      )}
                    >
                      {subject.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {subject.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {subject.estHours}h · {subject.topicsCount} topics ·{" "}
                        {subject.difficulty}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded ? (
                  <div className="space-y-1 border-t border-white/[0.05] bg-white/[0.01] px-5 py-4">
                    {subject.topics.map((topic, i) => (
                      <div
                        key={topic.slug}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300"
                      >
                        <span className="text-xs font-mono text-slate-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">{topic.title}</span>
                        <span className="text-xs text-slate-400">
                          {topic.subtopics.length} sub-topics
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 border-t border-white/[0.05] pt-3">
                      <Link
                        href={`/subjects/${subject.slug}`}
                        className="text-sm font-medium text-slate-100 hover:text-white"
                      >
                        Open full subject →
                      </Link>
                    </div>
                  </div>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      ) : null}

    </section>
  );
}
