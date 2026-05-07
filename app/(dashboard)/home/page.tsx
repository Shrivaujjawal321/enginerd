import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Code2,
  Flame,
  Map,
  Trophy,
} from "lucide-react";
import { and, desc, eq, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { userProgress, submissions, problems as problemsTable } from "@/lib/db/schema";
import { getUserStats } from "@/lib/progress";
import { computeLearningStyle } from "@/lib/learning-style";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { HeroSearch } from "@/components/dashboard/hero-search";
import { RecentlyViewed } from "@/components/dashboard/recently-viewed";
import { LearningStyleWidget } from "@/components/dashboard/learning-style-widget";
import { ROADMAPS, getRoadmap } from "@/lib/mock-data/roadmaps";
import { SUBJECTS_BY_SLUG, SUBJECTS, getSubject } from "@/lib/mock-data/subjects";
import { listProblems } from "@/lib/problems-store";
import { getRealJobs } from "@/lib/real-jobs";

export const metadata = { title: "Home" };
export const dynamic = "force-dynamic";

/**
 * Pull this user's most recently studied subject from `user_progress`.
 * Returns null when no DB / no progress rows yet.
 */
async function getLastStudied(userId: string): Promise<string | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db
      .select({ slug: userProgress.subtopicSlug })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastSeenAt))
      .limit(1);
    return row[0]?.slug ?? null;
  } catch {
    return null;
  }
}

/**
 *  Top N subtopics the user touched recently. Same `user_progress` table
 *  the Continue card uses, just unbounded to the slug list — we look up
 *  display data via SUBJECTS_BY_SLUG so a missing/renamed subject quietly
 *  drops out of the list rather than crashing the dashboard.
 */
type RecentItem = {
  slug: string;
  title: string;
  category: string;
  estHours: number;
  iconAccent: string;
  lastSeenAt: Date;
  progressPct: number;
  status: "not_started" | "in_progress" | "completed";
};

async function getRecentlyViewed(
  userId: string,
  limit: number,
): Promise<RecentItem[]> {
  if (!hasDatabase) return [];
  try {
    const rows = await db
      .select({
        slug: userProgress.subtopicSlug,
        lastSeenAt: userProgress.lastSeenAt,
        status: userProgress.status,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastSeenAt))
      .limit(limit);
    return rows
      .map((r) => {
        const subject = SUBJECTS_BY_SLUG[r.slug];
        if (!subject) return null;
        return {
          slug: subject.slug,
          title: subject.title,
          category: subject.category,
          estHours: subject.estHours,
          iconAccent: subject.iconAccent,
          lastSeenAt: r.lastSeenAt,
          progressPct: subject.progressPct,
          status: r.status,
        } satisfies RecentItem;
      })
      .filter((x): x is RecentItem => x !== null);
  } catch {
    return [];
  }
}

/** Distinct accepted submissions = count of unique problems solved. */
async function getProblemsSolved(userId: string): Promise<number> {
  if (!hasDatabase) return 0;
  try {
    const r = await db
      .select({
        c: sql<number>`count(distinct ${submissions.problemId})::int`,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.userId, userId),
          eq(submissions.status, "accepted"),
        ),
      );
    return r[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Total problems available — denominator for the solved tile. */
async function getTotalProblems(): Promise<number> {
  if (!hasDatabase) return 0;
  try {
    const r = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(problemsTable);
    return r[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Find the roadmap that contains this subject — used to pick "current" path. */
function roadmapContaining(subjectSlug: string) {
  return ROADMAPS.find((r) => r.subjectSlugs.includes(subjectSlug));
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    // Defensive — proxy.ts already redirects to /login.
    return null;
  }

  const userId = session.user.id;
  const [
    stats,
    lastSubjectSlug,
    allProblems,
    jobsResult,
    solvedCount,
    totalProblems,
    recentlyViewed,
    learningStyle,
  ] = await Promise.all([
    getUserStats(userId),
    getLastStudied(userId),
    listProblems(),
    getRealJobs("software engineer india"),
    getProblemsSolved(userId),
    getTotalProblems(),
    getRecentlyViewed(userId, 6),
    computeLearningStyle(userId),
  ]);

  // Resolve the "continue learning" card. Prefer the user's last-studied
  // subject's roadmap; fall back to the first roadmap in the catalog.
  const lastSubject = lastSubjectSlug ? getSubject(lastSubjectSlug) : null;
  const currentRoadmap =
    (lastSubject && roadmapContaining(lastSubject.slug)) ?? ROADMAPS[0]!;

  const recommendedSubjects = currentRoadmap.subjectSlugs
    .map((s) => SUBJECTS_BY_SLUG[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 3);

  const recommendedProblems = allProblems.slice(0, 3);
  const previewJobs = jobsResult.jobs.slice(0, 3);
  const previewCompanies = jobsResult.companies;

  const displayName =
    session.user.name ??
    (session.user.email ? session.user.email.split("@")[0] : null) ??
    session.user.phone ??
    "there";

  // Total subjects in the catalog — used for "topics done" denominator.
  const totalSubjects = SUBJECTS.length;

  const STAT_TILES = [
    {
      label: "Subjects done",
      value: `${stats.subjectsCompleted} / ${totalSubjects}`,
      icon: BookOpen,
      sub:
        stats.subjectsInProgress > 0
          ? `${stats.subjectsInProgress} in progress`
          : null,
    },
    {
      label: "DSA solved",
      value:
        totalProblems > 0
          ? `${solvedCount} / ${totalProblems}`
          : `${solvedCount}`,
      icon: Code2,
      sub:
        solvedCount === 0
          ? "Solve your first problem"
          : `${solvedCount === 1 ? "first" : `${solvedCount} so far`}`,
    },
    {
      label: "Day streak",
      value: stats.currentStreak > 0 ? `${stats.currentStreak}` : "—",
      icon: Flame,
      sub:
        stats.longestStreak > 0
          ? `Best: ${stats.longestStreak}d`
          : "Mark a subject complete to start",
    },
    {
      label: "Best streak",
      value:
        stats.longestStreak > 0 ? `${stats.longestStreak}d` : "—",
      icon: Trophy,
      sub:
        stats.longestStreak === 0
          ? "Streak when you mark daily"
          : null,
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Cycle 22 — search-anchored dashboard. Hero input is the primary
          discovery affordance; everything below is recall (continue,
          recently viewed, learning style). */}
      <HeroSearch />

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Welcome back,{" "}
          <span className="gradient-text-primary font-bold">
            {displayName}
          </span>
          .
        </h1>
        <p className="text-base text-slate-400">
          {lastSubject ? (
            <>
              You were last reading{" "}
              <span className="text-slate-200">{lastSubject.title}</span>.
            </>
          ) : (
            <>Pick your first subject — we&apos;re ready when you are.</>
          )}
        </p>
        {lastSubject ? (
          <Link
            href={`/subjects/${lastSubject.slug}`}
            aria-label={`Continue ${lastSubject.title}`}
            className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/[0.10] px-4 py-3 text-sm font-medium text-violet-100 transition-colors hover:border-violet-400/50 hover:bg-violet-500/[0.18] sm:mt-1 sm:inline-flex sm:w-fit sm:gap-2 sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs sm:text-violet-200"
          >
            <span className="min-w-0 truncate">
              <span className="text-violet-300/80">Continue:</span>{" "}
              {lastSubject.title}
            </span>
            <span aria-hidden className="text-base sm:text-xs">→</span>
          </Link>
        ) : null}
      </header>

      {/* ===== Continue learning hero card =================================*/}
      <GlassCard strong className="overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${currentRoadmap.thumbnailAccent} text-white shadow-lg shadow-black/20`}
            >
              <Map className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Continue learning
              </p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">
                {currentRoadmap.title}
              </h2>
              {lastSubject ? (
                <p className="mt-1 text-sm text-slate-400">
                  Last studied:{" "}
                  <span className="text-slate-200">{lastSubject.title}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  {currentRoadmap.subjectsCount} subjects ·{" "}
                  {currentRoadmap.topicsCount} topics
                </p>
              )}
            </div>
          </div>
          <Link
            href={
              lastSubject
                ? `/subjects/${lastSubject.slug}`
                : `/roadmaps/${currentRoadmap.slug}`
            }
          >
            <Button>
              {lastSubject ? "Continue" : "Start roadmap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {recommendedSubjects.map((subject) => (
            <Link
              key={subject.slug}
              href={`/subjects/${subject.slug}`}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Up next
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {subject.title}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {subject.estHours}h · {subject.topicsCount} topics
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white">
                Open
                <ArrowUpRight className="h-3 w-3" />
              </p>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* ===== Stats grid (real DB values) ================================ */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_TILES.map((stat) => (
            <GlassCard key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-50">
                {stat.value}
              </p>
              {"sub" in stat && stat.sub ? (
                <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>
              ) : null}
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ===== Recently viewed + learning style =========================== */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RecentlyViewed items={recentlyViewed} />
        <LearningStyleWidget style={learningStyle} />
      </section>

      {/* ===== Recommendations (still mock until Phase 6 personalization) == */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold text-slate-50">
            Recommended for you
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Picked from your current roadmap. Personalized recs land in
            Phase 6.
          </p>
        </header>

        <div className="-mx-4 overflow-x-auto pb-2 sm:mx-0">
          <div className="flex min-w-max gap-4 px-4 sm:min-w-0 sm:grid sm:grid-cols-3 sm:px-0">
            {recommendedSubjects.map((s) => (
              <Link
                key={`subj-${s.slug}`}
                href={`/subjects/${s.slug}`}
                className="block w-72 shrink-0 sm:w-auto"
              >
                <GlassCard hoverable className="h-full p-5">
                  <Badge variant="outline">Subject</Badge>
                  <p className="mt-3 text-base font-semibold text-slate-100">
                    {s.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {s.description}
                  </p>
                </GlassCard>
              </Link>
            ))}
            {recommendedProblems.map((p) => (
              <Link
                key={`prob-${p.slug}`}
                href={`/practice/${p.slug}`}
                className="block w-72 shrink-0 sm:w-auto"
              >
                <GlassCard hoverable className="h-full p-5">
                  <Badge variant="outline">Problem · {p.difficulty}</Badge>
                  <p className="mt-3 text-base font-semibold text-slate-100">
                    {p.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    Topic: {p.topic} · Asked at{" "}
                    {p.companies.slice(0, 2).join(", ")}
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Job rail =================================================== */}
      <section className="space-y-4">
        <header className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              Job opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Matched to your current roadmap progress.
            </p>
          </div>
          <Link
            href="/careers"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {previewJobs.map((job) => {
            const company = previewCompanies[job.companySlug];
            if (!company) return null;
            // Curated companies (Razorpay, Amazon, etc.) get an internal
            // detail page; synthesized companies link straight to the
            // external `applyUrl` so the user reaches the original posting.
            const hasInternalPage =
              company.relatedRoadmaps.length > 0 || company.employees !== "—";
            const href = hasInternalPage
              ? `/careers/${company.slug}`
              : job.applyUrl || "/careers";
            const linkProps = hasInternalPage
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" };
            return (
              <Link key={job.id} href={href} {...linkProps}>
                <GlassCard hoverable className="h-full p-5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${company.accent} text-xs font-bold text-white`}
                    >
                      {company.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {company.name}
                      </p>
                      <p className="text-xs text-slate-400">{job.location}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-50">
                    {job.title}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{job.remoteType}</span>
                    {/* Match score is only meaningful when the JobAgent has
                        explicitly scored against the user's resume. Hide
                        when 0 — don't fake a number. */}
                    {job.matchPct > 0 ? (
                      <Badge
                        variant={
                          job.matchPct >= 75
                            ? "success"
                            : job.matchPct >= 60
                              ? "warning"
                              : "outline"
                        }
                      >
                        Match {job.matchPct}%
                      </Badge>
                    ) : job.postedDaysAgo > 0 ? (
                      <span className="text-[11px] text-slate-400">
                        {job.postedDaysAgo}d ago
                      </span>
                    ) : null}
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/careers" className="md:hidden">
            <Button variant="glass" size="sm">
              View all <Briefcase className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
