import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { setUserHandle } from "@/lib/users-store";
import { apiMutationLimiter, tooManyRequests } from "@/lib/ratelimit";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  handle: z.string().min(3).max(24),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // Mutation tier (30/min) — handle changes are rare; the lower mutation
  // ceiling absorbs accidental retries while still tightly capping a probe
  // attack.
  const rl = await apiMutationLimiter.limit(`handle:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const result = await setUserHandle(userId, parsed.handle);
  if (!result.ok) {
    const status =
      result.error === "no_database"
        ? 503
        : result.error === "taken" || result.error === "reserved"
          ? 409
          : 400;
    return NextResponse.json(result, { status });
  }

  await logAuditEvent({
    userId,
    event: "profile.handle.set",
    metadata: { handle: result.handle },
  });

  return NextResponse.json({
    ok: true,
    handle: result.handle,
    profileUrl: `/u/${result.handle}`,
  });
}
