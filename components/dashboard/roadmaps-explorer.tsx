"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Map,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { Roadmap, RoadmapCategory } from "@/lib/mock-data/types";

const CATEGORY_FILTERS: ("All" | RoadmapCategory)[] = [
  "All",
  "Web Development",
  "Mobile",
  "Data & ML",
  "DevOps & Cloud",
  "Systems",
  "Game Dev",
  "Security",
  "Blockchain",
];

type SortKey = "popular" | "duration" | "difficulty";

const SORT_LABEL: Record<SortKey, string> = {
  popular: "Most learners",
  duration: "Shortest first",
  difficulty: "Difficulty",
};

const DIFFICULTY_RANK: Record<Roadmap["difficulty"], number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

type Props = {
  roadmaps: Roadmap[];
  /**
   * Live enrollment numbers per roadmap slug, computed from the
   * `cohort_members` table. When absent the card hides the chip rather
   * than showing a fabricated number.
   */
  liveStats?: Record<string, { enrolled: number }>;
  /**
   * Per-user roadmap completion (slug → 0..100). Computed from
   * `user_progress` joined to `roadmap.subjectSlugs`. Replaces the static
   * `progressPct: 34` placeholder from mock-data.
   */
  progressByRoadmap?: Record<string, number>;
};

export function RoadmapsExplorer({
  roadmaps,
  liveStats = {},
  progressByRoadmap = {},
}: Props) {
  const enrolledOf = React.useCallback(
    (slug: string) => liveStats[slug]?.enrolled ?? 0,
    [liveStats],
  );
  const progressOf = React.useCallback(
    (slug: string) => progressByRoadmap[slug] ?? 0,
    [progressByRoadmap],
  );
  const [activeCategory, setActiveCategory] = React.useState<
    "All" | RoadmapCategory
  >("All");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("popular");

  const filtered = React.useMemo(() => {
    let list = roadmaps;
    if (activeCategory !== "All") {
      list = list.filter((r) => r.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    const sorted = [...list];
    if (sort === "popular") {
      // "Most learners" — sorted by live enrollment, fallback alphabetical.
      sorted.sort((a, b) => {
        const dx = enrolledOf(b.slug) - enrolledOf(a.slug);
        return dx !== 0 ? dx : a.title.localeCompare(b.title);
      });
    } else if (sort === "duration") {
      sorted.sort((a, b) => a.durationMonths - b.durationMonths);
    } else {
      sorted.sort(
        (a, b) =>
          DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
      );
    }
    return sorted;
  }, [roadmaps, activeCategory, query, sort, enrolledOf]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((cat) => (
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
            placeholder="Search by title, skill, or description"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by</span>
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-medium transition-colors",
                  sort === key
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {SORT_LABEL[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04]">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            No roadmaps match those filters
          </h3>
          <p className="max-w-sm text-sm text-slate-400">
            Try removing some filters or searching for a different skill.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rm) => (
            <Link key={rm.slug} href={`/roadmaps/${rm.slug}`}>
              <GlassCard hoverable className="group flex h-full flex-col">
                <div
                  className={cn(
                    "h-28 rounded-t-2xl bg-gradient-to-br p-5",
                    rm.thumbnailAccent,
                  )}
                >
                  <div className="flex items-start justify-between">
                    <Map className="h-6 w-6 text-white/90" />
                    <Badge variant="glass" className="!bg-black/30">
                      {rm.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge variant="outline" className="self-start">
                    {rm.category}
                  </Badge>
                  <h3 className="mt-3 text-lg font-semibold text-slate-50">
                    {rm.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
                    {rm.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{rm.subjectsCount} subjects</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>{rm.topicsCount} topics</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>{rm.durationMonths} months</span>
                  </div>

                  {/* Rating chip removed — review system is Phase 9 work,
                      until then we don't fake stars. Enrolled chip shows
                      only when the cohort has at least one real learner. */}
                  {enrolledOf(rm.slug) > 0 ? (
                    <div className="mt-3 flex items-center text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {enrolledOf(rm.slug).toLocaleString()} learner
                        {enrolledOf(rm.slug) === 1 ? "" : "s"}
                      </span>
                    </div>
                  ) : null}

                  {progressOf(rm.slug) > 0 ? (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Your progress</span>
                        <span className="text-slate-200">
                          {progressOf(rm.slug)}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${progressOf(rm.slug)}%` }}
                        />
                      </div>
                      <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-100 group-hover:text-white">
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  ) : (
                    <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-100 group-hover:text-white">
                      Start learning
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
