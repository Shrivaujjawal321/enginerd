# Cycle 22 — Content out of frontend, dashboard becomes the centerpiece

**Date:** 2026-05-05
**Theme:** User course-correct: *"yr isko remove mt kro bs frontend pr render mt kro. bs jo mne kha uspr kam kro"* — keep cycle 21 (the format tabs), but stop building the frontend around 100K lines of static markdown. Move the runtime-of-record copy of every subject into Postgres, drop pre-rendering of every subject page, and make /home a search-anchored dashboard that surfaces past subjects, streak, progress, and the cycle-21 learning-style data.

---

## 1. Why this cycle

Cycle 21 shipped the *renderers* (slides / mindmap / flashcards) but kept content + metadata exactly where it was: `content/<slug>.md` files on disk and `lib/mock-data/{subjects,roadmaps}.ts` JS-bundled into every page that imports them. The user's pivot:

> *"frontend pr render mt kro. dashboard pr past subject, streak, progress, search bar, or bhi jariri chize."*

Two strands of work:

1. **Decouple content from frontend.** Markdown moves into Postgres so admins can publish without redeploy and so the cycle-23 `/studio` flow has a natural place to write rows. Build stops pre-rendering 600+ subject pages.
2. **Make the dashboard feel like a dashboard.** Search input pinned at the top (the discovery affordance), recently-viewed list, and the cycle-21 payoff — a "your learning style" widget that finally renders the `format.selected` audit trail we've been writing since C21-6.

Cycle 21 (the format tabs) stays — explicitly per user instruction.

---

## 2. Cycle plan — 7 items + QA

| Tag | Subject | Owner |
|-----|---------|-------|
| **C22-1** | `lib/db/migrations/0007_subject_content.sql` + Drizzle `subjectContent` table (slug PK, markdown, source, updatedAt) | Jarvis |
| **C22-2** | `lib/subject-content-store.ts` — DB-first read with `content/*.md` fallback; `unstable_cache` 1h with `subject-md:<slug>` tag; `upsertSubjectContent` for cycle-23 writers | Jarvis |
| **C22-3** | `scripts/seed-subject-content.ts` — idempotent upsert of every `content/*.md` file, runs against Neon via the script-only Drizzle client | Jarvis |
| **C22-4** | `/subjects/[slug]/page.tsx` — `generateStaticParams` returns []; route is now fully dynamic; build drops 618 → 512 pages | Jarvis |
| **C22-5** | `components/dashboard/hero-search.tsx` — full-width search input pinned to top of /home; opens the same `<SearchPalette>` cmd+K modal | Jarvis |
| **C22-6** | `components/dashboard/recently-viewed.tsx` — last 6 subjects from `user_progress` ordered by `last_seen_at`; relative timestamps via existing `formatRelative` | Jarvis |
| **C22-7** | `lib/learning-style.ts` + `components/dashboard/learning-style-widget.tsx` — the cycle-21 payoff: aggregate the last 200 `format.selected` audit rows, compute % per format, render Spotify-Wrapped-style tile | Jarvis |
| **CYCLE-22** | `lib/__tests__/learning-style.test.ts` (5 cases, mocked DB) + tsc + build + Playwright + this report | Jarvis |

---

## 3. Diffs

### C22-1 + C22-2 — content out of files into Postgres

```
lib/db/migrations/0007_subject_content.sql            NEW   ~25 lines
                                                            single-table store: slug PK,
                                                            markdown, source ('file'|'studio'|'agent'),
                                                            updated_at; index on updated_at DESC

lib/db/schema.ts                                      +20  new `subjectContent` pgTable + SubjectContentRow type

lib/subject-content-store.ts                          NEW   ~100 lines
                                                            readSubjectContent(slug):
                                                              1. DB row     (when DATABASE_URL set)
                                                              2. content/<slug>.md  (fallback)
                                                              3. null
                                                            wrapped in unstable_cache(['subject-content', slug],
                                                              { revalidate: 3600, tags: [subject-md:<slug>, subject-md] })
                                                            upsertSubjectContent(args) — single write point
                                                              with onConflictDoUpdate; throws if !hasDatabase to
                                                              avoid silent no-op writes from /studio (cycle 23)

lib/subject-markdown.ts                               full rewrite (was 41 lines, now 14)
                                                            delegates to readSubjectContent — call sites unchanged
```

The DB hit only fires on a cache miss (cold container or post-revalidate). Subsequent reads come from the in-process `unstable_cache` Map. Tag `subject-md:<slug>` lets us bust a single subject after an admin edit; `revalidateTag('subject-md')` flushes everything.

### C22-3 — seed script

```
scripts/seed-subject-content.ts                       NEW   ~85 lines

  Usage:
    npx tsx scripts/seed-subject-content.ts                # all 103 subjects
    npx tsx scripts/seed-subject-content.ts mongodb-deep-dive   # one slug

  - Lists every .md in content/ (skips _underscore-prefixed planning files
    in case any sneak back).
  - Reads markdown; upserts (slug, markdown, source='file').
  - Idempotent: re-running updates rows in place.
  - Reports inserted / updated / failed counts; exits 1 on any failure
    so CI can fail loud.
```

### C22-4 — drop static pre-render

```
app/(dashboard)/subjects/[slug]/page.tsx              -3 +13

  - generateStaticParams() now returns []
  + dynamic = "force-dynamic" so no per-deploy pre-render
  + dynamicParams = true (was already there) so any slug is still resolvable on demand

  Comment block explains the trade: every subject view becomes a dynamic
  RSC render, but readSubjectContent's unstable_cache (1h) means the second
  hit is fast. The 100+ subjects that no real user ever opens stop costing
  build time.
```

Build static page count: **618 → 512** (−106).

### C22-5 — hero search

```
components/dashboard/hero-search.tsx                  NEW   ~50 lines
                                                            full-width button styled like a search input
                                                            tap → opens the existing SearchPalette modal
                                                            keyboard shortcut hint (⌘K kbd) on sm+
                                                            gradient violet→cyan icon chip — visually anchors
                                                            the dashboard so the user sees "where do I go?" at first paint
```

### C22-6 — recently-viewed widget

```
components/dashboard/recently-viewed.tsx              NEW   ~95 lines

  Props: items (server-fetched in /home/page.tsx)
  Layout: divided list inside a GlassCard; each row =
            iconAccent badge | title + category + status | relative time | arrow

  Empty-state card when the user has zero progress rows ("nothing here
  yet — open any subject and it'll show up here") with a link to /subjects.

app/(dashboard)/home/page.tsx                         +60  new getRecentlyViewed(userId, limit)
                                                            queries user_progress ordered by last_seen_at DESC
                                                            joins against SUBJECTS_BY_SLUG to enrich with category /
                                                            estHours / iconAccent (missing slugs silently dropped)
                                                            added to the page Promise.all (no extra round-trip cost)
```

### C22-7 — learning-style widget

```
lib/learning-style.ts                                 NEW   ~95 lines

  computeLearningStyle(userId): LearningStyle | null
    - SELECT metadata FROM audit_events
        WHERE user_id = $1 AND event = 'format.selected'
        ORDER BY created_at DESC LIMIT 200
    - JSON.parse each metadata blob; count by format.
    - Null when total < 5 (statistically meaningless).
    - Floor each percentage; push the remainder onto the dominant
      format so the bar always sums to exactly 100.
    - Returns { total, counts, percentages, dominant }.

components/dashboard/learning-style-widget.tsx        NEW   ~120 lines

  Empty state (style === null):
    "We'll figure out how you learn best — read, slides, mindmaps, or
     flashcards — as you use the app." + format-tabs primer.

  Full state:
    "60%" giant number + "Slides learner" chip
    Stacked bar (4 segments, gradient palette)
    Per-format legend with tabular % (read / slides / mindmap / flashcards)
    "last N sessions" tag in the header

app/(dashboard)/home/page.tsx                         +5  imports + call site
                                                          new section: 2-col grid (RecentlyViewed | LearningStyleWidget)
                                                          on lg+; stacks vertically on mobile
```

### Cycle test coverage

```
lib/__tests__/learning-style.test.ts                  NEW   5 cases / ~100 lines

  - returns null when fewer than 5 valid samples
  - returns null when every metadata row is malformed
  - aggregates counts + percentages over a 10-row clean sample
  - rounds remainder onto dominant so percentages always sum to 100
  - ignores rows for unknown format values

DB layer mocked at the import level so tests stay pure (no Neon round-trip).
```

---

## 4. Verification

### Type check + build
```
npx tsc --noEmit                                      ✓ exit 0, clean
npm run build                                         ✓ Compiled successfully in 31.4s
                                                      ✓ Generating static pages (512/512)        (was 618; −106)
```

### Tests
```
npm test  (vitest)                                    ✓ 9 files / 68 tests
                                                       (was 8/63 — +5 learning-style cases)
npx playwright test                                   ✓ 43 / 43 passing, ~49s   (no e2e regression)
```

### Smoke (manual, dev server live at http://localhost:3000)
- `/subjects/mongodb-deep-dive` — loads dynamically, markdown still renders (file fallback firing because subject_content rows aren't seeded yet in dev). ✓
- `/subjects/mongodb-deep-dive?format=slides` (cycle 21) — still works. ✓
- `/home` (signed in) — Hero search at top, Continue card, Stats, Recently-viewed list (or empty state), Learning-style widget (empty state until ≥5 format clicks). ✓
- Click HeroSearch → cmd+K palette opens. ✓
- Click 5+ format tabs across different subjects → revisit /home → Learning-style widget shows percentages. ✓ (manually verified the empty-state → populated transition by hitting the format-tabs spec endpoints repeatedly, then refreshing /home.)

### Migration / seed (run order on Neon before deploy)
```
psql "$DATABASE_URL" -f lib/db/migrations/0007_subject_content.sql
npx tsx scripts/seed-subject-content.ts
```
After seeding, every subject is served from Postgres with a 1h cache; the file fallback only fires for slugs no one has authored yet.

---

## 5. Counters

| Metric | C21 | **C22** | Δ |
|--------|-----|---------|---|
| Vitest test files | 8 | **9** | +1 |
| Vitest tests | 63 | **68** | +5 |
| Playwright e2e | 43 | **43** | 0 |
| Static pages built | 618 | **512** | **−106** |
| Subject content storage | files only | **DB + file fallback** | — |
| Dashboard primary surfaces | Continue · Stats · Recommended · Jobs | **+Hero search · +Recently viewed · +Learning style** | +3 |
| Cycle-21 `format.selected` data surfaced to users | 0 | **on /home** | unlocked |
| DB migrations total | 7 | **8** | +1 |
| Seed scripts | 1 (problems) | **2 (problems + content)** | +1 |

---

## 6. What this enables in cycle 23+

- **`/studio` page (cycle 23)** — `upsertSubjectContent` is the write surface. User types a topic; we LLM-generate markdown; row lands in `subject_content` with `source: 'studio'`; the existing reader + cycle-21 format tabs render it.
- **Adaptive default format** — once a user has ≥5 format clicks, the dominant format becomes the default redirect when they open a new subject ("we noticed you prefer slides — change anytime").
- **Admin content editor** — a small `/admin/subjects/[slug]/edit` page that writes through `upsertSubjectContent` + `revalidateTag` flushes the cache.
- **Per-subject content versioning** — add `subject_content_history` table later, so admin edits keep an undo trail.

---

## 7. Deferred to cycle 23

- **`/studio`** — the user-types-a-topic LLM flow. Re-uses the cycle-21 renderers + the cycle-22 store. Major scope.
- **Move metadata (subjects.ts / roadmaps.ts) into DB.** Today the *content* is DB-backed but the metadata trees still live in 4081 + 1095-line TS modules that get JS-bundled. Needs `subjects_meta` + `roadmap_meta` tables + a parallel seed script + ~30 call-site updates.
- **Sidebar / topbar polish.** With the dashboard becoming the discovery surface, the sidebar's value drops. Possibly collapse to a drawer or remove on /home.
- **Admin content editor surface** — `/admin/subjects/[slug]/edit` write-through page.
- **Per-format last-viewed signal** — `user_progress.last_format` so RecentlyViewed can reopen in the format the user last used.

---

## 8. User verdict

> **Pending — awaiting verification.**

What changed this cycle:
- **Content is now decoupled from the deploy.** Edit a subject, run the seeder, traffic sees it within 1h (or instantly via `revalidateTag`). No redeploy.
- **Build is leaner.** 106 fewer pages pre-rendered; subject pages render on demand and cache for 1h.
- **The dashboard feels like a dashboard.** Search is the first thing you see; recently-viewed gives you the path back; learning style closes the cycle-21 loop by surfacing the data we were already writing.
- **Cycle 21 stays intact.** Format tabs / parsers / e2e specs all unchanged.
- **Build green · 68/68 vitest · 43/43 playwright.** 1 migration · 1 seed script · 7 new files · 4 edited.

Cycle report at `tech-team/cycles/cycle-22.md`. Dev server live at http://localhost:3000 — the new /home is the place to look first.
