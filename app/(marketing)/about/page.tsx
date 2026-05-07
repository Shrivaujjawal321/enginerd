import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Sparkles } from "lucide-react";

/* Inline brand-icon SVGs — lucide-react no longer ships GitHub / LinkedIn
 * marks (trademark concern). Keeping these inline avoids re-introducing the
 * deleted `components/shared/brand-icons.tsx` module and its 0-caller code.
 */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67h-3.55V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

import { GlassCard } from "@/components/shared/glass-card";

/* ============================================================================
 *  Edit these constants before deploying — they're load-bearing for hiring.
 *  Pulled to the top so swapping handles / email / city is a 30-second job.
 * ============================================================================
 */
const PROFILE = {
  name: "Ujjwal Shrivastava",
  tagline: "Full-stack engineer · Bengaluru, India",
  email: "ratneshs230@gmail.com",
  github: "https://github.com/Shrivaujjawal321",
  linkedin: "https://www.linkedin.com/in/ujjwal-shrivastava",
  resume: "/resume.pdf",
} as const;

const LOOKING_FOR = {
  roles: ["Senior Full-stack", "Founding Engineer", "Product-leaning SWE"],
  location: "Bengaluru / remote-friendly",
  comp: "Open — looking for impact-and-ownership-first roles",
};

const HIGHLIGHTS = [
  {
    title: "Shipped EngiNerd end-to-end, solo",
    body: "Next.js 16, TypeScript strict, Drizzle + Neon Postgres, Upstash, Razorpay, Anthropic. ~24 weeks of disciplined cycles, every one with a public retrospective at /changelog.",
  },
  {
    title: "Built a 5-stage production LLM pipeline",
    body: "Trend-researcher → subject-mapper → topic-deepdiver → Hinglish-writer → quality-orchestrator. Structured tool-use, ephemeral cache, stub mode for offline tests, per-stage cost telemetry, durable run + event tables, SSE-streamed progress dashboard.",
  },
  {
    title: "Polymorphic learning surface",
    body: "Same markdown, four views (Read · Slides · Mindmap · Flashcards) — pure-function transforms with 16 unit tests + 5 e2e specs. URL-state so views are shareable. Tab-clicks feed a per-user learning-style profile that surfaces on /home.",
  },
  {
    title: "Hardened the unsexy stuff",
    body: "Razorpay HMAC + idempotent webhook capture, 4-tier rate limiter with Retry-After on every 429, OTP retry on transient 5xx, audit-log everything, key-pair sanity check at module load, DPDPA-aware privacy + consent surfaces.",
  },
];

const SKILLS = [
  {
    label: "Frontend",
    items: ["Next.js 16 (App Router, RSC)", "TypeScript", "Tailwind", "React Server Components"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Drizzle ORM", "Neon Postgres", "Upstash Redis", "REST + Server Actions"],
  },
  {
    label: "AI / LLM",
    items: ["Anthropic Claude", "Structured tool-use", "Multi-stage agent pipelines", "Prompt caching"],
  },
  {
    label: "Infra / Ops",
    items: ["Vercel", "GitHub Actions CI", "Sentry", "PostHog", "Razorpay payments"],
  },
  {
    label: "Quality",
    items: ["Vitest", "Playwright", "WCAG-AA discipline", "Cycle-driven retros with audit retraction"],
  },
];

export const metadata: Metadata = {
  title: `${PROFILE.name} — full-stack engineer`,
  description: `${PROFILE.tagline}. Built EngiNerd end-to-end — open to senior full-stack and founding-engineer roles.`,
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 border-b border-white/[0.06] pb-10">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
          <Sparkles className="h-3 w-3" />
          About
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          {PROFILE.name}
        </h1>
        <p className="mt-3 text-base text-slate-300">{PROFILE.tagline}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/[0.10] px-4 py-2.5 text-sm font-medium text-violet-100 transition-colors hover:border-violet-400/50 hover:bg-violet-500/[0.18]"
          >
            <Mail className="h-4 w-4" />
            {PROFILE.email}
          </a>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
          >
            <LinkedinIcon className="h-4 w-4" />
            LinkedIn
            <ArrowUpRight className="h-3 w-3" />
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
            <ArrowUpRight className="h-3 w-3" />
          </a>
          <a
            href={PROFILE.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
          >
            Resume
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </header>

      {/* What I'm looking for ============================================== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          What I&apos;m looking for
        </h2>
        <GlassCard className="mt-4 grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Roles
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-100">
              {LOOKING_FOR.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Location
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-100">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {LOOKING_FOR.location}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Comp
            </p>
            <p className="mt-2 text-sm text-slate-100">{LOOKING_FOR.comp}</p>
          </div>
        </GlassCard>
      </section>

      {/* Highlights ======================================================= */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          What I&apos;ve built
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          This site is the proof. Every cycle is documented at{" "}
          <Link
            href="/changelog"
            className="text-violet-200 underline-offset-2 hover:text-violet-100 hover:underline"
          >
            /changelog
          </Link>
          ; the architecture is at{" "}
          <a
            href={`${PROFILE.github}/blob/main/ARCHITECTURE.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-200 underline-offset-2 hover:text-violet-100 hover:underline"
          >
            ARCHITECTURE.md
          </a>
          ; one technical deep-dive lives at{" "}
          <Link
            href="/posts/agent-pipeline"
            className="text-violet-200 underline-offset-2 hover:text-violet-100 hover:underline"
          >
            /posts/agent-pipeline
          </Link>
          .
        </p>
        <div className="mt-5 space-y-4">
          {HIGHLIGHTS.map((h) => (
            <GlassCard key={h.title} className="p-5">
              <h3 className="text-base font-semibold text-slate-50">
                {h.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {h.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Skills =========================================================== */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          Stack I reach for
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Final CTA ======================================================== */}
      <section>
        <GlassCard className="p-6 text-center sm:p-8">
          <p className="text-base text-slate-200">
            If you&apos;re hiring engineers who can ship a real product solo —
            let&apos;s talk.
          </p>
          <a
            href={`mailto:${PROFILE.email}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
          >
            <Mail className="h-4 w-4" />
            {PROFILE.email}
          </a>
        </GlassCard>
      </section>
    </article>
  );
}
