import "server-only";

import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { cohorts } from "@/lib/db/schema";

/* ============================================================================
 *  Live roadmap stats — replaces the hardcoded `enrolled: 9420` /
 *  `rating: 4.9` numbers from `lib/mock-data/roadmaps.ts`.
 *
 *  enrolled  = sum(cohort.member_count) across every cohort whose
 *              roadmap_slug matches. Cached for 5 min.
 *  rating    = NOT computed yet — no review system exists. We hide the
 *              chip entirely until that lands (anti-fake-number policy).
 * ============================================================================
 */

export type LiveRoadmapStats = Record<string, { enrolled: number }>;

async function fetchEnrolledUncached(): Promise<LiveRoadmapStats> {
  if (!hasDatabase) return {};
  try {
    // Sum members across all cohorts of each roadmap.
    const rows = await db
      .select({
        roadmapSlug: cohorts.roadmapSlug,
        members: sql<number>`coalesce(sum(${cohorts.memberCount}), 0)::int`,
      })
      .from(cohorts)
      .groupBy(cohorts.roadmapSlug);

    const out: LiveRoadmapStats = {};
    for (const r of rows) out[r.roadmapSlug] = { enrolled: r.members };
    return out;
  } catch {
    return {};
  }
}

export async function getLiveRoadmapStats(): Promise<LiveRoadmapStats> {
  // 5-min ISR cache — fine because new enrollments are an org-level number
  // shown on cards; not personal.
  const cached = unstable_cache(
    fetchEnrolledUncached,
    ["roadmap-stats"],
    { revalidate: 300, tags: ["roadmap-stats"] },
  );
  return cached();
}
