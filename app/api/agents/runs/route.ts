import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { runStore } from "@/lib/agents/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Owner-scoped — every user only sees their own runs.
  const runs = await runStore.list(20, { userId: session.user.id });
  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      status: r.status,
      mode: r.mode,
      input: r.input,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      eventCount: r.events.length,
      summary: r.summary,
      error: r.error,
    })),
  });
}
