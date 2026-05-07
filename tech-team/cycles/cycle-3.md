# Cycle 3 — Compound Velocity (Scale Polish + Foundation Content)

**Date:** 2026-05-02
**Theme:** Tighten every hot path, ship the first batch of placement-foundation content, set up the test harness — so cycle 4 can move faster than cycle 3 did.

---

## 1. Why this cycle

Two compounding angles:

1. **Engineering compound:** every authed page hits `/api/me` and pulls user stats; every roadmap page reads subscriptions for plan gating; every problem submit writes audit + analytics inline. Cycle 2 closed the *new-feature* gaps; cycle 3 squeezes the *steady-state* hot path so 10k DAU stays cheap and fast.
2. **Content compound:** without aptitude + DBMS, the platform fails 60%+ of placement aspirants at the first round. These two subjects unblock the *Service Company Cracker* roadmap (TCS NQT / Infosys / Wipro / Cognizant) — the largest single segment of Indian engineering students.

---

## 2. Audit — 3 specialist agents in parallel

| Agent | Output |
|-------|--------|
| **Senior Content Author (DBMS)** | `content/dbms-complete.md` — 1090 lines, 10 sections, threaded Swiggy-Orders schema across normalisation/indexes/transactions/joins, Indian-product anecdotes (Razorpay, Flipkart, CRED, Hotstar, Dream11), 1 mermaid ER + 1 MVCC sequence + 1 ASCII B-tree |
| **Senior Content Author (Aptitude)** | `content/aptitude-quant.md` — 835 lines, 13 sections, every concept paired with slow-formula vs fast-shortcut timed examples, 25-question trickiest-questions table, 80-second-per-question survival guide |
| **Frontend Performance Engineer** | `MarkdownRenderer` migrated from `"use client"` to RSC; Mermaid (~463 KB) + Shiki (~117 KB) now lazy-loaded islands; pink/orange legacy gradients purged from feature-cards + sidebar; one stray TS error in `scripts/_check_migration.ts` fixed as a side-quest |

Combined output: ~1925 lines of new content + RSC bundle win + brand cleanup, all in one parallel sweep.

---

## 3. Cycle plan — 12 items

| Tag | Subject | File(s) |
|-----|---------|---------|
| **PERF-1** | `unstable_cache` on `getUserStats` (30s, tag `user-stats:userId`) + `getActiveSubscription` (60s, tag `sub:userId`); `revalidateTag` on writes | `lib/progress.ts`, `lib/subscriptions-store.ts`, `app/api/submissions/route.ts` |
| **PERF-2** | `waitUntil` deferral for audit + analytics writes | `app/api/submissions/route.ts`, `app/api/checkout/verify/route.ts`, `app/api/webhooks/razorpay/route.ts`, `app/api/auth/otp/{email,phone}/send/route.ts`, `app/api/subscription/cancel/route.ts` |
| **SEC-6** | `apiLimiter` on `/api/me` (120/min), `/api/progress` (60/min), `/api/checkout/verify` (10/min), `/api/subscription/cancel` (5/min); `llmCostLimiter` on `/api/resume/extract`, `/api/jobs/match` (5/min) | (5 routes) |
| **FE-1** | RSC `MarkdownRenderer` + dynamic Mermaid/CodeBlock | `components/shared/markdown-renderer.tsx` |
| **UX-4** | Phone input inline `+91` prefix, `inputMode=numeric`, 10-digit cap, strip on paste | `components/auth/login-form.tsx` |
| **UX-5** | Code execution skeleton during Piston cold-start ("Compiling on Piston… 6-8s") + 4 shimmer rows | `components/dashboard/problem-workspace.tsx` |
| **BRAND-1** | Pink/orange legacy gradients purged | `components/marketing/feature-cards.tsx`, `components/dashboard/sidebar.tsx` |
| **CONTENT-3** | `content/dbms-complete.md` — 1090 lines | (new file) |
| **CONTENT-4** | `content/aptitude-quant.md` — 835 lines | (new file) |
| **CONTENT-5** | `service-company-cracker` roadmap | `lib/mock-data/roadmaps.ts` + `subjects.ts` (DBMS + Aptitude entries) |
| **TEST-1** | Vitest setup + 17 first tests | `vitest.config.ts`, `lib/__tests__/{plans,format,razorpay}.test.ts`, server-only stub, npm scripts |
| **CYCLE-3** | Build + smoke + this report | (12/12 smoke + 17/17 tests) |

---

## 4. Diffs

### Engineering (caching, deferral, limiter, perf)

```
lib/progress.ts                              +25 -3   getUserStats wrapped in unstable_cache (30s); tag bust on completion
lib/subscriptions-store.ts                   +28 -5   getActiveSubscription wrapped (60s); tag bust on activate/cancel
app/api/submissions/route.ts                 +24 -10  apiLimiter, waitUntil for audit + track, revalidateTag(leaderboard, user-stats)
app/api/checkout/verify/route.ts             +30 -10  10/min/user limiter, waitUntil for audit + track + recordPaymentFailed
app/api/webhooks/razorpay/route.ts           +20 -10  waitUntil for all audit log calls in switch arms
app/api/subscription/cancel/route.ts         +14 -2   apiLimiter (5/min) + waitUntil
app/api/auth/otp/email/send/route.ts         +5 -3    waitUntil for audit
app/api/auth/otp/phone/send/route.ts         +5 -3    waitUntil for audit
app/api/me/route.ts                          +12 -1   apiLimiter (120/min)
app/api/progress/route.ts                    +13 -1   apiLimiter (60/min)
app/api/jobs/match/route.ts                  +12 -1   llmCostLimiter (5/min/IP)
app/api/resume/extract/route.ts              +12 -1   llmCostLimiter (5/min/IP)
components/shared/markdown-renderer.tsx       remove "use client", dynamic Mermaid/CodeBlock with skeletons
components/marketing/feature-cards.tsx        4 pink/orange/amber accents → violet/cyan steps
components/dashboard/sidebar.tsx              upgrade card: drop pink stop, two-color violet→cyan
```

### UX

```
components/auth/login-form.tsx                +30 -8   inline +91 prefix, strip pasted +91/91, inputMode numeric, 10-digit submit gate
components/dashboard/problem-workspace.tsx    +20 -0   skeleton rows + cold-start hint when result.kind === "running"
```

### Content

```
content/dbms-complete.md                       NEW    1090 lines
content/aptitude-quant.md                      NEW    835 lines
lib/mock-data/subjects.ts                      +130   dbms-complete (9 topics) + aptitude-quant (11 topics)
lib/mock-data/roadmaps.ts                      +40    service-company-cracker roadmap; dbms-complete added to product-company-cracker
```

### Tests

```
vitest.config.ts                               NEW    aliases @ + server-only stub, node env, lib/__tests__ include
lib/__tests__/_stubs/server-only.ts            NEW    no-op for the server-only marker import
lib/__tests__/plans.test.ts                    NEW    PLANS shape + planMeets gating (5 tests)
lib/__tests__/format.test.ts                   NEW    formatINR (3) + formatDate (2) + formatDateTime (1) — 6 tests
lib/__tests__/razorpay.test.ts                 NEW    HMAC checkout sig (4) + webhook sig (2) — 6 tests
package.json                                   +3     test / test:watch / test:coverage scripts
```

Total new content + tests + infra: ~2200 lines added across 14 files.

---

## 5. Verification

### Type check
```
npx tsc --noEmit                              ✓ clean
```

### Build
```
npm run build                                 ✓ Compiled successfully
                                              ✓ 559 routes generated
                                              ✓ Mermaid + Shiki absent from /subjects/[slug] initial client manifest
```

### Tests
```
npm test                                      ✓ 3 files / 17 tests pass
                                              ✓ HMAC verifier: tampered payment id rejected, wrong-secret rejected, mutated body rejected
                                              ✓ planMeets: free→pro/career denied, pro→career denied, career→all allowed
                                              ✓ formatINR: ₹299 / ₹2,499 / ₹1,23,456 Indian comma grouping
```

### Smoke (port 3001, prod build)

| # | Check | Result |
|---|-------|--------|
| 1 | Homepage 200 | ✅ |
| 2 | `GET /api/me` unauthed → 401 | ✅ |
| 3 | `POST /api/progress` unauthed → 401 | ✅ |
| 4 | `POST /api/checkout/verify` unauthed → 401 | ✅ |
| 5 | `POST /api/subscription/cancel` unauthed → 401 | ✅ |
| 6 | `POST /api/jobs/match` → proxy 401 (limiter is the next layer) | ✅ |
| 7 | `POST /api/resume/extract` → proxy 401 | ✅ |
| 8 | Razorpay webhook bad sig → 401 | ✅ |
| 9 | Search index `total = 537`; all 5 expected slugs present (`aptitude-quant`, `dbms-complete`, `service-company-cracker`, `lld-design`, `product-company-cracker`) | ✅ |
| 10 | `/u/nobody` → 404 | ✅ |
| 11 | `/login` renders "Welcome back" — no Hinglish chrome | ✅ |
| 12 | Vitest re-run during smoke → 17/17 green | ✅ |

### Bundle delta (per Frontend agent's report)

- `MarkdownRenderer` no longer carries Mermaid (~463 KB raw) or Shiki (~117 KB raw) into the route's initial client manifest.
- Both load lazily only when markdown contains the matching block kind.
- Net: ~580 KB of JS deferred from every subject page's first paint.

### Cache topology (post-PERF-1)

| Cache key | TTL | Tag | Bust events |
|-----------|-----|-----|-------------|
| `user-stats:<userId>` | 30s | per-user | `setSubtopicProgress`, `submission accepted` |
| `sub:<userId>` | 60s | per-user | `activateSubscription`, `markCancelled`, `markCancelAtPeriodEnd` |
| `leaderboard:cohort-<cohortId>` (cycle 2) | 60s | per-cohort + global | `submission accepted`, subject completion |
| `search-index-v2` (cycle 2) | 1800s | global | (manual on publish) |
| `real-jobs:<query>` (existing) | 1h | per-query | (TTL only) |

---

## 6. Voice + brand state

- All UI strings audited remain English (no regressions in cycle 3).
- Hinglish lives only in `content/*.md` — DBMS and Aptitude follow the system-design-basics + lld-design template (English math/code, Hinglish narration).
- Pink/orange purged from non-status surfaces. Violet→cyan is the canonical brand gradient.

---

## 7. Deferred to cycle 4

From the running backlog, sorted by next-cycle priority:

### Engineering / DX
- `MarkdownRenderer` is now RSC, but its parent `SubjectMarkdownReader` is still `"use client"`. Splitting that into RSC shell + small interactive islands (`OnPageToc`, `MarkCompleteButton`, `FeedbackWidget`) unlocks the *full* RSC perf win.
- `force-dynamic` on `/roadmaps`, `/subjects` could become `revalidate: 300` since their content is static catalog data — the user-specific bits move to a Suspense'd client island fed by `/api/me` (already cached).
- CodeMirror 6 mobile editor (the textarea is still painful on phone-sized screens).
- Test coverage expansion: integration tests against a Neon test DB or PG container, especially for the Razorpay webhook flow end-to-end.
- vitest + RSC: add `@testing-library/react` + Playwright for component + e2e tests.

### Content (Layer 0 + Layer 2 from the placement-readiness map)
- **Aptitude — Logical** (puzzles, blood relations, syllogisms, data sufficiency)
- **Aptitude — Verbal** (reading comprehension, sentence correction, para jumbles)
- **Operating Systems** (process/thread, sync, deadlock, memory, FS)
- **Computer Networks** (OSI, TCP/IP, HTTP, DNS, TLS, sockets)
- **Resume + LinkedIn + Behavioural STAR**
- **TCS NQT prep playbook** (separate from aptitude — covers email writing, coding rounds, HR)

### New tracks
- **MERN / Backend Engineer** (Node/Express/Postgres/Redis) roadmap — most-hired track
- **Mobile (Android/Kotlin or Flutter)** roadmap

---

## 8. Counters

| Metric | Cycle 1 end | Cycle 2 end | Cycle 3 end |
|--------|-------------|-------------|-------------|
| Routes built | 557 | 558 | 559 |
| Subjects | 50 | 51 (+lld) | 53 (+dbms +apt) |
| Roadmaps | 5 | 6 (+product) | 7 (+service) |
| Test files | 0 | 0 | 3 |
| Tests passing | n/a | n/a | 17 |
| Indexes on Neon | 4 | 13 | 13 |
| Cached hot paths | 0 | 2 (leaderboard, search-index) | 4 (+ user-stats, + sub) |
| Per-IP-protected endpoints | 0 | 5 | 7 |
| `waitUntil`-deferred call sites | 0 | 0 | 12 |

---

## 9. User verdict

> **Pending — awaiting verification.**

If satisfied: cycle complete. Cycle 4 is teed up to focus on the second wave of placement content (OS / CN / Logical aptitude / Resume) plus splitting the remaining `"use client"` parents and getting test coverage above 30% on `lib/`.
