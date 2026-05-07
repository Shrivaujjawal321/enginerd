import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { triggerRun } from "@/lib/agents/pipeline";
import { isLive } from "@/lib/llm";
import { apiLimiter, tooManyRequests } from "@/lib/ratelimit";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";

const bodySchema = z.object({
  industry: z.string().min(2).max(80).default("Indian engineering students"),
  count: z.number().int().min(1).max(4).default(1),
  maxSubjectsPerCareer: z.number().int().min(1).max(10).default(3),
  maxTopicsPerSubject: z.number().int().min(1).max(8).default(2),
  maxSubtopicsPerTopic: z.number().int().min(1).max(6).default(2),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // 5 trigger requests per minute per user — agent runs are expensive.
  const rl = await apiLimiter.limit(`agents:trigger:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

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

  const run = await triggerRun({ ...parsed, userId });

  await logAuditEvent({
    userId,
    event: "agents.trigger",
    metadata: { runId: run.id, mode: run.mode, input: parsed },
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
