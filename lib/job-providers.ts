/**
 * Public job-board API aggregator.
 *
 * Each provider is fetched server-side, results normalized to `NormalizedJob`,
 * and merged. We deliberately use only APIs that are public, no-auth, and
 * explicitly intended for third-party developers — no LinkedIn/Naukri
 * scraping (against ToS, IP-blockable).
 *
 * Per Remotive's legal notice we always preserve `applyUrl` pointing back to
 * their original posting; we never claim the listing as our own.
 */

export type NormalizedJob = {
  id: string;
  source: "remotive" | "arbeitnow" | "muse";
  title: string;
  company: string;
  location: string;
  remote: boolean;
  /** Plain-text description (HTML stripped). Trimmed to ~2000 chars for LLM cost control. */
  description: string;
  /** External URL to open the original posting and apply. */
  applyUrl: string;
  /** Tags / tech stack if the source provides them. */
  tags: string[];
  /** Posted-at ISO string when available. */
  postedAt?: string;
  /** Salary if explicitly published. */
  salary?: string;
};

const STRIP_HTML = /<\/?[^>]+(>|$)/g;
const NORMALIZE_WHITESPACE = /\s+/g;

function stripHtml(html: string, max = 2000): string {
  if (!html) return "";
  const text = html
    .replace(STRIP_HTML, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(NORMALIZE_WHITESPACE, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "…" : text;
}

async function safeFetch(url: string, opts: RequestInit = {}): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: {
        Accept: "application/json",
        "User-Agent": "EngiNerd-JobAgent/1.0",
        ...(opts.headers ?? {}),
      },
      // Public APIs are slow sometimes — cap the wait.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function searchRemotive(query: string): Promise<NormalizedJob[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`;
  const data = (await safeFetch(url)) as { jobs?: Array<Record<string, unknown>> } | null;
  if (!data?.jobs) return [];
  return data.jobs.map((j) => ({
    id: `rmt-${j.id ?? j.slug ?? Math.random()}`,
    source: "remotive" as const,
    title: String(j.title ?? "Untitled"),
    company: String(j.company_name ?? "Unknown"),
    location: String(j.candidate_required_location ?? "Remote"),
    remote: true,
    description: stripHtml(String(j.description ?? "")),
    applyUrl: String(j.url ?? ""),
    tags: Array.isArray(j.tags) ? (j.tags as string[]).slice(0, 6) : [],
    postedAt: j.publication_date ? String(j.publication_date) : undefined,
    salary: j.salary ? String(j.salary) : undefined,
  }));
}

export async function searchArbeitnow(query: string): Promise<NormalizedJob[]> {
  const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;
  const data = (await safeFetch(url)) as { data?: Array<Record<string, unknown>> } | null;
  if (!data?.data) return [];
  return data.data.slice(0, 15).map((j) => ({
    id: `abn-${j.slug ?? Math.random()}`,
    source: "arbeitnow" as const,
    title: String(j.title ?? "Untitled"),
    company: String(j.company_name ?? "Unknown"),
    location: String(j.location ?? "—"),
    remote: Boolean(j.remote),
    description: stripHtml(String(j.description ?? "")),
    applyUrl: String(j.url ?? ""),
    tags: Array.isArray(j.tags) ? (j.tags as string[]).slice(0, 6) : [],
    postedAt: j.created_at ? String(j.created_at) : undefined,
  }));
}

export async function searchMuse(query: string): Promise<NormalizedJob[]> {
  // The Muse — public, no auth needed for the basic search endpoint.
  const url = `https://www.themuse.com/api/public/jobs?category=Engineering&page=0&descending=true`;
  const data = (await safeFetch(url)) as { results?: Array<Record<string, unknown>> } | null;
  if (!data?.results) return [];
  const q = query.toLowerCase();
  return data.results
    .filter((j) => {
      const text = `${j.name ?? ""} ${
        (j as { company?: { name?: string } }).company?.name ?? ""
      }`.toLowerCase();
      return !q || text.includes(q);
    })
    .slice(0, 10)
    .map((j) => {
      const locations =
        (j.locations as Array<{ name: string }> | undefined)?.map((l) => l.name).join(", ") ??
        "—";
      const refs = j.refs as { landing_page?: string } | undefined;
      return {
        id: `muse-${j.id ?? Math.random()}`,
        source: "muse" as const,
        title: String(j.name ?? "Untitled"),
        company: String(
          (j as { company?: { name?: string } }).company?.name ?? "Unknown",
        ),
        location: locations,
        remote: locations.toLowerCase().includes("remote"),
        description: stripHtml(String(j.contents ?? "")),
        applyUrl: String(refs?.landing_page ?? ""),
        tags: [],
        postedAt: j.publication_date ? String(j.publication_date) : undefined,
      };
    });
}

export async function aggregateJobs(query: string): Promise<NormalizedJob[]> {
  const [r, a, m] = await Promise.allSettled([
    searchRemotive(query),
    searchArbeitnow(query),
    searchMuse(query),
  ]);
  const all: NormalizedJob[] = [];
  if (r.status === "fulfilled") all.push(...r.value);
  if (a.status === "fulfilled") all.push(...a.value);
  if (m.status === "fulfilled") all.push(...m.value);

  // De-dup by exact title + company (sources occasionally cross-post).
  const seen = new Set<string>();
  return all.filter((j) => {
    const key = `${j.title.toLowerCase()}::${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
