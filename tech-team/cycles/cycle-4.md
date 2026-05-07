# Cycle 4 — Closing the Cycle-2 Plan (Placement-Readiness Floor)

**Date:** 2026-05-02
**Theme:** Ship the 5 missing items from the original cycle-2 plan so the placement-readiness floor is actually live.

---

## 1. Why this cycle

After cycle 3, the user asked "is this complete?" — and it wasn't. 5 of 10 cycle-2 items were still missing. Cycle 4 closes them.

Specifically, the Service Company Cracker roadmap was wired into mock-data in cycle 3 but pointed at subjects that didn't exist yet (Aptitude-Logical, Aptitude-Verbal, OS, Networks, Resume). Cycle 4 fills those gaps, then expands Product Company Cracker to inherit the same.

---

## 2. Audit — 5 specialist content authors in parallel

| Agent | Subject | File | Lines |
|-------|---------|------|-------|
| Aptitude — Logical author | `content/aptitude-logical.md` | 1012 |
| Aptitude — Verbal author | `content/aptitude-verbal.md` | 919 |
| Operating Systems author | `content/os-complete.md` | 1298 |
| Computer Networks author | `content/networks-complete.md` | 961 |
| Resume + Behavioural author | `content/resume-behavioural.md` | 991 |

**Total: 5181 new lines of placement-ready content** authored in one parallel sweep.

Each subject follows the established template: Hinglish narration with precise English code/math/formulas, "Pro tip" blockquotes, slow-vs-fast worked examples (timed), Indian product-company anecdotes (Razorpay, Hotstar, Swiggy, CRED, Flipkart), Top-N-questions interview table, pre-interview checklist, "What to learn next" cross-links.

---

## 3. Cycle plan — 9 items

| Tag | Subject |
|-----|---------|
| **CONTENT-6** | Aptitude — Logical Reasoning subject |
| **CONTENT-7** | Aptitude — Verbal subject |
| **CONTENT-8** | Operating Systems Complete subject |
| **CONTENT-9** | Computer Networks Complete subject |
| **CONTENT-10** | Resume + LinkedIn + Behavioural STAR subject |
| **CONTENT-11** | Wire all 5 into `mock-data/subjects.ts` + expand Service Company Cracker + add OS/CN/Resume to Product Company Cracker |
| **PERF-3** | Split `SubjectMarkdownReader` "use client" into RSC shell + interactive islands |
| **TEST-2** | `lib/__tests__/users-store.test.ts` — handle validation + reserved-list tests (10 cases) |
| **CYCLE-4** | Build + smoke + this report |

---

## 4. Diffs

### Content (5 new markdown files, 5181 lines)

```
content/aptitude-logical.md             NEW   1012
content/aptitude-verbal.md              NEW    919
content/os-complete.md                  NEW   1298
content/networks-complete.md            NEW    961
content/resume-behavioural.md           NEW    991
```

### Wiring (mock-data updates)

```
lib/mock-data/subjects.ts              +280  5 new subject entries with topics
lib/mock-data/roadmaps.ts              +35   service-company-cracker expanded; product-company-cracker gets OS/CN/Resume
```

### Engineering (RSC migration)

```
lib/toc.ts                              NEW    extractToc helper (pure, importable from RSC)
components/dashboard/on-page-toc.tsx    -22 +5  re-exports from lib/toc; client-only behavior preserved
components/dashboard/subject-markdown-reader.tsx    -10 +20  drop "use client", import extractToc from lib/toc, RSC-rendered shell with client islands inside (MarkCompleteButton, FeedbackWidget, OnPageToc, MarkdownRenderer's lazy code/mermaid)
```

### Tests

```
lib/__tests__/users-store.test.ts       NEW   10 new tests (normaliseHandle / isValidHandle / isReservedHandle)
```

Total: ~5500 lines added across 9 files.

---

## 5. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ 559 routes (unchanged — content-only additions)
```

### Tests
```
npm test                                      ✓ 4 files / 27 tests pass
                                              + 10 users-store tests added in cycle 4
```

### Smoke (port 3001, prod build)

| # | Check | Result |
|---|-------|--------|
| 1 | Homepage 200 | ✅ |
| 2 | Search index has all 10 placement-prep entries (Aptitude × 3, DBMS, OS, Networks, LLD, Resume, Service Cracker, Product Cracker) — total 542 items | ✅ all 10 |
| 3 | Razorpay webhook bad sig → 401 | ✅ |
| 4 | `/api/me` unauthed → 401 | ✅ |
| 5 | `/api/checkout/create-order` unauthed → 401 | ✅ |
| 6 | All 27 vitest tests still green | ✅ |

---

## 6. Original Cycle-2 plan — completion table

| # | Subject | Status | Cycle |
|---|---------|--------|-------|
| 1 | Aptitude — Quant | ✅ | 3 |
| 2 | Aptitude — Logical | ✅ | **4** |
| 3 | Aptitude — Verbal | ✅ | **4** |
| 4 | DBMS Complete | ✅ | 3 |
| 5 | Operating Systems | ✅ | **4** |
| 6 | Computer Networks | ✅ | **4** |
| 7 | Low-Level Design | ✅ | 2 |
| 8 | Resume + LinkedIn + Behavioural STAR | ✅ | **4** |
| 9 | Service Company Cracker roadmap | ✅ | 3 (expanded in 4) |
| 10 | Product Company Cracker roadmap | ✅ | 2 (expanded in 4) |

**Original cycle-2 plan: 10/10 ✓ closed.**

---

## 7. Layer 0–4 progress vs cycle-3 end

| Layer | Cycle 3 end | Cycle 4 end | Δ |
|-------|-------------|-------------|---|
| **Layer 0 — Foundations** (12) | 5 | **7** (+OS, +CN) | +2 |
| **Layer 1 — Specialisation tracks** (15) | 4 | 4 | — |
| **Layer 2 — Interview craft** (9) | 2 | **5** (+Behavioural, +Resume, +LinkedIn — packaged into one subject; counts as 3 line items in the Layer-2 map) | +3 |
| **Layer 3 — India-specific exam playbooks** (10) | 0 | 0 | — |
| **Layer 4 — Portfolio / Proof of work** (5) | 0 | 0 | — |
| **Total covered** | 11/51 (22%) | **16/51 (31%)** | +5 |

Layer 0 is the floor for placement-eligibility. After cycle 4: **7/12 = 58% of foundations live** (still missing C/C++/Python language mastery, Discrete Math, COA, Compiler/TOC, OOPS deep). The two crucial gaps for Service-Company eligibility (Aptitude × 3 + DBMS + OS + CN + Resume + DSA + Git + SQL) are now all live.

---

## 8. Engineering polish

- `SubjectMarkdownReader` now renders fully server-side. The client islands are: `<MarkdownRenderer>`'s lazy code/mermaid, `<MarkCompleteButton>`, `<FeedbackWidget>`, `<OnPageToc>`. This combined with cycle 3's `MarkdownRenderer` RSC migration means subject pages ship the *minimum* JS — text + layout + small island bundles.
- `extractToc` lifted into `lib/toc.ts` (pure helper) so RSC can import it without dragging the OnPageToc client component through the server bundle boundary.
- Test count: 17 → **27** (added 10 users-store tests).

---

## 9. Counters

| Metric | C1 | C2 | C3 | C4 |
|--------|----|----|----|----|
| Routes built | 557 | 558 | 559 | 559 |
| Subjects | 50 | 51 | 53 | **58** (+5) |
| Roadmaps | 5 | 6 | 7 | 7 |
| Test files | 0 | 0 | 3 | **4** |
| Tests passing | n/a | n/a | 17 | **27** |
| Indexes on Neon | 4 | 13 | 13 | 13 |
| Cached hot paths | 0 | 2 | 4 | 4 |
| Per-IP-protected endpoints | 0 | 5 | 7 | 7 |
| `waitUntil` call sites | 0 | 0 | 12 | 12 |
| Content lines on disk | ~50K | ~52K | ~55K | **~60K** |

---

## 10. Deferred to cycle 5

### Content (Layer 1 + Layer 3 — biggest moats remaining)

**Layer 1 — Specialisation tracks (highest hiring volume):**
- MERN / MEAN Stack roadmap (#1 hired track at Indian product startups)
- Backend Engineer (Node/Python/Go) roadmap
- Mobile — Android (Kotlin) roadmap
- Mobile — Flutter / React Native roadmap
- Data Engineer roadmap
- ML Engineer / Data Scientist roadmap (distinct from Data Analyst)
- QA / SDET roadmap
- DevSecOps / AppSec roadmap

**Layer 3 — India-specific exam playbooks (1M+ aspirants per playbook):**
- TCS NQT Complete Prep (deep — coding rounds + email writing + verbal patterns specific to TCS)
- Infosys SP / Power Programmer (the harder cousin)
- Cognizant GenC + GenC Next
- Capgemini Pseudocode + Game-based
- AMCAT / CoCubes / eLitmus (off-campus path)
- GATE CSE
- Off-campus drive playbook (LinkedIn cold-outreach + ATS hacks)
- FAANG India internship/fresher prep (Google STEP, Amazon WoW, Microsoft Engage)

**Layer 0 — remaining foundations:**
- C / C++ language mastery subject (most freshers DSA in C++)
- Python deep subject (most ML projects)
- Discrete Math + DM for CS
- OOPS Deep (currently partial via clean-code-solid)

**Layer 2 — additional interview craft:**
- Mock Interview Playbook (separate from STAR)
- Group Discussion (GD) prep
- English Communication for Tech (tier-2/3 pain point)

**Layer 4 — Portfolio (zero coverage):**
- 20-project capstone bank
- Open Source contribution guide
- Hackathons playbook

### Engineering / DX
- `revalidate: 300` on `/roadmaps`, `/subjects` (move user-specific bits to Suspense'd client island)
- CodeMirror 6 mobile editor (textarea remains painful on phone)
- Integration tests against a Neon test DB or PG container, especially Razorpay webhook flow
- Playwright for e2e (signup → solve → leaderboard → upgrade flow)
- DEPLOY.md update for the new content + roadmap surfaces

---

## 11. User verdict

> **Pending — awaiting verification.**

If satisfied: cycle complete. The placement-readiness floor is now live; cycle 5 ships the volume layer (Layer 3 exam playbooks where 1M+ aspirants are gated) plus the highest-hiring Layer 1 tracks (MERN / Backend / Mobile / SDET).
