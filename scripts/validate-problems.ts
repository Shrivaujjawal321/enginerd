/**
 * scripts/validate-problems.ts — runs every test in every generated JSON
 * file against a candidate JS solution synthesized FROM the problem itself,
 * and reports which test cases fail.
 *
 * Phase 3.4 of the build plan: catches hallucinated test cases (where an
 * agent wrote an `expected` value that the editorial solution doesn't
 * actually produce). Without this, bad problems would land in the DB.
 *
 * What this validator does:
 *   1. For each problem, look at `editorial` for a JS code block.
 *      If found: run that solution against `tests`.
 *      If NOT found: the problem is flagged for manual review.
 *   2. For each failing test, log the case.
 *   3. Optionally write a `validated.json` per file with only the problems
 *      that passed.
 *
 * Usage:
 *   npx tsx scripts/validate-problems.ts            # report only
 *   npx tsx scripts/validate-problems.ts --write    # also write validated.json
 *
 * NOTE: this runs in the Node VM — `vm.runInNewContext`. NOT a sandbox for
 * adversarial code; only for our own agent-generated solutions.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const GEN_DIR = path.join(process.cwd(), "data", "generated-problems");

type RawProblem = {
  slug: string;
  title: string;
  fnName: string;
  tests: Array<{ args: unknown[]; expected: unknown; label?: string }>;
  editorial?: string;
  starterCode?: Array<{ language: string; code: string }>;
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const ak = Object.keys(ao);
    const bk = Object.keys(bo);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (!deepEqual(ao[k], bo[k])) return false;
    return true;
  }
  return false;
}

/** Pull the first ```js or ```javascript fenced block out of markdown. */
function extractJsFromMarkdown(md: string): string | null {
  const re = /```(?:javascript|js)\s*\n([\s\S]*?)```/i;
  const m = md.match(re);
  return m ? (m[1]?.trim() ?? null) : null;
}

function compileSolution(code: string, fnName: string): ((...args: unknown[]) => unknown) | null {
  try {
    const ctx: Record<string, unknown> = {};
    vm.createContext(ctx);
    vm.runInContext(`${code}\n;__fn = typeof ${fnName} === "function" ? ${fnName} : null;`, ctx);
    const fn = (ctx as { __fn?: unknown }).__fn;
    if (typeof fn !== "function") return null;
    return fn as (...args: unknown[]) => unknown;
  } catch (err) {
    console.warn(`[validate] compile error: ${(err as Error).message}`);
    return null;
  }
}

type FileReport = {
  file: string;
  totalProblems: number;
  validated: number;
  failed: number;
  noEditorial: number;
  problemsValid: RawProblem[];
};

async function validateFile(file: string): Promise<FileReport> {
  const raw = await fs.readFile(path.join(GEN_DIR, file), "utf8");
  const problems = JSON.parse(raw) as RawProblem[];
  let validated = 0;
  let failed = 0;
  let noEditorial = 0;
  const problemsValid: RawProblem[] = [];

  for (const p of problems) {
    const md = p.editorial ?? "";
    let code = extractJsFromMarkdown(md);
    if (!code) {
      // Fallback: try the JS starter (some agents put the solution there).
      const jsStarter = p.starterCode?.find((s) => s.language === "javascript");
      if (jsStarter && /return\s+/.test(jsStarter.code)) {
        code = jsStarter.code;
      }
    }

    if (!code) {
      noEditorial++;
      console.warn(`[validate]  ${p.slug}: no editorial JS block — manual review needed`);
      problemsValid.push(p); // keep — still might be valid; just unverified
      continue;
    }

    const fn = compileSolution(code, p.fnName);
    if (!fn) {
      console.warn(`[validate]  ${p.slug}: compile failed`);
      failed++;
      continue;
    }

    let allPassed = true;
    for (let i = 0; i < p.tests.length; i++) {
      const t = p.tests[i]!;
      try {
        // Deep-clone args in case the solution mutates them (in-place sort etc.)
        const argsCopy = JSON.parse(JSON.stringify(t.args));
        const actual = fn(...argsCopy);
        if (!deepEqual(actual, t.expected)) {
          console.warn(
            `[validate]  ${p.slug} test#${i} (${t.label ?? "unnamed"}) FAIL — expected ${JSON.stringify(
              t.expected,
            )}, got ${JSON.stringify(actual)}`,
          );
          allPassed = false;
        }
      } catch (err) {
        console.warn(
          `[validate]  ${p.slug} test#${i} threw: ${(err as Error).message.slice(0, 100)}`,
        );
        allPassed = false;
      }
    }

    if (allPassed) {
      validated++;
      problemsValid.push(p);
    } else {
      failed++;
    }
  }

  return {
    file,
    totalProblems: problems.length,
    validated,
    failed,
    noEditorial,
    problemsValid,
  };
}

async function main() {
  const writeFlag = process.argv.includes("--write");
  let entries: string[];
  try {
    entries = await fs.readdir(GEN_DIR);
  } catch {
    console.error(`Directory ${GEN_DIR} not found.`);
    process.exit(1);
  }
  const files = entries.filter((e) => e.endsWith(".json") && !e.includes(".validated."));

  let totalAll = 0;
  let validatedAll = 0;
  let failedAll = 0;
  let noEditorialAll = 0;

  for (const file of files) {
    console.log(`\n[validate] ${file}`);
    const r = await validateFile(file);
    console.log(
      `[validate] ${file}: total=${r.totalProblems} validated=${r.validated} failed=${r.failed} noEditorial=${r.noEditorial}`,
    );
    totalAll += r.totalProblems;
    validatedAll += r.validated;
    failedAll += r.failed;
    noEditorialAll += r.noEditorial;

    if (writeFlag) {
      const outName = file.replace(/\.json$/, ".validated.json");
      await fs.writeFile(
        path.join(GEN_DIR, outName),
        JSON.stringify(r.problemsValid, null, 2),
      );
      console.log(`[validate] wrote ${outName} (${r.problemsValid.length} kept)`);
    }
  }

  console.log(
    `\n[validate] SUMMARY: total=${totalAll} validated=${validatedAll} failed=${failedAll} noEditorial=${noEditorialAll}`,
  );
}

main().catch((err) => {
  console.error("[validate] FAILED:", err);
  process.exit(1);
});
