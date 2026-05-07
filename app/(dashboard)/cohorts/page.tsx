import Link from "next/link";
import { ArrowRight, Flame, Trophy, Users } from "lucide-react";

import { auth } from "@/auth";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  computeLeaderboard,
  getUserCohorts,
  isoWeek,
} from "@/lib/cohorts";
import { ROADMAPS } from "@/lib/mock-data/roadmaps";
import { cn } from "@/lib/utils";

export const metadata = { title: "Cohorts" };
export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const myCohorts = await getUserCohorts(userId);

  // Render leaderboard for the user's most recent cohort (if any).
  const primaryCohort = myCohorts[0] ?? null;
  const board = primaryCohort
    ? await computeLeaderboard({
        cohortId: primaryCohort.id,
        limit: 25,
        meUserId: userId,
      })
    : [];

  const myRow = board.find((e) => e.isMe);
  const week = isoWeek();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Cohorts
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-400">
            The week you start a roadmap, you join that week&apos;s cohort.
            Compete, compare, climb.
          </p>
        </div>
        <Badge variant="glass" className="!gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          Week {week}
        </Badge>
      </header>

      {myCohorts.length === 0 ? (
        <GlassCard className="space-y-3 p-6 text-sm text-slate-300">
          <p className="font-medium text-slate-100">
            You&apos;re not in any cohort yet.
          </p>
          <p className="text-slate-400">
            Complete a subject from any roadmap — we&apos;ll enroll you in
            that week&apos;s cohort automatically.
          </p>
          <Link href="/roadmaps" className="inline-block pt-1">
            <Button>
              Explore roadmaps
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <>
          {/* ---- Cohort cards rail ---------------------------------------*/}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your cohorts
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myCohorts.map((c) => {
                const roadmap = ROADMAPS.find(
                  (r) => r.slug === c.roadmapSlug,
                );
                return (
                  <Link
                    key={c.id}
                    href={`/roadmaps/${c.roadmapSlug}`}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-violet-400/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400">
                          Cohort {c.week}
                        </p>
                        <p className="mt-1 truncate text-base font-semibold text-slate-100 group-hover:text-white">
                          {roadmap?.title ?? c.roadmapSlug}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {c.memberCount}{" "}
                        <Users className="ml-1 inline h-3 w-3" />
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Joined{" "}
                      {new Date(c.joinedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ---- Leaderboard for primary cohort -------------------------- */}
          {primaryCohort ? (
            <section>
              <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Leaderboard —{" "}
                    {ROADMAPS.find(
                      (r) => r.slug === primaryCohort.roadmapSlug,
                    )?.title ?? primaryCohort.roadmapSlug}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {primaryCohort.memberCount} learners ·{" "}
                    {primaryCohort.week} cohort · score = subjects×10 +
                    solved×3 + streak
                  </p>
                </div>
                {myRow ? (
                  <Badge
                    variant={myRow.rank <= 3 ? "success" : "outline"}
                    className="!gap-1.5"
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    You: #{myRow.rank}
                  </Badge>
                ) : null}
              </header>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03]">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2.5 text-left">#</th>
                      <th className="px-4 py-2.5 text-left">Learner</th>
                      <th className="px-4 py-2.5 text-right">Subjects</th>
                      <th className="px-4 py-2.5 text-right">DSA</th>
                      <th className="px-4 py-2.5 text-right">Streak</th>
                      <th className="px-4 py-2.5 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-slate-400"
                        >
                          This cohort is empty — be the first to join.
                        </td>
                      </tr>
                    ) : (
                      board.map((e) => (
                        <tr
                          key={e.userId}
                          className={cn(
                            "border-t border-white/[0.04]",
                            e.isMe && "bg-violet-500/[0.06]",
                          )}
                        >
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {e.rank <= 3 ? (
                              <span className="text-amber-300">
                                {["🥇", "🥈", "🥉"][e.rank - 1]}
                              </span>
                            ) : (
                              `#${e.rank}`
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "font-medium",
                                e.isMe ? "text-white" : "text-slate-200",
                              )}
                            >
                              {e.name ?? "Anonymous"}
                              {e.isMe ? (
                                <span className="ml-2 text-[10px] text-violet-300">
                                  (you)
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                            {e.subjectsCompleted}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                            {e.problemsSolved}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                            {e.currentStreak > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <Flame className="h-3 w-3 text-amber-400" />
                                {e.currentStreak}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-100 tabular-nums">
                            {e.score}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </GlassCard>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
