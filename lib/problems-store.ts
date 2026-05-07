import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  problems as problemsTable,
  submissions as submissionsTable,
  type ProblemRow,
} from "@/lib/db/schema";
import type { Problem } from "@/lib/mock-data/types";

/* ============================================================================
 * Problems are read-mostly and identical across users — one cache for the
 * whole process. Submissions are per-user and queried fresh.
 *
 * The mock-data fallback was removed once the DB seeded 459 problems. If
 * `DATABASE_URL` is unset or the DB returns zero rows we now return an
 * empty array — better than serving stale mock content for an unbooted
 * environment.
 * ============================================================================
 */

function rowToProblem(row: ProblemRow): Problem {
  return {
    slug: row.slug,
    number: row.number,
    title: row.title,
    difficulty: row.difficulty as Problem["difficulty"],
    topic: row.topic,
    companies: row.companies,
    status: "unsolved", // overlaid per-user later
    description: row.description,
    examples: row.examples,
    constraints: row.constraints,
    hints: row.hints,
    starterCode: row.starterCode,
    fnName: row.fnName ?? undefined,
    tests: row.tests,
  };
}

let dbHasProblemsCache: boolean | null = null;

async function dbHasProblems(): Promise<boolean> {
  if (!hasDatabase) return false;
  if (dbHasProblemsCache !== null) return dbHasProblemsCache;
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(problemsTable);
    dbHasProblemsCache = count > 0;
    return dbHasProblemsCache;
  } catch (err) {
    console.error("[problems] count check failed", err);
    return false;
  }
}

export async function listProblems(): Promise<Problem[]> {
  if (!(await dbHasProblems())) return [];
  try {
    // 500 is well above the seeded 459 rows but caps egress in the runaway
    // case where someone seeds 10k+ problems and forgets a paginated reader.
    // Search/filter consumers should use `listProblemSearchEntries` (slim cols).
    const rows = await db
      .select()
      .from(problemsTable)
      .orderBy(asc(problemsTable.number))
      .limit(500);
    return rows.map(rowToProblem);
  } catch (err) {
    console.error("[problems] listProblems failed", err);
    return [];
  }
}

/**
 *  Slim search index entries — just slug/title/topic/difficulty/companies.
 *  Avoids dragging the full markdown body and starter code through Neon
 *  for the cmd+k palette (saves ~3.5MB egress per cache miss at 460 problems).
 */
export type ProblemSearchEntry = {
  slug: string;
  number: number;
  title: string;
  difficulty: string;
  topic: string;
  companies: string[];
};

export async function listProblemSearchEntries(): Promise<
  ProblemSearchEntry[]
> {
  if (!(await dbHasProblems())) return [];
  try {
    const rows = await db
      .select({
        slug: problemsTable.slug,
        number: problemsTable.number,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
        topic: problemsTable.topic,
        companies: problemsTable.companies,
      })
      .from(problemsTable)
      .orderBy(asc(problemsTable.number));
    return rows.map((r) => ({
      slug: r.slug,
      number: r.number,
      title: r.title,
      difficulty: r.difficulty,
      topic: r.topic,
      companies: (r.companies as string[]) ?? [],
    }));
  } catch (err) {
    console.error("[problems] listProblemSearchEntries failed", err);
    return [];
  }
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  if (!(await dbHasProblems())) return null;
  try {
    const row = await db.query.problems.findFirst({
      where: eq(problemsTable.slug, slug),
    });
    return row ? rowToProblem(row) : null;
  } catch (err) {
    console.error("[problems] getProblemBySlug failed", err);
    return null;
  }
}

export async function getProblemRowBySlug(
  slug: string,
): Promise<ProblemRow | null> {
  if (!hasDatabase) return null;
  try {
    const row = await db.query.problems.findFirst({
      where: eq(problemsTable.slug, slug),
    });
    return row ?? null;
  } catch {
    return null;
  }
}

export async function listProblemSlugs(): Promise<string[]> {
  if (!(await dbHasProblems())) return [];
  try {
    const rows = await db
      .select({ slug: problemsTable.slug })
      .from(problemsTable);
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

/* --------- Submissions ---------------------------------------------------- */

export type SubmissionStatus =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit";

export async function recordSubmission(args: {
  userId: string;
  problemSlug: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  runtimeMs?: number;
  casesPassed: number;
  casesTotal: number;
}): Promise<{ id: string } | null> {
  if (!hasDatabase) return null;
  try {
    const problem = await getProblemRowBySlug(args.problemSlug);
    if (!problem) return null;
    const inserted = await db
      .insert(submissionsTable)
      .values({
        userId: args.userId,
        problemId: problem.id,
        language: args.language,
        code: args.code,
        status: args.status,
        runtimeMs: args.runtimeMs ?? null,
        casesPassed: args.casesPassed,
        casesTotal: args.casesTotal,
      })
      .returning({ id: submissionsTable.id });
    return inserted[0] ?? null;
  } catch (err) {
    console.error("[problems] recordSubmission failed", err);
    return null;
  }
}

export type ProblemUserStatus = "unsolved" | "attempted" | "solved";

/**
 * Returns the best status for each problem this user has touched, keyed by
 * problem slug. solved > attempted > unsolved.
 */
export async function getUserProblemStatuses(
  userId: string,
): Promise<Record<string, ProblemUserStatus>> {
  if (!hasDatabase) return {};
  try {
    const rows = await db
      .select({
        slug: problemsTable.slug,
        status: submissionsTable.status,
      })
      .from(submissionsTable)
      .innerJoin(
        problemsTable,
        eq(submissionsTable.problemId, problemsTable.id),
      )
      .where(eq(submissionsTable.userId, userId));

    const out: Record<string, ProblemUserStatus> = {};
    for (const r of rows) {
      const cur = out[r.slug];
      if (r.status === "accepted") {
        out[r.slug] = "solved";
      } else if (cur !== "solved") {
        out[r.slug] = "attempted";
      }
    }
    return out;
  } catch (err) {
    console.error("[problems] getUserProblemStatuses failed", err);
    return {};
  }
}

export async function listRecentSubmissionsForProblem(args: {
  userId: string;
  problemSlug: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    status: SubmissionStatus;
    language: string;
    casesPassed: number;
    casesTotal: number;
    runtimeMs: number | null;
    submittedAt: Date;
  }>
> {
  if (!hasDatabase) return [];
  const problem = await getProblemRowBySlug(args.problemSlug);
  if (!problem) return [];
  try {
    const rows = await db
      .select({
        id: submissionsTable.id,
        status: submissionsTable.status,
        language: submissionsTable.language,
        casesPassed: submissionsTable.casesPassed,
        casesTotal: submissionsTable.casesTotal,
        runtimeMs: submissionsTable.runtimeMs,
        submittedAt: submissionsTable.submittedAt,
      })
      .from(submissionsTable)
      .where(
        and(
          eq(submissionsTable.userId, args.userId),
          eq(submissionsTable.problemId, problem.id),
        ),
      )
      .orderBy(desc(submissionsTable.submittedAt))
      .limit(args.limit ?? 10);
    return rows.map((r) => ({
      ...r,
      status: r.status as SubmissionStatus,
    }));
  } catch (err) {
    console.error("[problems] listRecentSubmissionsForProblem failed", err);
    return [];
  }
}

/** Drop the cached "DB has problems" flag — call after seeding. */
export function invalidateProblemsCache() {
  dbHasProblemsCache = null;
}
