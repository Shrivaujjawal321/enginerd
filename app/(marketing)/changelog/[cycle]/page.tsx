import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, GitCommit } from "lucide-react";

import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { listCycles, getCycle } from "@/lib/changelog";

/** Drop the leading `# Cycle N — …` line so the cycle body renders without
 *  duplicating the page-header H1. Eats whitespace + the blank line that
 *  typically follows; subsequent content is preserved verbatim. */
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

export const revalidate = 3600;

export async function generateStaticParams() {
  // Pre-render every cycle that exists at build time. The list is small
  // (~22 entries) so the cost is trivial and gives recruiters an instant
  // first-byte on a Page that's central to the portfolio story.
  const cycles = await listCycles();
  return cycles.map((c) => ({ cycle: String(c.number) }));
}

export async function generateMetadata(props: {
  params: Promise<{ cycle: string }>;
}): Promise<Metadata> {
  const { cycle } = await props.params;
  const num = Number(cycle);
  if (!Number.isInteger(num) || num <= 0) return { title: "Changelog" };
  const detail = await getCycle(num);
  if (!detail) return { title: "Changelog" };
  return {
    title: `Cycle ${detail.number} — ${detail.title}`,
    description: detail.themePreview,
  };
}

export default async function CyclePage(props: {
  params: Promise<{ cycle: string }>;
}) {
  const { cycle } = await props.params;
  const num = Number(cycle);
  if (!Number.isInteger(num) || num <= 0) notFound();

  const detail = await getCycle(num);
  if (!detail) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link
        href="/changelog"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-100"
      >
        <ArrowLeft className="h-3 w-3" />
        All cycles
      </Link>

      <header className="mt-4 mb-10 border-b border-white/[0.06] pb-8">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
          <GitCommit className="h-3 w-3" />
          Cycle {detail.number}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-50 sm:text-4xl">
          {detail.title}
        </h1>
        {detail.date ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            Shipped {detail.date}
          </p>
        ) : null}
      </header>

      {/* Reuses the existing MarkdownRenderer — code blocks + Mermaid + GFM
          tables all work, so the cycle reports render exactly as they sit
          on disk. */}
      <div className="max-w-[68ch]">
        <MarkdownRenderer source={stripLeadingH1(detail.markdown)} />
      </div>

      {(detail.prev || detail.next) ? (
        <nav
          className="mt-12 grid gap-3 sm:grid-cols-2"
          aria-label="Cycle navigation"
        >
          {detail.prev ? (
            <Link
              href={`/changelog/${detail.prev.number}`}
              className="group flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors hover:border-violet-400/30 hover:bg-white/[0.04]"
            >
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400">
                <ArrowLeft className="h-3 w-3" />
                Cycle {detail.prev.number}
              </span>
              <span className="text-sm font-medium text-slate-100 group-hover:text-white">
                {detail.prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {detail.next ? (
            <Link
              href={`/changelog/${detail.next.number}`}
              className="group flex flex-col items-end gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-right transition-colors hover:border-violet-400/30 hover:bg-white/[0.04]"
            >
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400">
                Cycle {detail.next.number}
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="text-sm font-medium text-slate-100 group-hover:text-white">
                {detail.next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}
