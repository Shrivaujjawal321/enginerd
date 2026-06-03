/**
 * Library — agent-published roadmaps surfaced on the user-facing pages.
 *
 * Hybrid persistence: in-memory Map for fast reads + DB-backed `library_roadmaps`
 * row when DATABASE_URL is configured. Methods are async; legacy in-memory
 * data hydrates from DB on first access in a fresh process.
 */

import { desc } from "drizzle-orm";

import type {
  Roadmap,
  Subject,
  Subtopic,
  Topic,
  SubtopicContentBlock,
} from "@/lib/mock-data/types";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { libraryRoadmaps, type LibraryRoadmapRow } from "@/lib/db/schema";
import type { CareerSeed, GeneratedContentBlock } from "./types";
import type { GeneratedRoadmap } from "./store";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const ACCENT_PALETTE = [
  "from-violet-500 to-cyan-500",
  "from-pink-500 to-orange-500",
  "from-cyan-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-amber-500 to-yellow-500",
  "from-blue-500 to-indigo-500",
];

const CATEGORY_TO_ROADMAP: Record<string, Roadmap["category"]> = {
  "Web Development": "Web Development",
  Mobile: "Mobile",
  "Data & ML": "Data & ML",
  "DevOps & Cloud": "DevOps & Cloud",
  Systems: "Systems",
  "Game Dev": "Game Dev",
  Security: "Security",
  Blockchain: "Blockchain",
};

function blocksToContent(blocks: GeneratedContentBlock[]): SubtopicContentBlock[] {
  return blocks.map((b) => b);
}

export type LibraryRoadmap = {
  id: string;
  publishedAt: number;
  runId: string | null;
  roadmap: Roadmap;
  subjects: Subject[];
};

function rowToLibraryRoadmap(row: LibraryRoadmapRow): LibraryRoadmap {
  return {
    id: row.id,
    publishedAt: row.publishedAt.getTime(),
    runId: row.runId,
    roadmap: row.roadmap as Roadmap,
    subjects: row.subjects as Subject[],
  };
}

class Library {
  // Hot cache — populated lazily from DB. Index by roadmap slug + subject slug.
  private byRoadmapSlug = new Map<string, LibraryRoadmap>();
  private bySubjectSlug = new Map<string, Subject>();
  private hydrated = false;

  /** One-time hydration of the in-memory cache from `library_roadmaps`. */
  private async hydrate(): Promise<void> {
    if (this.hydrated || !hasDatabase) {
      this.hydrated = true;
      return;
    }
    try {
      const rows = await db
        .select()
        .from(libraryRoadmaps)
        .orderBy(desc(libraryRoadmaps.publishedAt));
      for (const row of rows) {
        const entry = rowToLibraryRoadmap(row);
        this.byRoadmapSlug.set(entry.roadmap.slug, entry);
        for (const s of entry.subjects) this.bySubjectSlug.set(s.slug, s);
      }
    } catch (err) {
      console.error("[library] hydrate failed", err);
    }
    this.hydrated = true;
  }

  async publish(
    runId: string,
    gen: GeneratedRoadmap,
    options: {
      canonicalSlug?: string;
      sourceRoadmap?: Roadmap;
      publishedBy?: string | null;
    } = {},
  ): Promise<LibraryRoadmap> {
    await this.hydrate();

    const career = gen.career;
    const baseSlug = options.canonicalSlug ?? slugify(career.title);

    // Disambiguate slug conflicts unless caller explicitly insists.
    let roadmapSlug = baseSlug;
    if (!options.canonicalSlug) {
      let n = 2;
      while (
        this.byRoadmapSlug.has(roadmapSlug) &&
        this.byRoadmapSlug.get(roadmapSlug)?.runId !== runId
      ) {
        roadmapSlug = `${baseSlug}-${n++}`;
      }
    }

    const subjects: Subject[] = gen.subjects.map((s, idx) =>
      buildSubject(s, idx),
    );

    const derivedSkills = Array.from(
      new Set(
        subjects.flatMap((s) =>
          s.title
            .replace(/[(),:]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 2 && /^[A-Z][a-zA-Z0-9.+]*$/.test(w)),
        ),
      ),
    ).slice(0, 8);

    const src = options.sourceRoadmap;

    const roadmap: Roadmap = {
      slug: roadmapSlug,
      title: src?.title ?? career.title,
      description: src?.description ?? career.description,
      longDescription:
        src?.longDescription ??
        (career.reasoning
          ? `${career.description} ${career.reasoning}`
          : career.description),
      category:
        src?.category ?? (CATEGORY_TO_ROADMAP[career.category] ?? "Web Development"),
      difficulty: src?.difficulty ?? career.difficulty,
      durationMonths: src?.durationMonths ?? career.estDurationMonths,
      subjectsCount: subjects.length,
      topicsCount: subjects.reduce((sum, s) => sum + s.topicsCount, 0),
      rating: src?.rating ?? 4.7,
      enrolled: src?.enrolled ?? 1240 + Math.floor(Math.random() * 800),
      thumbnailAccent:
        src?.thumbnailAccent ??
        ACCENT_PALETTE[Math.floor(Math.random() * ACCENT_PALETTE.length)],
      skills:
        src?.skills && src.skills.length > 0
          ? src.skills
          : derivedSkills.length > 0
            ? derivedSkills
            : ["Engineering"],
      companies:
        src?.companies && src.companies.length > 0
          ? src.companies
          : ["amazon", "google", "razorpay", "swiggy"],
      whyThis:
        src?.whyThis && src.whyThis.length > 0
          ? src.whyThis
          : career.reasoning
            ? [career.reasoning]
            : [
                "Currently high-paying with strong demand in the Indian market.",
                "Skills compound across modern engineering roles.",
                "Beginner-friendly content makes the ramp shorter.",
              ],
      subjectSlugs: subjects.map((s) => s.slug),
    };

    const publishedAt = Date.now();
    const entry: LibraryRoadmap = {
      id: `lib_${baseSlug}`,
      publishedAt,
      runId,
      roadmap,
      subjects,
    };

    this.byRoadmapSlug.set(roadmapSlug, entry);
    for (const s of subjects) this.bySubjectSlug.set(s.slug, s);

    if (hasDatabase) {
      try {
        await db
          .insert(libraryRoadmaps)
          .values({
            slug: roadmapSlug,
            runId,
            roadmap: roadmap as unknown as Record<string, unknown>,
            subjects: subjects as unknown as Record<string, unknown>[],
            publishedBy: options.publishedBy ?? null,
            publishedAt: new Date(publishedAt),
          })
          .onConflictDoUpdate({
            target: libraryRoadmaps.slug,
            set: {
              runId,
              roadmap: roadmap as unknown as Record<string, unknown>,
              subjects: subjects as unknown as Record<string, unknown>[],
              publishedAt: new Date(publishedAt),
              publishedBy: options.publishedBy ?? null,
            },
          });
      } catch (err) {
        console.error("[library] publish DB write failed", err);
      }
    }

    return entry;
  }

  async getRoadmap(slug: string): Promise<LibraryRoadmap | undefined> {
    await this.hydrate();
    return this.byRoadmapSlug.get(slug);
  }

  async getSubject(slug: string): Promise<Subject | undefined> {
    await this.hydrate();
    return this.bySubjectSlug.get(slug);
  }

  async listRoadmaps(): Promise<Roadmap[]> {
    await this.hydrate();
    return Array.from(this.byRoadmapSlug.values())
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map((e) => e.roadmap);
  }

  async listSubjects(): Promise<Subject[]> {
    await this.hydrate();
    return Array.from(this.bySubjectSlug.values());
  }
}

function buildSubject(
  source: GeneratedRoadmap["subjects"][number],
  idx: number,
): Subject {
  const subjectSlug = slugify(source.subject.title);
  const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];

  const topicsByTitle = new Map<string, Topic>();
  for (const t of source.topics) {
    const tSlug = slugify(t.title);
    topicsByTitle.set(t.title, {
      slug: tSlug,
      title: t.title,
      subtopics: t.subtopics.map((sub) => ({
        slug: slugify(sub.title),
        title: sub.title,
        estMinutes: sub.estMinutes,
        status: "not_started" as const,
      })),
    });
  }

  for (const written of source.subtopics) {
    const topic = topicsByTitle.get(written.topicTitle);
    if (!topic) continue;
    const subSlug = slugify(written.subtopicTitle);
    const target = topic.subtopics.find((s) => s.slug === subSlug);
    if (!target) {
      topic.subtopics.push({
        slug: subSlug,
        title: written.subtopicTitle,
        estMinutes: 18,
        status:
          written.quality.status === "published" ? "in_progress" : "not_started",
        content: blocksToContent(written.blocks),
      });
      continue;
    }
    target.content = blocksToContent(written.blocks);
    target.status =
      written.quality.status === "published" ? "in_progress" : "not_started";
  }

  const topics = Array.from(topicsByTitle.values());
  const allSubtopics: Subtopic[] = topics.flatMap((t) => t.subtopics);
  const completed = allSubtopics.filter((s) => s.status === "completed").length;
  const progressPct = allSubtopics.length
    ? Math.round((completed / allSubtopics.length) * 100)
    : 0;

  return {
    slug: subjectSlug,
    title: source.subject.title,
    description: source.subject.description,
    category: "Generated",
    difficulty: "Intermediate",
    estHours: Math.max(2, Math.round(source.subject.estTopicsCount * 0.8)),
    topicsCount: topics.length,
    progressPct,
    hasPractice: false,
    iconAccent: accent,
    roadmapSlugs: [],
    topics,
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __ENGINERD_LIBRARY__: Library | undefined;
}

export const library: Library = globalThis.__ENGINERD_LIBRARY__ ?? new Library();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ENGINERD_LIBRARY__ = library;
}

export function publishCareer(career: CareerSeed): void {
  void career;
}
