/**
 * scripts/seed-subject-content.ts
 *
 * One-shot seeder that mirrors `content/*.md` into the `subject_content`
 * table. Idempotent — existing slugs UPDATE, new slugs INSERT. Run after
 * applying migration 0007 and any time the markdown files change in CI.
 *
 *   npx tsx scripts/seed-subject-content.ts                # all files
 *   npx tsx scripts/seed-subject-content.ts mongodb-deep-dive   # one file
 *
 * Why a script instead of a runtime fetch: the markdown files are large
 * (~105K lines across 103 subjects). Doing this at request time on a cold
 * Vercel serverless container is wasteful — seed once, read fast.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { db, schema } from "./_db";

const { subjectContent } = schema;

const CONTENT_DIR = path.join(process.cwd(), "content");

async function listMarkdownSlugs(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR);
  return entries
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

async function seedOne(slug: string): Promise<"inserted" | "updated"> {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  const markdown = await fs.readFile(file, "utf8");
  const existing = await db
    .select({ slug: subjectContent.slug })
    .from(subjectContent)
    .where(eqSlug(slug))
    .limit(1);
  await db
    .insert(subjectContent)
    .values({ slug, markdown, source: "file" })
    .onConflictDoUpdate({
      target: subjectContent.slug,
      set: { markdown, source: "file", updatedAt: new Date() },
    });
  return existing[0] ? "updated" : "inserted";
}

// Tiny helper so the listing query above doesn't need the eq import.
function eqSlug(slug: string) {
  // Reach for drizzle's eq lazily so the script's other imports stay tidy.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { eq } = require("drizzle-orm") as typeof import("drizzle-orm");
  return eq(subjectContent.slug, slug);
}

async function main() {
  const target = process.argv[2];
  const slugs = target ? [target] : await listMarkdownSlugs();
  if (slugs.length === 0) {
    console.log("No content/*.md files found.");
    return;
  }
  console.log(`Seeding ${slugs.length} subject(s) into subject_content…`);

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const slug of slugs) {
    try {
      const result = await seedOne(slug);
      if (result === "inserted") inserted++;
      else updated++;
      process.stdout.write(`  ✓ ${slug.padEnd(40)} (${result})\n`);
    } catch (err) {
      failed++;
      process.stderr.write(
        `  ✗ ${slug.padEnd(40)} ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }

  console.log(
    `\nDone. inserted=${inserted}  updated=${updated}  failed=${failed}`,
  );
  if (failed > 0) process.exit(1);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
