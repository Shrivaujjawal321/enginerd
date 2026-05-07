import { notFound } from "next/navigation";
import { SUBJECTS, getSubject } from "@/lib/mock-data/subjects";
import { ROADMAPS, getNextRoadmap } from "@/lib/mock-data/roadmaps";
import { library } from "@/lib/agents/library";
import { auth } from "@/auth";
import { SubjectMarkdownReader } from "@/components/dashboard/subject-markdown-reader";
import type { SubjectFormat } from "@/components/dashboard/format-tabs";
import { readSubjectMarkdown } from "@/lib/subject-markdown";
import { getSubtopicProgress } from "@/lib/progress";

const VALID_FORMATS: ReadonlyArray<SubjectFormat> = [
  "read",
  "slides",
  "mindmap",
  "flashcards",
];

function resolveFormat(raw: string | string[] | undefined): SubjectFormat {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (VALID_FORMATS as readonly string[]).includes(v ?? "")
    ? (v as SubjectFormat)
    : "read";
}

/**
 * Best-effort prev/next neighbours within the same roadmap.
 * Returns the first roadmap that lists this subject (order-stable from
 * `roadmaps.ts`) and resolves the previous/next slug + title.
 */
function findNeighbors(slug: string) {
  const roadmap = ROADMAPS.find((r) => r.subjectSlugs.includes(slug));
  if (!roadmap) {
    return { prev: null, next: null, nextRoadmap: null };
  }
  const idx = roadmap.subjectSlugs.indexOf(slug);
  const prevSlug = idx > 0 ? roadmap.subjectSlugs[idx - 1] : null;
  const nextSlug =
    idx >= 0 && idx < roadmap.subjectSlugs.length - 1
      ? roadmap.subjectSlugs[idx + 1]
      : null;
  // When this is the LAST subject in the roadmap, surface the chain's
  // recommended next roadmap so the learner can keep going.
  const nextRoadmap = !nextSlug ? getNextRoadmap(roadmap.slug) ?? null : null;
  return {
    prev: prevSlug ? toNeighbor(prevSlug) : null,
    next: nextSlug ? toNeighbor(nextSlug) : null,
    nextRoadmap: nextRoadmap
      ? { slug: nextRoadmap.slug, title: nextRoadmap.title }
      : null,
  };
}

function toNeighbor(slug: string) {
  const subject = getSubject(slug);
  return subject ? { slug: subject.slug, title: subject.title } : null;
}

// Cycle 22 — markdown moved into Postgres. Pre-rendering 100+ subject pages
// at build time was wasteful (most users only ever visit a handful), so the
// route is now fully dynamic. Each page renders on first hit and the result
// is cached by `unstable_cache` inside `readSubjectContent` (1-hour TTL,
// per-slug tag for on-demand revalidation after admin edits).
//
// `dynamicParams = true` lets Next still serve any slug on demand even
// though `generateStaticParams` is gone.
export const dynamicParams = true;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const s = (await library.getSubject(slug)) ?? getSubject(slug);
  return { title: s ? s.title : "Subject" };
}

export default async function SubjectDetail(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string | string[] }>;
}) {
  const [{ slug }, search] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const subject = (await library.getSubject(slug)) ?? getSubject(slug);
  if (!subject) notFound();

  const [markdown, session] = await Promise.all([
    readSubjectMarkdown(slug),
    auth(),
  ]);
  const progress = session?.user?.id
    ? await getSubtopicProgress(session.user.id, subject.slug)
    : null;

  const { prev, next, nextRoadmap } = findNeighbors(slug);
  const format = resolveFormat(search.format);

  return (
    <SubjectMarkdownReader
      subject={subject}
      markdown={markdown}
      initialStatus={progress?.status ?? "not_started"}
      prev={prev}
      next={next}
      nextRoadmap={nextRoadmap}
      format={format}
    />
  );
}
