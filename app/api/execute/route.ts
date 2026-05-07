import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getProblemBySlug } from "@/lib/problems-store";
import {
  isSupportedServerLang,
  runOnPiston,
  type SupportedLang,
} from "@/lib/code-runner-server";
import { apiLimiter, tooManyRequests } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Piston cold-starts can take 5-8 sec for compiled languages. Bump.
export const maxDuration = 30;

const bodySchema = z.object({
  problemSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  language: z.string().min(1).max(20),
  code: z.string().min(1).max(50_000),
  // "run" = first test only (sample). "submit" = all tests.
  mode: z.enum(["run", "submit"]).default("run"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // Per-user execution limit — Piston public API is rate-limited (~5/sec
  // global), so we throttle aggressively to share fairly across users.
  const rl = await apiLimiter.limit(`execute:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "validation", details: err instanceof Error ? err.message : "" },
      { status: 400 },
    );
  }

  const lang = parsed.language.toLowerCase();
  if (!isSupportedServerLang(lang)) {
    return NextResponse.json(
      {
        error: "unsupported_language",
        supported: [
          "python",
          "javascript",
          "typescript",
          "java",
          "cpp",
          "go",
          "rust",
        ],
      },
      { status: 400 },
    );
  }

  const problem = await getProblemBySlug(parsed.problemSlug);
  if (!problem) {
    return NextResponse.json({ error: "problem_not_found" }, { status: 404 });
  }
  if (!problem.fnName || !problem.tests || problem.tests.length === 0) {
    return NextResponse.json(
      { error: "no_tests_configured" },
      { status: 422 },
    );
  }

  const tests = parsed.mode === "run" ? problem.tests.slice(0, 1) : problem.tests;

  logger.info("execute.start", {
    userId,
    slug: parsed.problemSlug,
    language: lang,
    mode: parsed.mode,
    testCount: tests.length,
  });

  const outcome = await runOnPiston({
    language: lang as SupportedLang,
    code: parsed.code,
    fnName: problem.fnName,
    tests,
  });

  logger.info("execute.done", {
    userId,
    slug: parsed.problemSlug,
    language: lang,
    kind: outcome.kind,
    passed:
      outcome.kind === "ok"
        ? outcome.cases.filter((c) => c.passed).length
        : 0,
    total: tests.length,
  });

  return NextResponse.json(outcome);
}
