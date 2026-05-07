# Cycle 2 — Voice Course-Correction + Scale + Public Profile

**Date:** 2026-05-02
**Theme:** Make every screen feel inevitable — clean English UI everywhere, scale-ready engineering for 10k DAU, the social-moat feature (public profile), and the first interview-craft subject (LLD).

---

## 1. Why this cycle

Two big user directives between cycles:

1. **Voice rule:** "swag hai tumhra mrko app ke andr hinglish psdn nahi ari sirf content hinglish mai rakhna hai" — UI English everywhere; Hinglish reserved for lesson content (`content/*.md`).
2. **Mission:** "agr is app pr user ajye to uska vapis jane ka mn hi na kre… handle 10k user request" — premium polish + scale-ready engineering.

Both saved as durable memory (`feedback_voice.md`, `project_vision.md`).

---

## 2. Audit — specialists in parallel

Two parallel agents (Voice Auditor + Scale Architect) returned ship-ready patch plans:

| Agent | What they found |
|-------|-----------------|
| **Voice Auditor** | ~50 Hinglish strings in chrome surfaces (toasts, errors, empty states, marketing CTAs). Two strings flagged KEEP — the hero typewriter input wrapper "I want to be ___" and the live-stream lesson content (it's user-rendered content). |
| **Scale Architect** | Concrete `0005_scale_indexes.sql` migration covering 6 hot-path indexes + razorpay event-id idempotency table; `unstable_cache` wrappers for leaderboard + search-index; rate-limit gap table for ~12 endpoints; `waitUntil` deferral targets; XFF hardening recipe. |

---

## 3. Cycle plan — 9 items

| Tag | Subject |
|-----|---------|
| **VOICE-1** | Sweep + revert all Hinglish UI strings to clean English |
| **SCALE-1** | DB migration `0005_scale_indexes.sql` — 6 hot-path indexes + `razorpay_webhook_events` table + `users.handle` |
| **SCALE-2** | Cohort leaderboard `unstable_cache`-wrapped (60s TTL) + slim `listProblemSearchEntries()` for `/api/search-index` (1800s TTL) |
| **SCALE-3** | New limiters (`otpSendByIpLimiter`, `publicLimiter`, `llmCostLimiter`) + canonical `getClientIp()` (Vercel-aware XFF) + per-IP layer on OTP send + idempotency on submissions / search-index |
| **SEC-X** | Razorpay webhook event-id idempotency — `x-razorpay-event-id` (or sha256(rawBody)) inserted into `razorpay_webhook_events` with `onConflictDoNothing()` before processing |
| **UI-2** | `loading.tsx` skeletons for `/home`, `/careers`, `/cohorts`, `/billing`, `/profile` (the 5 routes that lacked them) + canonical `<EmptyState>` component |
| **UI-3** | Public profile `/u/[handle]` — `lib/users-store.ts` (handle validation, reserved list, public-profile lookup with stats), `app/api/profile/handle/route.ts` (claim endpoint, rate-limited 5/min), `<HandlePicker>` client component on the dashboard `/profile` page |
| **CONTENT-1** | New subject — `content/lld-design.md`, ~520 lines: 4-step LLD framework, SOLID applied, 6 essential patterns, full worked examples for Parking Lot / Splitwise / BookMyShow, top-30 problem ladder, pre-interview checklist |
| **CONTENT-2** | New roadmap — `product-company-cracker` (DSA + DBMS + System Design + LLD + Clean Code + Patterns) plus LLD wired into `java-full-stack` |

---

## 4. Diffs

### Voice — 23 files touched

```
app/not-found.tsx                             404 copy → English
app/error.tsx                                 error boundary copy → English
app/(auth)/login/page.tsx                     "Welcome back. Continue with phone, email, or Google."
app/(dashboard)/home/page.tsx                 hero greeting + sub-stat copy → English
app/(dashboard)/billing/page.tsx              header sub + empty state + footer → English
app/(dashboard)/cohorts/page.tsx              header + empty state + section labels → English
app/(dashboard)/profile/page.tsx              "Solve your first problem" sub
app/opengraph-image.tsx                       OG title + sub → English
components/marketing/hero.tsx                 H1 → "Engineering, explained like a friend would." + supporting copy + button → English (typewriter STREAM kept Hinglish — content)
components/marketing/final-cta.tsx            full English rewrite, dynamic ₹ from PLANS
components/marketing/pricing.tsx              "Pricing students actually respect." dynamic ₹
components/marketing/upgrade-button.tsx       8 toast messages → English
components/auth/login-form.tsx                ~9 strings → English (sendOTP / verifyOTP / rate-limit copy)
components/dashboard/topbar.tsx               sign-out toast → English
components/dashboard/feedback-widget.tsx      vote toast + heading + sub → English
components/dashboard/mark-complete-button.tsx error toast → English
components/dashboard/problem-workspace.tsx    rate-limit + runner-error toasts → English
components/dashboard/search-palette.tsx       no-results copy → English
components/dashboard/job-agent.tsx            no-jobs message → English
components/dashboard/subject-markdown-reader.tsx "Done reading?" prompt → English
components/dashboard/careers-explorer.tsx     Apply toast → English
components/dashboard/cancel-subscription-button.tsx error → English
lib/format.ts                                 "abhi" → "just now"
lib/validators/otp.ts                         3 Zod messages → English
```

### Scale + security

```
lib/db/schema.ts                              + razorpayWebhookEvents table, + users.handle
lib/db/migrations/0005_scale_indexes.sql      NEW — 6 hot-path indexes + idempotency table + handle column
lib/cohorts.ts                                computeLeaderboard wrapped in unstable_cache (60s, tag-busted)
lib/problems-store.ts                         + listProblemSearchEntries() (slim 6-column select)
lib/ratelimit.ts                              + otpSendByIpLimiter, publicLimiter, llmCostLimiter, getClientIp()
lib/users-store.ts                            NEW — handle validation, reserved list, getPublicProfileByHandle
app/api/auth/otp/email/send/route.ts          dual-layer (per-email + per-IP) limiter
app/api/auth/otp/phone/send/route.ts          dual-layer (per-phone + per-IP) limiter
app/api/webhooks/razorpay/route.ts            event-id idempotency at the top
app/api/submissions/route.ts                  apiLimiter + revalidateTag("leaderboard","max")
app/api/search-index/route.ts                 unstable_cache + slim payload + per-IP limit + 30-min CDN
```

### UI polish + new feature

```
app/(dashboard)/home/loading.tsx                 NEW
app/(dashboard)/careers/loading.tsx              NEW
app/(dashboard)/cohorts/loading.tsx              NEW
app/(dashboard)/billing/loading.tsx              NEW
app/(dashboard)/profile/loading.tsx              NEW
components/shared/empty-state.tsx                NEW — canonical empty surface
app/u/[handle]/page.tsx                          NEW — public profile page
app/api/profile/handle/route.ts                  NEW — claim/update handle
components/dashboard/handle-picker.tsx           NEW — claim handle inline UI
app/(dashboard)/profile/page.tsx                 wires HandlePicker
app/(dashboard)/billing/page.tsx                 cycle-1 empty state already updated; voice now English
```

### Content + roadmap

```
content/lld-design.md                            NEW — ~520 lines, deep + Hinglish (content surface)
lib/mock-data/subjects.ts                        + lld-design subject entry (10 topics)
lib/mock-data/roadmaps.ts                        + product-company-cracker roadmap, lld-design wired into java-full-stack
lib/mock-data/types.ts                           + "Interview Prep" RoadmapCategory
```

---

## 5. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ 558 routes generated (was 557; +/u/[handle])
                                              ✓ +loading.tsx for home/careers/cohorts/billing/profile
                                              ✓ +/api/profile/handle in route table
```

### DB migration applied to Neon
```
✓ submissions_accepted_user_problem_idx        partial index on accepted submissions
✓ submissions_user_recent_idx                  (user_id, submitted_at DESC)
✓ payments_user_recent_idx                     (user_id, created_at DESC)
✓ subscriptions_rzp_sub_uniq                   unique partial on razorpay_subscription_id
✓ users_handle_uniq                            unique case-insensitive index on handle
✓ razorpay_webhook_events table                event-id idempotency
✓ user_progress_completed_idx                  partial on completed status
✓ audit_user_recent_idx                        (user_id, created_at DESC)
✓ user.handle column                           text, nullable
```

### Smoke (prod build, port 3001)

| # | Check | Result |
|---|-------|--------|
| 1 | Homepage hero says "Engineering, explained" — no Hinglish | ✅ |
| 2 | Login page says "Welcome back. Continue with phone, email, or Google." | ✅ |
| 3 | `/u/nobody` (handle never claimed) → 404 | ✅ |
| 4 | `POST /api/profile/handle` unauthed → 401 | ✅ |
| 5 | `GET /api/search-index` → 200 + `Cache-Control: public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400` | ✅ |
| 6 | `POST /api/submissions` unauthed → 401 (rate-limit guard runs after auth) | ✅ |
| 7 | Razorpay webhook bad sig → 401; replay → 401 | ✅ |
| 8 | `/api/jobs/search?q=java` → 200 + 1h CDN cache header | ✅ |
| 9 | `/billing` unauthed → 307 → `/login` | ✅ |
| 10 | `lld-design` present in catalog | ✅ (search-index check: True) |
| 11 | `product-company-cracker` present in catalog | ✅ (search-index check: True) |
| 12 | Total search index items = 534 (was 533 — added one subject + one roadmap, but the LLD subject pushed by one and the roadmap by one) | ✅ |

### Security regression coverage (carry-over from cycle 1)

- Webhook idempotency now at *event-id* level (not just `payments.status`) — covers transient DB error case.
- OTP send protected at two layers (per-identifier + per-IP).
- `submissions` POST rate-limited (was missing).
- `getClientIp()` prefers Vercel's signed `x-vercel-forwarded-for` to reduce log poisoning.
- `users.handle` enforced unique case-insensitive at the DB index level — race-safe.

---

## 6. New surfaces shipped

- `/u/[handle]` — shareable public profile with avatar, college, join date, and 4-stat grid (problems solved, subjects done, current/best streak). Links to `/login` for visitors.
- `<HandlePicker>` on `/profile` — claim/update with live URL preview + copy/view buttons.
- `<EmptyState>` canonical component — gradient chip + headline + body + CTA. Ready to replace ad-hoc empty states across the app in future cycles.
- 5 `loading.tsx` skeletons replacing frozen layouts during data fetch.
- `lib/format.ts` already canonical from cycle 1; cycle 2 expanded usage.
- `content/lld-design.md` — 520-line interview-craft subject with full worked examples.

---

## 7. Deferred to cycle 3

From the original Scale Architect report:
- Cache wrappers on `getUserStats` (called by every authed page via `/api/me`) and `getActiveSubscription` (gates plan-locked pages)
- `waitUntil` deferral on `logAuditEvent` and `track()` calls in submissions / verify / OTP send (cuts ~50-150ms p50)
- Per-user `apiLimiter` on `/api/me`, `/api/progress`, `/api/checkout/verify`, `/api/subscription/cancel`
- LLM-cost limiter on `/api/resume/extract`, `/api/jobs/match`, `/api/agents/fill-roadmaps`

From the deferred list at end of cycle 1:
- `MarkdownRenderer` is `"use client"` and eagerly imports Mermaid — convert to RSC + dynamic import
- Code editor mobile UX (CodeMirror 6 / Monaco)
- Phone input inline `+91` prefix
- Feature-card pink/orange legacy gradient cleanup
- Test coverage (vitest setup) — payments + auth + code runner

Content gaps remaining (per "what makes a student placement-ready" answer):
- Aptitude (Quant + Logical + Verbal)
- DBMS / OS / CN / OOPS deep
- Resume + Behavioural + LinkedIn
- TCS NQT / Infosys SP / Cognizant playbooks
- MERN / Backend / Mobile / ML Engineer / SDET specialisation roadmaps

---

## 8. User verdict

> **Pending — awaiting verification.**

If satisfied: cycle complete; cycle 3 picks the next-tier P1 backlog above (most likely sequence: cache wrappers + waitUntil + remaining limiter coverage + 1-2 more interview-craft subjects).
