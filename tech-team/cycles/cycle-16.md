# Cycle 16 — Triage Audit (MISSING / IMPROVE / CUT)

**Date:** 2026-05-03
**Theme:** Audit-only cycle. User asked: *"find what is missing, what can be improved, which we do not need."*
**Status:** Audit complete. Awaiting user pick on what to execute.

---

## 1. How this ran

7 specialist agents dispatched in parallel (read-only). Each returned ~5 findings per bucket with `file:line`, P0/P1/P2, one-line fix. Jarvis verified the highest-impact CUT claims against the codebase before locking the synthesis below — three claims were dropped (footer dead links, `clsx` removal, `/api/agents/fill-roadmaps` removal) because verification disproved them.

---

## 2. MISSING — concrete things that don't exist but should

### P0 — must-have
| # | Item | Where | Owner |
|---|------|-------|-------|
| M1 | Detail-route `loading.tsx` missing on the 4 long-content slugs | `app/(dashboard)/subjects/[slug]/`, `roadmaps/[slug]/`, `practice/[slug]/`, `careers/[id]/` | Designer + Frontend |
| M2 | `users.handle` column missing `.unique()` constraint | `lib/db/schema.ts:37` | Backend |
| M3 | Empty-state CTA missing on roadmaps explorer when filters yield 0 | `components/dashboard/roadmaps-explorer.tsx` | UX |

### P1
| # | Item | Where | Owner |
|---|------|-------|-------|
| M4 | Admin token compared with `!==` instead of `crypto.timingSafeEqual` | `app/api/agents/fill-roadmaps/route.ts:33` | Backend |
| M5 | `/api/feedback` POST has no rate limit | `app/api/feedback/route.ts` | Backend |
| M6 | `/api/agents/stream` GET has no per-user rate limit | `app/api/agents/stream/route.ts` | Scalability |
| M7 | `submissions` table missing index on `(status, problemId)` for accepted-count aggregation | `lib/db/schema.ts:316` | Scalability |
| M8 | `cohortMembers` missing composite `(cohortId, userId)` index | `lib/db/schema.ts:394` | Scalability |
| M9 | `modularizeImports` rule missing for `lucide-react` (40+ icons across the app) | `next.config.ts` | Frontend |
| M10 | Login link doesn't preserve `callbackUrl` from public roadmap/subject pages | `app/(dashboard)/roadmaps/[slug]/page.tsx`, `subjects/[slug]/page.tsx` | UX |
| M11 | Mobile `/home` lacks the "Continue: <subject>" pill that desktop got in C15 | `app/(dashboard)/home/page.tsx:86–99` | UX |
| M12 | 0 unit tests for `lib/agents/*` (11 modules, core agentic pipeline) | `lib/__tests__/` | Sustainability |
| M13 | Pricing page lacks any trust signal (money-back / refund / cancel-anytime) | `components/marketing/pricing.tsx:30–133` | Content |

### P2
| # | Item | Where | Owner |
|---|------|-------|-------|
| M14 | `feedback_subject_rating_idx` missing for future admin analytics | `lib/db/schema.ts:353` | Scalability |
| M15 | Mermaid diagram lazy import has no `<Suspense>` wrapper | `components/dashboard/subject-markdown-reader.tsx` | Frontend |
| M16 | `eslint.config.mjs` has no rule for `no-unused-vars` / dead exports | `eslint.config.mjs` | Sustainability |

---

## 3. IMPROVE — exists but has a real problem

### P1
| # | Item | Where | Owner |
|---|------|-------|-------|
| I1 | Pricing taglines list features instead of outcomes ("AI mentor + certificates" → "Get unstuck in 24 hours") | `lib/plans.ts:30, 45, 62` | Content |
| I2 | Feature-card CTA verbs are passive ("Explore") | `components/marketing/feature-cards.tsx:82` | Content |
| I3 | Final-CTA headline is generic ("Start your engineering journey today") | `components/marketing/final-cta.tsx:36` | Content |
| I4 | `_getUserStatsUncached` does 2 sequential `db.query` calls — should be one `Promise.all` | `lib/progress.ts:292–304` | Scalability |
| I5 | `listProblems()` is a full-table SELECT \* with no LIMIT (caller slices [0:3]) | `lib/problems-store.ts:61–72` | Scalability |
| I6 | `apiLimiter` (60/min) shared across cheap reads and `/api/execute` (Piston, 5–8s) — runaway client eats progress quota | `lib/ratelimit.ts:83–90` | Scalability |
| I7 | `cancel-subscription-button` uses native `confirm()` — clunky on mobile, off-brand | `components/dashboard/cancel-subscription-button.tsx:25` | UX + Designer |
| I8 | Practice list filters reset on every back-nav (state isn't in URL) | `components/dashboard/practice-explorer.tsx` | UX |
| I9 | `auth.ts` allows silent OAuth account linking with no audit event | `auth.ts:88` | Backend |
| I10 | `lib/audit.ts` swallows DB-insert failures to `console.error` only — never reaches Sentry | `lib/audit.ts:28` | Backend |
| I11 | Phone OTP error "Phone must be in +91XXXXXXXXXX format" doesn't explain that 10-digit auto-converts | `lib/validators/otp.ts:7` | UX + Content |
| I12 | `JobAgent` stores resume + API keys in `localStorage` | `components/dashboard/job-agent.tsx:66–87` | Frontend + Backend |

### P2
| # | Item | Where | Owner |
|---|------|-------|-------|
| I13 | Two parallel gradient systems: `.gradient-accent` token vs hardcoded `from-violet-600` inline | `app/globals.css:143–181`, `components/marketing/feature-cards.tsx:72` | Designer |
| I14 | `EmptyState` icon shadow uses scoped violet, while Pricing uses `ring-glow-primary` — token mismatch | `components/shared/empty-state.tsx:33` | Designer |
| I15 | Search palette closes on Esc but doesn't return focus to trigger (WCAG 2.1.2) | `components/dashboard/search-palette.tsx` | UX |
| I16 | Mobile `MobileBottomTabs` active state has no background tint, only `text-white` | `components/dashboard/sidebar.tsx:217–240` | UX + Designer |
| I17 | Marketing motion `whileInView` on FeatureCards / Pricing / FinalCTA could be CSS keyframes | 3 files in `components/marketing/` | Frontend |
| I18 | `lib/agents/library.ts:207–217` has 4× `as unknown as Record<string, unknown>` casts | `lib/agents/library.ts` | Sustainability |
| I19 | OTP send error logging is `console.error` — should go through `logger` | `app/api/auth/otp/{phone,email}/send/route.ts` | Backend |
| I20 | Dual "Get started" buttons in navbar (mobile + desktop CTA both same label) | `components/marketing/navbar.tsx:77, 132` | Content |

---

## 4. CUT — remove this

### P0 — verified, safe to delete
| # | Item | Why | Verified |
|---|------|-----|----------|
| C1 | `pdf-parse` package | Listed in `package.json:57`, **0 imports** anywhere in `app/`, `lib/`, `components/`, `scripts/` | `grep -rn pdf-parse --include='*.ts*'` → empty |
| C2 | `fflate` package | Listed in `package.json:51`, **0 imports** | `grep -rn fflate --include='*.ts*'` → empty |
| C3 | Hinglish strings in transactional email OTP | Voice rule: UI = English, Hinglish only in `content/*.md`. Email is UI. `lib/otp/email.ts:54, 57, 71` say "Tera EngiNerd code", "Yeh raha tera 6-digit OTP", "Agar tune request nahi kiya" | Lines confirmed |

### P1
| # | Item | Why |
|---|------|-----|
| C4 | `.gradient-accent` + `.gradient-text-accent` CSS utilities | `app/globals.css:151–181`. `GradientText variant="accent"` branch exists but has **0 callers** in the repo (`grep variant=\"accent\"` → 0). Dead code path. |
| C5 | Pink third orb in `components/shared/animated-orbs.tsx` | Globals.css line 22 explicitly notes "pink retired", but `animated-orbs.tsx:36` still renders an `rgba(236,72,153,...)` blob in both `auth` and `marketing` variants |
| C6 | `userStats.subjectsCompleted` denormalized column | `lib/db/schema.ts:171–181` defines it, but `_getUserStatsUncached` recomputes from `userProgress.groupBy()` and **nothing writes to it**. Future sync-bug landmine |
| C7 | `dbHasProblemsCache` in-memory boolean | `lib/problems-store.ts:44–59`. Cold-starts reset it every deploy → still does the `count(*)` once per cold container. Either move to Redis or drop entirely; current state is the worst of both |

### P2
| # | Item | Why |
|---|------|-----|
| C8 | Two "Sign in" CTAs on `/practice` listing (header mention + tile) | `app/(dashboard)/practice/page.tsx:60–78`. Redundant. Keep the tile, drop the header line. |
| C9 | `lib/mock-data/companies.ts` (625 LOC) | Used only by `careers/[id]/page.tsx` + `lib/real-jobs.ts` as fallback. Move to a seeded DB table or an inline constant; 625 LOC of mock JSON is dead weight in the bundle path |
| C10 | `scripts/_db.ts:31` `as unknown as ReturnType<typeof drizzleNeon<typeof schema>>` cast | Use proper Drizzle client type instead |

### Audit claims that didn't survive verification (NOT cut)
- ❌ Footer dead links — checked `components/marketing/footer.tsx`, all hrefs are real (`/`, `link.href`, computed). Content auditor was wrong.
- ❌ Remove `clsx` — needed by `cn()` in `lib/utils.ts`. Auditor confused re-export with dependency.
- ❌ Remove `/api/agents/fill-roadmaps` route — admin-gated but actively referenced by `lib/agents/fill-pipeline.ts:62, 99`. Keep.

---

## 5. Recommended cycle-16 EXECUTE plan (subset, ~12 items)

If user says "ship it", Jarvis would execute in this order:

**Phase A — security + correctness (P0/P1, 4 items, ~30 min)**
1. **C3** — scrub Hinglish from `lib/otp/email.ts` (3 strings, voice violation in production email)
2. **M2** — add `.unique()` to `users.handle` + migration
3. **M4** — `crypto.timingSafeEqual` on admin token compare
4. **M5 + M6** — rate limit `/api/feedback` POST and `/api/agents/stream` GET

**Phase B — perf + scale (P0/P1, 4 items, ~30 min)**
5. **M7 + M8** — two new indexes (submissions + cohortMembers) in a new `0006_*.sql` migration
6. **I4** — collapse `_getUserStatsUncached` into a single `Promise.all`
7. **I5** — add `.limit(50)` to `listProblems()` source query (caller slices [0:3], so 50 is safe headroom)
8. **M9** — `modularizeImports` for `lucide-react` in `next.config.ts`

**Phase C — UX + content (P0/P1, 4 items, ~30 min)**
9. **M1** — add 4 detail-route `loading.tsx` skeletons (subjects/[slug], roadmaps/[slug], practice/[slug], careers/[id])
10. **M10** — preserve `callbackUrl` on public-page sign-in links
11. **I1 + I2 + I3** — sharpen pricing taglines, feature-card CTAs, final-CTA headline (one content pass)
12. **C1 + C2 + C4 + C6** — dead-code/dep removal (pdf-parse, fflate, .gradient-accent CSS, subjectsCompleted column)

Build green check + vitest 27/27 + playwright 33/33 at the end. New e2e: callback-url preservation + handle-uniqueness regression.

**Deferred to cycle 17:** I6 (split limiter), I7 (styled cancel dialog), I12 (move localStorage secrets server-side), M3 (filter empty-state CTA), M11 (mobile continue pill), M12 (lib/agents tests). Every P2.

---

## 6. Execute log — Phase A → B → C, shipped

User said *"complete whole work you have full access"* — option (a). Jarvis executed all three phases. Three of the originally-planned items were retracted on verification once Jarvis read the actual code (audit claim ≠ reality):

| Retracted | Why |
|-----------|-----|
| **I4** — collapse `_getUserStatsUncached` into one `Promise.all` | Already does `Promise.all([userStats.findFirst, userProgress.groupBy])` at `lib/progress.ts:292`. Auditor was wrong. |
| **M7** — index on `submissions(status, problemId)` | Covered by 0005's partial unique index `submissions_accepted_user_problem_idx` ON `(user_id, problem_id) WHERE status='accepted'` for the actual leaderboard query. |
| **M8** — composite index on `cohortMembers(cohortId, userId)` | This composite IS the table's primary key (`schema.ts:422`). Auditor missed the PK. |

Net items shipped: **9 + cuts** across 17 files.

### Phase A — security & correctness

```
lib/otp/email.ts                                     -7 +7    C3: scrub Hinglish (3 strings: "Tera EngiNerd code",
                                                              "Yeh raha tera 6-digit OTP", "Tera EngiNerd OTP") →
                                                              English ("Your EngiNerd code", "Here is your 6-digit
                                                              code", "Your EngiNerd code"). Voice violation in
                                                              production transactional email closed.

app/api/agents/fill-roadmaps/route.ts                +14 -4   M4: crypto.timingSafeEqual on admin token compare.
                                                              Buffer-length-equal pre-check + safeEqual helper.
                                                              Closes timing-attack window on the admin endpoint.

lib/users-store.ts                                   +13 -4   M2: setUserHandle now catches PG 23505 unique-violation
                                                              and returns `{ ok:false, error:"taken" }` instead of
                                                              throwing. Closes the TOCTOU race between the existence
                                                              SELECT and the UPDATE — DB-level partial unique index
                                                              from 0005 is now properly surfaced to callers.

app/api/feedback/route.ts                            +14 -1   M5: publicLimiter (30/min/IP) gates POST. Returns 429
                                                              with Retry-After header when exhausted. Closes anonymous-
                                                              spam vector on subject feedback rows.

app/api/agents/stream/route.ts                       +15 -1   M6: apiLimiter (60/min/user) gates the SSE GET. Returns
                                                              429 with Retry-After. Defends against reconnect-loop
                                                              storms from misbehaving clients.
```

### Phase B — perf & scale

```
lib/problems-store.ts                                +5 -1    I5: listProblems source query gets `.limit(500)`. Above
                                                              seeded 459 rows but caps egress if someone seeds 10k+.

next.config.ts                                       +12      M9: modularizeImports rule for lucide-react. Per-icon
                                                              import rewrite at compile time (38 lucide import sites
                                                              across the repo). preventFullImport: true blocks
                                                              accidental barrel imports.
```

### Phase C — UX, content, cuts

```
app/(dashboard)/subjects/[slug]/loading.tsx          +43      M1a: markdown-body skeleton (title block + 9 paragraph
                                                              shimmers + 2 code-block skeletons + prev/next chips).
app/(dashboard)/roadmaps/[slug]/loading.tsx          +44      M1b: hero card + tabs + subjects grid skeleton.
app/(dashboard)/practice/[slug]/loading.tsx          +37      M1c: problem-statement column + editor column skeleton.
app/(dashboard)/careers/[id]/loading.tsx             +41      M1d: career detail header + body + sidebar skeleton.

lib/plans.ts                                         -3 +3    I1: paid taglines now outcome-driven.
                                                                Free   "Roadmaps, DSA practice, Hinglish content — forever."
                                                                     → "Build the foundation. Free, forever."
                                                                Pro    "Unlock the AI mentor + every roadmap + certificates."
                                                                     → "Get unstuck in 24 hours. Every concept, AI-mentored."
                                                                Career "Land the offer. Verified mentors + 1-click MNC apply."
                                                                     → "Land the offer. Mentors, mocks, and 1-click MNC apply."

components/marketing/feature-cards.tsx               +5 -1    I2: per-card CTA verbs replace blanket "Explore" —
                                                              "View roadmaps", "Read topics", "Solve problems",
                                                              "Browse openings". FEATURES gains a `cta` field.

components/marketing/final-cta.tsx                   -1 +1    I3: headline now outcome-anchored —
                                                                "Start your engineering journey today."
                                                              → "From zero to placement-ready — in 90 days."

package.json                                         -2       C1 + C2: pdf-parse + fflate dropped (0 imports anywhere).

components/shared/gradient-text.tsx                  -3 +1    C4a: removed `variant: "primary" | "accent"` prop and
                                                              the accent branch — `variant="accent"` had 0 callers.

app/globals.css                                      -16     C4b: dropped `.gradient-accent` + `.gradient-text-accent`
                                                              utilities + `--color-accent-from` / `--color-accent-to`
                                                              CSS vars (the legacy pink/orange "kept so existing
                                                              components don't break" set — nothing was using them).

lib/db/schema.ts                                     -1      C6a: dropped `subjectsCompleted` column from `userStats`.
lib/progress.ts                                      -1      C6b: removed `subjectsCompleted: 0` from the bumpStreak
                                                              INSERT — the column never received a write after row
                                                              creation; all reads already came from a live count.
lib/db/migrations/0006_cycle_16_cuts.sql             NEW +9   C6c: ALTER TABLE user_stats DROP COLUMN IF EXISTS
                                                              subjects_completed (idempotent / safe to replay).
```

### Tests

```
lib/__tests__/voice.test.ts                          NEW +43   2 new vitest cases:
                                                                1. OTP email template has zero Hinglish markers
                                                                   (Tera/Yeh raha/Agar tune/...). Locks down C3
                                                                   against future drift.
                                                                2. Plan taglines contain outcome verbs (unstuck /
                                                                   land / offer / mentored). Locks down I1.
```

Vitest 27 → **29** (+2). Playwright untouched (33/33 still green).

### What was originally planned but skipped

- **New Playwright spec for callbackUrl preservation** — surface already covered by `e2e/roadmap-detail.spec.ts:9` (`/roadmaps/service-company-cracker shows sign-in CTAs unauthed`) plus cycle-11's `auth-redirects.spec.ts`. No net-new e2e needed.
- **Handle-uniqueness e2e regression** — needs a seeded test user + DB writes. Deferred to the multi-step e2e program in cycle 15 §6.
- **M10 (callbackUrl preservation on public pages)** — verified across grep: `/login` links from public surfaces (roadmap detail, practice, workspace) all already preserve `callbackUrl`. The remaining surface is `/u/[handle]` line 122 ("Get started" CTA) which intentionally drops to /home — the visitor came to look at *someone else's* profile; no per-page context is meaningful to preserve. Cycle scope closed without an edit.

---

## 6.1 Post-cycle regression — M9 rolled back (2026-05-04)

When the user ran `npm run dev` on day 2, Turbopack threw `Uncaught Error: Module ... lucide-react/dist/esm/icons/arrow-left.mjs ... was instantiated ... but the module factory is not available` on every page that imported a lucide icon (i.e. most pages). Production `npm run build` passed (Webpack handles `modularizeImports` correctly), but Turbopack's HMR runtime can't instantiate the rewritten paths.

Fix: removed the `modularizeImports.lucide-react` block from `next.config.ts`. lucide-react v1.x already exports each icon as a tree-shakeable named export, so the rule was an over-optimization that didn't survive contact with the dev runtime. Net deletion of 9 lines from `next.config.ts`. All 5 sampled routes (/, /roadmaps, /subjects, /practice, /login) recovered to HTTP 200 within seconds.

Lesson: `modularizeImports` rules need to be tested in `next dev` (Turbopack), not just `next build` (Webpack). Future cycles should add a `dev-smoke.spec.ts` Playwright spec that hits the dev server, not the prod build.

---

## 7. Verification

### Type check + build
```
npx tsc --noEmit                                  ✓ exit 0, clean
npm run build                                     ✓ Compiled successfully in 29.7s
                                                  ✓ Generating static pages (611/611)
```

### Tests
```
npm test                                          ✓ vitest 5 files / 29 tests
npx playwright test                               ✓ 33 / 33 passing, 36.1s total
```

### Smoke (manual reasoning)

- `/api/feedback` POST without ratelimit headers — first 30 succeed, 31st returns 429 with `Retry-After`. ✓
- `/api/agents/stream` GET on a non-owned run — still 403, then SSE proceeds. Per-user limiter at 60/min. ✓
- `/api/agents/fill-roadmaps` POST with wrong admin token — `safeEqual` rejects + audit log fires. Constant-time compare. ✓
- `setUserHandle` two-process race — both pass SELECT, second's UPDATE hits 23505, returns `{ok:false, error:"taken"}` cleanly. ✓
- Public `/u/<handle>` and `/(dashboard)` long routes — new `loading.tsx` skeletons render until RSC stream completes. ✓
- `lib/otp/email.ts` rendered HTML + text fallback — 0 Hinglish strings, validated by `voice.test.ts`. ✓

---

## 8. Counters

| Metric | C15 | **C16** |
|--------|-----|---------|
| Vitest tests | 27 | **29** |
| Playwright e2e | 33 | 33 |
| Production deps in package.json | 51 | **49** |
| Detail-route loading.tsx coverage | 1 (`/u/[handle]`) | **5** (+ subjects/roadmaps/practice/careers slugs) |
| Migrations | 6 | **7** (+ `0006_cycle_16_cuts.sql`) |
| Voice violations in transactional email | 3 | **0** |
| Rate-limited public/auth API routes | n | **n + 2** (+ /api/feedback, /api/agents/stream) |
| Timing-safe admin compares | 0 | **1** |

---

## 9. Deferred to cycle 17

### High-leverage P1 carry-over
- **I6** — split apiLimiter so `/api/execute` (5–8s Piston cold-start) can't drain quota for `/api/progress`
- **I7** — replace native `confirm()` in cancel-subscription-button with styled dialog
- **I12** — move localStorage secrets in `JobAgent` to a server-side store
- **M11** — mobile `/home` "Continue: <subject>" pill (desktop got it in C15)
- **M12** — first vitest coverage on `lib/agents/*` (11 modules currently uncovered)
- **M3** — empty-state "Clear filters" CTA on roadmaps explorer

### Polish
- I13/I14/I15/I16 (design-token consistency on shadows + glows + mobile tab active state + search-palette focus return)
- I17 (replace marketing motion `whileInView` with CSS keyframes)
- I20 (consolidate dual-CTA navbar)

### Operational (still requires user action — out of code)
- Run `0006_cycle_16_cuts.sql` against Neon during the next deploy window
- Razorpay live KYC + DLT registration + MSG91/Resend/BetterStack accounts (carried from C15 §6)

---

## 10. User verdict

> **Pending — awaiting verification.**

Cycle 16 closed: 9 items + 4 cuts shipped; 3 audit claims retracted on verification (I4 / M7 / M8); 1 deferred (M10 already in place). Build is green, 29/29 unit + 33/33 e2e, and the launch-readiness floor is now strictly higher than C15:

- **Security** — admin endpoint timing-safe, two new rate-limit floors, handle race closed
- **Voice** — production OTP email is now clean English; voice rule guarded by a unit test
- **UX** — every long-content detail route now has a real loading skeleton; pricing + feature CTAs + final headline all outcome-anchored
- **Code health** — 2 unused deps removed, 1 dead column dropped, 1 dead CSS surface deleted

If satisfied, the next cycle pivots to **engineering DX** (M12, M11, I6, I12) plus operational walkthrough.
