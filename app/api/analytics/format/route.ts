import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { track } from "@/lib/analytics-server";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { apiMutationLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 *  POST /api/analytics/format
 *
 *  Records a "user picked this format for this subject" signal. Powers the
 *  cycle-22 personality model — once we have enough events per user we can
 *  pre-select their dominant format on every new subject they open and
 *  surface "you're a slides learner (60%)" on /home.
 *
 *  Anonymous callers (no session) are accepted but NOT tracked. We could
 *  fingerprint by IP to attribute browsing pre-signup, but that's a DPDPA
 *  surface we don't want to open without a consent banner — so for now,
 *  format engagement is observed only after sign-in.
 */

const bodySchema = z.object({
  subjectSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Invalid slug"),
  format: z.enum(["read", "slides", "mindmap", "flashcards"]),
});

export async function POST(req: Request) {
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
  const userId = session?.user?.id;

  // Pre-signup browsing — accept the call so the client doesn't retry, but
  // don't fan out to PostHog / audit. Conversion comes when they sign in;
  // pre-signup format choices are not load-bearing for the personality
  // model.
  if (!userId) {
    return NextResponse.json({ ok: true, tracked: false });
  }

  const rl = await apiMutationLimiter.limit(`format:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  try {
    await track({
      distinctId: userId,
      event: "format.selected",
      properties: {
        subjectSlug: parsed.subjectSlug,
        format: parsed.format,
      },
    });
    // Durable copy in audit_events so we can compute the personality model
    // off our own DB without depending on PostHog being queryable.
    await logAuditEvent({
      userId,
      event: "format.selected",
      metadata: {
        subjectSlug: parsed.subjectSlug,
        format: parsed.format,
      },
    });
  } catch (err) {
    // Tracking is best-effort — never fail the user's tab click on a logger
    // hiccup. The error is surfaced to Sentry via the structured logger.
    logger.warn("format.selected.track_failed", { err: String(err) });
  }

  return NextResponse.json({ ok: true, tracked: true });
}
