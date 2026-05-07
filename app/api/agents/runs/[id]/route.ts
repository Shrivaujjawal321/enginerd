import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { runStore } from "@/lib/agents/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const run = await runStore.get(id);
  if (!run) {
    return NextResponse.json(
      { error: "not_found", message: `Run ${id} not found` },
      { status: 404 },
    );
  }

  // Owner check — runs without userId (legacy) are admin-only readable.
  if (run.userId && run.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: run.id,
    status: run.status,
    mode: run.mode,
    input: run.input,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    summary: run.summary,
    error: run.error,
    events: run.events,
    generated: run.generated,
  });
}
