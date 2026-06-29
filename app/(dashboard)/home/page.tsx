import { Suspense } from "react";
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
import { userProgress, submissions, problems as problemsTable, users } from "@/lib/db/schema";
import { VALID_SLUGS } from "@/lib/goal-match";
import { getUserStats, getUserProgress } from "@/lib/progress";
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

/**
 * Fetch the user's stored `preferredRoadmap` slug from the DB.
 * Returns null when the DB is unavailable or no preference has been set.
 */
async function getPreferredRoadmap(userId: string): Promise<string | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db
      .select({ preferredRoadmap: users.preferredRoadmap })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row[0]?.preferredRoadmap ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    // Defensive — proxy.ts already redirects to /login.
    return null;
  }

  const userId = session.user.id;

  // Read the goal param forwarded from Google OAuth or hero → /home?goal=<slug>.
  // This is the fallback path for Google users who came via the hero form.
  const resolvedSearchParams = await searchParams;
  const rawGoalParam =
    typeof resolvedSearchParams.goal === "string"
      ? resolvedSearchParams.goal
      : Array.isArray(resolvedSearchParams.goal)
        ? (resolvedSearchParams.goal[0] ?? "")
        : "";
  const validGoalParam: string | null =
    rawGoalParam && VALID_SLUGS.has(rawGoalParam) ? rawGoalParam : null;

  // Render the page in two passes:
  //   1. Fast-path data needed for the above-the-fold hero + stats.
  //   2. Slow-path (job aggregator) is deferred via Suspense so the public
  //      job-board APIs (1-3s cold latency) don't block the entire page.
  const [
    stats,
    lastSubjectSlug,
    allProblems,
    solvedCount,
    totalProblems,
    recentlyViewed,
    learningStyle,
    progressMap,
    storedPreferredSlug,
  ] = await Promise.all([
    getUserStats(userId),
    getLastStudied(userId),
    listProblems(),
    getProblemsSolved(userId),
    getTotalProblems(),
    getRecentlyViewed(userId, 6),
    computeLearningStyle(userId),
    getUserProgress(userId),
    getPreferredRoadmap(userId),
  ]);

  // Resolve the "continue learning" card.
  // Priority order:
  //   1. Stored preferredRoadmap (set via OTP flow or Google OAuth ?goal= param)
  //   2. URL ?goal= param (Google OAuth path — fire-and-forget persist for next visit)
  //   3. Roadmap inferred from last-studied subject
  //   4. ROADMAPS[0] (GenAI Developer — default)
  const lastSubject = lastSubjectSlug ? getSubject(lastSubjectSlug) : null;

  // For Google OAuth users: if they arrived via ?goal= and have no stored preference,
  // persist it now fire-and-forget so future visits don't need the URL param.
  if (validGoalParam && !storedPreferredSlug && hasDatabase) {
    void db
      .update(users)
      .set({ preferredRoadmap: validGoalParam })
      .where(eq(users.id, userId))
      .catch(() => undefined);
  }

  const effectivePreferredSlug = storedPreferredSlug ?? validGoalParam;
  const resolvedByPreference = effectivePreferredSlug
    ? (getRoadmap(effectivePreferredSlug) ?? null)
    : null;

  const currentRoadmap =
    resolvedByPreference ??
    (lastSubject && roadmapContaining(lastSubject.slug)) ??
    ROADMAPS[0]!;

  // Up-next: first three subjects from the current roadmap.
  const upNextSubjects = currentRoadmap.subjectSlugs
    .map((s) => SUBJECTS_BY_SLUG[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 3);

  // Recommended row: take the *next* slice of the roadmap (4th-6th) so the
  // second carousel doesn't echo the trio above. Falls back to weak-area
  // subjects (in_progress in user_progress) when the roadmap is short.
  const recommendedFromRoadmap = currentRoadmap.subjectSlugs
    .slice(3, 6)
    .map((s) => SUBJECTS_BY_SLUG[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const weakAreaSubjects = Object.values(progressMap)
    .filter((p) => p.status === "in_progress")
    .map((p) => SUBJECTS_BY_SLUG[p.subtopicSlug])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const upNextSlugs = new Set(upNextSubjects.map((s) => s.slug));
  const recommendedSubjects = (
    recommendedFromRoadmap.length > 0
      ? recommendedFromRoadmap
      : weakAreaSubjects.filter((s) => !upNextSlugs.has(s.slug))
  ).slice(0, 3);

  const recommendedProblems = allProblems.slice(0, 3);

  // Continue button percent — share of subjects in the current roadmap that
  // the user has marked completed. Stays at 0 for fresh accounts.
  const roadmapTotal = currentRoadmap.subjectSlugs.length;
  const roadmapDone = currentRoadmap.subjectSlugs.filter(
    (slug) => progressMap[slug]?.status === "completed",
  ).length;
  const continuePct =
    roadmapTotal > 0 ? Math.round((roadmapDone / roadmapTotal) * 100) : 0;

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
              {lastSubject
                ? `Continue · ${continuePct}%`
                : "Start roadmap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {upNextSubjects.map((subject, i) => {
            const stepLabel =
              i === 0 ? "Up next" : i === 1 ? "Then" : "After that";
            return (
              <Link
                key={subject.slug}
                href={`/subjects/${subject.slug}`}
                className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span
                  aria-hidden
                  className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-semibold text-slate-300"
                >
                  {i + 1}
                </span>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {stepLabel}
                </p>
                <p className="mt-1 pr-7 text-sm font-semibold text-slate-100">
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
            );
          })}
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

      {/* ===== Recommendations row =====================================*/}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold text-slate-50">
            Recommended for you
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Picked from your current roadmap.
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

      {/* ===== Job rail (deferred — public APIs add 1-3s) ================ */}
      <Suspense fallback={<JobRailSkeleton />}>
        <JobRail />
      </Suspense>
    </div>
  );
}

/* =============================================================================
 * Streamed job rail. Lives below the fold, so we render the rest of the page
 * synchronously and let this section stream in once the public job-board APIs
 * (Remotive / Arbeitnow / Muse) respond. Without this Suspense boundary the
 * whole page blocks on the slowest provider — typically 1-3 seconds.
 * ===========================================================================*/

async function JobRail() {
  const jobsResult = await getRealJobs("software engineer india");
  const previewJobs = jobsResult.jobs.slice(0, 3);
  const previewCompanies = jobsResult.companies;

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Job opportunities
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Live openings from public job boards.
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
  );
}

function JobRailSkeleton() {
  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Job opportunities
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Live openings from public job boards.
          </p>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="h-44 animate-pulse p-5" />
        ))}
      </div>
    </section>
  );
}
