import "server-only";

import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { userProgress } from "@/lib/db/schema";
import { ROADMAPS } from "@/lib/mock-data/roadmaps";

/* ============================================================================
 *  User-progress aggregations — replaces the hardcoded `progressPct: 18`
 *  fields from `lib/mock-data/subjects.ts` and `roadmaps.ts`.
 *
 *  Subject-level: 100% if the user has marked the subject as completed via
 *  the "Mark complete" button, else 0%. (Phase 9+ will introduce per-subtopic
 *  granularity for partial credit.)
 *
 *  Roadmap-level: completed_subjects / total_subjects × 100.
 * ============================================================================
 */

export type ProgressMaps = {
  /** subjectSlug → 0 or 100 */
  bySubject: Record<string, number>;
  /** roadmapSlug → 0..100 */
  byRoadmap: Record<string, number>;
};

const EMPTY: ProgressMaps = { bySubject: {}, byRoadmap: {} };

/**
 *  Cached for 30s with a per-user tag. /roadmaps + /subjects pages call this
 *  on every request — without cache that's a Neon roundtrip on every nav.
 *  Bust via `revalidateTag(\`user-progress:\${userId}\`)` from `setSubtopicProgress`
 *  whenever a subject completion lands.
 */
export async function getUserProgressMaps(
  userId: string | null | undefined,
): Promise<ProgressMaps> {
  if (!userId || !hasDatabase) return EMPTY;
  const cached = unstable_cache(
    () => _getUserProgressMapsUncached(userId),
    ["user-progress", userId],
    { revalidate: 30, tags: [`user-progress:${userId}`] },
  );
  return cached();
}

async function _getUserProgressMapsUncached(
  userId: string,
): Promise<ProgressMaps> {
  try {
    const completed = await db
      .select({ slug: userProgress.subtopicSlug })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, "completed"),
        ),
      );

    const completedSlugs = new Set(completed.map((r) => r.slug));
    const bySubject: Record<string, number> = {};
    for (const slug of completedSlugs) bySubject[slug] = 100;

    const byRoadmap: Record<string, number> = {};
    for (const r of ROADMAPS) {
      const total = r.subjectSlugs.length;
      if (total === 0) continue;
      const done = r.subjectSlugs.filter((s) => completedSlugs.has(s)).length;
      byRoadmap[r.slug] = Math.round((done / total) * 100);
    }

    return { bySubject, byRoadmap };
  } catch {
    return EMPTY;
  }
}
