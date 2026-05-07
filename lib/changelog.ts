import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

/**
 *  Changelog reader — surfaces the tech-team cycle reports as a public,
 *  scannable record of how the platform was built.
 *
 *  Each `tech-team/cycles/cycle-<n>.md` is parsed for:
 *    - cycle number   (from filename)
 *    - title          (H1: "Cycle N — Theme")
 *    - date           ("**Date:** YYYY-MM-DD" line)
 *    - theme          ("**Theme:** …" line; truncated to 320 chars)
 *
 *  We deliberately don't render the full markdown on the list page — keeps
 *  the index fast (one row per cycle) and pushes the long-form prose to the
 *  per-cycle detail route. The full markdown is available via `getCycle(n)`.
 *
 *  Cached for 1 hour (file changes only on deploy) with a `changelog` tag
 *  for on-demand revalidation when a new cycle ships.
 */

const CYCLES_DIR = path.join(process.cwd(), "tech-team", "cycles");
const FILENAME_RE = /^cycle-(\d+)\.md$/;
const TITLE_RE = /^# Cycle \d+ — (.+)$/m;
const DATE_RE = /^\*\*Date:\*\* (\d{4}-\d{2}-\d{2})/m;
const THEME_RE = /^\*\*Theme:\*\* ([\s\S]+?)(?=\n\n|\n---|\n\*\*)/m;
const THEME_PREVIEW_LIMIT = 320;

export type CycleSummary = {
  number: number;
  title: string;
  date: string | null;
  themePreview: string;
  /** Full theme string — used by the detail page header.
   *  Always present; falls back to themePreview when nothing parsed. */
  theme: string;
};

export type CycleDetail = CycleSummary & {
  /** Whole markdown body of the cycle report. */
  markdown: string;
  prev: { number: number; title: string } | null;
  next: { number: number; title: string } | null;
};

/** Strip the markdown markers we don't want to leak into the preview text. */
function stripInlineMd(s: string): string {
  return s
    .replace(/`+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
    .replace(/[\n\r]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  // Cut at the last whitespace before the limit so we don't slice mid-word.
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.75 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

function parseSummary(num: number, raw: string): CycleSummary {
  const title = TITLE_RE.exec(raw)?.[1]?.trim() ?? `Cycle ${num}`;
  const date = DATE_RE.exec(raw)?.[1] ?? null;
  const themeMatch = THEME_RE.exec(raw);
  const themeRaw = themeMatch ? themeMatch[1]!.trim() : "";
  const themeStripped = stripInlineMd(themeRaw);
  return {
    number: num,
    title,
    date,
    theme: themeStripped,
    themePreview: truncate(themeStripped, THEME_PREVIEW_LIMIT),
  };
}

async function listCyclesUncached(): Promise<CycleSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(CYCLES_DIR);
  } catch {
    return [];
  }
  const summaries: CycleSummary[] = [];
  for (const name of files) {
    const m = FILENAME_RE.exec(name);
    if (!m) continue;
    const num = Number(m[1]);
    try {
      const raw = await fs.readFile(path.join(CYCLES_DIR, name), "utf8");
      summaries.push(parseSummary(num, raw));
    } catch {
      // Skip unreadable files rather than crash the index.
    }
  }
  // Newest first — Awwwards-style judges scroll from top.
  summaries.sort((a, b) => b.number - a.number);
  return summaries;
}

export async function listCycles(): Promise<CycleSummary[]> {
  const cached = unstable_cache(
    listCyclesUncached,
    ["changelog-list"],
    { revalidate: 3600, tags: ["changelog"] },
  );
  return cached();
}

async function getCycleUncached(num: number): Promise<CycleDetail | null> {
  const file = path.join(CYCLES_DIR, `cycle-${num}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
  const summary = parseSummary(num, raw);
  const all = await listCyclesUncached();
  // `all` is sorted newest-first; "prev" navigates to the older cycle (n-1)
  // and "next" to the newer (n+1). Friendly chronology for a reader who
  // wants to walk the project from start to today.
  const prev = all.find((c) => c.number === num - 1);
  const next = all.find((c) => c.number === num + 1);
  return {
    ...summary,
    markdown: raw,
    prev: prev ? { number: prev.number, title: prev.title } : null,
    next: next ? { number: next.number, title: next.title } : null,
  };
}

export async function getCycle(num: number): Promise<CycleDetail | null> {
  const cached = unstable_cache(
    () => getCycleUncached(num),
    ["changelog-cycle", String(num)],
    { revalidate: 3600, tags: ["changelog", `changelog:cycle-${num}`] },
  );
  return cached();
}
