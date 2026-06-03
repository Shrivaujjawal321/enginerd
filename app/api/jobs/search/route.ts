import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { aggregateJobs, type NormalizedJob } from "@/lib/job-providers";
import { apiLimiter, tooManyRequests } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MAX_QUERY_LEN = 80;

/**
 *  GET /api/jobs/search?q=<role or keyword>
 *
 *  Public, unauthenticated endpoint. Returns raw `NormalizedJob[]` from the
 *  public job-board aggregator (Remotive + Arbeitnow + Muse) so the client
 *  can pass each job straight into the LLM match endpoint.
 *
 *  Cached for 1 hour per query — protects providers from spike traffic and
 *  lets us still hit a stale-while-revalidate window for 24h.
 */
const cachedAggregate = (query: string) =>
  unstable_cache(
    () => aggregateJobs(query),
    ["jobs-search", query],
    { revalidate: 3600, tags: ["jobs"] },
  )();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawQuery = url.searchParams.get("q")?.trim() ?? "";
  if (!rawQuery) {
    return NextResponse.json(
      { error: "Provide ?q=<role or keyword>" },
      { status: 400 },
    );
  }

  // Normalize: lowercased + capped — defeats cache-fragmentation attacks
  // where an attacker sends `?q=foo`, `?q=Foo`, `?q=foo `, … to bypass cache.
  const query = rawQuery.toLowerCase().slice(0, MAX_QUERY_LEN);

  const ip =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const rl = await apiLimiter.limit(`jobs-search:${ip}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  try {
    let jobs: NormalizedJob[];
    try {
      jobs = await cachedAggregate(query);
    } catch (err) {
      logger.error("jobs.search.aggregate", {
        err: err instanceof Error ? err.message : String(err),
        query,
      });
      jobs = [];
    }
    return NextResponse.json(
      {
        jobs,
        count: jobs.length,
        source: jobs.length > 0 ? "live" : "stub",
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    logger.error("jobs.search.failed", {
      err: err instanceof Error ? err.message : String(err),
      query,
    });
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }
}
