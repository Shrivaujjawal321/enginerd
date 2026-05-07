"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Clock,
  IndianRupee,
  MapPin,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { JobPosting, Company } from "@/lib/mock-data/types";

type Props = {
  jobs: JobPosting[];
  companies: Record<string, Company>;
};

const REMOTE_FILTERS = ["All", "Remote", "Hybrid", "On-site"] as const;
const EXPERIENCE_FILTERS = [
  { key: "all", label: "Any", min: 0, max: 999 },
  { key: "0-2", label: "0–2 yrs", min: 0, max: 2 },
  { key: "2-5", label: "2–5 yrs", min: 2, max: 5 },
  { key: "5+", label: "5+ yrs", min: 5, max: 999 },
] as const;

export function CareersExplorer({ jobs, companies }: Props) {
  const stacks = React.useMemo(
    () => ["All", ...new Set(jobs.flatMap((j) => j.techStack))],
    [jobs],
  );

  const [remote, setRemote] = React.useState<(typeof REMOTE_FILTERS)[number]>(
    "All",
  );
  const [exp, setExp] = React.useState<(typeof EXPERIENCE_FILTERS)[number]>(
    EXPERIENCE_FILTERS[0],
  );
  const [stack, setStack] = React.useState<string>("All");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    return jobs.filter((j) => {
      if (remote !== "All" && j.remoteType !== remote) return false;
      if (exp.key !== "all") {
        if (j.experienceMin > exp.max || j.experienceMax < exp.min) {
          return false;
        }
      }
      if (stack !== "All" && !j.techStack.includes(stack)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const company = companies[j.companySlug];
        if (
          !j.title.toLowerCase().includes(q) &&
          !company?.name.toLowerCase().includes(q) &&
          !j.location.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [jobs, remote, exp, stack, query, companies]);

  return (
    <div className="space-y-6">
      <GlassCard
        strong
        className="p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))",
        }}
      >
        <div className="flex items-center gap-3">
          <Badge variant="gradient">Match score</Badge>
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-slate-100">78%</span> overall —
            based on Java Full Stack roadmap progress
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full gradient-primary"
            style={{ width: "78%" }}
          />
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role, company, or location"
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          <span className="px-2 text-slate-400">Mode</span>
          {REMOTE_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRemote(r)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-medium transition-colors",
                remote === r
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          <span className="px-2 text-slate-400">Experience</span>
          {EXPERIENCE_FILTERS.map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => setExp(e)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 font-medium transition-colors",
                exp.key === e.key
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
        <details className="group relative">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-medium text-slate-300 hover:bg-white/[0.05]",
              stack !== "All" && "border-violet-400/30 bg-violet-500/15 text-violet-200",
            )}
          >
            <span className="text-slate-400">Stack:</span>
            <span>{stack}</span>
          </summary>
          <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-44 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#12121a]/95 p-1 shadow-2xl backdrop-blur-xl">
            {stacks.map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  setStack(s);
                  (e.currentTarget.closest("details") as HTMLDetailsElement).open = false;
                }}
                className={cn(
                  "block w-full rounded-lg px-3 py-1.5 text-left text-xs",
                  stack === s
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-300 hover:bg-white/[0.05]",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </details>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04]">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            No jobs match those filters
          </h3>
          <p className="max-w-sm text-sm text-slate-400">
            Try widening the experience or mode filter, or removing the stack.
          </p>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {filtered.map((job) => {
            const company = companies[job.companySlug];
            if (!company) return null;
            return (
              <li key={job.id}>
                <GlassCard hoverable className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <Link
                    href={`/careers/${company.slug}`}
                    className="flex shrink-0 items-center gap-3"
                  >
                    <div
                      className={cn(
                        "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                        company.accent,
                      )}
                    >
                      {company.shortName.slice(0, 2)}
                    </div>
                    <div className="sm:hidden">
                      <p className="text-sm font-semibold text-slate-100">
                        {company.name}
                      </p>
                    </div>
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div>
                      <Link
                        href={`/careers/${company.slug}`}
                        className="hidden text-sm font-medium text-slate-400 hover:text-white sm:inline"
                      >
                        {company.name} · Verified
                      </Link>
                      <p className="text-base font-semibold text-slate-50">
                        {job.title}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.remoteType}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {job.experienceMin}–{job.experienceMax} yrs
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {job.salaryMin}–{job.salaryMax} LPA
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {job.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant={
                            ["Java", "Spring Boot", "React", "AWS"].includes(
                              tech,
                            )
                              ? "success"
                              : "outline"
                          }
                          className="!text-[10px]"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Match · posted {job.postedDaysAgo}d ago
                        </span>
                        <span className="font-medium text-slate-200">
                          {job.matchPct}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${job.matchPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Button
                      onClick={() =>
                        toast.success("Application drafted.", {
                          description:
                            "Drafted your resume for this role — we'll review and send it within 24 hours.",
                        })
                      }
                    >
                      Apply via EngiNerd
                    </Button>
                    <a
                      href={job.applyUrl}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                    >
                      Company site
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
