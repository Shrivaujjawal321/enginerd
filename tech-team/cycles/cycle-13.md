# Cycle 13 — Launch-Readiness (A11Y + Perf + Chain + Docs)

**Date:** 2026-05-02
**Theme:** Polish for launch — accessibility audit fixes, performance audit fixes, per-roadmap follow-up chain, DEPLOY.md closure.

---

## 1. Why this cycle

Cycle 12 closed engineering depth + marketing brief. Cycle 13 is the final pre-launch polish cycle:

1. **Accessibility audit** — top 5 fixes (skip-to-content, aria-current, real `<label>` on hero input, contrast)
2. **Performance audit** — top 3 wins (avatar CLS fix; LCP & revalidate flagged for cycle 14)
3. **Per-roadmap chain map** — end-of-roadmap CTA now suggests a specific next roadmap
4. **More e2e** — login form behaviors + skip-to-content keyboard test
5. **DEPLOY.md cycles 10-13 highlights** — comprehensive launch checklist

---

## 2. Audit — 2 specialist agents in parallel

### A11Y agent (top 5)
1. **A11Y-1 (P1)** — Sidebar nav links missing `aria-current="page"`. Fixed: added on PRIMARY + PLACEMENT_TRACKS + SECONDARY + MobileBottomTabs.
2. **A11Y-2 (P0)** — Topbar dropdown menu has no Escape key, no focus return, no arrow-key nav. **Deferred to cycle 14** — substantial refactor of focus management.
3. **A11Y-3 (P1)** — Hero input "I want to be" prefix is `<span>` (visible name) but `aria-label` differs ("What do you want to become?"). WCAG 2.5.3 violation. Fixed: converted prefix to `<label htmlFor="hero-goal">`.
4. **A11Y-4 (P1)** — Slate-500 body text on `#0a0a0f` measures ~4.0:1 (fails WCAG AA 4.5:1). Fixed: swapped text-slate-500 → text-slate-400 in hero, pricing, sidebar.
5. **A11Y-5 (P0)** — No skip-to-content link, `<main>` has no id. Fixed: added skip link in root layout + `id="main-content"` + `tabIndex={-1}` on dashboard and marketing `<main>`.

### Perf agent (top 3)
1. **PERF-1 (P0)** — Hero is `"use client"`, pushes LCP H1 + motion runtime to client bundle (~250-400ms LCP). **Deferred to cycle 14** — RSC-split refactor needs care.
2. **PERF-2 (P1)** — `/roadmaps` + `/subjects` are `force-dynamic` but catalog half is fully cacheable (~300-600ms TTFB win). **Deferred to cycle 14** — needs Suspense restructure of per-user data.
3. **PERF-3 (P1)** — User avatar `<img>` has no width/height (CLS 0.05-0.1 + unoptimized transfer). Fixed: added `width={32} height={32}` on topbar + `width={80} height={80}` on profile page (`/u/[handle]/page.tsx` already had them).

---

## 3. Cycle plan — 7 items

| Tag | Subject | Outcome |
|-----|---------|---------|
| **A11Y-1** | Audit + apply top 5 fixes | 4/5 applied; A11Y-2 deferred |
| **PERF-5** | Audit + apply top 3 wins | 1/3 applied; PERF-1 + PERF-2 deferred |
| **UX-13** | Per-roadmap follow-up chain map + UI | Shipped — 22-edge chain in `lib/mock-data/roadmaps.ts`, end-of-roadmap CTA picks a specific next roadmap |
| **UX-14** | MobileBottomTabs roadmaps tap-to-expand | Determined adequately covered by cycle-11 featured pills row on `/roadmaps` |
| **DOC-4** | DEPLOY.md cycles 10-13 + launch checklist | Shipped |
| **TEST-5** | 2 more Playwright spec files | Shipped — login-form + skip-content (4 new tests) |
| **CYCLE-13** | Build + smoke + Playwright + this report | Shipped |

---

## 4. Diffs

### A11Y

```
app/layout.tsx                                +10  Skip-to-content <a> with focus styles, before SessionProvider
app/(dashboard)/layout.tsx                    +3   id="main-content" + tabIndex={-1} on <main>
app/(marketing)/layout.tsx                    +3   id="main-content" + tabIndex={-1} on <main>
components/dashboard/sidebar.tsx              +5   aria-current="page" on PRIMARY + PLACEMENT_TRACKS + SECONDARY + MobileBottomTabs; slate-500 → slate-400 on inactive states
components/marketing/hero.tsx                 +5 -2  <label htmlFor="hero-goal"> + slate-500 → slate-400 on supporting text + on "Already a learner" link
components/marketing/pricing.tsx              +2 -2  slate-500 → slate-400 on price period + footer
```

### Performance

```
components/dashboard/topbar.tsx               +6 -1   width/height on avatar <img>; aria-hidden on decorative initial fallback
app/(dashboard)/profile/page.tsx              +2     width/height on avatar <img>
```

### UX — Per-roadmap chain

```
lib/mock-data/types.ts                        +5   nextRoadmapSlug?: string on Roadmap type
lib/mock-data/roadmaps.ts                     +60  NEXT_ROADMAP map (22 edges) + getNextRoadmap helper
app/(dashboard)/subjects/[slug]/page.tsx      +12  findNeighbors returns nextRoadmap when at last subject
components/dashboard/subject-markdown-reader.tsx  +35 -15  nextRoadmap prop; CTA renders specific next-roadmap link OR generic /roadmaps fallback
```

### Docs

```
DEPLOY.md                                     +20  Cycles 10-13 highlights, expanded launch checklist (8 new items)
```

### Tests

```
e2e/login-form.spec.ts                        NEW  2 tests — phone tab +91 prefix, channel switcher
e2e/skip-content.spec.ts                      NEW  2 tests — skip link on Tab, #main-content target
```

E2E count: 22 → **26** (+4).

Total: ~250 lines added / changed across 13 files.

---

## 5. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ Compiled successfully (559 routes)
```

### Tests
```
npm test                                      ✓ vitest 4 files / 27 tests
npm run e2e                                   ✓ playwright 26/26 tests passing
```

---

## 6. Counters

| Metric | C10 | C11 | C12 | **C13** |
|--------|-----|-----|-----|----|
| Subjects / Roadmaps | 85 / 24 | 85 / 24 | 85 / 24 | 85 / 24 |
| Vitest tests | 27 | 27 | 27 | 27 |
| Playwright e2e | 6 | 19 | 22 | **26** |
| WCAG A items | partial | partial | partial | **skip-link + main-id ✓** |
| Roadmap chain edges | 0 | 0 | 0 | **22** |
| Avatar CLS | unfixed | unfixed | unfixed | **fixed (width/height)** |

---

## 7. Deferred to cycle 14

### Engineering (deferred from this cycle's audits)
- **A11Y-2: Topbar dropdown keyboard nav** (P0) — focus management refactor: Escape key, focus return on close, arrow-key menu nav, `tabIndex` on menu items
- **PERF-1: Hero RSC split** (P0) — extract interactive hero piece into a small client island; render H1 + paragraph + form shell as RSC; replace `motion.div` with CSS keyframes; estimated 250-400ms LCP win
- **PERF-2: `/roadmaps` + `/subjects` revalidate** (P1) — switch `force-dynamic` to `revalidate: 300`; wrap per-user `getUserProgressMaps` in Suspense; estimated 300-600ms TTFB win on cache hit

### Operational (out of code scope)
- **Razorpay live keys + KYC** — needs Razorpay account + bank verification
- **DLT registration for SMS OTP** — telecom regulator paperwork (4-7 day turnaround)
- **BetterStack uptime monitoring** — needs account + monitor configuration

### Engineering depth
- Full signup → solve → leaderboard e2e (multi-step user-journey test)
- Integration tests against a Neon test DB (Razorpay webhook end-to-end)
- Sentry / PostHog dashboards configured (alerts armed)
- Reading-progress indicator on subject pages
- Search palette command-K instrumentation + analytics

---

## 8. User verdict

> **Pending — awaiting verification.**

After cycle 13:
- **WCAG A and key WCAG AA items** addressed (skip-link, aria-current, real labels, contrast on key surfaces)
- **22-edge roadmap chain** drives end-to-end learner progression (TCS NQT → Service → Product → MERN → Backend → DevSecOps; Data ladder; Mobile side-grade)
- **26 Playwright e2e tests** cover landing + login form + public catalog + practice + roadmaps + auth redirects + security + profile + skip-content
- **DEPLOY.md** comprehensive launch checklist (50+ items)
- **Bundle size + LCP wins** flagged but deferred — they're the cycle-14 priority along with the operational launch tasks (Razorpay live, DLT, monitoring)

If satisfied, cycle 14 ships the deferred audit items + operational launch tasks (where in-code work is needed). The platform is functionally launch-ready as of this cycle.
