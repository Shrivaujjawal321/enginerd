import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { ROADMAPS } from "@/lib/mock-data/roadmaps";
import { SUBJECTS } from "@/lib/mock-data/subjects";
import { listProblemSearchEntries } from "@/lib/problems-store";
import { publicLimiter, getClientIp, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
// Index is essentially static between deploys / publishes.
export const revalidate = 1800;

/**
 *  GET /api/search-index — flat list of every searchable thing in the app.
 *
 *  Powers the topbar's `cmd+k` palette. Uses slim problem rows (slug/title/
 *  topic) so we don't drag full markdown + starter code through Neon every
 *  time the palette opens. Wrapped in `unstable_cache` with a 30-min TTL —
 *  bust via `revalidateTag("search-index")` after admin publish events.
 *
 *  Public (no auth) so the palette renders before sign-in.
 */
const buildIndex = unstable_cache(
  async () => {
    const problems = await listProblemSearchEntries();
    return [
      ...ROADMAPS.map((r) => ({
        kind: "roadmap" as const,
        slug: r.slug,
        title: r.title,
        subtitle: `${r.category} · ${r.subjectsCount} subjects`,
        href: `/roadmaps/${r.slug}`,
        haystack:
          `${r.title} ${r.description} ${r.skills.join(" ")} ${r.category}`.toLowerCase(),
      })),
      ...SUBJECTS.map((s) => ({
        kind: "subject" as const,
        slug: s.slug,
        title: s.title,
        subtitle: `${s.category} · ${s.estHours}h · ${s.difficulty}`,
        href: `/subjects/${s.slug}`,
        haystack: `${s.title} ${s.description} ${s.category}`.toLowerCase(),
      })),
      ...problems.map((p) => ({
        kind: "problem" as const,
        slug: p.slug,
        title: p.title,
        subtitle: `${p.topic} · ${p.difficulty}`,
        href: `/practice/${p.slug}`,
        haystack:
          `${p.title} ${p.topic} ${p.companies.join(" ")}`.toLowerCase(),
      })),
    ];
  },
  ["search-index-v2"],
  { revalidate: 1800, tags: ["search-index"] },
);

export async function GET(req: Request) {
  // Per-IP rate limit (30/min) — endpoint is public + cached, but cache miss
  // does ~460-row Neon read, so we still want abuse protection.
  const ip = getClientIp(req);
  const rl = await publicLimiter.limit(`search-index:${ip}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  const items = await buildIndex();
  return NextResponse.json(
    { items, total: items.length },
    {
      headers: {
        "Cache-Control":
          "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400",
      },
    },
  );
}
