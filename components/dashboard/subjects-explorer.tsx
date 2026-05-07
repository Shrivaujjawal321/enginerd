"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { Subject, Difficulty } from "@/lib/mock-data/types";

type Props = {
  subjects: Subject[];
  /**
   * Live per-user progress (subjectSlug → percent). Falls back to 0 when
   * the user hasn't marked the subject complete. Replaces the hardcoded
   * `progressPct: 18` placeholders that used to live in mock-data.
   */
  progressBySubject?: Record<string, number>;
};

const DIFFICULTIES: ("All" | Difficulty)[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function SubjectsExplorer({
  subjects,
  progressBySubject = {},
}: Props) {
  const pctOf = React.useCallback(
    (slug: string) => progressBySubject[slug] ?? 0,
    [progressBySubject],
  );
  const categories = React.useMemo(
    () => ["All", ...new Set(subjects.map((s) => s.category))],
    [subjects],
  );

  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [activeDifficulty, setActiveDifficulty] = React.useState<
    "All" | Difficulty
  >("All");
  const [hasPracticeOnly, setHasPracticeOnly] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    return subjects.filter((s) => {
      if (activeCategory !== "All" && s.category !== activeCategory)
        return false;
      if (activeDifficulty !== "All" && s.difficulty !== activeDifficulty)
        return false;
      if (hasPracticeOnly && !s.hasPractice) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !s.title.toLowerCase().includes(q) &&
          !s.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [subjects, activeCategory, activeDifficulty, hasPracticeOnly, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "gradient-primary text-white shadow-sm shadow-violet-500/30"
                : "border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/[0.05]",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDifficulty(d)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-medium transition-colors",
                activeDifficulty === d
                  ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]",
              )}
            >
              {d}
            </button>
          ))}
          <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-slate-300">
            <Checkbox
              checked={hasPracticeOnly}
              onChange={(e) => setHasPracticeOnly(e.target.checked)}
            />
            Has practice
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04]">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            No subjects match those filters
          </h3>
          <p className="max-w-sm text-sm text-slate-400">
            Try removing a filter or searching for a different term.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((subject) => (
            <Link key={subject.slug} href={`/subjects/${subject.slug}`}>
              <GlassCard hoverable className="group flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white",
                      subject.iconAccent,
                    )}
                  >
                    <span className="text-sm font-bold">
                      {subject.title.charAt(0)}
                    </span>
                  </div>
                  <Badge variant="outline">{subject.difficulty}</Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-50">
                  {subject.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                  {subject.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <span>{subject.estHours}h</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>{subject.topicsCount} topics</span>
                  {subject.hasPractice ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="text-emerald-300">Practice</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {subject.roadmapSlugs.slice(0, 2).map((rs) => (
                    <Badge key={rs} variant="glass" className="!text-[10px] !py-0.5">
                      {rs.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>

                <div className="mt-5">
                  {pctOf(subject.slug) > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span className="text-slate-200">
                          {pctOf(subject.slug)}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${pctOf(subject.slug)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-100 group-hover:text-white">
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </p>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
