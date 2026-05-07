import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { userProgress, userStats } from "@/lib/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { track } from "@/lib/analytics-server";
import { enrollInCohort } from "@/lib/cohorts";
import { ROADMAPS } from "@/lib/mock-data/roadmaps";

/** Best-effort lookup: which roadmap contains this subject? */
function roadmapForSubject(subjectSlug: string): string | null {
  const r = ROADMAPS.find((rm) => rm.subjectSlugs.includes(subjectSlug));
  return r?.slug ?? null;
}

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type ProgressEntry = {
  subtopicSlug: string;
  status: ProgressStatus;
  masteredAt?: string | null;
  lastSeenAt: string;
  /** When the completion just crossed a streak milestone (7 / 14 / 30 / 50
   *  / 100 / 200 / 365), this is the day count. Used by the client to fire
   *  a celebration toast. Null otherwise. */
  streakMilestone?: number | null;
};

/* ------------------------------------------------------------------ *
 *  Read paths
 * ------------------------------------------------------------------ */

/**
 * All progress rows for one user, keyed by subtopic slug. Empty object when
 * DB is not configured (graceful — UI just shows everything as not_started).
 */
export async function getUserProgress(
  userId: string,
): Promise<Record<string, ProgressEntry>> {
  if (!hasDatabase) return {};
  try {
    const rows = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    const out: Record<string, ProgressEntry> = {};
    for (const r of rows) {
      out[r.subtopicSlug] = {
        subtopicSlug: r.subtopicSlug,
        status: r.status as ProgressStatus,
        masteredAt: r.masteredAt?.toISOString() ?? null,
        lastSeenAt: r.lastSeenAt.toISOString(),
      };
    }
    return out;
  } catch (err) {
    console.error("[progress] getUserProgress failed", err);
    return {};
  }
}

/** Single subtopic status — used by the mark-complete button. */
export async function getSubtopicProgress(
  userId: string,
  subtopicSlug: string,
): Promise<ProgressEntry | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, userId),
        eq(userProgress.subtopicSlug, subtopicSlug),
      ),
    });
    if (!row) return null;
    return {
      subtopicSlug: row.subtopicSlug,
      status: row.status as ProgressStatus,
      masteredAt: row.masteredAt?.toISOString() ?? null,
      lastSeenAt: row.lastSeenAt.toISOString(),
    };
  } catch (err) {
    console.error("[progress] getSubtopicProgress failed", err);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 *  Write paths
 * ------------------------------------------------------------------ */

/**
 * Mark a subtopic as visited (in_progress) or completed.
 * Idempotent — calling complete twice keeps the original masteredAt.
 */
export async function setSubtopicProgress(args: {
  userId: string;
  subtopicSlug: string;
  status: ProgressStatus;
}): Promise<ProgressEntry | null> {
  if (!hasDatabase) return null;
  const now = new Date();
  const masteredAt = args.status === "completed" ? now : null;

  try {
    await db
      .insert(userProgress)
      .values({
        userId: args.userId,
        subtopicSlug: args.subtopicSlug,
        status: args.status,
        masteredAt,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.subtopicSlug],
        set: {
          status: args.status,
          // Don't clear masteredAt if the user re-visits a completed subtopic.
          masteredAt: sql`CASE WHEN ${userProgress.masteredAt} IS NOT NULL
                              THEN ${userProgress.masteredAt}
                              ELSE ${masteredAt} END`,
          lastSeenAt: now,
        },
      });

    let milestone: number | null = null;
    if (args.status === "completed") {
      const bump = await bumpStreak(args.userId);
      milestone = bump.milestone;
      await logAuditEvent({
        userId: args.userId,
        event: "progress.complete",
        metadata: {
          subtopicSlug: args.subtopicSlug,
          streak: bump.streak,
          milestone: bump.milestone,
        },
      });
      void track({
        distinctId: args.userId,
        event: "subject.completed",
        properties: {
          slug: args.subtopicSlug,
          streak: bump.streak,
          milestone: bump.milestone,
        },
      });
    }

    // Auto-enroll in this subject's roadmap cohort (week-of-first-touch).
    // Idempotent — safe to call on every progress update.
    const roadmapSlug = roadmapForSubject(args.subtopicSlug);
    if (roadmapSlug) {
      void enrollInCohort({ userId: args.userId, roadmapSlug });
    }

    // Cache busts — user-stats + user-progress maps reflect this row
    // immediately on next read; leaderboard busts only on completion.
    revalidateTag(`user-stats:${args.userId}`, "max");
    revalidateTag(`user-progress:${args.userId}`, "max");
    if (args.status === "completed") {
      revalidateTag("leaderboard", "max");
    }

    return {
      subtopicSlug: args.subtopicSlug,
      status: args.status,
      masteredAt: masteredAt?.toISOString() ?? null,
      lastSeenAt: now.toISOString(),
      // null when the new streak isn't a milestone, OR when no streak bump
      // happened (status !== "completed", same-day repeat, etc.).
      streakMilestone: milestone,
    };
  } catch (err) {
    console.error("[progress] setSubtopicProgress failed", err);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 *  Streaks
 * ------------------------------------------------------------------ */

function todayYmd(d = new Date()): string {
  // YYYY-MM-DD in user's local-ish timezone (UTC-shifted to IST for India).
  // Phase 3 will let users set their own TZ; for now IST is the default.
  const ist = new Date(d.getTime() + 5.5 * 3600_000);
  return ist.toISOString().slice(0, 10);
}

/** Streak milestones that trigger a celebration toast on the client. */
const STREAK_MILESTONES = new Set([7, 14, 30, 50, 100, 200, 365]);

/**
 *  Increment streak when user marks a completion on a new day.
 *
 *  Returns the new streak day count, plus a `milestone` flag set to the
 *  number when the new streak crosses one of `STREAK_MILESTONES`. Caller
 *  (`setSubtopicProgress`) propagates this back so the client can show a
 *  celebration toast.
 */
async function bumpStreak(
  userId: string,
): Promise<{ streak: number; milestone: number | null }> {
  if (!hasDatabase) return { streak: 0, milestone: null };
  const today = todayYmd();
  try {
    const existing = await db.query.userStats.findFirst({
      where: eq(userStats.userId, userId),
    });

    if (!existing) {
      await db.insert(userStats).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        totalMinutes: 0,
      });
      return { streak: 1, milestone: null };
    }

    if (existing.lastActiveDate === today) {
      // Already active today — no streak change.
      return { streak: existing.currentStreak, milestone: null };
    }

    const yesterday = todayYmd(new Date(Date.now() - 86_400_000));
    const newStreak =
      existing.lastActiveDate === yesterday ? existing.currentStreak + 1 : 1;

    await db
      .update(userStats)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(existing.longestStreak, newStreak),
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return {
      streak: newStreak,
      milestone: STREAK_MILESTONES.has(newStreak) ? newStreak : null,
    };
  } catch (err) {
    console.error("[progress] bumpStreak failed", err);
    return { streak: 0, milestone: null };
  }
}

/** Read aggregate gamification numbers — used by the topbar streak badge. */
/**
 *  `subjectsCompleted` and `subjectsInProgress` are computed live from the
 *  `user_progress` table — the `user_stats` row's stored values can drift
 *  if completions land via raw SQL outside `setSubtopicProgress`.
 *
 *  `totalMinutes` is intentionally NOT exposed — we don't track time-on-task
 *  yet, and the previous "0 minutes" tile was a fake placeholder. Phase 9+
 *  will instrument topic-view durations via PostHog.
 */
/**
 *  Cached for 30s with a per-user tag. `/api/me` calls this on every page
 *  load via the topbar — without cache it's two DB roundtrips per nav.
 *  Bust via `revalidateTag(\`user-stats:\${userId}\`)` from setSubtopicProgress
 *  (subjects flip status) and from any submission accept (streak update).
 */
export async function getUserStats(userId: string) {
  const cached = unstable_cache(
    () => _getUserStatsUncached(userId),
    ["user-stats", userId],
    { revalidate: 30, tags: [`user-stats:${userId}`] },
  );
  return cached();
}

async function _getUserStatsUncached(userId: string) {
  const empty = {
    currentStreak: 0,
    longestStreak: 0,
    subjectsCompleted: 0,
    subjectsInProgress: 0,
  };
  if (!hasDatabase) return empty;
  try {
    const [statsRow, progressCounts] = await Promise.all([
      db.query.userStats.findFirst({
        where: eq(userStats.userId, userId),
      }),
      db
        .select({
          status: userProgress.status,
          count: sql<number>`count(*)::int`,
        })
        .from(userProgress)
        .where(eq(userProgress.userId, userId))
        .groupBy(userProgress.status),
    ]);

    let subjectsCompleted = 0;
    let subjectsInProgress = 0;
    for (const row of progressCounts) {
      if (row.status === "completed") subjectsCompleted = row.count;
      if (row.status === "in_progress") subjectsInProgress = row.count;
    }

    return {
      currentStreak: statsRow?.currentStreak ?? 0,
      longestStreak: statsRow?.longestStreak ?? 0,
      subjectsCompleted,
      subjectsInProgress,
    };
  } catch (err) {
    console.error("[progress] getUserStats failed", err);
    return empty;
  }
}
