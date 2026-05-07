# EngiNerd

> A Hinglish-first learning platform for Indian engineering students — built end-to-end as a single-engineer ship.
>
> **Live demo:** _add link after deploy_  ·  **Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)  ·  **Built-in-public log:** [`/changelog`](./tech-team/cycles/) (22 cycles, ~3 weeks)

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle-Postgres-c5f74f)](https://orm.drizzle.team/) [![Tested](https://img.shields.io/badge/tests-68_unit_%2B_43_e2e-brightgreen)](#testing) [![License](https://img.shields.io/badge/license-MIT-blue)](#license)

---

## Why this exists

Engineering placement prep in India is a five-platform problem: roadmaps on one site, DSA on another, mock interviews somewhere else, and content that's either too dry or too shallow. EngiNerd is the single-platform answer for tier-2 / tier-3 college students — Hinglish-native explanations, India-context interviews, real practice loop.

It's also a portfolio piece: I designed, shipped, and ran the multi-agent improvement loop that produced this codebase. The cycle log lives at [`tech-team/cycles/`](./tech-team/cycles/) — every audit, every retracted claim, every verification, every shipped change.

---

## What's interesting about this codebase

These are the parts a hiring manager would actually want to read:

| Where | What it is | Why it's interesting |
|---|---|---|
| `lib/agents/` | A 5-stage LLM content pipeline (Trend Researcher → Subject Mapper → Topic Deepdiver → Hinglish Writer → Quality Orchestrator) | Real production agentic system: structured tool-use, ephemeral cache, stub mode for offline dev, durable run + event tables, SSE streaming to a live progress dashboard. |
| `lib/format-parsers.ts` + `components/dashboard/format-*.tsx` | Cycle 21's "polymorphic learning surface" — every subject can render as Read · Slides · Mindmap · Flashcards | Pure-function transforms over the same markdown source. Format choice lives in the URL (shareable, backable). 16 unit tests + 5 e2e specs lock the behaviour. |
| `lib/ratelimit.ts` | 4-tier limiter (api / read / mutation / checkout) atop Upstash Redis | Distinct ceilings per workload class so probes can't amortise across surfaces. `tooManyRequests(reset)` helper applied to every 14 routes — every 429 carries `Retry-After`. |
| `lib/learning-style.ts` + `components/dashboard/learning-style-widget.tsx` | A live learning-style profile per user, computed from `format.selected` audit events | Opt-in personality observation. Empty state until ≥5 samples (no statistical noise), percentages always sum to 100 (remainder pushed onto dominant format). |
| `lib/subject-content-store.ts` | DB-first content reader with file fallback (cycle 22) | Decouples content from deploys. Admin edits land via `revalidateTag('subject-md:<slug>')`. |
| `app/api/checkout/*` + `app/api/webhooks/razorpay/*` | Razorpay one-time + subscription flow | Server-side HMAC verification on every payment + every webhook (`crypto.timingSafeEqual`). Idempotent capture transition guarded with explicit `WHERE status='created'` so replay can't double-extend a subscription. |
| `tech-team/cycles/cycle-N.md` (×22) | Multi-agent improvement loop reports | Each cycle: parallel specialist audits → synthesis → execution → build/smoke → user verdict. Includes retracted audit claims that didn't survive verification. Surfaced publicly at [`/changelog`](./app/(marketing)/changelog/). |

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC, Turbopack) | Server-first; per-route caching; native View Transitions on the roadmap |
| Language | **TypeScript** strict | Every cross-module call site is type-checked; zero `any` outside test mocks |
| Database | **Neon Postgres** + **Drizzle ORM** | Serverless-friendly; migrations checked into `lib/db/migrations/` |
| Cache + rate-limit | **Upstash Redis** | Distributed token-bucket; in-memory fallback in dev with stale-bucket eviction |
| Auth | **NextAuth v5** + phone OTP (MSG91) + email OTP (Resend) + Google OAuth | India-friendly, DLT-compliant SMS; OTP retries on transient 5xx |
| Payments | **Razorpay** (one-time + subscriptions) | India's most-used gateway; HMAC + idempotent webhook capture |
| LLM | **Anthropic Claude** (Sonnet 4.6 smart, Haiku 4.5 fast) via custom `generateStructured` | Tool-use for structured output; ephemeral cache; stub mode for offline tests |
| Analytics | **PostHog** (server + client) + durable `audit_events` row per signal | Two-pipeline tracking: PostHog for behavioural, Postgres for compliance + replayability |
| Error tracking | **Sentry** | Wired in `instrumentation.ts` |
| Testing | **Vitest** (68 unit) + **Playwright** (43 e2e) | Pure-function logic in vitest; user-flow regressions in chromium |
| Deploy | **Vercel** + GitHub Actions (typecheck · build · vitest · playwright) | Branch-deploy preview every PR |

---

## Architecture at a glance

```
                    Marketing                         Dashboard
                    (public)                          (auth-gated)
                       │                                   │
                       ▼                                   ▼
   ┌──────────────────────┐         ┌────────────────────────────────────┐
   │  /         landing   │         │  /home   search · streak · recent  │
   │  /pricing  pricing   │         │  /subjects/<slug> ?format=…        │
   │  /roadmaps catalog   │         │  /practice  + code runner          │
   │  /changelog  cycles  │         │  /careers   + JobAgent (LLM match) │
   │  /terms /privacy …   │         │  /billing  + Razorpay              │
   └──────────────────────┘         └────────────────────────────────────┘
                       │                                   │
                       └─────────────┬─────────────────────┘
                                     ▼
                   ┌────────────────────────────────────┐
                   │  Server actions + RSC + /api routes │
                   │  apiRead · apiMutation · apiCheckout │
                   │  (every 429 → Retry-After header)   │
                   └────────────────────────────────────┘
                                     │
                       ┌─────────────┼──────────────┐
                       ▼             ▼              ▼
                 Neon Postgres  Upstash Redis   Anthropic API
                 (15 tables)    (rate-limit)    (5-stage agents)
```

Full breakdown in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Local setup

```bash
# 1. Clone + install
git clone <this-repo>
cd enginerd
npm install

# 2. Env
cp .env.example .env.local
# Fill in DATABASE_URL (Neon free tier works) + ANTHROPIC_API_KEY (optional — stubs run offline)

# 3. Run migrations + seed
psql "$DATABASE_URL" -f lib/db/migrations/0000_phase_1_2_init.sql
# … run each numbered migration in order, last is 0007_subject_content.sql
npx tsx scripts/seed-problems.ts          # 469 DSA problems
npx tsx scripts/seed-subject-content.ts   # 103 subject markdowns into DB

# 4. Dev
npm run dev             # turbopack, http://localhost:3000

# 5. Tests
npm test                # vitest (unit) — 68 cases
npx playwright test     # e2e (chromium) — 43 cases
npm run build           # production build
```

OTP in dev: with `RESEND_API_KEY` and `MSG91_AUTH_KEY` unset, the OTP code is logged to the dev terminal — paste it into the form to complete sign-in.

---

## Project structure (the parts that matter)

```
app/
  (marketing)/              public surfaces — landing, pricing, /changelog,
                            /terms /privacy /refunds /contact
  (dashboard)/              auth-gated — /home, /subjects, /practice,
                            /careers, /billing, /profile
  api/                      route handlers — auth, checkout, webhooks,
                            agent triggers, analytics, search-index
components/
  dashboard/                client islands per dashboard surface
  marketing/                hero, navbar, footer, feature cards
  shared/                   markdown renderer (lazy mermaid + shiki),
                            glass card, wordmark
lib/
  agents/                   5-stage LLM pipeline + run store + library
  db/                       Drizzle schema + 8 migrations
  format-parsers.ts         markdown → slides / mindmap / flashcards (pure)
  learning-style.ts         personality model aggregator
  ratelimit.ts              4-tier Upstash limiter + Retry-After helper
  razorpay.ts               HMAC verify + key-pair sanity check at boot
  changelog.ts              parses tech-team/cycles for /changelog page
content/                    103 Hinglish subject markdowns (105K lines)
data/generated-problems/    469 DSA problems (validated against editorials)
e2e/                        18 Playwright spec files
tech-team/cycles/           22 build-in-public cycle reports
```

---

## Testing

- **Unit (vitest)** — 68 cases / 9 files. Pure-function logic only: format parsers, learning-style aggregator, rate-limit helper, plan + Razorpay HMAC, voice-rule enforcement.
- **E2e (Playwright)** — 43 cases / 18 files. Auth redirects, public catalog, subject render, cycle-21 format tabs, legal pages, security headers.
- **Build** — green on every cycle ship; static pages drop from 618 → 512 after cycle 22 dropped per-subject pre-render.

---

## Built in public

The platform was shipped through a multi-agent improvement loop — Designer · UX · Frontend · Backend/Security · Scalability · Sustainability · Content specialists run audits in parallel, the orchestrator (Jarvis) verifies findings, picks priorities, and executes. Each cycle ends with a markdown report committed to `tech-team/cycles/cycle-N.md`. **22 cycles to date.** [Browse them at `/changelog`](./app/\(marketing\)/changelog/).

A few favourites:

- **Cycle 16** — triage audit + 9 fixes + 4 cuts. Three audit claims retracted on verification (footer dead links, clsx removal, fill-roadmaps removal — all false alarms).
- **Cycle 19** — launch-readiness sweep. Two more retracted claims (webhook double-extend already guarded; navbar CTA already correct). 4 real legal pages shipped.
- **Cycle 21** — polymorphic learning surface. One markdown source → 4 views (Read · Slides · Mindmap · Flashcards) + every tab click logged for the personality model.
- **Cycle 22** — content out of frontend. Markdown moved into Postgres; build dropped from 618 → 512 static pages; dashboard reshaped around search + recently-viewed + learning-style.

---

## License

MIT — feel free to learn from the code. Content under `content/*.md` is © EngiNerd, all rights reserved.

---

## Hire me

I built this end-to-end. If you're hiring engineers who can ship a real product solo, take a look at [`/about`](./app/\(marketing\)/about/) on the live site, or email **hello@enginerd.in**.
