# Architecture

A walk-through of how EngiNerd is wired — what's where, what's deliberate, what's deferred. Aimed at a senior engineer reading this to decide whether to bring me in for a deeper conversation.

---

## High-level shape

EngiNerd is a Next.js 16 App Router project. Three surfaces:

| Surface | Route group | Audience | Auth |
|---|---|---|---|
| Marketing | `app/(marketing)/` | Cold visitors, recruiters, judges | Public |
| Dashboard | `app/(dashboard)/` | Signed-in learners | Auth-gated via `proxy.ts` |
| Auth | `app/(auth)/` | Sign-in / register | Public |

Every API surface is `app/api/*` with a per-route handler. There's no `pages/` directory — the codebase is App Router only.

Edge of the system:

```
Browser ─► Vercel CDN ─► proxy.ts (NextAuth-aware)
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
       RSC + Server Actions          Route handlers (app/api/*)
                │                           │
                └─────────────┬─────────────┘
                              ▼
        ┌───────────┬─────────┴───────────┬───────────────┐
        ▼           ▼                     ▼               ▼
    Neon         Upstash               Anthropic     Razorpay /
    Postgres     Redis                  Claude        MSG91 / Resend
   (15 tables)   (rate-limit)        (5-stage agents)  (3rd-party)
```

---

## Stack choices and why

### Framework: Next.js 16 (App Router, RSC, Turbopack)

- **Why this version specifically.** Native support for the View Transitions API (cycle 26 candidate) and partial pre-rendering. The codebase reads `node_modules/next/dist/docs/` before applying any framework pattern that's newer than typical training data.
- **Server-first by default.** Every page that doesn't need interactivity stays an RSC. Client islands (`"use client"`) are reserved for state, effects, browser APIs, or third-party libraries that ship their own client boundary.
- **Turbopack** for dev + build. ~30s clean prod build over 512 static pages.

### Database: Neon Postgres + Drizzle ORM

- **Neon** because serverless Postgres pairs with Vercel functions: one HTTP-style connection, no pool management, regional read replicas if needed later.
- **Drizzle** for type-safe queries without a heavy ORM tax. Schema lives in `lib/db/schema.ts` (a single file, ~600 lines, easy to scan). Migrations are plain SQL in `lib/db/migrations/000N_*.sql` — applied with `psql -f`, no migrator framework.
- **Two clients**: the `server-only` client at `lib/db/index.ts` (for RSC + route handlers), and a parallel non-`server-only` client at `scripts/_db.ts` (for tsx scripts). Same schema, different import boundary.

### Cache + rate-limit: Upstash Redis

- 4 limiter tiers, all routing through the `tooManyRequests(reset)` helper so every 429 carries `Retry-After`:
  - `apiReadLimiter` — 120/min for read-heavy GETs (`/api/me`)
  - `apiLimiter` — 60/min default
  - `apiMutationLimiter` — 30/min for state-changing POSTs (handle, progress, submissions, cancel)
  - `apiCheckoutLimiter` — 10/min for Razorpay create-order + verify (shared budget — replay-proof across siblings)
- In-memory fallback (dev with no Upstash creds) does opportunistic stale-bucket eviction every 256 calls + 50k hard cap, so a long-running container can't OOM.

### Auth: NextAuth v5 + phone OTP + email OTP + Google OAuth

- Phone OTP via **MSG91** (DLT-compliant in India), email OTP via **Resend**. Both have a single 500ms-backoff retry on transient 5xx so a flaky upstream doesn't burn the user's per-hour quota.
- OTPs stored in `audit_events` for compliance (with the OTP value redacted before logging — see `lib/logger.ts`'s `REDACT_KEYS` set).
- Two-tier rate limit on send: per-identifier (3/h) AND per-IP (5/h) so an attacker iterating phone numbers can't reap fresh per-identifier budgets at our SMS cost.

### Payments: Razorpay

- **HMAC verification on every checkout success** + **every webhook**. `crypto.timingSafeEqual` for the constant-time compare — prevents timing leaks on signature checks.
- **Idempotent capture transition.** `recordPaymentCaptured` runs `UPDATE … WHERE status = 'created' RETURNING *`. Re-entry returns null; the webhook checks for null and breaks before extending the subscription. Replay attacks are no-ops.
- **Key-pair sanity check at module load** — logs `razorpay.key_mismatch` (last-4-chars only, never key body) if `RAZORPAY_KEY_ID !== NEXT_PUBLIC_RAZORPAY_KEY_ID`. Closes the most common silent payment-failure cause.

### LLM: Anthropic Claude via `generateStructured`

- Tier system: `smart` (Sonnet 4.6) for quality-critical agents; `fast` (Haiku 4.5) for cheap classification. Every call returns `{ output, usage, mode, model }` so cost is observable end-to-end.
- **Stub mode**: when `ANTHROPIC_API_KEY` is unset, the entire 5-stage pipeline runs against deterministic fixtures in ~1 second. Tests + CI never touch the network.
- Ephemeral cache via `cacheableUserPrefix` — stable system prompts get a cache breakpoint so back-to-back calls with similar context cost ~10% of the input tokens.

### Analytics: PostHog + audit_events

- **Two pipelines**: PostHog for behavioural funnels, Postgres `audit_events` for compliance and DB-side replayability.
- 12 typed event names in `lib/analytics-server.ts`. New event = update the union, no schema migration.
- The `format.selected` event is the load-bearing signal for the cycle-21+22 personality model. The widget aggregates the user's last 200 events and computes their dominant format.

---

## Key flows

### Sign-in (phone OTP)

```
POST /api/auth/otp/phone/send
  → otpSendLimiter.limit(phone)               (3/h per phone)
  → otpSendByIpLimiter.limit(`phone:${ip}`)   (5/h per IP)
  → issueOtp(...) writes 1 row in `otp_codes`
  → sendPhoneOtp(...) → MSG91 (with 1 retry on 5xx/timeout)
  → audit_events: otp.send

POST /api/auth/otp/phone/verify (NextAuth route)
  → otpVerifyLimiter.limit(phone)             (10 / 15 min)
  → constant-time compare against the row
  → success → NextAuth issues session cookie
  → audit_events: otp.verify.{ok|fail}
```

### Subject view (with cycle-21 format tabs + cycle-22 DB content)

```
GET /subjects/<slug>?format=slides
  → page.tsx (RSC):
      params.slug + searchParams.format
      ↓
      readSubjectContent(slug)
        ├── DB query subject_content (1h unstable_cache)
        └── fallback: fs.readFile content/<slug>.md
      ↓
      <SubjectMarkdownReader markdown={…} format="slides" />
        ├── <FormatTabs active="slides">          (4 tabs, URL-state)
        └── <FormatSlides source={markdown}>      (deterministic parser → ## sections)

GET /api/analytics/format
  → apiMutationLimiter.limit(`format:${userId}`) (30/min)
  → track('format.selected', { subjectSlug, format })
  → logAuditEvent('format.selected', metadata)
```

### Razorpay checkout

```
POST /api/checkout/create-order  (apiCheckoutLimiter 10/min)
  → server picks plan amount (never trusts client)
  → razorpay.orders.create(...)
  → INSERT payments (status='created')
  → return { orderId, amount, keyId } to client
  → client opens Razorpay Checkout popup

POST /api/checkout/verify        (shares 10/min budget with create-order)
  → verifyCheckoutSignature(orderId|paymentId, signature)
      crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      → crypto.timingSafeEqual
  → recordPaymentCaptured(orderId, paymentId, signature)
      UPDATE payments SET status='captured' WHERE status='created' RETURNING *
      ← returns null on already-captured (idempotent)
  → activateSubscription(...) only when capture transition succeeded
  → audit_events: checkout.activated
```

### Polymorphic learning surface (cycle 21)

```
content/<slug>.md  ─►  parseSlides       ─►  FormatSlides    (## sections, arrow-key nav)
                  ─►  parseMindmap      ─►  FormatMindmap   (H1/H2/H3 → Mermaid mindmap)
                  ─►  parseFlashcards   ─►  FormatFlashcards (### → flip-card deck)
                  ─►  MarkdownRenderer  ─►  Read view       (default)

Tab click ─► POST /api/analytics/format ─► audit_events
                                       └─► PostHog 'format.selected'
                                                      │
                                                      ▼
                  /home learning-style widget aggregates last 200 events:
                    counts → percentages (sum to 100, remainder onto dominant)
                    null until ≥5 samples
```

---

## Data layer (15 tables)

| Table | Purpose | Cycle introduced |
|---|---|---|
| `users`, `accounts`, `sessions`, `verification_tokens` | NextAuth core | Phase 1 |
| `audit_events` | Durable event log (security + compliance + analytics replay) | Phase 1 |
| `user_progress` | Per-subtopic completion + lastSeenAt + masteredAt | Phase 2 |
| `user_stats` | Streak counters + cohort denorm | Phase 2 |
| `problems`, `submissions` | DSA practice + per-user attempt history | Phase 3 |
| `subject_feedback` | Anonymous-friendly thumbs (composite uniq on user/anon × slug) | Phase 5 |
| `cohorts`, `cohort_members`, `leaderboard_snapshots` | Weekly cohort rollup, materialised for fast leaderboard reads | Phase 8 |
| `payments`, `subscriptions`, `razorpay_webhook_events` | Payment + subscription lifecycle, webhook idempotency | Phase 9 |
| `library_roadmaps` | LLM-generated roadmap publish target | Agent pipeline |
| `agent_runs`, `agent_events` | Durable run + event log for the 5-stage pipeline | Agent pipeline |
| `subject_content` | DB-of-record markdown (cycle 22) | Cycle 22 |

Indexes are added per cycle as scaling requires; `0005_scale_indexes.sql` ships the foundational set.

---

## Cycle-driven development

The build process itself is the headline architectural choice. Each cycle is:

1. **Audit** — 5–7 specialist agents (Designer, UX, Frontend, Backend/Security, Scalability, Sustainability, Content) run in parallel against the codebase, returning ranked findings with file:line citations.
2. **Synthesis** — Jarvis (the orchestrator) verifies each top-impact claim before locking the synthesis. Cycle history shows ~10 retractions across 22 cycles — verification consistently catches false alarms.
3. **Execute** — work is split between direct Jarvis edits (mechanical, fast) and delegated specialist subagents (parallel, long-form).
4. **Build + smoke** — tsc, build, vitest, playwright, manual smoke. Gates are non-negotiable: every cycle ends green or doesn't ship.
5. **Report** — a `cycle-N.md` lands in `tech-team/cycles/`. The cycle index is publicly readable at `/changelog`.

---

## Testing approach

- **Vitest for pure logic.** Format parsers, rate-limit helper, plan computation, Razorpay signature, voice-rule enforcement, learning-style aggregator. 68 cases / 9 files.
- **Playwright for user-flow regressions.** Public catalog browse, auth redirects, format-tab switching, legal pages, security headers, profile not-found. 43 cases / 18 files.
- **No DB-integration tests** in CI — the schema-level integrations are caught by Drizzle's type system + manual smoke. A future cycle adds Testcontainers-based suite.
- **Stub mode** for the LLM pipeline so tests run offline.

---

## Performance notes

- 512 static pages at build (down from 618 in cycle 21) — subjects became dynamic in cycle 22 because pre-rendering 100+ pages most users never visit was wasteful.
- `unstable_cache` everywhere DB-read-heavy: subject content (1h), search index (30min), real-jobs (1h), subject feedback aggregates (5min). Per-cycle tags so `revalidateTag('subject-md:<slug>')` flushes a single subject after admin edit.
- Mermaid + Shiki are lazy-loaded via `next/dynamic` — only the first page that contains a fence pays the WASM cost, and the same cache services in-content fences and the cycle-21 mindmap view.
- Lucide-react `modularizeImports` rule keeps the icon tree-shake honest across 38+ import sites.

---

## What's deferred

Tracked at the bottom of every cycle report. Highlights:

- **`/studio`** — the user-types-a-topic LLM flow that produces slides + mindmap + flashcards from scratch. Plumbing landed in cycle 22 (`upsertSubjectContent`, `source: 'studio'`); the LLM call is the next big ship.
- **Adaptive default format** — once a user has ≥5 format clicks, redirect to their dominant format on every new subject open.
- **Move metadata to DB** — `subjects.ts` (4081 lines) and `roadmaps.ts` (1095 lines) still live in the JS bundle. Cycle 22 moved the *content* but left the *catalog metadata*.
- **Awwwards-grade craft** — view transitions, custom cursor, sound design, dynamic OG, Lighthouse 100s sweep. Tracked for cycle 26.

---

## Why this codebase is the way it is

Three unstated rules:

1. **Verify audit claims before fixing.** The `tech-team/cycles/` log shows ~10 retractions where I read the cited file and discovered the audit was wrong. The discipline saved real edit time and prevented regressions.
2. **Render server, hydrate islands.** Every interactive piece is a leaf-level client component — `"use client"` never sits on a layout or shared shell. The dashboard surface ships almost entirely as server-rendered HTML.
3. **Make the unsafe call observable.** Every limiter has a name. Every 429 has Retry-After. Every audit event has a typed name. Every webhook is idempotent. Every payment-key check fails loud at boot, not silently at first use.

Each cycle made one or more of these rules more concrete. The cycle log explains why.
