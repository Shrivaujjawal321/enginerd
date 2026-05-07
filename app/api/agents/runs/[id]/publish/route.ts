import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { runStore } from "@/lib/agents/store";
import { library } from "@/lib/agents/library";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(
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
  if (run.userId && run.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (run.status !== "succeeded") {
    return NextResponse.json(
      {
        error: "not_ready",
        message: `Run is ${run.status}; only succeeded runs can be published.`,
      },
      { status: 409 },
    );
  }

  const published = await Promise.all(
    run.generated.map((gen) =>
      library.publish(run.id, gen, { publishedBy: session.user.id }),
    ),
  );

  await logAuditEvent({
    userId: session.user.id,
    event: "library.publish",
    metadata: {
      runId: run.id,
      slugs: published.map((p) => p.roadmap.slug),
    },
  });

  return NextResponse.json({
    runId: run.id,
    publishedCount: published.length,
    roadmaps: published.map((p) => ({
      slug: p.roadmap.slug,
      title: p.roadmap.title,
      subjectsCount: p.subjects.length,
    })),
  });
}
