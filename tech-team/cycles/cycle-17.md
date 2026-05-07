# Cycle 17 — Content gap closure (orphans + planning hygiene + LLD depth + tries)

**Date:** 2026-05-04
**Theme:** Close the 4 real content gaps surfaced by the cycle-16 audit follow-up. User asked: *"do 1234"* — wire orphans, move planning docs, expand LLD, ramp tries.

---

## 1. Why this cycle

After cycle 16's triage, a deeper question arose: *what content is actually missing?* That audit surfaced 5 buckets — items 1–4 were the actionable wins:

| # | Gap | Action |
|---|-----|--------|
| 1 | 3 orphan subjects (authored but no roadmap reference) | Wire them into the right roadmaps |
| 2 | 2 planning docs polluting `content/` | Move to `tech-team/` |
| 3 | `lld-design.md` was 549 lines (thin for a separate interview round) | Expand to 1500+ lines with 3 new worked examples + concurrency deep-dive |
| 4 | DSA `tries` topic had only 10 problems vs `trees-bst` 40 | Author 10 new tries problems, validate against editorial JS |

Item 5 (real-market gaps: HDFC tech, MongoDB deep-dive, GSoC India playbook) deferred to a future cycle.

---

## 2. Cycle plan — 4 items + QA

| Tag | Subject | Owner |
|-----|---------|-------|
| **C17-1** | Wire `mock-interview-comm`, `amcat-cocubes-elitmus`, `final-layer-closures` into 4 roadmaps | Jarvis (direct) |
| **C17-2** | Move `content/_plan.md` + `content/_progress.md` → `tech-team/content-plan.md` + `tech-team/content-progress.md` | Jarvis (direct) |
| **C17-3** | Expand `content/lld-design.md` from 549 → 1500–1800 lines | Content-author agent (parallel) |
| **C17-4** | Author 10 new tries problems → validate to 20/20 | Problem-author agent (parallel, background) |
| **CYCLE-17** | tsc + build + vitest + playwright + this report | Jarvis |

---

## 3. Diffs

### Item 1 — orphan wiring

```
lib/mock-data/roadmaps.ts                            +6 -0   3 subjectSlugs additions across 4 roadmaps:
                                                              service-company-cracker  + mock-interview-comm
                                                              off-campus-cracker       + amcat-cocubes-elitmus
                                                                                       + mock-interview-comm
                                                                                       + final-layer-closures
                                                              service-trio-cracker     + amcat-cocubes-elitmus
                                                              portfolio-builder        + final-layer-closures
                                                              + subjectsCount metadata bumped on each:
                                                                service-company-cracker 10 → 11
                                                                off-campus-cracker       6 →  9 (topics 45 → 60)
                                                                service-trio-cracker     6 →  7
                                                                portfolio-builder        4 →  6
```

Orphan re-check after wiring: **0 orphan subjects** in `content/` (the only "orphans" remaining are `_plan.md`/`_progress.md`, handled by item 2).

### Item 2 — planning docs out of `content/`

```
content/_plan.md           → tech-team/content-plan.md       (445 lines)
content/_progress.md       → tech-team/content-progress.md   (125 lines)
```

User-facing `content/` directory now contains only published lesson content. Planning docs live alongside cycle reports.

### Item 3 — LLD expansion (delegated, completed in 5 min)

```
content/lld-design.md                                +977 -0   549 → 1526 lines

New sections (slotted between existing §7 BookMyShow and §8 Pitfalls; existing
content preserved verbatim, original §8/9/10 renumbered to §15/16/17):

  §8  Worked Example D — ATM machine        ~165 lines (state pattern)
  §9  Worked Example E — Online Chess       ~165 lines (factory + command, undo/redo)
  §10 Worked Example F — Cab-booking (Uber) ~175 lines (matching + state machines + fare strategy)
  §11 Concurrency patterns deep-dive         ~195 lines (synchronized vs ReentrantLock vs ReadWriteLock,
                                                          AtomicInteger / CAS, BlockingQueue, Redis SETNX
                                                          vs Redlock, BookMyShow concurrent-booking answer,
                                                          deadlock-avoidance recipe)
  §12 When to use which pattern              ~105 lines (3 signal-phrase hints per pattern + anti-patterns)
  §13 India-specific LLD twists              ~90  lines (Razorpay webhook delivery, Swiggy surge pricing,
                                                          Flipkart flash-sale queue, Paytm P2P transfer,
                                                          Zomato reservation)
  §14 6-week practice plan                   ~80  lines (week-by-week problem schedule + mock-with-friend protocol)
```

Voice consistency: Hinglish in prose ("ekdum chai-pani", "tu agar"), English in code/UML/table headers. No existing content deleted.

### Item 4 — tries problems (delegated, completed via background agent)

```
data/generated-problems/tries.json            10 → 20  (10 new problems at #1711–1720)
data/generated-problems/tries.validated.json  10 → 20  (validator: 20/20 pass)

New problems (2 Easy / 5 Medium / 3 Hard):
  1711 zomato-restaurant-search-suggestion       Medium   Search Suggestion System (lex-3-smallest per prefix)
  1712 freshworks-add-search-words-wildcard      Medium   "." wildcard search (LeetCode 211)
  1713 atlassian-map-sum-prefix                  Easy     Map Sum Pairs (677)
  1714 walmart-stream-of-characters-suffix-trie  Hard     Stream of Characters (1032)
  1715 google-palindrome-pair-finder             Hard     Palindrome Pairs (336)
  1716 microsoft-short-encoding-of-words         Medium   Short Encoding (820)
  1717 uber-longest-buildable-word               Easy     Longest Word in Dictionary (720)
  1718 paytm-count-distinct-substrings           Hard     Distinct Substrings via trie
  1719 zomato-prefix-suffix-cuisine-search       Medium   Prefix+Suffix Search (745)
  1720 microsoft-camelcase-matching              Medium   CamelCase Matching (1023)

Each problem ships with: 6-language starter code (js/python/java/cpp/typescript/go),
5–6 test cases, 3 Hinglish hints, editorial markdown with a JS code block that the
validator runs against tests (the agent verified all 50 expected-output assertions
locally before injection).
```

Total: ~3 files of code edits + 1 large content rewrite + 1 problem-bank expansion. Lines added across cycle: **~977 LLD prose + 10 problem JSON entries (~5K JSON lines) + 14 code edits**.

---

## 4. Verification

### Type check + build
```
npx tsc --noEmit                                  ✓ exit 0, clean
npm run build                                     ✓ Compiled successfully in 37.2s
                                                  ✓ Generating static pages (611/611)
```

### Tests
```
npm test                                          ✓ vitest 5 files / 29 tests
npx playwright test                               ✓ 33 / 33 passing, ~1.1 min
                                                  (one flaky retry: keyboard-a11y "Send OTP enabled"
                                                   passed cleanly on re-run; not caused by anything
                                                   in items 1-4 — login-form not touched this cycle)
```

### Validator
```
npx tsx scripts/validate-problems.ts              ✓ tries: 20/20 pass, 0 failed, 0 noEditorial
                                                    (pre-existing failures in dp-2d/greedy/linked-list/
                                                    strings untouched by this cycle)
```

### Smoke (manual)
- Visit `/roadmaps/off-campus-cracker` — now lists 9 subjects including `Mock Interview + GD + Communication`,
  `AMCAT + CoCubes + eLitmus`, `Final-Layer Closures`. ✓
- Visit `/subjects/lld-design` — renders 1526-line markdown with new ATM / Chess / Uber examples, concurrency
  deep-dive, India-twists, practice plan. Reading progress bar fades correctly at 0–99%. ✓
- Visit `/practice` filtered by topic `Tries` — 20 problems listed (was 10). ✓

---

## 5. Counters

| Metric | C16 | **C17** |
|--------|-----|---------|
| Vitest tests | 29 | 29 |
| Playwright e2e | 33 | 33 |
| Subjects total | 100 (3 orphan) | **100** (0 orphan) |
| Roadmaps with all subjects wired | n/a | **24/24** |
| `lld-design.md` lines | 549 | **1526** |
| Tries problems | 10 | **20** |
| Total DSA problems | 459 | **469** |
| Planning docs in user-facing content/ | 2 | **0** |
| Roadmap subject coverage (subjectSlugs total entries) | n | **n + 6** |

---

## 6. Deferred to cycle 18 (or later)

### Real-market content gaps (item 5 from the audit)
- **Indian banking tech** (HDFC / ICICI / SBI Tech, COBOL+Java) — ~10k engineers/year hired, near-zero competition for prep content
- **PSU technical via GATE HR rounds** (NTPC / BHEL / IOCL post-result strategy)
- **MongoDB deep-dive** — current `database-nosql.md` (833 lines) is generic; MongoDB-specific aggregation / replica-set / sharding deserves its own subject
- **GSoC India / Linux Foundation Mentorship playbook** — `open-source-guide.md` exists but no mentorship-to-FAANG-internship pipeline
- **Aptitude-Logical sub-topics** (syllogism, cube-folding, blood-relation as separate subjects)

### Light short subjects (under 600 lines)
- `da-stakeholder-influence` (506) / `da-business-fundamentals` (514) / `da-product-analytics` (543) — could expand or merge

### Engineering carry-over (from C16 §9)
- I6 — split apiLimiter
- I7 — replace native `confirm()` in cancel-subscription-button
- M11 — mobile `/home` "Continue: <subject>" pill
- M12 — first vitest coverage on `lib/agents/*`

---

## 7. User verdict

> **Pending — awaiting verification.**

Cycle 17 closes 4/5 content gaps surfaced by the audit follow-up. The platform now has:
- **Zero subject orphans** — every authored subject is reachable through a guided roadmap path
- **Clean `content/` directory** — only published lesson content, no internal tracking
- **Interview-grade LLD** — 6 worked examples + concurrency deep-dive + pattern decision-tree + India-twist sketches + 6-week practice plan
- **Balanced DSA `tries`** — 20 problems (was 10), now in line with `arrays-hashing` / `binary-search` / `sliding-window` neighbours, all FAANG-tier topics validated

Item 5 (real-market gaps — HDFC banking tech, MongoDB deep-dive, GSoC playbook) is the next high-leverage content cycle. Engineering DX carry-over from C16 §9 is the next high-leverage code cycle.
