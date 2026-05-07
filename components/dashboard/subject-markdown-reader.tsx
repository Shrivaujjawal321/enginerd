import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { MarkCompleteButton } from "@/components/dashboard/mark-complete-button";
import { FeedbackWidget } from "@/components/dashboard/feedback-widget";
import { OnPageToc } from "@/components/dashboard/on-page-toc";
import { ReadingProgressBar } from "@/components/dashboard/reading-progress-bar";
import {
  FormatTabs,
  type SubjectFormat,
} from "@/components/dashboard/format-tabs";
import { FormatSlides } from "@/components/dashboard/format-slides";
import { FormatMindmap } from "@/components/dashboard/format-mindmap";
import { FormatFlashcards } from "@/components/dashboard/format-flashcards";
import { extractToc } from "@/lib/toc";
import type { Subject } from "@/lib/mock-data/types";

/* ============================================================================
 *  SubjectMarkdownReader — server component (RSC) shell.
 *
 *  Markdown rendering, layout, header, sidebar, and navigation footer all
 *  resolve on the server. Client islands embedded inside:
 *    - <MarkdownRenderer>'s code-block + mermaid-diagram islands (via
 *      `next/dynamic`, lazy-loaded only when the markdown contains them)
 *    - <MarkCompleteButton>     "Mark complete" / "Mark in progress" toggle
 *    - <FeedbackWidget>         thumbs up/down vote
 *    - <OnPageToc>              IntersectionObserver-driven scroll-spy
 *
 *  Net: subject pages now render almost entirely server-side; the client
 *  bundle ships only the small interactive bits.
 * ============================================================================
 */

type NeighborSubject = {
  slug: string;
  title: string;
};

type Props = {
  subject: Subject;
  markdown: string | null;
  initialStatus?: "not_started" | "in_progress" | "completed";
  prev?: NeighborSubject | null;
  next?: NeighborSubject | null;
  /** When the learner is on the last subject of a roadmap, the chain's
   *  recommended next roadmap (per `getNextRoadmap`). Surfaced by the
   *  end-of-roadmap CTA. */
  nextRoadmap?: { slug: string; title: string } | null;
  /** Resolved from the page's `?format=` search param. Defaults to "read". */
  format?: SubjectFormat;
};

export function SubjectMarkdownReader({
  subject,
  markdown,
  initialStatus = "not_started",
  prev = null,
  next = null,
  nextRoadmap = null,
  format = "read",
}: Props) {
  const totalSubtopics = subject.topics.reduce(
    (n, t) => n + t.subtopics.length,
    0,
  );

  // Computed once on the server per request; the result hydrates straight
  // into the OnPageToc client island as a serialized prop.
  const toc = markdown ? extractToc(markdown) : [];

  return (
    <>
      {/* Top scroll-progress bar — only shown when there's actual markdown
          to scroll through (skip empty-content shells). Slides / mindmap /
          flashcards have their own internal progress UI. */}
      {markdown && format === "read" ? <ReadingProgressBar /> : null}
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
      {/* ===== LEFT — subject outline ===================================== */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-3">
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            All subjects
          </Link>

          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Subject
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-100">
                {subject.title}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span>{subject.estHours}h</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>{subject.difficulty}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {subject.topics.length} topics · {totalSubtopics} subtopics
              </div>
            </div>

            <nav className="max-h-[60vh] overflow-y-auto p-2 text-xs">
              <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                Outline
              </p>
              <ol className="space-y-0.5">
                {subject.topics.map((topic, i) => (
                  <li key={topic.slug}>
                    <a
                      href={`#${slugifyAnchor(topic.title)}`}
                      className="flex items-start gap-2 rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/[0.04] hover:text-white"
                    >
                      <span className="mt-0.5 text-[10px] text-slate-400 tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="flex-1">{topic.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </GlassCard>
        </div>
      </aside>

      {/* ===== CENTER — the actual content ================================ */}
      <article className="min-w-0">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white lg:hidden"
        >
          <ArrowLeft className="h-3 w-3" />
          All subjects
        </Link>

        <header className="mt-2 space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            {subject.category}
          </p>
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-slate-50 sm:text-5xl">
            {subject.title}
          </h1>
          <p className="max-w-3xl text-[17px] leading-relaxed text-slate-400">
            {subject.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {subject.estHours}h estimated
            </span>
            <Badge variant="outline">{subject.difficulty}</Badge>
            <Badge variant="glass" className="!gap-1.5">
              <Sparkles className="h-3 w-3 text-violet-300" />
              Hinglish
            </Badge>
          </div>
        </header>

        {/* Format switcher — Read / Slides / Mindmap / Flashcards. The
            inactive format only renders when there's actual markdown to
            transform; an empty-content shell stays in Read mode. */}
        {markdown ? (
          <div className="mt-10">
            <FormatTabs active={format} subjectSlug={subject.slug} />
          </div>
        ) : null}

        <div
          className={
            format === "read" ? "mt-2 max-w-[68ch]" : "mt-2 max-w-[820px]"
          }
        >
          {!markdown ? (
            <GlassCard className="space-y-3 p-6 text-sm text-slate-300">
              <p>Hinglish content for this subject is being generated.</p>
              <p className="text-slate-400">
                Generated markdown will appear here once
                <code className="mx-1 rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-cyan-200">
                  content/{subject.slug}.md
                </code>
                is written.
              </p>
            </GlassCard>
          ) : format === "slides" ? (
            <FormatSlides source={markdown} fallbackTitle={subject.title} />
          ) : format === "mindmap" ? (
            <FormatMindmap source={markdown} fallbackTitle={subject.title} />
          ) : format === "flashcards" ? (
            <FormatFlashcards
              source={markdown}
              subjectSlug={subject.slug}
            />
          ) : (
            <MarkdownRenderer source={markdown} />
          )}
        </div>

        {markdown ? (
          <div className="mt-12 max-w-[68ch]">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="text-sm text-slate-300">
                <p className="font-medium text-slate-100">Done reading?</p>
                <p className="text-xs text-slate-400">
                  Progress is saved — your streak grows too.
                </p>
              </div>
              <MarkCompleteButton
                subtopicSlug={subject.slug}
                initialStatus={initialStatus}
              />
            </div>

            <FeedbackWidget subjectSlug={subject.slug} />

            {(prev || next) ? (
              <nav
                className="mt-12 grid gap-3 sm:grid-cols-2"
                aria-label="Subject navigation"
              >
                {prev ? (
                  <Link
                    href={`/subjects/${prev.slug}`}
                    className="group flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors hover:border-violet-400/30 hover:bg-white/[0.04]"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400">
                      <ArrowLeft className="h-3 w-3" />
                      Previous
                    </span>
                    <span className="text-sm font-medium text-slate-100 group-hover:text-white">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    href={`/subjects/${next.slug}`}
                    className="group flex flex-col items-end gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-right transition-colors hover:border-violet-400/30 hover:bg-white/[0.04]"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400">
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-medium text-slate-100 group-hover:text-white">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            ) : null}

            {/* End-of-roadmap recommendation — surfaced when a learner
                reaches the last subject in their current roadmap. Drives
                cross-roadmap discovery (the strongest engagement lever).
                When a chain map suggests a specific next roadmap, link
                straight to it; otherwise fall back to the general browse. */}
            {prev && !next ? (
              <div className="mt-8 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.08] p-5">
                <p className="text-xs uppercase tracking-wider text-violet-200">
                  End of roadmap
                </p>
                {nextRoadmap ? (
                  <>
                    <p className="mt-1 text-base font-medium text-slate-100">
                      Done with this track? Try{" "}
                      <span className="text-white">{nextRoadmap.title}</span>{" "}
                      next — it builds directly on what you just learned.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/roadmaps/${nextRoadmap.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
                      >
                        Open {nextRoadmap.title}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/roadmaps"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-violet-400/30 hover:text-white"
                      >
                        Browse all roadmaps
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-base font-medium text-slate-100">
                      Done with this track? Pick the next one — every
                      roadmap pairs with two or three follow-ups.
                    </p>
                    <Link
                      href="/roadmaps"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
                    >
                      Browse all roadmaps
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>

      {/* ===== RIGHT — on-page ToC (scroll-spy) — only meaningful in Read
          mode; slides / mindmap / flashcards have their own internal nav. */}
      {format === "read" ? <OnPageToc items={toc} /> : <div />}
      </div>
    </>
  );
}

function slugifyAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
