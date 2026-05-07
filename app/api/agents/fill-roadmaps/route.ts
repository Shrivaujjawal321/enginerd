import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { triggerFillRoadmaps } from "@/lib/agents/fill-pipeline";
import { isLive } from "@/lib/llm";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

const bodySchema = z.object({
  slugs: z.array(z.string()).optional(),
  maxSubjectsPerRoadmap: z.number().int().min(1).max(8).optional(),
  maxTopicsPerSubject: z.number().int().min(1).max(6).optional(),
  maxSubtopicsPerTopic: z.number().int().min(1).max(6).optional(),
});

/**
 * /api/agents/fill-roadmaps — fans out ~100 LLM calls per request.
 *
 * ADMIN-ONLY. Gated by a header secret on top of the session check, since
 * an authenticated learner triggering this would still drain budget. Set
 * INTERNAL_ADMIN_TOKEN in production env and never share it client-side.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const adminToken = req.headers.get("x-internal-token");
  const expected = process.env.INTERNAL_ADMIN_TOKEN;
  if (!expected || !adminToken || !safeEqual(adminToken, expected)) {
    await logAuditEvent({
      userId: session.user.id,
      event: "agents.fill.unauthorized",
    });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await req.json().catch(() => ({}));
    parsed = bodySchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: err instanceof Error ? err.message : "Invalid request body",
      },
      { status: 400 },
    );
  }

  const run = await triggerFillRoadmaps({
    ...parsed,
    userId: session.user.id,
  });

  await logAuditEvent({
    userId: session.user.id,
    event: "agents.fill.start",
    metadata: { runId: run.id, slugs: parsed.slugs ?? "all" },
  });

  return NextResponse.json(
    {
      runId: run.id,
      status: run.status,
      mode: run.mode,
      live: isLive(),
      input: run.input,
      startedAt: run.startedAt,
    },
    { status: 202 },
  );
}
