"use client";

/**
 * Hero client island.
 *
 * Owns ALL interactivity for the landing-page hero:
 *   - the "I want to be ___" form (controlled `goal`, submit, focus mgmt)
 *   - goal validation via matchGoal — garbage input is blocked with an error
 *   - the rotating placeholder (SAMPLE_GOALS interval)
 *   - roadmap-matched typewriter streaming (one blurb per slug)
 *   - the right-column visual: Logo3D before submit, live stream after
 *
 * Split out of `hero.tsx` (Cycle 14, PERF-1) so the H1 + subhead in `<Hero>`
 * stay pure RSC and ship as server HTML — saves ~250-400ms LCP because the
 * largest text block paints without waiting for the client bundle to hydrate.
 */

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoSvg } from "@/components/shared/logo-svg";
import { matchGoal, GOAL_PREVIEWS } from "@/lib/goal-match";

// Lazy-load the 3D canvas — Three.js is ~150KB; defer until hero is needed.
const Logo3D = dynamic(() => import("@/components/marketing/logo-3d"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full max-w-[420px] mx-auto opacity-60">
      <LogoSvg size={300} />
    </div>
  ),
});

const SAMPLE_GOALS = [
  "Amazon mein backend developer",
  "Razorpay mein data analyst",
  "Swiggy mein ML engineer",
  "Google mein SRE",
  "Flipkart mein full-stack engineer",
];

const MATCH_ERROR_MSG =
  "Hmm, ye samajh nahi aaya. Try: 'backend developer', 'data analyst', 'ML engineer', 'frontend', 'DevOps', 'TCS NQT'…";

export function HeroForm() {
  const [goal, setGoal] = React.useState("");
  // matched holds the roadmap resolved from the last successful submit.
  const [matched, setMatched] = React.useState<{
    slug: string;
    title: string;
  } | null>(null);
  // streamContent is the full blurb we're typewriting — set once on submit.
  const [streamContent, setStreamContent] = React.useState("");
  const [streamIndex, setStreamIndex] = React.useState(0);
  // matchError is set when the input doesn't map to any roadmap.
  const [matchError, setMatchError] = React.useState<string | null>(null);
  const [placeholder, setPlaceholder] = React.useState(SAMPLE_GOALS[0]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Rotate the placeholder example every 2.4s — only when the input is
  // empty + unfocused, so we never disrupt the user's typing.
  React.useEffect(() => {
    if (goal.length > 0) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % SAMPLE_GOALS.length;
      setPlaceholder(SAMPLE_GOALS[i] ?? SAMPLE_GOALS[0]);
    }, 2400);
    return () => clearInterval(id);
  }, [goal]);

  // Typewriter effect — char by char once the user submits a recognized goal.
  React.useEffect(() => {
    if (matched === null) return;
    if (streamIndex >= streamContent.length) return;
    const id = setTimeout(() => setStreamIndex((i) => i + 1), 18);
    return () => clearTimeout(id);
  }, [matched, streamIndex, streamContent.length]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goal.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    const result = matchGoal(trimmed);
    if (!result) {
      // Block progression — show inline error, keep focus on input.
      setMatchError(MATCH_ERROR_MSG);
      inputRef.current?.focus();
      return;
    }

    // Valid roadmap matched — clear any prior error and start streaming.
    setMatchError(null);
    const preview =
      GOAL_PREVIEWS[result.slug] ??
      `${result.title} — yeh roadmap tumhare liye hai. Chalo shuru karte hain.`;
    setMatched(result);
    setStreamContent(preview);
    setStreamIndex(0);
  };

  const visible = matched ? streamContent.slice(0, streamIndex) : "";
  const showCursor =
    matched !== null && streamIndex < streamContent.length;

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
      {/* LEFT — interactive form + error + login link */}
      <div className="flex flex-col items-start">
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
          aria-describedby={matchError ? "hero-goal-error" : undefined}
          noValidate
        >
          <div className="relative flex-1">
            {/* The visible "I want to be" prefix is the label — mapping
                visible text to accessible name (WCAG 2.5.3). Voice-control
                users can say "click I want to be" and land on the input. */}
            <label
              htmlFor="hero-goal"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            >
              I want to be
            </label>
            <input
              id="hero-goal"
              ref={inputRef}
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                // Clear error as soon as the user starts typing again.
                if (matchError) setMatchError(null);
              }}
              placeholder={placeholder}
              aria-invalid={matchError !== null}
              aria-errormessage={matchError ? "hero-goal-error" : undefined}
              className="h-14 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-[110px] pr-4 text-lg text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-white/[0.04] aria-[invalid=true]:border-amber-400/50"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-6 text-base">
            <Sparkles className="h-4 w-4" />
            Get started
          </Button>
        </form>

        {/* Inline error — shown when matchGoal returns null */}
        {matchError ? (
          <p
            id="hero-goal-error"
            role="alert"
            className="mt-2 max-w-2xl text-sm text-amber-300"
          >
            {matchError}
          </p>
        ) : null}

        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          Already a learner? Continue your roadmap
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* RIGHT — 3D logo OR live roadmap-specific stream */}
      <div className="relative">
        {/* Subtle glow behind the logo / stream — kept singular: no rainbow */}
        <div
          aria-hidden
          className="absolute -inset-12 -z-10 rounded-[40px] opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(139,92,246,0.30), rgba(6,182,212,0.18) 50%, transparent 75%)",
          }}
        />
        {matched === null ? (
          <Logo3D />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-6 sm:p-8"
          >
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">
              {matched.title} — first lesson
            </p>
            <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.75] text-slate-200 sm:text-base">
              {visible}
              {showCursor ? (
                <span className="inline-block h-[1.1em] w-[2px] -mb-[0.15em] animate-pulse bg-violet-300 align-middle" />
              ) : null}
            </pre>
            {!showCursor ? (
              <Link
                href={`/login?goal=${encodeURIComponent(matched.slug)}`}
                className="mt-6 inline-block"
              >
                <Button size="lg">
                  Continue — log in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
