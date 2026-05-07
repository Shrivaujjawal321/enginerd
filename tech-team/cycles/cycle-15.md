# Cycle 15 — Engagement Polish + Final Pre-Launch

**Date:** 2026-05-02
**Theme:** "Continue from where you left off" pill, streak-celebration toasts, reading-bar fade, expanded e2e, comprehensive launch checklist.

---

## 1. Why this cycle

Cycle 14 closed every deferred audit item. Cycle 15 ships the engagement polish that compounds retention + a comprehensive pre-launch operational checklist:

1. **UX-16** — "Continue: <last subject> →" pill on `/home` for returning users
2. **UX-17** — Streak-celebration toasts at 7 / 14 / 30 / 50 / 100 / 200 / 365-day milestones
3. **UX-18** — Reading-progress bar fades in/out (only visible 0.5%-99% scroll)
4. **TEST-7** — 3 new Playwright spec files
5. **DOC-5** — DEPLOY.md final pre-launch operational checklist (Razorpay live, DLT, monitoring, Lighthouse, accessibility, content, marketing)

---

## 2. Cycle plan — 6 items

| Tag | Subject | Outcome |
|-----|---------|---------|
| **UX-16** | "Continue: <subject>" pill on /home | Inline action button, violet, positioned in welcome header |
| **UX-17** | Streak-celebration toast at milestones | `bumpStreak` returns `{streak, milestone}` → propagated through `setSubtopicProgress` → forwarded by `/api/progress` → mark-complete-button toasts when `entry.streakMilestone` is set |
| **UX-18** | Reading-progress bar fade in/out | Hidden when scroll is 0% or 100%; opacity transition 300ms |
| **TEST-7** | 3 new Playwright spec files | home-continue-pill (auth redirect), subject-render (markdown + bar host), end-of-roadmap-cta (chain target-agnostic) |
| **DOC-5** | DEPLOY.md final pre-launch checklist | 30+ ops items across Razorpay, OTP, monitoring, Lighthouse, a11y, content, tests, marketing |
| **CYCLE-15** | Build + smoke + Playwright + this report | Shipped |

---

## 3. Diffs

### Engagement

```
app/(dashboard)/home/page.tsx                 +12   "Continue: <lastSubject.title> →" pill in header
                                                    (rounded-full violet border, hover state)

lib/progress.ts                               +30 -10  bumpStreak now returns {streak, milestone}
                                                       STREAK_MILESTONES = {7, 14, 30, 50, 100, 200, 365}
                                                       setSubtopicProgress propagates milestone in audit + analytics
                                                       ProgressEntry includes streakMilestone?: number | null

components/dashboard/mark-complete-button.tsx +25 -2  reads entry.streakMilestone from /api/progress response
                                                      fires celebration toast with Indian-context copy
                                                      ("🔥 N-day streak! Keep going.")

components/dashboard/reading-progress-bar.tsx +5 -3  visible only when 0.5% < pct < 99%
                                                     opacity transition 300ms
                                                     prevents "always there" feel on barely-scrolled pages
```

### Tests

```
e2e/home-continue-pill.spec.ts          NEW  1 test — /home unauthed → /login redirect
e2e/subject-render.spec.ts              NEW  1 test — subject page renders + reading-bar host
e2e/end-of-roadmap-cta.spec.ts          NEW  1 test — last-in-roadmap subject shows "Open <Next>" CTA
                                                       (chain-target-agnostic match)
```

E2E count: 30 → **33** (+3).

### Docs

```
DEPLOY.md                               +60   Cycle 14-15 highlights + comprehensive final pre-launch
                                              ops checklist:
                                                Razorpay (live keys, KYC, webhook secret rotation)
                                                SMS / Email OTP (DLT, MSG91 + Resend)
                                                Monitoring (Sentry, PostHog, BetterStack)
                                                Performance (Lighthouse LCP/CLS/INP targets)
                                                Accessibility (Tab order, axe-core scan)
                                                Content (24 roadmaps, 85 subjects)
                                                Test sweep (vitest + playwright + tsc + build)
                                                Marketing prep (cross-link to launch.md)
```

Total: ~135 lines added/changed across 6 files.

---

## 4. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ Compiled successfully (559 routes)
```

### Tests
```
npm test                                      ✓ vitest 4 files / 27 tests
npm run e2e                                   ✓ playwright 33/33 tests passing
```

---

## 5. Counters

| Metric | C13 | C14 | **C15** |
|--------|-----|-----|----|
| Vitest tests | 27 | 27 | 27 |
| Playwright e2e | 26 | 30 | **33** |
| Engagement surfaces | end-of-roadmap CTA | + reading bar | **+ continue pill, streak toasts** |
| DEPLOY.md ops items | 28 | 28 | **30+** (Lighthouse, axe, DLT, BetterStack lines added) |
| Subjects / Roadmaps | 85 / 24 | 85 / 24 | 85 / 24 |

---

## 6. Deferred to cycle 16 (or post-launch)

### Engineering depth
- **Multi-step e2e with seeded test user** — full signup → solve → see streak toast → upgrade flow. Needs DB-seeded fixture user.
- **Integration tests vs Neon test DB** — Razorpay webhook end-to-end with real DB writes.
- **Lighthouse CI in GitHub Actions** — enforce LCP < 2.5s + CLS < 0.1 on every PR.
- **axe-core scan in Playwright** — automated WCAG regression in e2e.

### Operational (out-of-code, the user must do these)
- Razorpay live keys + KYC submitted
- DLT registration with TRAI for SMS OTP
- MSG91 + Resend live API keys
- BetterStack uptime monitoring
- Sentry + PostHog dashboards configured (alerts armed)

### Polish (post-launch)
- Streak-celebration confetti on 30+ milestones (currently text-only toast)
- "Continue" pill remembers last 2-3 subjects, not just one
- Reading-progress bar reads from a `useTopicAnchorObserver` so the bar reflects topic-level progress, not raw scroll

---

## 7. User verdict

> **Pending — awaiting verification.**

Cycle 15 closes the in-code launch-readiness work. The platform is now:

- **Engagement-polished** — continue pill on /home, streak toasts at 7 distinct milestones, reading-bar that fades in/out
- **Tested** — 27 unit tests + 33 e2e tests, all green
- **Documented** — DEPLOY.md has 30+ ops items across 7 launch-prep categories
- **Marketing-ready** — cycle 12's `tech-team/marketing/launch.md` (885 lines, 10 channels)

What's left for actual go-live is the operational work that requires accounts, KYC, telecom regulator paperwork, and observability dashboards — items I can't execute in code but have documented every step for.

If the user approves cycle 15, the next cycle should be either: (a) operational assistance (walk-through of each pre-launch checkbox while the user executes), or (b) post-launch iterations (lighthouse-CI, multi-step e2e with seeded user, streak confetti, smarter "continue" pill).
