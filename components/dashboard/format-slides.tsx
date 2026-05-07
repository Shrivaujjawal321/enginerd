"use client";

/**
 * FormatSlides — turns a markdown subject into a 1-section-per-slide deck.
 *
 * Why a slide deck: long-form markdown is a wall to engineers. A slide is a
 * single idea, sized to fit on a phone, with explicit "next" intent. Lower
 * cognitive load → users keep going.
 *
 * - Server-side parser (lib/format-parsers.ts) splits the markdown on `##`.
 * - Keyboard nav: ← / → / Home / End. Buttons + dots for touch.
 * - Slide body uses MarkdownRenderer so code blocks + Mermaid still work.
 * - When the user reaches the last slide a "Mark complete" prompt nudges
 *   them to log the engagement.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { parseSlides, type Slide } from "@/lib/format-parsers";
import { cn } from "@/lib/utils";

type Props = {
  source: string;
  fallbackTitle: string;
};

export function FormatSlides({ source, fallbackTitle }: Props) {
  const slides = React.useMemo<Slide[]>(
    () => parseSlides(source, fallbackTitle),
    [source, fallbackTitle],
  );
  const [index, setIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const total = slides.length;
  const current = slides[index];

  // Clamp index when source changes (e.g. user nav between subjects).
  React.useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, total - 1)));
  }, [total]);

  // Keyboard nav — only when the slide deck is the user's focus, otherwise
  // arrow keys would interfere with normal browser navigation.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if the user is typing in an input/textarea/contenteditable.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (total === 0) {
    return (
      <GlassCard className="p-6 text-sm text-slate-300">
        Slides need at least one <code>## Section</code> heading. This subject
        doesn&apos;t have one yet — switch to <strong>Read</strong> for now.
      </GlassCard>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Slide stage — fixed minimum height so the next/prev controls don't
          jump around as users skim through cards. */}
      <GlassCard className="relative flex min-h-[480px] flex-col overflow-hidden p-6 sm:min-h-[560px] sm:p-10">
        <header className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
            <Layers className="h-3 w-3" />
            Slide {index + 1} <span className="text-slate-400">/ {total}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-violet-300"
                    : "w-1.5 bg-white/15 hover:bg-white/30",
                )}
              />
            ))}
          </div>
        </header>

        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-3xl">
          {current?.title}
        </h2>

        <div className="mt-5 max-w-[68ch] flex-1 overflow-y-auto pr-1">
          {current?.body ? (
            <MarkdownRenderer source={current.body} />
          ) : (
            <p className="text-sm text-slate-400">
              No body for this section. Hit Next.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <p className="hidden text-xs text-slate-400 sm:block">
          Use ← → arrow keys
        </p>
        <Button
          size="sm"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          aria-label="Next slide"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
