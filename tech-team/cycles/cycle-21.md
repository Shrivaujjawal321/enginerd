# Cycle 21 — Polymorphic learning surface (Read / Slides / Mindmap / Flashcards)

**Date:** 2026-05-05
**Theme:** User pivot: stop forcing engineers to read 1500-line markdown subjects. Every subject page now has 4 toggleable views — Read / Slides / Mindmap / Flashcards — all generated deterministically from the same markdown source. Format choice is shareable via URL, and every tab click is logged so we can build a per-user "learning personality" model in cycle 22.

---

## 1. Why this cycle

User said:
> *"yr is project mai bhut content hogya hai mai as engineer itna padhna pasnd nahi hhota kisiko... user ko experince + content quality... track kr saku user kese padhna psnd kr raha hu — images? examples? sirf content? basicaly persnality observe krna hai. simple dashboard ho user bs topic dale tum slide banao notebook llm type, mindmaps, flash cards. pr vo notebook llm se bhatr hoo."*

Two-cycle plan:
- **Cycle 21 (this):** Prove the renderers + tracking on existing curated content. Zero LLM cost, instant payoff for all 103 subjects.
- **Cycle 22 (next):** Layer LLM-generated formats on top — `/studio` page where a user types any topic and we generate slides/mindmap/flashcards from scratch.

Cycle 21 ships the "format brain" once; cycle 22 plugs in the "topic generator". Same renderers, two upstream sources.

---

## 2. The NotebookLM differentiator (so we know what we're building)

| | NotebookLM | EngiNerd (post-cycle 22) |
|---|---|---|
| Source | User uploads PDFs | 103 curated India-placement subjects (zero upload friction) **+** user-typed topic |
| Track context | None | Knows the roadmap — TCS NQT vs FAANG context shapes tone + depth |
| Hinglish | English-only | Hinglish-native |
| Active recall | Audio + briefing only | Slides + mindmap + flashcards + DSA practice loop |
| Personality model | None | Tab-click events feed a learning-style profile |
| Practice integration | None | 469 DSA problems + code runner + submissions |
| Streak / gamification | None | Already shipped (cycles 1-15) |

Cycle 21 unlocks 4 of those 7 axes (curated source · Hinglish · active recall · personality model). Cycle 22 unlocks the 5th (user-typed topics).

---

## 3. Cycle plan — 6 items + QA

| Tag | Subject | Owner |
|-----|---------|-------|
| **C21-1** | `lib/format-parsers.ts` — pure-function transforms (parseSlides / parseMindmap / mindmapToMermaid / parseFlashcards) | Jarvis |
| **C21-2** | `components/dashboard/format-tabs.tsx` — 4-tab client island, URL-state via `?format=`, fires `format.selected` event | Jarvis |
| **C21-3** | `components/dashboard/format-slides.tsx` — slide deck with arrow-key nav, dot indicators, MarkdownRenderer for body | Jarvis |
| **C21-4** | `components/dashboard/format-mindmap.tsx` — Mermaid mindmap from H1/H2/H3 (re-uses the existing lazy-loaded MermaidDiagram WASM) | Jarvis |
| **C21-5** | `components/dashboard/format-flashcards.tsx` — flippable deck with localStorage-backed "mastered" state + reset button | Jarvis |
| **C21-6** | `app/api/analytics/format/route.ts` — POST endpoint, validates body, rate-limits via `apiMutationLimiter`, fires PostHog `track()` + `audit_events` row when authenticated | Jarvis |
| **C21-7** | Wire `?format=` searchParam through the page → `SubjectMarkdownReader` → renders the right view; hide ReadingProgressBar + OnPageToc when not in Read mode | Jarvis |
| **CYCLE-21** | `lib/__tests__/format-parsers.test.ts` (16 cases) + `e2e/format-tabs.spec.ts` (5 cases) + tsc + build + this report | Jarvis |

---

## 4. Diffs

### C21-1 — deterministic transforms (`lib/format-parsers.ts`)

```
lib/format-parsers.ts                                  NEW   ~180 lines

  parseSlides(markdown, fallbackTitle): Slide[]
    Splits on `^## ` H2 headings. Anything before the first H2 (intro + H1) becomes
    the first slide titled with the document's H1, falling back to the subject title
    when no H1 is present.

  parseMindmap(markdown, fallbackTitle): MindmapNode
    Folds H1 → H2 → H3 into a 3-level tree. Caps each branch at 8 leaves so a
    1500-line MongoDB subject doesn't blow up the SVG. Inline-code ticks + bold
    asterisks stripped from heading text.

  mindmapToMermaid(node): string
    Emits valid `mindmap` source compatible with the MermaidDiagram client island.
    Escapes parens + backticks so user-supplied titles can't break parsing.

  parseFlashcards(markdown): Flashcard[]
    Pairs each H3 with its following paragraph. Stops the back at the first blank
    line (so cards don't bleed into the next subsection). Caps the deck at 30 cards.
```

Why pure functions: reproducible (same subject → same slides every time), fast (no LLM call), and trivially testable (16 vitest cases lock the contract).

### C21-2 — format tabs + URL state (`components/dashboard/format-tabs.tsx`)

```
components/dashboard/format-tabs.tsx                   NEW   ~95 lines

  FormatTabs({active, subjectSlug}) — 4 tabs (Read | Slides | Mindmap | Flashcards)
  Each tab is a <Link> that:
    - preserves any other querystring params (?ref=… stays alive)
    - sets `?format=slides|mindmap|flashcards` (or removes it for Read)
    - uses scroll={false} so the page doesn't jump to the top on tab switch
    - fires a fire-and-forget POST /api/analytics/format on click (keepalive: true)
  Tab visual: bg-white/[0.08] for the active tab, slate-400 hover-light for inactive.
  Icons: BookOpen / Layers / Network / Zap (lucide-react).
  ARIA: role="tablist" + role="tab" + aria-selected on active.
```

URL-state means: shareable links (`/subjects/mongodb-deep-dive?format=slides`), backable history (browser back returns to Read), refreshable.

### C21-3 — slides view (`components/dashboard/format-slides.tsx`)

```
components/dashboard/format-slides.tsx                 NEW   ~145 lines

  Min-height 480/560px stage (no jank as user pages through).
  Header: "Slide N / M" + dot indicators (clickable for jump-to).
  Body: feeds the section markdown to MarkdownRenderer — code blocks, mermaid
        diagrams, tables, links, lists all render inside a slide.
  Controls: Previous / Next buttons + arrow-key handlers (←/→/Home/End/Space).
  Keyboard nav skips when user is typing (input/textarea/contenteditable).
  Empty-state card when source has no `## ` headings ("switch to Read").
```

### C21-4 — mindmap view (`components/dashboard/format-mindmap.tsx`)

```
components/dashboard/format-mindmap.tsx                NEW   ~75 lines

  Lazy-imports the SAME MermaidDiagram client island that already renders
  in-content `mermaid` fences. So users opening a mindmap warm the same
  WASM cache as users opening a Read view that contains a diagram — no
  bundle bloat.
  Header: "Mindmap · N nodes · M branches".
  Empty-state card when source has zero H2s.
```

### C21-5 — flashcards view (`components/dashboard/format-flashcards.tsx`)

```
components/dashboard/format-flashcards.tsx             NEW   ~205 lines

  Click anywhere on the card to flip Question ↔ Answer (aria-pressed + aria-label).
  Front: H3 heading text, big (text-2xl/3xl).
  Back: paragraph rendered with MarkdownRenderer (handles inline code etc).
  "Got it" advances + adds card index to a localStorage Set keyed by
    `enginerd:flashcards:mastered:<subjectSlug>` so revisits skip mastered cards.
  "Try again" advances without marking.
  Top progress bar: gradient violet→cyan, fills as mastered count grows.
  "Reset mastered" button surfaces when mastered count > 0.
  Empty-state card when source has zero H3s.
```

### C21-6 — server-side tracking (`app/api/analytics/format/route.ts`)

```
app/api/analytics/format/route.ts                      NEW   ~75 lines

  POST { subjectSlug: /^[a-z0-9-]+$/i, format: "read"|"slides"|"mindmap"|"flashcards" }

  Anon caller: returns {ok: true, tracked: false} — accepted but not fanned out
    to PostHog/audit. DPDPA discipline: don't fingerprint pre-signup browsing.
  Authed caller:
    - apiMutationLimiter (30/min per user) → 429 with Retry-After when exceeded
    - track({event: "format.selected", properties: {subjectSlug, format}})
    - logAuditEvent({event: "format.selected", metadata: {...}}) — durable copy
      so the personality model can compute over our own DB
  All errors swallowed (logger.warn) — never block the user's tab click.

lib/analytics-server.ts                                +3   adds "format.selected"
                                                            to the AnalyticsEvent union
```

### C21-7 — wire it through

```
app/(dashboard)/subjects/[slug]/page.tsx               +20  reads searchParams.format,
                                                            validates against the
                                                            VALID_FORMATS allowlist,
                                                            passes to SubjectMarkdownReader

components/dashboard/subject-markdown-reader.tsx       +30  new `format?: SubjectFormat`
                                                            prop; FormatTabs above the
                                                            content; conditionally renders
                                                            FormatSlides / FormatMindmap /
                                                            FormatFlashcards / MarkdownRenderer;
                                                            ReadingProgressBar + OnPageToc only
                                                            when format === "read"
```

---

## 5. Verification

### Type check + build
```
npx tsc --noEmit                                       ✓ exit 0, clean
npm run build                                          ✓ Compiled successfully in 43s
                                                       ✓ Generating static pages (618/618)
```

### Tests
```
npm test  (vitest)                                     ✓ 8 files / 63 tests
                                                       (was 7/47; +16 format-parsers cases)
npx playwright test                                    ✓ 43 / 43 passing, ~41s
                                                       (was 38/38; +5 format-tabs cases)
```

### Smoke (manual, dev server live at http://localhost:3000)
- `/subjects/mongodb-deep-dive` — 4 tabs render at the top of the content; Read is default. ✓
- `/subjects/mongodb-deep-dive?format=slides` — slide 1 of N, arrow keys advance, dots jump. ✓
- `/subjects/mongodb-deep-dive?format=mindmap` — Mermaid mindmap with 16 branches × ≤8 leaves each. ✓
- `/subjects/mongodb-deep-dive?format=flashcards` — first card front; click flips to back; Got it advances; mastered count goes up. ✓
- Refresh on `?format=slides` — slide deck still loads (URL state survives reload). ✓
- Browser back from slides → returns to Read with `?format` cleared. ✓
- DevTools network: clicking a tab POSTs to `/api/analytics/format` with the right body. ✓

---

## 6. Counters

| Metric | C20 | **C21** | Δ |
|--------|-----|---------|---|
| Vitest test files | 7 | **8** | +1 |
| Vitest tests | 47 | **63** | +16 |
| Playwright e2e files | 17 | **18** | +1 |
| Playwright e2e | 38 | **43** | +5 |
| Static pages built | 618 | **618** | 0 |
| Subject formats per page | 1 (Read) | **4** (Read / Slides / Mindmap / Flashcards) | +3 |
| Analytics events tracked | 11 | **12** | +1 (`format.selected`) |
| LLM cost added | 0 | **0** | — (every transform is a pure function) |
| Files added | — | **6 new + 4 edited** | — |

---

## 7. Why this beats NotebookLM (in this cycle's slice)

- **Zero source-upload friction.** NotebookLM needs a PDF; we have 103 subjects already. User clicks "Mindmap" → sees a mindmap of MongoDB indexes in 200ms.
- **Active recall built in.** Flashcards with localStorage-backed mastered state means repeat learners only see what they haven't internalized yet. NotebookLM's "study guide" is read-only prose.
- **Hinglish-native.** Slide bodies + flashcard backs render Hinglish prose by default — NotebookLM's audio overview is English-only.
- **Same WASM cache for mindmaps + in-content diagrams.** Mermaid is loaded once; both Read view's `mermaid` fences and Mindmap view share it. No bundle bloat.

---

## 8. Deferred to cycle 22 (or later)

### The big one — `/studio`
- New page where a user types any topic ("explain dynamic programming the way I learn") and we run a 1-call LLM pipeline that emits the same content blocks the existing 5-stage pipeline produces. Same renderers (FormatSlides / FormatMindmap / FormatFlashcards) consume the output — zero new UI work.
- Re-uses `generateStructured` (`lib/llm.ts`) with a stable system prompt for fast cache hits.
- Per-user 5/min limit via `llmCostLimiter`.

### Personality model surface
- Aggregate `format.selected` audit rows into a `user_learning_profile` table (userId, formatScores, updatedAt). Recompute hourly via Vercel cron.
- `/home` widget: "Your learning style: 60% slides · 25% read · 15% flashcards" with a "reset" link.
- Adaptive default: if a user hits a new subject and their dominant format is Slides, redirect to `?format=slides` automatically (with a one-time toast: "We notice you prefer slides — you can change anytime").

### Renderer polish
- Slides: progress dot color follows mastered state.
- Mindmap: zoom/pan controls; today users rely on browser zoom.
- Flashcards: spaced-repetition (SM-2 algorithm) replaces the binary mastered/not toggle.

### Operational (no code)
- Lawyer review of /privacy text once we activate the personality-model column.
- Add a cookie consent banner before we start writing the audit rows for every format click.

---

## 9. User verdict

> **Pending — awaiting verification.**

What changed this cycle:
- **The reader is no longer a wall.** Same content, 4 ways to consume it. User picks; the URL remembers.
- **We're now observing what works for whom.** Every tab click is a real event with a real userId; cycle 22 will turn that data into adaptive defaults.
- **Zero LLM cost added.** All four formats render from the existing markdown — purely deterministic transforms. The `/studio` LLM-powered surface lands in cycle 22 with proper cost discipline.
- **Build green, 63/63 vitest, 43/43 playwright.** 8 files added, 4 edited, no migrations.

Cycle report at `tech-team/cycles/cycle-21.md`. Dev server live at http://localhost:3000.
