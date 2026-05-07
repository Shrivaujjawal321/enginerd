"use client";

/**
 * FormatFlashcards — turns a subject's `### Heading + paragraph` pairs into
 * a flippable flashcard deck. Active recall beats passive reading for
 * retention, and a deck of ~20-30 cards is the right size for a single
 * pomodoro session.
 *
 * UX:
 *   - Click the card to flip front ↔ back.
 *   - "Got it" advances + remembers (localStorage so re-visits skip mastered cards).
 *   - "Try again" advances without marking mastered.
 *   - Progress bar at the top shows mastered / total.
 */

import * as React from "react";
import { Check, RotateCcw, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { parseFlashcards, type Flashcard } from "@/lib/format-parsers";
import { cn } from "@/lib/utils";

type Props = {
  source: string;
  /** Used to namespace localStorage so different subjects don't share state. */
  subjectSlug: string;
};

const STORAGE_PREFIX = "enginerd:flashcards:mastered:";

function loadMastered(slug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as number[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveMastered(slug: string, set: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + slug,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // Quota exceeded / private mode — silently ignore. Mastered state is a
    // best-effort enhancement, not a correctness requirement.
  }
}

export function FormatFlashcards({ source, subjectSlug }: Props) {
  const cards = React.useMemo<Flashcard[]>(
    () => parseFlashcards(source),
    [source],
  );
  const total = cards.length;

  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [mastered, setMastered] = React.useState<Set<number>>(() => new Set());

  // Hydrate mastered set from localStorage after mount (avoids SSR mismatch).
  React.useEffect(() => {
    setMastered(loadMastered(subjectSlug));
  }, [subjectSlug]);

  const persistMastered = React.useCallback(
    (next: Set<number>) => {
      setMastered(next);
      saveMastered(subjectSlug, next);
    },
    [subjectSlug],
  );

  const advance = (markMastered: boolean) => {
    if (markMastered) {
      const next = new Set(mastered);
      next.add(index);
      persistMastered(next);
    }
    setFlipped(false);
    setIndex((i) => (i + 1 < total ? i + 1 : 0));
  };

  const resetMastered = () => persistMastered(new Set());

  if (total === 0) {
    return (
      <GlassCard className="p-6 text-sm text-slate-300">
        Flashcards are pulled from <code>### Subheadings</code> in the source.
        This subject doesn&apos;t have any yet — switch to{" "}
        <strong>Read</strong>.
      </GlassCard>
    );
  }

  const card = cards[index]!;
  const masteredCount = mastered.size;
  const progressPct = Math.round((masteredCount / total) * 100);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
          <Zap className="h-3 w-3" />
          Card {index + 1} <span className="text-slate-400">/ {total}</span>
          <span className="ml-2 text-slate-400">
            · {masteredCount} mastered ({progressPct}%)
          </span>
        </p>
        {masteredCount > 0 ? (
          <button
            type="button"
            onClick={resetMastered}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
          >
            <RotateCcw className="h-3 w-3" />
            Reset mastered
          </button>
        ) : null}
      </header>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]"
        role="progressbar"
        aria-valuenow={masteredCount}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* The flippable card itself — click anywhere on it to toggle. */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show front" : "Show back"}
        aria-pressed={flipped}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-2xl"
      >
        <GlassCard
          className={cn(
            "relative flex min-h-[320px] flex-col overflow-hidden p-6 transition-colors sm:min-h-[400px] sm:p-10",
            flipped
              ? "border-cyan-400/30 bg-cyan-500/[0.04]"
              : "border-violet-400/20 bg-violet-500/[0.04]",
          )}
        >
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-300">
            {flipped ? "Answer" : "Question"}
          </span>
          {flipped ? (
            <div className="mt-4 max-w-[58ch] flex-1 overflow-y-auto">
              <MarkdownRenderer source={card.back} />
            </div>
          ) : (
            <p className="mt-4 max-w-[42ch] flex-1 text-2xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-3xl">
              {card.front}
            </p>
          )}
          <p className="mt-6 text-xs text-slate-400">
            Click card to flip ↔
          </p>
        </GlassCard>
      </button>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="glass"
          size="sm"
          onClick={() => advance(false)}
          aria-label="Try this card again later"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button
          size="sm"
          onClick={() => advance(true)}
          aria-label="Mark this card as mastered and continue"
        >
          <Check className="h-4 w-4" />
          Got it
        </Button>
      </div>
    </div>
  );
}
