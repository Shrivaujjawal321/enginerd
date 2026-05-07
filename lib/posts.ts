import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

/**
 *  Long-form technical posts — public surface mirroring `lib/changelog.ts`,
 *  but for evergreen write-ups instead of cycle retrospectives. Markdown
 *  files live at `content/posts/<slug>.md` with a tiny YAML-style
 *  frontmatter (title / date / description / readingTimeMinutes).
 *
 *  Cycle 24 ships exactly one post (the agent-pipeline deep-dive); cycle 25+
 *  can drop more files into `content/posts/` without further plumbing.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const FRONTMATTER_RE = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/;

export type PostSummary = {
  slug: string;
  title: string;
  date: string | null;
  description: string;
  readingTimeMinutes: number | null;
};

export type PostDetail = PostSummary & {
  /** Markdown body with the frontmatter removed and the leading `# Title`
   *  stripped (the page already renders the title in its header). */
  body: string;
};

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const m = FRONTMATTER_RE.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: m[2]! };
}

function stripLeadingH1(source: string): string {
  const lines = source.split("\n");
  let i = 0;
  while (i < lines.length && lines[i]!.trim() === "") i++;
  if (i < lines.length && /^# (?!#)/.test(lines[i]!)) {
    i++;
    if (i < lines.length && lines[i]!.trim() === "") i++;
  }
  return lines.slice(i).join("\n");
}

async function listPostsUncached(): Promise<PostSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }
  const summaries: PostSummary[] = [];
  for (const name of files) {
    if (!name.endsWith(".md") || name.startsWith("_")) continue;
    const slug = name.replace(/\.md$/, "");
    try {
      const raw = await fs.readFile(path.join(POSTS_DIR, name), "utf8");
      const { meta } = parseFrontmatter(raw);
      summaries.push({
        slug,
        title: meta.title ?? slug,
        date: meta.date ?? null,
        description: meta.description ?? "",
        readingTimeMinutes: meta.readingTimeMinutes
          ? Number(meta.readingTimeMinutes)
          : null,
      });
    } catch {
      // Skip unreadable files rather than crash the index.
    }
  }
  // Newest first. Posts without a date sort to the end.
  summaries.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return summaries;
}

export async function listPosts(): Promise<PostSummary[]> {
  const cached = unstable_cache(listPostsUncached, ["posts-list"], {
    revalidate: 3600,
    tags: ["posts"],
  });
  return cached();
}

async function getPostUncached(slug: string): Promise<PostDetail | null> {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? null,
    description: meta.description ?? "",
    readingTimeMinutes: meta.readingTimeMinutes
      ? Number(meta.readingTimeMinutes)
      : null,
    body: stripLeadingH1(body),
  };
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  const cached = unstable_cache(
    () => getPostUncached(slug),
    ["posts-post", slug],
    { revalidate: 3600, tags: ["posts", `post:${slug}`] },
  );
  return cached();
}
