import { NextResponse } from "next/server";

import { getRealJobs } from "@/lib/real-jobs";
import { apiLimiter, tooManyRequests } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MAX_QUERY_LEN = 80;

/**
 *  GET /api/jobs/search?q=<role or keyword>
 *
 *  Public, unauthenticated endpoint. Routes through `getRealJobs` which is
 *  `unstable_cache`-wrapped with a 1-hour TTL — protecting third-party
 *  providers (Remotive/Arbeitnow/Muse) from our user spike traffic.
 *
 *  Rate-limited per-IP because there's no userId for anonymous callers.
 */
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

  // IP-keyed limit because the endpoint is anonymous.
  const ip =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const rl = await apiLimiter.limit(`jobs-search:${ip}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  try {
    const result = await getRealJobs(query);
    return NextResponse.json(
      {
        jobs: result.jobs,
        count: result.jobs.length,
        source: result.source,
      },
      {
        headers: {
          // CDN: 1h fresh, 1d stale-while-revalidate. Same TTL as the
          // unstable_cache so cache layers stay aligned.
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
