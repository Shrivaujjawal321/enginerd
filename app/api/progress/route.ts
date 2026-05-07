import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  getUserProgress,
  setSubtopicProgress,
} from "@/lib/progress";
import { apiMutationLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- GET — return progress map for the current user ------------- */

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const map = await getUserProgress(session.user.id);
  return NextResponse.json({ progress: map });
}

/* ---------- POST — upsert one subtopic ---------------------------------- */

const bodySchema = z.object({
  subtopicSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Invalid slug"),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Mutation tier (30/min/user) — typical Mark Complete cadence is far less;
  // this caps rogue clients from flooding userProgress + audit_events.
  const rl = await apiMutationLimiter.limit(`progress:${session.user.id}`);
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

  const entry = await setSubtopicProgress({
    userId: session.user.id,
    subtopicSlug: parsed.subtopicSlug,
    status: parsed.status,
  });

  if (!entry) {
    return NextResponse.json(
      {
        error: "no_database",
        message:
          "DATABASE_URL is not configured — progress can't be saved yet.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, entry });
}
