# Cycle 14 — Deferred Audits Closed (LCP, A11Y, Cache, Engagement)

**Date:** 2026-05-02
**Theme:** Close every deferred audit item from cycle 13. Hero RSC split, topbar keyboard nav, per-user progress cache, reading-progress indicator.

---

## 1. Why this cycle

Cycle 13 deferred 3 audit items because they needed care. Cycle 14 closes them all:

1. **PERF-1** — Hero RSC split (LCP win)
2. **PERF-2** — /roadmaps + /subjects per-user progress cached (TTFB win, simpler than full Suspense restructure)
3. **A11Y-2** — Topbar dropdown keyboard nav (Escape, focus return, arrow keys)

Plus engagement polish:
4. **UX-15** — Reading-progress indicator on long subject pages
5. **TEST-6** — 4 more Playwright tests covering the cycle 13/14 changes

---

## 2. Cycle plan — 6 items

| Tag | Subject | Approach |
|-----|---------|----------|
| **PERF-1** | Hero `"use client"` removed; H1 + subhead now RSC; interactive bits in `<HeroForm>` client island | Dispatched 1 agent |
| **PERF-2** | `getUserProgressMaps` wrapped with `unstable_cache` (30s TTL, per-user tag, busts on `setSubtopicProgress`) | Direct edit |
| **A11Y-2** | Topbar dropdown — Escape closes + returns focus to trigger; ArrowUp/Down/Home/End cycle menuitems; first menuitem auto-focused on open | Direct edit |
| **UX-15** | `<ReadingProgressBar />` client island — fixed-position thin gradient bar, scroll-tracked, rAF-throttled | Direct write |
| **TEST-6** | 4 new Playwright tests across 2 spec files | Direct write |
| **CYCLE-14** | Build + smoke + Playwright + this report | Direct |

---

## 3. Diffs

### PERF-1 — Hero RSC split (agent-shipped)

```
components/marketing/hero.tsx         REWRITTEN  RSC. Renders <section> + H1 + subhead from server HTML.
                                                 No `"use client"`, no `motion`, no React hooks.
components/marketing/hero-form.tsx    NEW        Client island. Owns goal/streaming/streamIndex state,
                                                 placeholder rotation, typewriter, <Logo3D /> lazy import,
                                                 right-column live-stream pane with motion.div.
```

LCP win: H1 + subhead paint from server HTML before any JS evaluates. `motion/react` only loads after submission (post-LCP).

### PERF-2 — getUserProgressMaps cached

```
lib/user-progress-stats.ts            +12 -1   `getUserProgressMaps` wrapped in `unstable_cache`
                                                (30s revalidate, tag `user-progress:${userId}`).
                                                _getUserProgressMapsUncached extracted for the inner Drizzle work.
lib/progress.ts                       +1       `setSubtopicProgress` busts `user-progress:${userId}` tag too.
```

TTFB win on `/roadmaps` + `/subjects`: per-user progress lookup is now cached for 30s. Bust is immediate on subject completion.

### A11Y-2 — Topbar keyboard nav

```
components/dashboard/topbar.tsx       +60     Two refs (triggerRef, menuListRef) + Escape handler that
                                              also returns focus to trigger; arrow-key + Home/End nav
                                              callback; auto-focus first menuitem on open;
                                              focus-visible ring on the trigger.
```

WCAG 2.1.1 + 2.1.2: keyboard users can fully drive the dropdown (open / navigate / dismiss / return).

### UX-15 — Reading-progress bar

```
components/dashboard/reading-progress-bar.tsx       NEW   passive scroll listener, rAF-throttled,
                                                          fixed-top thin gradient bar pinned at z-40.
components/dashboard/subject-markdown-reader.tsx    +5    Imports + renders <ReadingProgressBar /> when
                                                          markdown exists. Wrapped existing render in <>...</>.
```

### Tests

```
e2e/keyboard-a11y.spec.ts             NEW  2 tests — Tab from landing reaches skip-link;
                                                     phone-input → Send OTP enables + focuses.
e2e/roadmap-detail.spec.ts            NEW  2 tests — /roadmaps/service-company-cracker shows
                                                     "Sign in to start" + "Track your progress" CTAs;
                                                     /roadmaps/tcs-nqt-cracker H1 renders.
```

E2E count: 26 → **30** (+4).

Total: ~120 lines added/changed across 8 files.

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
npm run e2e                                   ✓ playwright 30/30 tests passing
```

---

## 5. Counters

| Metric | C12 | C13 | **C14** |
|--------|-----|-----|----|
| Vitest tests | 27 | 27 | 27 |
| Playwright e2e | 22 | 26 | **30** |
| LCP element source | client (hydrate-blocked) | client | **server HTML (RSC)** |
| Per-user progress cached | no | no | **30s TTL, per-user tag** |
| Topbar keyboard nav | partial | partial | **complete** (Escape, arrows, Home/End, focus return) |
| Reading-progress UX | none | none | **fixed-top bar, rAF-throttled** |
| Public-discoverable pages | 6 | 6 | 6 |
| Subjects / Roadmaps | 85 / 24 | 85 / 24 | 85 / 24 |

---

## 6. Deferred to cycle 15 (final pre-launch)

### Engineering
- **Multi-step e2e** — full signup → solve a problem → see streak → upgrade flow. Needs DB seeding for the test user.
- **Integration tests vs Neon test DB** — Razorpay webhook end-to-end with real DB.
- **Sentry / PostHog dashboards configured** — code is wired; alerts + dashboards in their own UIs.
- **Lighthouse run** — confirm the LCP win from PERF-1, document numbers.
- **Accessibility audit re-run** — verify cycle 13 + 14 fixes hold + uncover any new gaps.

### Operational (out of code scope)
- Razorpay live keys + KYC
- DLT registration for SMS
- BetterStack uptime monitoring

### Engagement polish (nice-to-have)
- Reading-progress bar fade-in/out with intersection observer (currently appears immediately on mount)
- "Continue from where you left off" pill on /home if user has an in-progress subject
- Streak-celebration toast at 7-day / 30-day milestones

---

## 7. User verdict

> **Pending — awaiting verification.**

Cycle 14 closed the entire cycle-13 audit deferral list. After this cycle:

- **Hero LCP** is now server-rendered HTML — the brand H1 paints on first byte
- **/roadmaps + /subjects** per-user progress is cached 30s with proper tag-busting
- **Topbar dropdown** has full WCAG-compliant keyboard nav
- **Subject pages** have a thin reading-progress bar pinned to viewport top
- **30 Playwright tests** + 27 Vitest tests, both fully green

Engineering DX is at the cleanest state since cycle 1. Cycle 15 should be the final pre-launch check — Lighthouse run + multi-step user-journey e2e + the ops items the user has to handle (Razorpay live, DLT, BetterStack).
