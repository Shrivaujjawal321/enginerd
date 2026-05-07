/**
 * The hero. The one demo moment. Steve Jobs would have killed everything
 * else. Here it is:
 *
 *   1. The 3D bracket logo on the right (or a tasteful SVG fallback).
 *   2. ONE H1: "Engineering, explained like a friend would."
 *   3. ONE input: "I want to be ___."
 *   4. ONE typewriter that starts streaming Hinglish content the moment you
 *      submit, so the visitor SEES the product before signing up.
 *   5. ONE CTA — "Continue — log in →".
 *
 * Cycle 14, PERF-1: this file is now a pure React Server Component. It
 * renders the LCP element (H1 + subhead) straight from server HTML so the
 * browser paints it before any JS evaluates. All interactivity (form state,
 * placeholder rotation, typewriter, Logo3D vs stream) lives in the
 * `<HeroForm />` client island below — saving ~250-400ms LCP.
 *
 * No client directive here. No `motion`, no `useState`, no `useEffect`.
 */

import { HeroForm } from "@/components/marketing/hero-form";

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* LCP block: H1 + subhead. Server-rendered HTML, zero JS gate. */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="flex flex-col items-start">
            <h1 className="text-[40px] font-bold leading-[0.98] tracking-[-0.035em] text-slate-50 sm:text-6xl lg:text-[72px]">
              Engineering,
              <br />
              explained
              <br />
              like a{" "}
              <span className="gradient-text-primary">friend</span>{" "}
              would.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Hinglish lessons. IIT-level depth. Job-ready in 90 days.
              <br className="hidden sm:block" />
              <span className="text-slate-400">
                Tell us what you want to become — we&apos;ll start your first
                lesson now.
              </span>
            </p>
          </div>
          {/* Right column reserved at lg+ so the form + logo grid below
              aligns optically with the H1 column. Empty on the server. */}
          <div aria-hidden className="hidden lg:block" />
        </div>
      </div>

      {/* Interactive island: form (LEFT) + Logo3D / live stream (RIGHT). */}
      <div className="mt-8 sm:mt-10">
        <HeroForm />
      </div>
    </section>
  );
}
