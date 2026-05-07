/**
 * scripts/seed-problems.ts — bulk-insert generated DSA problems.
 *
 * Reads every JSON file in `data/generated-problems/`, validates each
 * problem's shape, and upserts into the `problems` table. Idempotent:
 * existing slugs get UPDATED, new slugs INSERTED.
 *
 * Usage:
 *   npx tsx scripts/seed-problems.ts            # all topic files
 *   npx tsx scripts/seed-problems.ts arrays-hashing  # one file
 *
 * Doesn't run the editorial against tests — that's `validate-problems.ts`.
 * This is the dumb-pipe seeder; the validator runs separately and rejects
 * problems that fail their own tests before they ever land in the DB.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db, schema } from "./_db";

const { problems: problemsTable } = schema;

const GEN_DIR = path.join(process.cwd(), "data", "generated-problems");

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

const starterCodeSchema = z.object({
  language: z.string(),
  code: z.string(),
});

const testSchema = z.object({
  args: z.array(z.unknown()),
  expected: z.unknown(),
  label: z.string().optional(),
});

const problemSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  number: z.number().int().min(1),
  title: z.string().min(1).max(200),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().min(1).max(80),
  companies: z.array(z.string()).min(1).max(10),
  description: z.string().min(20),
  examples: z.array(exampleSchema).min(1).max(8),
  constraints: z.array(z.string()).min(1).max(12),
  hints: z.array(z.string()).min(1).max(8),
  starterCode: z.array(starterCodeSchema).min(1),
  fnName: z.string().min(1).max(80),
  tests: z.array(testSchema).min(2).max(20),
  editorial: z.string().optional(),
});

type ParsedProblem = z.infer<typeof problemSchema>;

async function loadFile(file: string): Promise<ParsedProblem[]> {
  const full = path.join(GEN_DIR, file);
  const raw = await fs.readFile(full, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${file}: invalid JSON — ${(err as Error).message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error(`${file}: expected JSON array, got ${typeof data}`);
  }
  const out: ParsedProblem[] = [];
  for (let i = 0; i < data.length; i++) {
    const r = problemSchema.safeParse(data[i]);
    if (!r.success) {
      const item = data[i] as { slug?: string; title?: string };
      console.warn(
        `[seed] ${file}#${i} (${item.title ?? "no title"}) skipped — ${r.error.issues
          .slice(0, 3)
          .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
          .join("; ")}`,
      );
      continue;
    }
    out.push(r.data);
  }
  return out;
}

async function listFiles(filter?: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(GEN_DIR);
  } catch {
    throw new Error(`Directory ${GEN_DIR} not found.`);
  }
  const all = entries.filter((e) => e.endsWith(".json"));

  // Prefer `*.validated.json` (filtered by the validator) over the raw
  // `*.json` for the same topic — that way only problems whose editorial
  // actually executes against the test cases land in the DB.
  const validatedTopics = new Set(
    all
      .filter((f) => f.endsWith(".validated.json"))
      .map((f) => f.replace(/\.validated\.json$/, "")),
  );

  const files = all.filter((f) => {
    if (f.endsWith(".validated.json")) return true;
    const topic = f.replace(/\.json$/, "");
    return !validatedTopics.has(topic);
  });

  if (filter) {
    return files.filter((f) => f.startsWith(filter));
  }
  return files;
}

async function upsertProblem(p: ParsedProblem): Promise<"inserted" | "updated"> {
  const existing = await db.query.problems.findFirst({
    where: eq(problemsTable.slug, p.slug),
  });

  const values = {
    slug: p.slug,
    number: p.number,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic,
    companies: p.companies,
    description: p.description,
    examples: p.examples,
    constraints: p.constraints,
    hints: p.hints,
    starterCode: p.starterCode,
    fnName: p.fnName,
    tests: p.tests,
    editorial: p.editorial ?? null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(problemsTable)
      .set(values)
      .where(eq(problemsTable.slug, p.slug));
    return "updated";
  }

  await db.insert(problemsTable).values(values);
  return "inserted";
}

async function main() {
  const filter = process.argv[2];
  const files = await listFiles(filter);
  if (files.length === 0) {
    console.log(`No files matched ${filter ?? "*.json"} in ${GEN_DIR}`);
    return;
  }

  console.log(`[seed] processing ${files.length} file(s)`);
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let total = 0;

  for (const file of files) {
    const problems = await loadFile(file);
    total += problems.length;
    console.log(`[seed] ${file}: ${problems.length} valid problem(s)`);
    for (const p of problems) {
      try {
        const op = await upsertProblem(p);
        if (op === "inserted") inserted++;
        else updated++;
      } catch (err) {
        console.error(`[seed] ${p.slug} failed:`, (err as Error).message);
        skipped++;
      }
    }
  }

  console.log(
    `\n[seed] done — total parsed=${total}  inserted=${inserted}  updated=${updated}  skipped=${skipped}`,
  );
}

main().catch((err) => {
  console.error("[seed] FAILED:", err);
  process.exit(1);
});
