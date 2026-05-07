import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  cohorts,
  cohortMembers,
  leaderboardSnapshots,
  users,
  userStats,
  userProgress,
  submissions,
  problems,
} from "@/lib/db/schema";

/* ============================================================================
 *  Cohorts — auto-derived from (roadmap, ISO-week) when a user first
 *  interacts with a roadmap.
 *
 *  Why ISO weeks? They're locale-stable and give natural cohorts ("the JS
 *  full-stack class of 2026 W18"). Cohort id is human-readable so deep
 *  links + GitHub-issue-style sharing work.
 * ============================================================================
 */

/** "2026-W18" for any Date. */
export function isoWeek(d: Date = new Date()): string {
  // Copy date so we don't mutate caller's value.
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // ISO-8601 week-of-year algorithm.
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((t.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  const year = t.getUTCFullYear();
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function cohortId(roadmapSlug: string, week = isoWeek()): string {
  return `${roadmapSlug}-${week}`;
}

/**
 * Idempotently enroll a user in the cohort for `roadmapSlug` × current week.
 * Creates the cohort row if it's the first member. Returns the cohort id.
 */
export async function enrollInCohort(args: {
  userId: string;
  roadmapSlug: string;
}): Promise<string | null> {
  if (!hasDatabase) return null;
  const id = cohortId(args.roadmapSlug);
  const week = isoWeek();

  try {
    // 1. Ensure cohort row exists (no-op if it already does).
    await db
      .insert(cohorts)
      .values({
        id,
        roadmapSlug: args.roadmapSlug,
        week,
        memberCount: 0,
      })
      .onConflictDoNothing();

    // 2. Try to insert membership. If duplicate, swallow.
    const inserted = await db
      .insert(cohortMembers)
      .values({ cohortId: id, userId: args.userId })
      .onConflictDoNothing()
      .returning({ cohortId: cohortMembers.cohortId });

    if (inserted.length > 0) {
      // First time membership → bump member count.
      await db
        .update(cohorts)
        .set({ memberCount: sql`${cohorts.memberCount} + 1` })
        .where(eq(cohorts.id, id));
    }

    return id;
  } catch (err) {
    console.error("[cohorts] enroll failed", err);
    return null;
  }
}

export type CohortInfo = {
  id: string;
  roadmapSlug: string;
  week: string;
  memberCount: number;
  joinedAt: string;
};

/** Cohorts this user belongs to — most recent first.
 *
 *  member_count is computed live (via subquery) instead of trusted from
 *  the denormalized counter on `cohorts` — concurrent-write safe. The
 *  counter exists for analytics but reads always go through the count().
 */
export async function getUserCohorts(
  userId: string,
): Promise<CohortInfo[]> {
  if (!hasDatabase) return [];
  try {
    const memberCountSubquery = sql<number>`(
      SELECT count(*)::int FROM cohort_members
      WHERE cohort_members.cohort_id = ${cohorts.id}
    )`;
    const rows = await db
      .select({
        id: cohorts.id,
        roadmapSlug: cohorts.roadmapSlug,
        week: cohorts.week,
        memberCount: memberCountSubquery,
        joinedAt: cohortMembers.joinedAt,
      })
      .from(cohortMembers)
      .innerJoin(cohorts, eq(cohorts.id, cohortMembers.cohortId))
      .where(eq(cohortMembers.userId, userId))
      .orderBy(desc(cohortMembers.joinedAt));
    return rows.map((r) => ({
      ...r,
      joinedAt: r.joinedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[cohorts] getUserCohorts failed", err);
    return [];
  }
}

/* ============================================================================
 *  Leaderboard — composite score formula:
 *
 *    score = subjects_completed * 10
 *          + problems_solved   * 3
 *          + current_streak
 *
 *  Computed on-demand for the cohort's current state. Snapshot is stored to
 *  `leaderboard_snapshots` so the page renders without aggregation cost on
 *  the next render (TTL = 1 hour; recompute opportunistically).
 * ============================================================================
 */

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  score: number;
  subjectsCompleted: number;
  problemsSolved: number;
  currentStreak: number;
  /** True when this entry is the requesting user. */
  isMe?: boolean;
};

/**
 * Fresh leaderboard for `cohortId`. Pulls from the live `user_progress` /
 * `submissions` / `user_stats` tables — no snapshot. Ordering is stable
 * via tie-break on userId.
 */
export async function computeLeaderboard(args: {
  cohortId: string;
  limit?: number;
  meUserId?: string;
}): Promise<LeaderboardEntry[]> {
  const limit = args.limit ?? 50;

  // Cache the heavy aggregation by (cohortId, limit). `meUserId` is applied
  // AFTER cache so per-user `isMe` flag stays correct without busting cache
  // per user. Bust via revalidateTag("leaderboard") on submission accept /
  // subject completion.
  const cached = unstable_cache(
    async () => _computeLeaderboardUncached(args.cohortId, limit),
    ["leaderboard", args.cohortId, String(limit)],
    {
      revalidate: 60,
      tags: [`leaderboard:cohort-${args.cohortId}`, "leaderboard"],
    },
  );
  const board = await cached();
  if (!args.meUserId) return board;
  return board.map((e) => ({ ...e, isMe: args.meUserId === e.userId }));
}

async function _computeLeaderboardUncached(
  cohortId: string,
  limit: number,
): Promise<LeaderboardEntry[]> {
  if (!hasDatabase) return [];

  try {
    // Subjects completed per member of this cohort.
    const completedQ = db
      .select({
        userId: userProgress.userId,
        subjectsCompleted: sql<number>`count(*)::int`,
      })
      .from(userProgress)
      .innerJoin(
        cohortMembers,
        eq(cohortMembers.userId, userProgress.userId),
      )
      .where(
        and(
          eq(cohortMembers.cohortId, cohortId),
          eq(userProgress.status, "completed"),
        ),
      )
      .groupBy(userProgress.userId)
      .as("completed_q");

    // Accepted problem submissions per member (distinct problems).
    const solvedQ = db
      .select({
        userId: submissions.userId,
        problemsSolved: sql<number>`count(distinct ${submissions.problemId})::int`,
      })
      .from(submissions)
      .innerJoin(
        cohortMembers,
        eq(cohortMembers.userId, submissions.userId),
      )
      .where(
        and(
          eq(cohortMembers.cohortId, cohortId),
          eq(submissions.status, "accepted"),
        ),
      )
      .groupBy(submissions.userId)
      .as("solved_q");

    // Materialize one row per cohort member with all stats joined.
    const rows = await db
      .select({
        userId: cohortMembers.userId,
        name: users.name,
        image: users.image,
        currentStreak: userStats.currentStreak,
        subjectsCompleted: completedQ.subjectsCompleted,
        problemsSolved: solvedQ.problemsSolved,
      })
      .from(cohortMembers)
      .leftJoin(users, eq(users.id, cohortMembers.userId))
      .leftJoin(userStats, eq(userStats.userId, cohortMembers.userId))
      .leftJoin(completedQ, eq(completedQ.userId, cohortMembers.userId))
      .leftJoin(solvedQ, eq(solvedQ.userId, cohortMembers.userId))
      .where(eq(cohortMembers.cohortId, cohortId));

    // Score + rank in JS — small N, simpler than a window function.
    const enriched = rows
      .map((r) => {
        const subj = r.subjectsCompleted ?? 0;
        const solv = r.problemsSolved ?? 0;
        const strk = r.currentStreak ?? 0;
        return {
          userId: r.userId,
          name: r.name,
          image: r.image,
          subjectsCompleted: subj,
          problemsSolved: solv,
          currentStreak: strk,
          score: subj * 10 + solv * 3 + strk,
        };
      })
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : a.userId.localeCompare(b.userId),
      )
      .slice(0, limit)
      .map((e, i) => ({
        ...e,
        rank: i + 1,
        // `isMe` is filled in by the cached() wrapper after cache.
        isMe: false,
      }));

    return enriched;
  } catch (err) {
    console.error("[cohorts] computeLeaderboard failed", err);
    return [];
  }
}

/**
 * Persist the current leaderboard for a cohort as a snapshot. Called from
 * a cron / Inngest function. Idempotent per (cohortId, week).
 */
export async function saveLeaderboardSnapshot(
  cohortId: string,
): Promise<number> {
  if (!hasDatabase) return 0;
  const week = isoWeek();
  const board = await computeLeaderboard({ cohortId, limit: 500 });

  if (board.length === 0) return 0;

  try {
    // Delete prior snapshot for this week + cohort, then re-insert (upsert).
    await db
      .delete(leaderboardSnapshots)
      .where(
        and(
          eq(leaderboardSnapshots.cohortId, cohortId),
          eq(leaderboardSnapshots.snapshotWeek, week),
        ),
      );
    await db.insert(leaderboardSnapshots).values(
      board.map((e) => ({
        cohortId,
        userId: e.userId,
        rank: e.rank,
        score: e.score,
        subjectsCompleted: e.subjectsCompleted,
        problemsSolved: e.problemsSolved,
        currentStreak: e.currentStreak,
        snapshotWeek: week,
      })),
    );
    return board.length;
  } catch (err) {
    console.error("[cohorts] saveLeaderboardSnapshot failed", err);
    return 0;
  }
}

void problems; // silence unused-import lint when wiring future features
