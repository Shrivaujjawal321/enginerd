"use client";

/**
 * Hero client island.
 *
 * Owns ALL interactivity for the landing-page hero:
 *   - the "I want to be ___" form (controlled `goal`, submit, focus mgmt)
 *   - the rotating placeholder (SAMPLE_GOALS interval)
 *   - the typewriter `streaming` / `streamIndex` state
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
  "Swiggy mein product manager",
  "Google mein SRE",
  "Flipkart mein full-stack engineer",
];

/** Hinglish content that streams when the user hits Enter. Real content,
 *  pulled in spirit from `content/da-business-fundamentals.md`. */
const STREAM = `Dekh bhai, seedha point pe aata hoon.

Tu agar product company mein backend dev banna chahta hai, sabse pehle ek baat samajh — DSA crack karna ek skill hai, system design dusri, aur asli interview mein dono ke beech ka cross-questioning hota hai.

Hum start karenge HTTP basics se. Ek REST API kya cheez hai? Restaurant ka waiter samajh — client (tu) order deta hai, server (kitchen) banata hai, waiter response laata hai. Agar kitchen busy hai, 503 milta hai. Agar tu galat order de raha hai, 400. Yahin se shuru hoti hai woh seedhi line jo Amazon mein 18 LPA tak le jaati hai.`;

export function HeroForm() {
  const [goal, setGoal] = React.useState("");
  const [streaming, setStreaming] = React.useState<string | null>(null);
  const [streamIndex, setStreamIndex] = React.useState(0);
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

  // Typewriter effect — stream STREAM char by char once the user submits.
  React.useEffect(() => {
    if (streaming === null) return;
    if (streamIndex >= STREAM.length) return;
    const id = setTimeout(() => setStreamIndex((i) => i + 1), 18);
    return () => clearTimeout(id);
  }, [streaming, streamIndex]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      inputRef.current?.focus();
      return;
    }
    setStreaming(goal.trim());
    setStreamIndex(0);
  };

  const visible = streaming ? STREAM.slice(0, streamIndex) : "";
  const showCursor = streaming !== null && streamIndex < STREAM.length;

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
      {/* LEFT — interactive form + login link */}
      <div className="flex flex-col items-start">
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
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
              onChange={(e) => setGoal(e.target.value)}
              placeholder={placeholder}
              className="h-14 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-[110px] pr-4 text-lg text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-white/[0.04]"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-6 text-base">
            <Sparkles className="h-4 w-4" />
            Get started
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          Already a learner? Continue your roadmap
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* RIGHT — 3D logo OR live stream */}
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
        {streaming === null ? (
          <Logo3D />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-6 sm:p-8"
          >
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">
              {streaming} — first lesson
            </p>
            <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.75] text-slate-200 sm:text-base">
              {visible}
              {showCursor ? (
                <span className="inline-block h-[1.1em] w-[2px] -mb-[0.15em] animate-pulse bg-violet-300 align-middle" />
              ) : null}
            </pre>
            {!showCursor ? (
              <Link href="/login" className="mt-6 inline-block">
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
