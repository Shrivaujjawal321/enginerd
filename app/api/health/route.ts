import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase, hasMsg91, hasResend, hasUpstash, env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/health — uptime probe.
 *
 * Returns 200 when:
 *   - process is alive (always true if this code runs)
 *   - DATABASE_URL is configured AND a `SELECT 1` round-trip succeeds
 *
 * Otherwise returns 503 — useful for Vercel/UptimeRobot/BetterStack to
 * page on-call when Neon flakes.
 *
 * Response shape stays small + cacheable-friendly (cache-control: no-store).
 */
export async function GET() {
  const startedAt = Date.now();

  // ---- Database ping ----
  let dbStatus: "ok" | "down" | "unconfigured" = "unconfigured";
  let dbLatencyMs: number | null = null;
  if (hasDatabase) {
    const dbStart = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      dbStatus = "ok";
    } catch {
      dbStatus = "down";
    }
    dbLatencyMs = Date.now() - dbStart;
  }

  // ---- Build a single overall status ----
  const overall: "ok" | "degraded" | "down" =
    dbStatus === "down"
      ? "down"
      : dbStatus === "unconfigured"
        ? "degraded"
        : "ok";

  const httpStatus = overall === "down" ? 503 : 200;

  return NextResponse.json(
    {
      status: overall,
      service: "enginerd",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      env: env.NODE_ENV,
      uptime_s: Math.round(process.uptime()),
      response_ms: Date.now() - startedAt,
      checks: {
        db: { status: dbStatus, latency_ms: dbLatencyMs },
        // Provider statuses — only report whether they're configured. Real
        // pings would burn budget, so we just track config presence.
        msg91: { configured: hasMsg91 },
        resend: { configured: hasResend },
        upstash: { configured: hasUpstash },
        anthropic: { configured: Boolean(env.ANTHROPIC_API_KEY) },
        google_oauth: { configured: Boolean(env.AUTH_GOOGLE_ID) },
      },
    },
    {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
