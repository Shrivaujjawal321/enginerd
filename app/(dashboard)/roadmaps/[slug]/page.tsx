import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { auth } from "@/auth";
import { getRoadmap } from "@/lib/mock-data/roadmaps";
import { SUBJECTS_BY_SLUG } from "@/lib/mock-data/subjects";
import { library } from "@/lib/agents/library";
import { getLiveRoadmapStats } from "@/lib/roadmap-stats";
import { getUserProgressMaps } from "@/lib/user-progress-stats";
import { RoadmapTabs } from "@/components/dashboard/roadmap-tabs";
import { cn } from "@/lib/utils";

// This page reads the visitor's session via `auth()` (cookies — a dynamic
// server API) for per-user progress, so it must render per-request. Declaring
// `generateStaticParams` previously put the mock-roadmap slugs on the static
// prerender path, where the `auth()` cookie read throws DYNAMIC_SERVER_USAGE.
// Force dynamic rendering instead (roadmap data is cheap + cached).
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const r = getRoadmap(slug) ?? (await library.getRoadmap(slug))?.roadmap;
  return { title: r ? r.title : "Roadmap" };
}

export default async function RoadmapDetail(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const [libEntry, liveStats, session] = await Promise.all([
    library.getRoadmap(slug),
    getLiveRoadmapStats(),
    auth(),
  ]);
  const roadmap = libEntry?.roadmap ?? getRoadmap(slug);
  if (!roadmap) notFound();
  const liveEnrolled = liveStats[slug]?.enrolled ?? 0;
  const { byRoadmap } = await getUserProgressMaps(session?.user?.id);
  const userProgressPct = byRoadmap[slug] ?? 0;

  // Library roadmaps carry their own subject set; mock roadmaps look up
  // by slug in SUBJECTS_BY_SLUG.
  const subjects = libEntry
    ? libEntry.subjects
    : roadmap.subjectSlugs
        .map((s) => SUBJECTS_BY_SLUG[s])
        .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="space-y-8">
      <Link
        href="/roadmaps"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All roadmaps
      </Link>

      <GlassCard
        strong
        className={cn(
          "relative overflow-hidden p-8 sm:p-10",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-25",
            roadmap.thumbnailAccent,
          )}
        />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline">{roadmap.category}</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              {roadmap.title}
            </h1>
            <p className="text-base text-slate-300">
              {roadmap.longDescription}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {roadmap.durationMonths} months
              </span>
              <span>{roadmap.subjectsCount} subjects</span>
              <span>{roadmap.topicsCount} topics</span>
              <Badge variant="outline">{roadmap.difficulty}</Badge>
              {/* Rating chip removed — no review system yet (don't fake stars). */}
              {liveEnrolled > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {liveEnrolled.toLocaleString()} learner
                  {liveEnrolled === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[220px]">
            {session?.user?.id ? (
              userProgressPct > 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Your progress
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">
                    {userProgressPct}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full gradient-primary"
                      style={{ width: `${userProgressPct}%` }}
                    />
                  </div>
                </div>
              ) : null
            ) : (
              <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-4">
                <p className="text-xs uppercase tracking-wider text-violet-200">
                  Track your progress
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Sign in to mark subjects complete, build a streak, and earn
                  a public profile.
                </p>
              </div>
            )}
            {subjects[0] ? (
              session?.user?.id ? (
                <Link href={`/subjects/${subjects[0].slug}`}>
                  <Button className="w-full">
                    {userProgressPct > 0
                      ? "Continue learning"
                      : "Start learning"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(
                      `/subjects/${subjects[0].slug}`,
                    )}`}
                  >
                    <Button className="w-full">
                      Sign in to start
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/subjects/${subjects[0].slug}`}>
                    <Button variant="glass" className="w-full">
                      Preview first subject
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <Button disabled>
                No subjects yet
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <RoadmapTabs roadmap={roadmap} subjects={subjects} />
    </div>
  );
}
