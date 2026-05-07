import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { auth } from "@/auth";
import { recordSubmission } from "@/lib/problems-store";
import { logAuditEvent } from "@/lib/audit";
import { track } from "@/lib/analytics-server";
import { apiMutationLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  problemSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Invalid slug"),
  language: z.string().min(1).max(20),
  // Generous cap — JS solutions can be 10K+ chars when verbose.
  code: z.string().min(1).max(50_000),
  status: z.enum([
    "accepted",
    "wrong_answer",
    "runtime_error",
    "time_limit",
  ]),
  runtimeMs: z.number().int().min(0).max(60_000).optional(),
  casesPassed: z.number().int().min(0).max(1000),
  casesTotal: z.number().int().min(0).max(1000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Mutation tier (30/min) — submissions write a row + audit + analytics;
  // shares the budget with other state-changing endpoints.
  const rl = await apiMutationLimiter.limit(`submit:${session.user.id}`);
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

  const inserted = await recordSubmission({
    userId: session.user.id,
    ...parsed,
  });

  if (!inserted) {
    return NextResponse.json(
      { error: "no_database_or_problem_missing" },
      { status: 503 },
    );
  }

  // Bust the leaderboard cache when a problem is solved — readers in other
  // cohorts will pick up the change within their next request.
  if (parsed.status === "accepted") {
    // "max" = stale-while-revalidate; viewers see stale leaderboard while
    // fresh data fetches in the background. Acceptable for a leaderboard.
    revalidateTag("leaderboard", "max");
    // Their own stat tile (problems solved + streak) should reflect this
    // immediately on next /api/me poll.
    revalidateTag(`user-stats:${session.user.id}`, "max");
  }

  // Defer audit + analytics — they're independent of the response payload.
  // `waitUntil` keeps the function alive past response so the writes finish
  // without adding to user-perceived latency.
  waitUntil(
    logAuditEvent({
      userId: session.user.id,
      event:
        parsed.status === "accepted"
          ? "submission.solved"
          : "submission.failed",
      metadata: {
        problemSlug: parsed.problemSlug,
        status: parsed.status,
        casesPassed: parsed.casesPassed,
        casesTotal: parsed.casesTotal,
      },
    }),
  );
  waitUntil(
    track({
      distinctId: session.user.id,
      event:
        parsed.status === "accepted" ? "problem.solved" : "problem.run",
      properties: {
        problemSlug: parsed.problemSlug,
        language: parsed.language,
        status: parsed.status,
        casesPassed: parsed.casesPassed,
        casesTotal: parsed.casesTotal,
        runtimeMs: parsed.runtimeMs,
      },
    }),
  );

  return NextResponse.json({ ok: true, id: inserted.id });
}
