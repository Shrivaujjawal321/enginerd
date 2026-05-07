"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Circle, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { Problem, ProblemDifficulty } from "@/lib/mock-data/types";

type Props = { problems: Problem[] };

const DIFFICULTIES: ("All" | ProblemDifficulty)[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "unsolved", label: "Unsolved" },
  { key: "attempted", label: "Attempted" },
  { key: "solved", label: "Solved" },
] as const;
type StatusKey = (typeof STATUS_FILTERS)[number]["key"];

const DIFFICULTY_COLOR: Record<ProblemDifficulty, string> = {
  Easy: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  Medium: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  Hard: "bg-rose-500/10 border-rose-500/20 text-rose-300",
};

export function PracticeExplorer({ problems }: Props) {
  const topics = React.useMemo(
    () => ["All", ...new Set(problems.map((p) => p.topic))],
    [problems],
  );
  const companies = React.useMemo(
    () => ["All", ...new Set(problems.flatMap((p) => p.companies))],
    [problems],
  );

  const [activeDifficulty, setActiveDifficulty] = React.useState<
    "All" | ProblemDifficulty
  >("All");
  const [activeTopic, setActiveTopic] = React.useState<string>("All");
  const [activeCompany, setActiveCompany] = React.useState<string>("All");
  const [activeStatus, setActiveStatus] = React.useState<StatusKey>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    return problems.filter((p) => {
      if (activeDifficulty !== "All" && p.difficulty !== activeDifficulty)
        return false;
      if (activeTopic !== "All" && p.topic !== activeTopic) return false;
      if (
        activeCompany !== "All" &&
        !p.companies.includes(activeCompany)
      )
        return false;
      if (activeStatus !== "all" && p.status !== activeStatus) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.topic.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [problems, activeDifficulty, activeTopic, activeCompany, activeStatus, query]);

  const stats = React.useMemo(() => {
    const solved = problems.filter((p) => p.status === "solved").length;
    return {
      solved,
      attempted: problems.filter((p) => p.status === "attempted").length,
      total: problems.length,
      accuracy: solved
        ? Math.round((solved / (solved + 6)) * 100)
        : 0,
    };
  }, [problems]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Solved
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {stats.solved} <span className="text-slate-400">/ {stats.total}</span>
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Current streak
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">12 days</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Accuracy
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {stats.accuracy}%
          </p>
        </GlassCard>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems by title or topic"
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Pill
            label="Difficulty"
            options={DIFFICULTIES}
            value={activeDifficulty}
            onChange={(v) => setActiveDifficulty(v as "All" | ProblemDifficulty)}
          />
          <Pill
            label="Topic"
            options={topics}
            value={activeTopic}
            onChange={setActiveTopic}
          />
          <Pill
            label="Company"
            options={companies}
            value={activeCompany}
            onChange={setActiveCompany}
            capitalize
          />
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveStatus(s.key)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 font-medium transition-colors",
                  activeStatus === s.key
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="hidden grid-cols-[40px_1fr_120px_140px_180px_120px] gap-3 border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid">
          <span>#</span>
          <span>Title</span>
          <span>Difficulty</span>
          <span>Topic</span>
          <span>Companies</span>
          <span>Status</span>
        </div>
        <ul>
          {filtered.length === 0 ? (
            <li className="px-6 py-12 text-center text-sm text-slate-400">
              No problems match those filters. Try removing a few.
            </li>
          ) : null}
          {filtered.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/practice/${p.slug}`}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[40px_1fr_120px_140px_180px_120px]"
              >
                <span className="hidden font-mono text-xs text-slate-400 sm:inline">
                  {p.number}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                    {p.topic} · {p.difficulty}
                  </p>
                </div>
                <span
                  className={cn(
                    "hidden w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-medium sm:inline",
                    DIFFICULTY_COLOR[p.difficulty],
                  )}
                >
                  {p.difficulty}
                </span>
                <span className="hidden text-xs text-slate-300 sm:inline">
                  {p.topic}
                </span>
                <div className="hidden flex-wrap gap-1 sm:flex">
                  {p.companies.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] uppercase text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <StatusBadge status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function Pill<T extends string>({
  label,
  options,
  value,
  onChange,
  capitalize,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  capitalize?: boolean;
}) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.05]",
          value !== "All" && "border-violet-400/30 bg-violet-500/15 text-violet-200",
        )}
      >
        <span className="text-slate-400">{label}:</span>
        <span className={cn(capitalize && "capitalize")}>{value}</span>
      </summary>
      <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-44 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#12121a]/95 p-1 shadow-2xl backdrop-blur-xl">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={(e) => {
              onChange(opt);
              (e.currentTarget.closest("details") as HTMLDetailsElement).open = false;
            }}
            className={cn(
              "block w-full rounded-lg px-3 py-1.5 text-left text-xs",
              value === opt
                ? "bg-white/[0.07] text-white"
                : "text-slate-300 hover:bg-white/[0.05]",
              capitalize && "capitalize",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </details>
  );
}

function StatusBadge({ status }: { status: Problem["status"] }) {
  if (status === "solved") {
    return (
      <Badge variant="success" className="!gap-1">
        <Check className="h-3 w-3" />
        Solved
      </Badge>
    );
  }
  if (status === "attempted") {
    return (
      <Badge variant="warning" className="!gap-1">
        <Loader2 className="h-3 w-3" />
        Attempted
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="!gap-1">
      <Circle className="h-3 w-3" />
      Unsolved
    </Badge>
  );
}
