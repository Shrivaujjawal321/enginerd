import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { auditEvents } from "@/lib/db/schema";

/**
 *  Learning-style aggregator.
 *
 *  Cycle 21 started writing one `audit_events` row per format-tab click
 *  (`event = 'format.selected'`, metadata = JSON-stringified `{subjectSlug,
 *  format}`). Cycle 22 turns those rows into a learning-style profile we
 *  can surface on /home: "you reach for slides 60% of the time".
 *
 *  Computed live (not materialised) over the user's last 200 format-tab
 *  clicks. 200 is enough to be statistically meaningful but small enough
 *  to stay fast on a Neon row scan. If the user has fewer than 5 clicks
 *  total we return null so the dashboard can show a "we'll learn your
 *  style as you use the app" empty state instead of misleading numbers.
 */

export type LearningFormat = "read" | "slides" | "mindmap" | "flashcards";

export type LearningStyle = {
  /** Total number of format-tab clicks observed (capped at 200). */
  total: number;
  /** Counts per format, keys always present. */
  counts: Record<LearningFormat, number>;
  /** Percentages 0-100, keys always present, sum to 100. */
  percentages: Record<LearningFormat, number>;
  /** The format the user reaches for most. Null only when total === 0. */
  dominant: LearningFormat | null;
};

const FORMATS: LearningFormat[] = ["read", "slides", "mindmap", "flashcards"];
const SAMPLE_SIZE = 200;
const MIN_SAMPLE_FOR_DISPLAY = 5;

function blank(): Record<LearningFormat, number> {
  return { read: 0, slides: 0, mindmap: 0, flashcards: 0 };
}

export async function computeLearningStyle(
  userId: string,
): Promise<LearningStyle | null> {
  if (!hasDatabase) return null;

  let rows: Array<{ metadata: string | null }>;
  try {
    rows = await db
      .select({ metadata: auditEvents.metadata })
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.userId, userId),
          eq(auditEvents.event, "format.selected"),
        ),
      )
      .orderBy(desc(auditEvents.createdAt))
      .limit(SAMPLE_SIZE);
  } catch {
    // Transient DB error — never block /home on the personality widget.
    return null;
  }

  const counts = blank();
  let total = 0;
  for (const row of rows) {
    if (!row.metadata) continue;
    try {
      const meta = JSON.parse(row.metadata) as { format?: string };
      const f = meta.format;
      if (f && (FORMATS as string[]).includes(f)) {
        counts[f as LearningFormat] += 1;
        total += 1;
      }
    } catch {
      // Skip malformed rows — never throw on aggregation.
    }
  }

  if (total < MIN_SAMPLE_FOR_DISPLAY) return null;

  const percentages = blank();
  let assigned = 0;
  // Floor each percentage so they sum to ≤100, then push the remainder
  // onto the dominant format so the bar always reads exactly 100%.
  for (const f of FORMATS) {
    percentages[f] = Math.floor((counts[f] / total) * 100);
    assigned += percentages[f];
  }

  let dominant: LearningFormat = FORMATS[0]!;
  for (const f of FORMATS) {
    if (counts[f] > counts[dominant]) dominant = f;
  }
  if (assigned < 100) {
    percentages[dominant] += 100 - assigned;
  }

  return { total, counts, percentages, dominant };
}
