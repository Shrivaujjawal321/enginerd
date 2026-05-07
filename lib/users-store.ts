import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  users,
  userProgress,
  userStats,
  submissions,
} from "@/lib/db/schema";

/* ============================================================================
 *  Public profile + handle helpers.
 * ============================================================================
 */

const HANDLE_RE = /^[a-z0-9][a-z0-9_-]{2,23}$/;

/** Validate a candidate handle. Lower-cased, 3-24 chars, alnum + `_` + `-`. */
export function isValidHandle(raw: string): boolean {
  return HANDLE_RE.test(raw.toLowerCase());
}

/** Normalise a candidate handle (lowercased, trimmed). */
export function normaliseHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Reserved handles — keep system / route paths off-limits. */
const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "billing",
  "cohorts",
  "careers",
  "home",
  "login",
  "logout",
  "me",
  "practice",
  "profile",
  "roadmaps",
  "settings",
  "subjects",
  "support",
  "u",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED.has(normaliseHandle(handle));
}

/**
 *  Set the current user's handle. Returns:
 *   - { ok: true } on success
 *   - { error: "invalid" | "reserved" | "taken" | "no_database" }
 */
export async function setUserHandle(
  userId: string,
  raw: string,
): Promise<
  { ok: true; handle: string } | { ok: false; error: string }
> {
  const handle = normaliseHandle(raw);
  if (!isValidHandle(handle)) return { ok: false, error: "invalid" };
  if (isReservedHandle(handle)) return { ok: false, error: "reserved" };
  if (!hasDatabase) return { ok: false, error: "no_database" };

  // Case-insensitive uniqueness — DB has a `users_handle_uniq` index on
  // lower(handle), but we still race-check explicitly for a friendly error.
  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.handle}) = ${handle}`,
    columns: { id: true },
  });
  if (existing && existing.id !== userId) {
    return { ok: false, error: "taken" };
  }

  try {
    await db
      .update(users)
      .set({ handle })
      .where(eq(users.id, userId));
  } catch (err) {
    // Postgres unique-violation (23505) — concurrent POST raced past the
    // SELECT above. The partial unique index `users_handle_uniq` saves us.
    const code =
      err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "23505") return { ok: false, error: "taken" };
    throw err;
  }
  return { ok: true, handle };
}

export type PublicProfile = {
  handle: string;
  name: string | null;
  image: string | null;
  collegeName: string | null;
  graduationYear: number | null;
  joinedAt: Date;
  stats: {
    subjectsCompleted: number;
    problemsSolved: number;
    currentStreak: number;
    longestStreak: number;
  };
};

export async function getPublicProfileByHandle(
  rawHandle: string,
): Promise<PublicProfile | null> {
  if (!hasDatabase) return null;
  const handle = normaliseHandle(rawHandle);
  if (!isValidHandle(handle)) return null;

  try {
    const user = await db.query.users.findFirst({
      where: sql`lower(${users.handle}) = ${handle}`,
      columns: {
        id: true,
        handle: true,
        name: true,
        image: true,
        collegeName: true,
        graduationYear: true,
        createdAt: true,
      },
    });
    if (!user || !user.handle) return null;

    const [completedRow, solvedRow, statsRow] = await Promise.all([
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(userProgress)
        .where(
          sql`${userProgress.userId} = ${user.id} AND ${userProgress.status} = 'completed'`,
        ),
      db
        .select({
          n: sql<number>`count(distinct ${submissions.problemId})::int`,
        })
        .from(submissions)
        .where(
          sql`${submissions.userId} = ${user.id} AND ${submissions.status} = 'accepted'`,
        ),
      db.query.userStats.findFirst({
        where: eq(userStats.userId, user.id),
      }),
    ]);

    return {
      handle: user.handle,
      name: user.name,
      image: user.image,
      collegeName: user.collegeName,
      graduationYear: user.graduationYear,
      joinedAt: user.createdAt,
      stats: {
        subjectsCompleted: completedRow[0]?.n ?? 0,
        problemsSolved: solvedRow[0]?.n ?? 0,
        currentStreak: statsRow?.currentStreak ?? 0,
        longestStreak: statsRow?.longestStreak ?? 0,
      },
    };
  } catch (err) {
    console.error("[users] getPublicProfileByHandle failed", err);
    return null;
  }
}
