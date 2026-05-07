import { BookOpen, Layers, Network, Sparkles, Zap } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import type {
  LearningFormat,
  LearningStyle,
} from "@/lib/learning-style";

type Props = {
  style: LearningStyle | null;
};

const FORMAT_META: Record<
  LearningFormat,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    barClass: string;
    chipClass: string;
  }
> = {
  read: {
    label: "Read",
    Icon: BookOpen,
    barClass: "bg-slate-300/80",
    chipClass: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  },
  slides: {
    label: "Slides",
    Icon: Layers,
    barClass: "bg-violet-400",
    chipClass: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  },
  mindmap: {
    label: "Mindmap",
    Icon: Network,
    barClass: "bg-cyan-400",
    chipClass: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  },
  flashcards: {
    label: "Flashcards",
    Icon: Zap,
    barClass: "bg-amber-400",
    chipClass: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  },
};

const FORMATS: LearningFormat[] = ["read", "slides", "mindmap", "flashcards"];

/**
 *  LearningStyleWidget — the cycle-21 payoff.
 *
 *  Pulls the per-user `format.selected` audit rows and renders the user's
 *  dominant format with a stacked-bar breakdown. Designed to feel like a
 *  Spotify Wrapped tile, not a dry chart — the point is for the user to
 *  understand "oh, I'm a slides person" at a glance.
 *
 *  The empty state is intentional: until we have ≥5 clicks we don't show
 *  numbers (would be statistically noise) — instead we show a one-line
 *  primer about the format tabs.
 */
export function LearningStyleWidget({ style }: Props) {
  if (!style) {
    return (
      <GlassCard className="p-5 sm:p-6">
        <header className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <h2 className="text-base font-semibold text-slate-100">
            Your learning style
          </h2>
        </header>
        <p className="mt-2 text-sm text-slate-300">
          We&apos;ll figure out how you learn best — read, slides, mindmaps,
          or flashcards — as you use the app.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Open any subject and switch tabs at the top to try a format. After
          a few sessions you&apos;ll see your top-format breakdown right here.
        </p>
      </GlassCard>
    );
  }

  const dominant = FORMAT_META[style.dominant ?? "read"];

  return (
    <GlassCard className="p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <h2 className="text-base font-semibold text-slate-100">
            Your learning style
          </h2>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          last {style.total} session{style.total === 1 ? "" : "s"}
        </span>
      </header>

      <div className="mt-3 flex items-baseline gap-3">
        <p className="text-3xl font-semibold tracking-tight text-slate-50">
          {style.percentages[style.dominant ?? "read"]}%
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${dominant.chipClass}`}
        >
          <dominant.Icon className="h-3 w-3" />
          {dominant.label} learner
        </span>
      </div>

      {/* Stacked bar — one segment per format. Keys are stable so React
          doesn't tear segments on re-render. Empty (0%) segments collapse
          to zero width via the inline style. */}
      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
        {FORMATS.map((f) => {
          const pct = style.percentages[f];
          if (pct === 0) return null;
          return (
            <div
              key={f}
              className={`${FORMAT_META[f].barClass} transition-all`}
              style={{ width: `${pct}%` }}
              aria-label={`${FORMAT_META[f].label} ${pct}%`}
            />
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300 sm:grid-cols-4">
        {FORMATS.map((f) => {
          const meta = FORMAT_META[f];
          return (
            <li key={f} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <meta.Icon className="h-3 w-3 text-slate-400" />
                {meta.label}
              </span>
              <span className="tabular-nums text-slate-100">
                {style.percentages[f]}%
              </span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
