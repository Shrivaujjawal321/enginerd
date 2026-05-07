# Cycle 23 — Legibility (changelog + README + ARCHITECTURE)

**Date:** 2026-05-05
**Theme:** User reframed the goal: this project is the first step toward attracting big-profile employers. Hiring managers don't read the platform — they scan it in 90 seconds. The 22 cycle reports sitting in `tech-team/cycles/` are the strongest portfolio signal we have but were invisible. This cycle makes them visible: a public `/changelog` page, a portfolio-grade `README.md`, and an `ARCHITECTURE.md` that surfaces the deliberate decisions inside the codebase.

---

## 1. Why this cycle (the reframe)

Earlier I was steering toward Awwwards-grade craft (cursor effects, sound design, bento landing). That's wrong for the actual goal. The user clarified:

> *"now my goal is to get high paying job and this is my first step to attract big profile people to hire me."*

What hiring managers (especially Razorpay / Swiggy / CRED / Postman / Atlan / FAANG-India) score:

1. **Velocity + judgment** — proven by the cycle reports IF they're visible
2. **Technical depth** — proven by `ARCHITECTURE.md` + the code itself
3. **Communication** — proven by the README, the cycle reports, and any deep-dive write-ups

Awwwards craft is mostly orthogonal. Legibility of the existing work is the highest-leverage move.

---

## 2. Cycle plan — 5 items + QA

| Tag | Subject | Owner |
|-----|---------|-------|
| **C23-1** | `lib/changelog.ts` + `app/(marketing)/changelog/page.tsx` — public list page reading every `tech-team/cycles/cycle-N.md`, parsing title / date / theme, vertical timeline UI | Jarvis |
| **C23-2** | `app/(marketing)/changelog/[cycle]/page.tsx` — per-cycle detail page rendering the full markdown via the existing `MarkdownRenderer`, with prev/next nav + leading-H1 stripper to avoid a duplicate-H1 a11y regression | Jarvis |
| **C23-3** | Wire `/changelog` into `components/marketing/navbar.tsx` (top nav) and `components/marketing/footer.tsx` (Product column) | Jarvis |
| **C23-4** | `README.md` rewrite as a portfolio surface — tagline + tech-stack table + "what's interesting" callouts + local setup + cycle log link + "Hire me" CTA | Jarvis |
| **C23-5** | `ARCHITECTURE.md` — high-level shape + stack rationale + key flows (sign-in, subject view with format tabs, Razorpay checkout, polymorphic surface) + 15-table data-layer map + "why this codebase is the way it is" closer | Jarvis |
| **CYCLE-23** | `e2e/changelog.spec.ts` (4 cases) + tsc + build + this report | Jarvis |

---

## 3. Diffs

### C23-1 — changelog parser + list page

```
lib/changelog.ts                                NEW   ~145 lines

  listCycles(): CycleSummary[]                  // tech-team/cycles/*.md, sorted newest-first
  getCycle(num): CycleDetail | null             // single cycle + prev/next neighbours
  parseSummary(num, raw)                        // pulls H1 + Date + Theme regex
  stripInlineMd(s)                              // removes ` * [..] markers from preview text
  truncate(s, max)                              // word-boundary truncate for theme preview

  Both list + detail wrapped in unstable_cache(['changelog…'], 1h, tags=['changelog']).
  Single tag busts the index after a new cycle ships.

app/(marketing)/changelog/page.tsx              NEW   ~110 lines

  Page header: "Built in public" eyebrow + "Changelog" h1 + 1-paragraph intro
  Stats bar: cycles shipped · latest date · cadence (~1 / day)
  Vertical list of cycle cards — each card has the cycle number badge, title,
  date, theme preview (truncated to 320 chars). Hover lifts the card's
  border + the arrow icon nudges right.
```

### C23-2 — detail page

```
app/(marketing)/changelog/[cycle]/page.tsx      NEW   ~125 lines

  generateStaticParams: pre-renders all 22 detail pages (cheap, ~22 entries)
  generateMetadata: cycle-specific title + description so social shares
                    look correct per-cycle

  Header: "Cycle N" eyebrow chip + h1 title + "Shipped <date>" line
  Body: MarkdownRenderer over the cycle's markdown (stripped of leading
        `# Cycle N — …` so the H1 doesn't duplicate the page header — real
        a11y fix that was masking until I tested it)
  Footer: prev / next navigation between cycles
```

### C23-3 — wiring

```
components/marketing/navbar.tsx                 +1 link
                                                NAV_LINKS now includes
                                                  { href: "/changelog", label: "Changelog" }
                                                between Careers and Pricing.

components/marketing/footer.tsx                 +1 link
                                                Product column gains a "Changelog"
                                                entry between Careers and Pricing.
```

### C23-4 — README as portfolio

```
README.md                                       full rewrite (~240 lines)

  Front: tagline + live demo placeholder + ARCHITECTURE link + cycle-log link
  Stack badges (Next.js 16, TS, Drizzle, tests count, MIT)
  "Why this exists" — the placement-prep gap framing (1 paragraph)
  "What's interesting" table — 7 entries calling out the agent pipeline,
    polymorphic surface, rate-limit tiers, learning-style aggregator,
    DB-first content, Razorpay HMAC, the cycle log itself
  Stack table with rationale per layer (12 entries)
  Architecture-at-a-glance ASCII block
  Local setup (npm install + migrations + seeds + dev + tests)
  Project structure — only the parts that matter
  Testing summary
  "Built in public" — favourite cycles called out (16, 19, 21, 22)
  License + Hire-me CTA pointing at /about + email
```

### C23-5 — ARCHITECTURE.md

```
ARCHITECTURE.md                                 NEW   ~280 lines

  - High-level shape diagram (Browser → Vercel → proxy.ts → RSC + route handlers
    → Neon / Upstash / Anthropic / Razorpay)
  - Stack choices with paragraph rationale for each (framework / DB / cache /
    auth / payments / LLM / analytics)
  - Key flows: sign-in (phone OTP), subject view with cycle-21 format tabs +
    cycle-22 DB content, Razorpay checkout, polymorphic learning surface
  - Data-layer table (15 tables, with cycle-of-introduction column)
  - Cycle-driven development (the 5-step audit → synthesis → execute →
    smoke → report loop)
  - Testing approach (vitest pure / playwright user-flow / no DB integration
    yet / stub mode for LLM)
  - Performance notes (618 → 535 → 535 static pages, unstable_cache,
    Mermaid + Shiki lazy-load)
  - "Three unstated rules" closer:
      1. Verify audit claims before fixing
      2. Render server, hydrate islands
      3. Make the unsafe call observable
```

---

## 4. Real fix surfaced by testing — duplicate H1

Cycle markdown files start with `# Cycle N — Theme`. The detail page already renders that title in its own page-header H1. Without intervention, every cycle detail page would have **two H1s** — a real WCAG / SEO regression.

Added `stripLeadingH1(source)` in the detail page that drops the leading H1 + the blank line after it before passing the body to `MarkdownRenderer`. Verified by Playwright: `getByRole('heading', { level: 1 })` resolves to exactly one element.

---

## 5. Verification

### Type check + build
```
npx tsc --noEmit                                ✓ exit 0, clean
npm run build                                   ✓ Compiled successfully in 35.4s
                                                ✓ Generating static pages (535/535)
                                                  (was 512; +22 cycle detail pages + 1 index)
```

### Tests
```
npm test  (vitest)                              ✓ 9 files / 68 tests   (no change)
npx playwright test                             ✓ 47 / 47 passing, ~41s
                                                  (was 43/43 — +4 changelog cases)
```

### Smoke (manual, dev server live at http://localhost:3000)
- `/changelog` — 22 cycle cards in vertical timeline; stats bar shows "22 cycles shipped · 2026-05-05 · ~1 / day". ✓
- Click first card → `/changelog/22` loads with stripped duplicate H1, full markdown renders, prev cycle link goes to `/changelog/21`. ✓
- Navbar Changelog link works on desktop + mobile drawer. ✓
- Footer Product column has Changelog. ✓
- `/changelog/9999` → 404 page renders. ✓

---

## 6. Counters

| Metric | C22 | **C23** | Δ |
|--------|-----|---------|---|
| Vitest test files | 9 | **9** | 0 |
| Vitest tests | 68 | **68** | 0 |
| Playwright e2e files | 18 | **19** | +1 |
| Playwright e2e | 43 | **47** | +4 |
| Static pages built | 512 | **535** | +23 |
| Public marketing pages | 11 | **34** | +23 (changelog index + 22 detail pages) |
| Project README | feature-list dump | **portfolio surface** | rewritten |
| Architecture doc | none | **ARCHITECTURE.md (~280 lines)** | new |
| Hiring-readable surfaces | 0 | **3** (changelog, README, ARCHITECTURE) | +3 |

---

## 7. Why this is the highest-leverage cycle for the hiring goal

What a senior hiring manager actually does on a 5-minute portfolio scan:

1. Opens the live URL → sees `/` → 30 seconds
2. Clicks Changelog (because it's in the top nav and unusual) → reads two cycle headers → understands the velocity instantly
3. Goes to GitHub → reads README → 60 seconds
4. Clicks ARCHITECTURE.md → reads the "key flows" section → 90 seconds
5. Decides: phone screen yes / no

Before this cycle, items 2 and 4 didn't exist. The 22 weeks of work was real but invisible. After this cycle, the candidate's velocity + judgment + depth signals are scannable. The deliverable is the same code; the difference is whether someone can see it.

---

## 8. Deferred to cycle 24

### Hireable surfaces
- `/about` page — explicit but classy "hire me", with resume + LinkedIn + email + GitHub.
- One technical deep-dive write-up (1500-2000 words) — pick from: 5-stage agent pipeline, polymorphic learning surface, rate-limit tiers, learning-style aggregator. This is the link to DM recruiters.
- Resume-bullets file + LinkedIn-post draft (markdown text artefacts the user can copy).
- 3-minute Loom demo (recorded by the user).

### Cycle 25 candidate — `/studio`
The AI-flagship feature: user types any topic → LLM generates markdown → upserts into `subject_content` (cycle-22 plumbing) → existing reader + cycle-21 format tabs render slides / mindmap / flashcards. Press-headline material; comes after the legibility work is in.

### Cycle 26 candidate — Awwwards-grade craft
View transitions, custom cursor, sound design, dynamic OG, Lighthouse 100s sweep. Optional — only if there's time before applying to jobs.

---

## 9. User verdict

> **Pending — awaiting verification.**

What changed this cycle:
- **22 cycles of invisible work became a public timeline.** `/changelog` is now in the nav, with a per-cycle detail page for each report.
- **The README went from feature-list dump to portfolio surface** — tagline, stack rationale, "what's interesting" callouts, hire-me CTA.
- **`ARCHITECTURE.md` exists.** A senior engineer can scan it in 5 minutes and know whether this candidate has system-design instincts.
- **Real a11y fix landed in passing** — stripped duplicate H1s from cycle detail pages.
- **Build green · 68/68 vitest · 47/47 playwright (+4 changelog smoke).** 535 static pages (+23 over cycle 22).

Cycle report at `tech-team/cycles/cycle-23.md`. Dev server live at http://localhost:3000 — visit `/changelog` to see the headline change.
