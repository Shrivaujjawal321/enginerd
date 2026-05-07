import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { subjectContent } from "@/lib/db/schema";

/**
 *  Subject content store — DB first, file second.
 *
 *  Why both: cycle 22 moves the runtime-of-record copy of every subject's
 *  markdown into Postgres so admins can edit content without redeploying
 *  and so the cycle-22 /studio (user-typed topic → LLM-generated content)
 *  has a natural place to write. The on-disk `content/<slug>.md` files
 *  remain in the repo for git history + content-author agent workflow,
 *  and serve as a fallback whenever the DB is unavailable or a slug
 *  hasn't been seeded yet (e.g. fresh local dev).
 *
 *  Lookup order:
 *    1. DB row in `subject_content` (when DATABASE_URL is set)
 *    2. `content/<slug>.md` on disk
 *    3. null (page renders the empty-state placeholder)
 *
 *  All paths sit behind `unstable_cache` so the hot path is a Map hit, not
 *  a Neon round-trip per request. Tag `subject-md:<slug>` busts a single
 *  subject after an admin edit; tag `subject-md` busts every subject.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

async function readFromDb(slug: string): Promise<string | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db
      .select({ markdown: subjectContent.markdown })
      .from(subjectContent)
      .where(eq(subjectContent.slug, slug))
      .limit(1);
    return row[0]?.markdown ?? null;
  } catch {
    // Network blip / transient Neon error — fall through to the file path.
    // Keeping the page reachable beats surfacing a 500 because of cache miss.
    return null;
  }
}

async function readFromFile(slug: string): Promise<string | null> {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function readSubjectContentUncached(
  slug: string,
): Promise<string | null> {
  return (await readFromDb(slug)) ?? (await readFromFile(slug));
}

export async function readSubjectContent(
  slug: string,
): Promise<string | null> {
  const cached = unstable_cache(
    () => readSubjectContentUncached(slug),
    ["subject-content", slug],
    { revalidate: 3600, tags: [`subject-md:${slug}`, "subject-md"] },
  );
  return cached();
}

/** Admin / studio writes — single point of write so the cache invalidation
 *  is guaranteed to fire. Callers should also `revalidateTag` after the
 *  upsert returns. */
export async function upsertSubjectContent(args: {
  slug: string;
  markdown: string;
  source?: "file" | "studio" | "agent";
}): Promise<void> {
  if (!hasDatabase) {
    throw new Error(
      "upsertSubjectContent: DATABASE_URL is not set — refusing to silently no-op a write",
    );
  }
  await db
    .insert(subjectContent)
    .values({
      slug: args.slug,
      markdown: args.markdown,
      source: args.source ?? "studio",
    })
    .onConflictDoUpdate({
      target: subjectContent.slug,
      set: {
        markdown: args.markdown,
        source: args.source ?? "studio",
        updatedAt: new Date(),
      },
    });
}
