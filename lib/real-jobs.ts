import "server-only";

import { unstable_cache } from "next/cache";

import { aggregateJobs, type NormalizedJob } from "@/lib/job-providers";
import {
  COMPANIES_BY_SLUG,
} from "@/lib/mock-data/companies";
import type { Company, JobPosting } from "@/lib/mock-data/types";

/* ============================================================================
 *  Real-jobs shim — turns the public job-board APIs (Remotive / Arbeitnow /
 *  Muse) into the legacy `JobPosting` + `Company` shapes the existing UI
 *  expects. Lets us drop the fabricated `JOB_POSTINGS` array without
 *  rewriting `CareersExplorer`.
 *
 *  Cached for 1 hour because public APIs are slow + rate-limited; the data
 *  is intentionally stale-tolerant (we're showing "jobs posted this week").
 * ============================================================================
 */

const ACCENT_PALETTE = [
  "from-violet-500 to-cyan-500",
  "from-pink-500 to-orange-500",
  "from-cyan-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-amber-500 to-yellow-500",
  "from-blue-500 to-indigo-500",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function shortName(name: string): string {
  // First chars of words OR first 4 of single word.
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0]![0] + (words[1]![0] ?? ""))
      .toUpperCase()
      .padEnd(2, "X");
  }
  return name.slice(0, 4).toUpperCase();
}

function pickAccent(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length]!;
}

function daysSince(iso?: string): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function classifyRemote(j: NormalizedJob): "Remote" | "Hybrid" | "On-site" {
  if (j.remote) return "Remote";
  const loc = j.location.toLowerCase();
  if (loc.includes("remote")) return "Remote";
  if (loc.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function inferExperience(title: string): { min: number; max: number } {
  const t = title.toLowerCase();
  if (/\bjr\b|junior|associate|graduate|trainee|intern/.test(t)) return { min: 0, max: 2 };
  if (/\bsr\b|senior|lead/.test(t)) return { min: 5, max: 9 };
  if (/staff|principal|architect|head|director/.test(t)) return { min: 8, max: 15 };
  return { min: 2, max: 6 };
}

function jobToJobPosting(j: NormalizedJob): JobPosting {
  const companySlug = slugify(j.company);
  const exp = inferExperience(j.title);
  return {
    id: j.id,
    companySlug,
    title: j.title,
    location: j.location || "Remote",
    remoteType: classifyRemote(j),
    experienceMin: exp.min,
    experienceMax: exp.max,
    techStack: j.tags.slice(0, 6),
    // Real public APIs don't expose salary on most postings — set to 0
    // and the UI hides salary chip when both bounds are 0.
    salaryMin: 0,
    salaryMax: 0,
    // Match score is a curated/LLM-driven number; we don't fake it.
    matchPct: 0,
    postedDaysAgo: daysSince(j.postedAt),
    applyUrl: j.applyUrl,
  };
}

function synthesizeCompany(name: string): Company {
  const slug = slugify(name);
  // If the curated mock-data has a real company entry (Razorpay, Amazon,
  // etc.), prefer it — it has logo, quotes, and roadmap mappings.
  const curated = COMPANIES_BY_SLUG[slug];
  if (curated) return curated;

  return {
    slug,
    name,
    shortName: shortName(name),
    founded: 0,
    employees: "—",
    description: `${name} — view live posting on the linked source.`,
    techStack: [],
    skillsLookFor: [],
    employeeQuotes: [],
    relatedRoadmaps: [],
    accent: pickAccent(slug),
  };
}

/* ---------------------------------------------------------------------- */

export type RealJobsResult = {
  jobs: JobPosting[];
  companies: Record<string, Company>;
  source: "live" | "stub";
};

async function fetchRealJobsUncached(query: string): Promise<RealJobsResult> {
  let raw: NormalizedJob[];
  try {
    raw = await aggregateJobs(query);
  } catch {
    return { jobs: [], companies: {}, source: "stub" };
  }
  if (raw.length === 0) {
    return { jobs: [], companies: {}, source: "stub" };
  }

  const jobs: JobPosting[] = raw.map(jobToJobPosting);

  // Build the company map — synthesize entries for companies not in the
  // curated COMPANIES_BY_SLUG.
  const companies: Record<string, Company> = {};
  for (const j of jobs) {
    if (companies[j.companySlug]) continue;
    const name = raw.find((r) => slugify(r.company) === j.companySlug)?.company ?? j.companySlug;
    companies[j.companySlug] = synthesizeCompany(name);
  }

  return { jobs, companies, source: "live" };
}

/**
 * Cached for 1 hour per query. Set `revalidatePath('/careers')` after a
 * manual content edit to force a refresh — usually unnecessary since
 * job postings change throughout the day.
 */
export async function getRealJobs(
  query = "software engineer india",
): Promise<RealJobsResult> {
  const cached = unstable_cache(
    () => fetchRealJobsUncached(query),
    ["real-jobs", query],
    { revalidate: 3600, tags: ["jobs", `jobs:${query}`] },
  );
  return cached();
}
