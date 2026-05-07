import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { subjectFeedback } from "@/lib/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { publicLimiter, getClientIp, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  subjectSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  rating: z.enum(["up", "down"]),
  comment: z.string().max(1000).optional(),
  /** Anonymous client id when no session — short random string the page sets
   *  in localStorage. Never personally-identifying. */
  anonymousId: z
    .string()
    .min(8)
    .max(60)
    .regex(/^[a-z0-9-]+$/i)
    .optional(),
});

export async function POST(req: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "no_database" }, { status: 503 });
  }

  const rl = await publicLimiter.limit(`feedback:${getClientIp(req)}`);
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

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const anonymousId = userId ? null : (parsed.anonymousId ?? null);

  if (!userId && !anonymousId) {
    return NextResponse.json(
      { error: "missing_identity" },
      { status: 400 },
    );
  }

  try {
    // Atomic upsert — relies on the unique indexes feedback_user_subject_uniq
    // (userId, subjectSlug) and feedback_anon_subject_uniq (anonymousId,
    // subjectSlug). Replaces a select-then-insert that could race two
    // concurrent POSTs into duplicate rows.
    await db
      .insert(subjectFeedback)
      .values({
        userId,
        anonymousId,
        subjectSlug: parsed.subjectSlug,
        rating: parsed.rating,
        comment: parsed.comment ?? null,
      })
      .onConflictDoUpdate({
        target: userId
          ? [subjectFeedback.userId, subjectFeedback.subjectSlug]
          : [subjectFeedback.anonymousId, subjectFeedback.subjectSlug],
        set: {
          rating: parsed.rating,
          comment: parsed.comment ?? null,
          updatedAt: new Date(),
        },
      });

    await logAuditEvent({
      userId,
      event: "feedback.submit",
      metadata: {
        subjectSlug: parsed.subjectSlug,
        rating: parsed.rating,
        anonymous: !userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("feedback.submit.failed", { err: String(err) });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
