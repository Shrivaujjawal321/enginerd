# Cycle 11 — Engineering DX Pivot

**Date:** 2026-05-02
**Theme:** Content is at 100%; cycle 11 pivots to engineering DX. CodeMirror 6 editor, public practice previews, more Playwright e2e, mobile placement-tracks discoverability.

---

## 1. Why this cycle

Cycle 10 closed placement-readiness content at 100% (51/51). This cycle attacks the engineering DX backlog that piled up during the content sprint:

1. **CodeMirror 6 mobile editor** — the textarea was painful on phones; tier-2/3 users are 70%+ mobile.
2. **Public `/practice/[slug]` previews** — opens the catalog's third surface to unauthed signup-conversion (after `/roadmaps` + `/subjects` in cycle 8).
3. **More Playwright e2e** — 6 → 19 tests covering auth redirects + profile not-found + Razorpay webhook + cache headers.
4. **Mobile placement-tracks discoverability** — the desktop sidebar's PLACEMENT_TRACKS shortcut is invisible on mobile; mirror it as a featured-tracks scroller on `/roadmaps`.

---

## 2. Cycle plan — 6 items

| Tag | Subject | Approach |
|-----|---------|----------|
| **ENG-2** | CodeMirror 6 editor for problem-workspace | Dispatched 1 agent (substantial integration) |
| **UX-8** | `/practice` and `/practice/[slug]` public for unauthed visitors | Direct edit |
| **UX-9** | Subject "next subject" CTA verified | Already in place from cycle 4 |
| **UX-10** | Featured tracks row on `/roadmaps` for mobile discoverability | Direct edit |
| **TEST-3** | 3 more Playwright e2e files (auth-redirects, profile, security) | Direct write |
| **CYCLE-11** | Build + smoke + Playwright run + this report | Direct |

---

## 3. Diffs

### Engineering — CodeMirror 6 (agent-shipped)

```
package.json                                   +12   @codemirror/* deps (state/view/commands/language + 6 lang packs + theme + core)
components/dashboard/code-editor.tsx           NEW   CodeMirror 6 wrapper with multi-language + oneDark + line numbers + tab handling
components/dashboard/problem-workspace.tsx     -10 +25  Replace <textarea> with <CodeEditor>, add toEditorLanguage helper
```

Bundle impact: all 6 language packs ship synchronously in the practice route's client chunk (~80-120KB gz combined). Lazy-loading per language is a follow-up.

### Engineering — Public practice previews

```
proxy.ts                                       -1   /practice removed from PROTECTED_PREFIXES
app/(dashboard)/practice/[slug]/page.tsx       +1   passes isAuthed prop to ProblemWorkspace
components/dashboard/problem-workspace.tsx     +30 -10  isAuthed prop gates Run/Submit buttons; unauthed users see "Sign in to run" CTA with callbackUrl
```

### UX — Mobile featured tracks

```
app/(dashboard)/roadmaps/page.tsx              +35 -5  FEATURED constant + horizontally-scrollable pills row above the full grid
                                                       Header copy updated to reflect 24+ roadmaps
```

### Tests

```
e2e/auth-redirects.spec.ts                     NEW   6 tests — 5 protected paths redirect to /login + login renders
e2e/profile.spec.ts                            NEW   2 tests — /u/<unknown> + /u/<reserved> render not-found UI
e2e/security.spec.ts                           NEW   5 tests — webhook bad sig / missing sig / checkout unauthed / /api/me unauthed / jobs CDN headers
```

E2E test count: 6 → **19** (+13).

---

## 4. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ Compiled successfully
```

### Tests
```
npm test                                      ✓ vitest 4 files / 27 tests
npm run e2e                                   ✓ playwright 19/19 tests passing
                                                — landing renders
                                                — login link
                                                — /roadmaps + /subjects public
                                                — /api/search-index 500+ entries + cache headers
                                                — auth redirects (5 paths)
                                                — login heading
                                                — /u/<unknown> + /u/<reserved> not-found
                                                — webhook bad/missing sig
                                                — checkout unauthed
                                                — /api/me unauthed
                                                — /api/jobs/search CDN headers
```

### Smoke (port 3001, prod build)

| # | Check | Result |
|---|-------|--------|
| 1 | `/practice` unauthed → 200 (now public) | ✅ |
| 2 | `/practice/two-sum` unauthed → 200 | ✅ |
| 3 | Vitest 27/27 green | ✅ |
| 4 | Playwright 19/19 green | ✅ |

---

## 5. Layer 0–4 progress vs cycle-10 end

Content coverage stayed at 51/51 (100%) — cycle 11 was DX-focused, not content-focused. Engineering counters moved:

| Metric | C10 end | **C11 end** | Δ |
|--------|---------|--------------|---|
| Code editor | textarea | **CodeMirror 6** (multi-lang + theme + line numbers) | upgrade |
| Public-discoverable pages | landing + /login + /roadmaps + /subjects + /u/[handle] | **+ /practice + /practice/[slug]** | +2 |
| Playwright e2e tests | 6 | **19** | +13 |
| Vitest tests | 27 | 27 | — |
| Subjects | 85 | 85 | — |
| Roadmaps | 24 | 24 | — |
| Layer 0–4 coverage | 100% | 100% | — |

---

## 6. Counters

| Metric | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | **C11** |
|--------|----|----|----|----|----|----|----|----|----|-----|----|
| Routes | 557 | 558 | 559 | 559 | 559 | 559 | 559 | 559 | 559 | 559 | 559 |
| Subjects | 50 | 51 | 53 | 58 | 62 | 67 | 72 | 77 | 82 | 85 | 85 |
| Roadmaps | 5 | 6 | 7 | 7 | 10 | 13 | 16 | 19 | 22 | 24 | 24 |
| Vitest tests | 0 | 0 | 17 | 27 | 27 | 27 | 27 | 27 | 27 | 27 | 27 |
| Playwright e2e | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | **19** |
| Public-discoverable | 1 | 1 | 1 | 1 | 2 | 2 | 2 | **4** | 4 | 4 | **6** |
| Content lines | 50K | 52K | 55K | 60K | 74K | 80K | 85K | 92K | 98K | 101K | ~101K |

---

## 7. Deferred to cycle 12 (engineering)

- **CodeMirror per-language lazy loading** — saves ~80-120KB gz from the practice route's first paint
- **Integration tests against a Neon test DB** — Razorpay webhook end-to-end with real DB
- **More e2e flows** — signup → solve → leaderboard → upgrade journey (currently 19 tests are surface-level)
- **`/practice` listing page polish for unauthed** — currently public but not optimised for visitors (no clear "sign in to track progress" CTA on the listing)
- **Sentry / PostHog dashboards setup** — code is wired; dashboards / alerts are not configured
- **`MobileBottomTabs` — Roadmaps tab tap-to-expand** — could surface placement tracks via a sheet
- **Roadmap recommendation at end of subject** — when a user finishes the last subject in a roadmap, suggest the next roadmap
- **README marketing brief** — LinkedIn launch posts, ProductHunt prep, founder thread template
- **CodeMirror Next 16 quirk: notFound() returns 200** — investigate why `notFound()` returns 200 with the not-found body instead of HTTP 404. Fixed in test by content-checking, but the underlying behaviour deserves a follow-up.

---

## 8. User verdict

> **Pending — awaiting verification.**

Cycle 11 is the first DX-focused cycle since cycle 8. After 9 content-heavy cycles + 1 polish cycle, the platform now has:

- **CodeMirror 6** editor instead of a textarea (mobile-friendly, syntax-highlighted)
- **Public practice previews** drive signup conversion (6th public surface)
- **19 Playwright e2e tests** covering landing + catalog + auth + security + profile not-found
- **Featured tracks discoverability** on `/roadmaps` for mobile users

If satisfied: cycle 11 closes the immediate DX gaps. Cycle 12 should attack the deeper integration gaps (CodeMirror lazy loading + Sentry dashboards + signup-to-solve e2e + Neon test DB integration) plus the marketing brief that's been deferred since cycle 8.
