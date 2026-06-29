/**
 * scripts/add-language-starters.ts
 *
 * Reads every `data/generated-problems/*.validated.json` (and falls through
 * to the raw `*.json` when no validated file exists), and adds Java + C++ +
 * TypeScript starter stubs to the `starterCode` array. Idempotent — skips
 * entries that already have a given language.
 *
 * Why script-based, not LLM-generated? — the existing JS + Python starters
 * already encode the canonical signature. Auto-deriving Java/C++/TS stubs
 * from `fnName` produces a working *shell* — user fills in. Per-problem
 * hand-tuning (correct typing of args/return) is Phase 8+ content work.
 *
 * Usage:
 *   npx tsx scripts/add-language-starters.ts            # all topic files
 *   npx tsx scripts/add-language-starters.ts arrays-hashing  # one file
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const GEN_DIR = path.join(process.cwd(), "data", "generated-problems");

type StarterCode = { language: string; code: string };
type Problem = {
  slug: string;
  fnName: string;
  starterCode: StarterCode[];
  // We don't touch the rest — opaque pass-through.
  [k: string]: unknown;
};

/* ============================================================================
 *  Stub generators — minimal shells that compile, don't pass tests.
 *
 *  The shape MUST match what the corresponding harness in
 *  `lib/code-runner-server.ts` expects:
 *
 *  - Java: harness wraps in `public class Main { ${userCode} ... }`. User
 *    writes ONE method whose name = fnName, takes Object[] args, returns Object.
 *
 *  - C++: harness includes the user code at file scope before main(). User
 *    writes a top-level function: `json fnName(json args) { ... }`.
 *
 *  - TypeScript: same as JS — one top-level function `function fnName(...) {}`.
 *
 *  - Go: harness manages package + main. User writes a top-level function
 *    `func fnName(args []interface{}) interface{} { ... }`.
 * ============================================================================
 */

function javaStub(fnName: string): string {
  return `// EngiNerd Java starter — bhar de.
// Harness aap ki function ko \`Object[] args\` ke saath call karta hai.
// args[0], args[1], ... mein test ke arguments hain.
public Object ${fnName}(Object[] args) {
  // tu yahan apna solution likh
  // example: List<Integer> nums = (List<Integer>) args[0];
  return null;
}
`;
}

function cppStub(fnName: string): string {
  return `// EngiNerd C++ starter — bhar de.
// nlohmann::json se args[0], args[1], ... mein values nikaal.
json ${fnName}(json args) {
  // tu yahan apna solution likh
  // example: vector<int> nums = args[0].get<vector<int>>();
  return nullptr;
}
`;
}

function typescriptStub(fnName: string, jsSignature: string | null): string {
  // Re-use the JS signature literally — TS is a strict superset.
  if (jsSignature) {
    return `function ${fnName}(${jsSignature}): unknown {
  // tu yahan apna solution likh
  return null;
}
`;
  }
  return `function ${fnName}(...args: unknown[]): unknown {
  // tu yahan apna solution likh
  return null;
}
`;
}

function goStub(fnName: string): string {
  // Go can't easily do generic args without per-problem boilerplate; the
  // harness signature is `func fnName(args []interface{}) interface{}`.
  return `// EngiNerd Go starter — bhar de.
// args[0], args[1], ... mein test ke arguments hain (type assertion zaroori).
func ${fnName}(args []interface{}) interface{} {
	// tu yahan apna solution likh
	// example: nums := args[0].([]interface{})
	return nil
}
`;
}

/**
 * Python stub — fallback for problems whose upstream JSON doesn't already
 * include a python entry. ensureStarter is idempotent so this is a no-op when
 * the upstream stub already exists (which is the common case).
 *
 * The harness tries camelCase first, then snake_case, so either naming works.
 */
function pythonStub(fnName: string): string {
  // Convert camelCase to snake_case for PEP 8 convention.
  const snakeName = fnName
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
  return `# EngiNerd Python starter — bhar de.
# Harness camelCase aur snake_case dono try karta hai.
def ${snakeName}(*args):
    # tu yahan apna solution likh
    # example: nums = args[0]; target = args[1]
    return None
`;
}

/**
 * Rust stub — matches the signature that rustHarness() in
 * lib/code-runner-server.ts expects:
 *   fn ${fnName}(args: Vec<Val>) -> Val
 *
 * The harness injects the Val enum + parser into the file before user code,
 * so Val is available without an import in the stub.
 */
function rustStub(fnName: string): string {
  return `// EngiNerd Rust starter — bhar de.
//
// Val enum (provided by the harness — no import needed):
//   Val::Null | Val::Bool(bool) | Val::Num(f64) | Val::Str(String) | Val::Arr(Vec<Val>)
//
// Example usage:
//   let nums = if let Val::Arr(v) = &args[0] { v } else { return Val::Null };
//   let target = if let Val::Num(n) = args[1] { *n as i64 } else { return Val::Null };
fn ${fnName}(args: Vec<Val>) -> Val {
    // tu yahan apna solution likh
    let _ = args; // suppress unused-variable warning
    Val::Null
}
`;
}

/**
 * C stub — matches the signature that cHarness() in
 * lib/code-runner-server.ts expects:
 *   char* ${fnName}(int argc, char* argv[])
 *
 * Each argv[i] is a null-terminated JSON string for that argument.
 * Return a null-terminated JSON string (static literal is fine for simple cases).
 */
function cStub(fnName: string): string {
  return `/* EngiNerd C starter — bhar de.
 * argc = number of test arguments
 * argv[i] = i-th argument as a null-terminated JSON string
 *   e.g. argv[0]="[2,7,11,15]"  argv[1]="9"
 * Return a null-terminated JSON string (static literal OK for simple cases).
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* ${fnName}(int argc, char* argv[]) {
    (void)argc; (void)argv; /* suppress unused warnings */
    /* tu yahan apna solution likh */
    return "null";
}
`;
}

/** Try to extract the JS signature `(arg1, arg2, ...)` from existing starter. */
function extractJsSignature(code: string, fnName: string): string | null {
  const re = new RegExp(`function\\s+${fnName}\\s*\\(([^)]*)\\)`);
  const m = code.match(re);
  return m ? (m[1] ?? "").trim() : null;
}

/* ============================================================================
 *  Mutation logic
 * ============================================================================
 */

function ensureStarter(
  problem: Problem,
  language: string,
  build: () => string,
): boolean {
  const exists = problem.starterCode.some((s) => s.language === language);
  if (exists) return false;
  problem.starterCode.push({ language, code: build() });
  return true;
}

function augment(problem: Problem): {
  added: string[];
  skipped: string[];
} {
  const added: string[] = [];
  const skipped: string[] = [];

  const jsStarter = problem.starterCode.find(
    (s) => s.language === "javascript",
  );
  const jsSignature = jsStarter
    ? extractJsSignature(jsStarter.code, problem.fnName)
    : null;

  for (const [lang, builder] of [
    ["python", () => pythonStub(problem.fnName)],
    ["java", () => javaStub(problem.fnName)],
    ["cpp", () => cppStub(problem.fnName)],
    ["typescript", () => typescriptStub(problem.fnName, jsSignature)],
    ["go", () => goStub(problem.fnName)],
    ["rust", () => rustStub(problem.fnName)],
    ["c", () => cStub(problem.fnName)],
  ] as const) {
    const ok = ensureStarter(problem, lang, builder);
    (ok ? added : skipped).push(lang);
  }

  return { added, skipped };
}

async function processFile(file: string): Promise<{
  total: number;
  added: number;
  skipped: number;
}> {
  const full = path.join(GEN_DIR, file);
  const raw = await fs.readFile(full, "utf8");
  const problems = JSON.parse(raw) as Problem[];

  let totalAdded = 0;
  let totalSkipped = 0;
  for (const p of problems) {
    const { added, skipped } = augment(p);
    totalAdded += added.length;
    totalSkipped += skipped.length;
  }

  await fs.writeFile(full, JSON.stringify(problems, null, 2));
  return {
    total: problems.length,
    added: totalAdded,
    skipped: totalSkipped,
  };
}

async function main() {
  const filter = process.argv[2];
  const all = await fs.readdir(GEN_DIR);

  // Prefer .validated.json over .json — those are the seeded set.
  const byTopic = new Map<string, string>();
  for (const f of all) {
    if (!f.endsWith(".json")) continue;
    const topic = f.replace(/\.validated\.json$/, "").replace(/\.json$/, "");
    if (filter && !topic.startsWith(filter)) continue;
    if (f.endsWith(".validated.json") || !byTopic.has(topic)) {
      byTopic.set(topic, f);
    }
  }

  let totalProblems = 0;
  let totalAdded = 0;
  let totalSkipped = 0;

  for (const [topic, file] of byTopic) {
    const r = await processFile(file);
    console.log(
      `[stub] ${topic.padEnd(22)} problems=${r.total} added=${r.added} skipped=${r.skipped}`,
    );
    totalProblems += r.total;
    totalAdded += r.added;
    totalSkipped += r.skipped;
  }

  console.log(
    `\n[stub] DONE — files=${byTopic.size} problems=${totalProblems} starters_added=${totalAdded} skipped_existing=${totalSkipped}`,
  );
}

main().catch((err) => {
  console.error("[stub] FAILED:", err);
  process.exit(1);
});
