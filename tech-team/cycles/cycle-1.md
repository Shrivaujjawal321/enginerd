# Cycle 1 — Phase 9 hardening + landing fixes

**Date:** 2026-05-02
**Theme:** "Don't let Phase 9 (Razorpay) embarrass us — close the security gaps and visible UX bugs that shipped with payments."

---

## 1. Audit — what the team found

7 specialists ran in parallel. Top findings condensed:

| # | Specialist | Finding | Priority | File |
|---|-----------|---------|----------|------|
| 1 | Backend & Security | Webhook trusts `notes.userId` / `notes.plan` → free Career plan via $0.01 forged order | **P0** | `app/api/webhooks/razorpay/route.ts:105-108` |
| 2 | Backend & Security | `recordPaymentCaptured` non-idempotent; `activateSubscription` extends from `now()` on every call → period doubles on webhook retry | **P0** | `lib/subscriptions-store.ts:138-155, :62-64` |
| 3 | Backend & Security | `/checkout/verify` no DB status guard (race) + `/checkout/create-order` no rate limit (spam Razorpay API) | **P0** | `app/api/checkout/{verify,create-order}/route.ts` |
| 4 | Backend & Security | `consumeOtp` bypasses `otpVerifyLimiter`; attempt counter increments before bcrypt compare → brute force open over rotations | **P1** | `lib/otp/store.ts:54-93` |
| 5 | Scalability | `/api/jobs/search` no rate limit, calls `aggregateJobs` directly (bypasses 1h cache) → DoS vector + 3rd-party ban | **P0** | `app/api/jobs/search/route.ts` |
| 6 | Designer | `Button size="lg"` uses invalid `h-13` — every "lg" CTA on landing/login collapses to intrinsic height | **P0** | `components/ui/button.tsx:22` |
| 7 | UX Engineer | Razorpay `payment.failed` has no listener → silent failures look like silent successes | **P0** | `components/marketing/upgrade-button.tsx:177-181` |
| 8 | UX Engineer | OTP rate-limit message lies "1 ghante" with no live countdown, no email fallback nudge | **P0** | `components/auth/login-form.tsx:155` |
| 9 | Sustainability + Content | Final-CTA hardcodes `₹499/month`, pricing card says ₹299 → live customer-facing inconsistency | **P0** | `components/marketing/final-cta.tsx:36` |
| 10 | Content | Careers "Apply" toast leaks internal `"Final wiring in Phase 4"` Jira-speak to users | **P0** | `components/dashboard/careers-explorer.tsx:289-292` |
| 11 | Sustainability | Date/INR formatting duplicated in 6+ places → a stale en-IN drift will produce wrong dates one day | P1 | (multiple) |
| 12 | Designer | Billing payment-history table has 5 columns, no `overflow-x-auto` → breaks on mobile right after the user pays | P1 | `app/(dashboard)/billing/page.tsx:137-182` |

### Findings deferred to cycle 2

- **Designer** — Pink/orange legacy gradients still on landing feature cards & sidebar (brand drift)
- **Designer** — 4 visual treatments for "metadata pill" on practice page
- **UX** — Code editor is a raw `<textarea>` (mobile pain, no Tab indent, no autosave)
- **UX** — Code submission has no skeleton during 6-10s Piston cold start
- **UX** — Phone input has no inline `+91` prefix / live formatting
- **Frontend** — `MarkdownRenderer` is `"use client"` and eagerly imports Mermaid + Shiki (bundle bloat on every subject page)
- **Frontend** — Sidebar/topbar fully client-side; could split static parts into RSC
- **Scalability** — Leaderboard recomputes on every `/cohorts` view; missing `submissions.status` partial index
- **Scalability** — `/api/search-index` returns full problem rows (3.5MB egress per cache miss)
- **Scalability** — `/api/submissions` sequential awaits; missing `(userId, status)` index
- **Sustainability** — Zero test coverage on payments / auth / code runner — needs vitest setup
- **Sustainability** — `lib/mock-data/` is the source of truth despite the name (rename or migrate to DB)
- **Sustainability** — `as unknown as` double-casts in `lib/agents/library.ts` and `lib/job-providers.ts`
- **Backend** — `proxy.ts` and `/api/auth/otp/*/send` trust raw `x-forwarded-for` (log poisoning + per-IP-limit bypass)
- **Backend** — No per-IP rate limit on `otpSendLimiter` (per-phone only) → SMS-cost DoS by iterating numbers

---

## 2. Cycle plan — 12 fixes selected

All P0s + 2 high-leverage P1s. Bundled where the diff stays cohesive (e.g. all subscription-store + verify + webhook changes coordinate idempotency together).

| Tag | Subject | Files |
|-----|---------|-------|
| **SEC-1** | Webhook hardening — no `notes` trust, lookup `payments` row by `orderId`, validate `amount` + `currency` | `app/api/webhooks/razorpay/route.ts` |
| **SEC-2** | Subscriptions-store idempotency — `recordPaymentCaptured` conditional on `status='created'` and returns the row; `activateSubscription` only extends from existing `currentPeriodEnd` when `extend: true` | `lib/subscriptions-store.ts` |
| **SEC-3** | Verify endpoint guarded by `recordPaymentCaptured` return value; create-order rate-limited per-user | `app/api/checkout/verify/route.ts` + `create-order/route.ts` |
| **SEC-4** | OTP `consumeOtp` calls `otpVerifyLimiter` first; attempts counted only on wrong-code branch | `lib/otp/store.ts` |
| **SEC-5** | `/api/jobs/search` switches to cached `getRealJobs`, per-IP limit, CDN headers | `app/api/jobs/search/route.ts` |
| **UI-1** | Button `size="lg"` → `h-12` (was invalid `h-13`) | `components/ui/button.tsx` |
| **UX-1** | `rzp.on("payment.failed", …)` toast + retry CTA; soft nudge on dismiss-without-outcome; support email link in verify-failure toast | `components/marketing/upgrade-button.tsx` |
| **UX-2** | OTP rate-limit shows live `mm:ss` countdown + "Email se try kar →" fallback link that flips channel tab | `components/auth/login-form.tsx` |
| **COPY-1** | Final-CTA price + copy switched to Hinglish, price comes from `PLANS.pro.pricePaise` | `components/marketing/final-cta.tsx` |
| **COPY-2** | Careers Apply toast rewritten — no Jira leak | `components/dashboard/careers-explorer.tsx` |
| **SUS-1** | New `lib/format.ts` centralises `formatINR`, `formatDate`, `formatDateTime`, `formatRelative`. Billing page + Pricing card now consume it | `lib/format.ts` (new) + `app/(dashboard)/billing/page.tsx` + `components/marketing/pricing.tsx` |
| **UX-3** | Billing payment-history table wrapped in `overflow-x-auto` + `min-w-[640px]`; empty state upgraded from a placeholder to a real upsell | `app/(dashboard)/billing/page.tsx` |

---

## 3. Diffs — what actually changed

### Security

```
lib/subscriptions-store.ts       +69 -23      idempotent capture, extend-from-period-end
app/api/webhooks/razorpay/       +57 -20      lookup payments row, validate amount, server-trusted user/plan
app/api/checkout/verify/         +21 -3       gate activation on capture-row return
app/api/checkout/create-order/   +20 -1       apiLimiter("checkout:userId") 60/min
lib/otp/store.ts                 +14 -8       otpVerifyLimiter + count-after-compare
app/api/jobs/search/route.ts     +52 -7       cached getRealJobs + per-IP limit + CDN headers
```

### UI/UX

```
components/ui/button.tsx                       1 line: h-13 → h-12
components/marketing/upgrade-button.tsx       +35 -10  payment.failed listener, dismiss nudge, support mailto
components/auth/login-form.tsx                +55 -10  rate-limit countdown + channel-flip fallback
```

### Copy + brand

```
components/marketing/final-cta.tsx            rewrite: dynamic ₹ from PLANS, full Hinglish
components/marketing/pricing.tsx              uses formatINR, intro paragraph dynamic + Hinglish
components/dashboard/careers-explorer.tsx     toast copy rewritten
app/(dashboard)/billing/page.tsx              uses lib/format helpers, table mobile-safe, empty-state upgraded, footer Hinglish
```

### New files

```
lib/format.ts                     formatINR / formatDate / formatDateTime / formatRelative
tech-team/README.md               agentic team system documentation
tech-team/cycles/cycle-1.md       this report
```

---

## 4. Verification

### Type check
```
npx tsc --noEmit
✓ clean
```

### Build
```
npm run build
✓ Compiled successfully in 31s
✓ 557 routes generated (same as before — no route added/removed for cycle 1)
```

### Smoke test (port 3001, prod build)

| # | Endpoint / page | Expected | Got |
|---|----------------|----------|-----|
| 1 | `GET /` | 200 | ✅ 200 |
| 2 | `POST /api/webhooks/razorpay` (bad sig) | 401 | ✅ 401 |
| 3 | `POST /api/webhooks/razorpay` (no sig) | 400 | ✅ 400 |
| 4 | `POST /api/checkout/create-order` (unauthed) | 401 | ✅ 401 |
| 5 | `GET /api/jobs/search` (no `q`) | 400 | ✅ 400 |
| 6 | `GET /api/jobs/search?q=java` | 200 + `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` | ✅ both |
| 7 | `GET /billing` (unauthed) | 307 → `/login?callbackUrl=/billing` | ✅ 307 |
| 8 | Homepage HTML contains ₹299 + ₹2,499, NO ₹499 | true | ✅ confirmed |
| 9 | Final-CTA renders "Pehla lesson abhi shuru karo" instead of "Get started free" | true | ✅ confirmed |
| 10 | `GET /login` | 200 | ✅ 200 |

### Security regression coverage
- Forged `notes.userId/plan` no longer activates: webhook now requires a `payments` row for the `order_id` and validates `amount === amountPaise`. Without a matching server-stored row, activation is skipped.
- Replay protection: `recordPaymentCaptured` conditional update returns `null` on already-captured rows. Both `/checkout/verify` and the webhook bail out without re-extending the period.
- OTP brute force: `otpVerifyLimiter.limit()` runs before bcrypt compare; correct codes do not consume an attempt; wrong codes still tick the per-row counter.
- Job-search abuse: anonymous IP-keyed `apiLimiter` in front of every call; cached aggregator means upstream APIs see ≤1 req/hour/query/region.
- Checkout spam: per-user `apiLimiter("checkout:" + userId)` 60/min before hitting Razorpay.

---

## 5. User verdict

> **Pending — awaiting verification.**

If satisfied: cycle complete; cycle 2 picks the next-tier P1 backlog (deferred list above).
If not satisfied: state what's still broken and a new cycle starts.
