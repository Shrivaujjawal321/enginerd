# Cycle 5 — Volume + Tracks

**Date:** 2026-05-02
**Theme:** Ship the volume play (TCS NQT, 1M+ aspirants/year) and the highest-hiring specialisation tracks (MERN, Android) so the platform graduates from "placement-eligible" to "placement-competitive".

---

## 1. Why this cycle

Cycle 4 closed Layer 0 / Layer 2 (the floor — every student is now interview-eligible). Cycle 5 attacks two compounding angles:

1. **Volume** — TCS NQT has 1M+ aspirants per year. Owning that prep = brand-defining surface for the Indian student market.
2. **Tracks** — Cycle 4 left Layer 1 untouched. MERN is the #1 hired track at Indian product startups; Android is hire-volume-#2 at Indian consumer products (Swiggy/Zomato/PhonePe/CRED).

Both delivered. Plus one foundation-language gap closed (Python — needed for DSA + ML + TCS coding round).

---

## 2. Audit — 4 specialist content authors in parallel

| Agent | Subject | File | Lines |
|-------|---------|------|------|
| TCS NQT Playbook author | `content/tcs-nqt-playbook.md` | 1202 |
| Node.js + Backend author | `content/nodejs-backend.md` | 1269 |
| Python Mastery author | `content/python-mastery.md` | 1691 |
| Android (Kotlin) author | `content/android-kotlin.md` | 1740 |

**Total: 5902 new lines of content** in one parallel sweep. Same template applied: Hinglish narration, precise English code/math, mermaid diagrams, runnable code (Python/JS/TS/Kotlin), Indian product-co anecdotes, top-N interview tables, pre-interview checklists, "What to learn next" cross-links.

---

## 3. Cycle plan — 8 items

| Tag | Subject |
|-----|---------|
| **CONTENT-12** | TCS NQT Complete Playbook subject |
| **CONTENT-13** | Node.js + Express + Backend subject |
| **CONTENT-14** | Python Mastery subject |
| **CONTENT-15** | Android (Kotlin) Mobile subject |
| **CONTENT-16** | Wire 4 new subjects (`subjects.ts`) + 3 new roadmaps (`roadmaps.ts`) |
| **DOC-1** | DEPLOY.md updated with cycle 5 surfaces + cycle 1-5 highlights section |
| **UI-4** | `/u/[handle]` `loading.tsx` skeleton |
| **CYCLE-5** | Build + smoke + this report |

---

## 4. Diffs

### Content (4 new markdown files, 5902 lines)

```
content/tcs-nqt-playbook.md             NEW   1202
content/nodejs-backend.md               NEW   1269
content/python-mastery.md               NEW   1691
content/android-kotlin.md               NEW   1740
```

### Wiring (mock-data updates)

```
lib/mock-data/subjects.ts              +320  4 new subject entries with topics
lib/mock-data/roadmaps.ts              +130  tcs-nqt-cracker, mern-stack-developer, android-developer
```

### UX

```
app/u/[handle]/loading.tsx              NEW   skeleton matching public profile layout
```

### Docs

```
DEPLOY.md                               +25   launch checklist additions, cycle 1-5 highlights
```

Total: ~6400 lines added across 8 files.

---

## 5. New roadmaps

### TCS NQT Cracker — Volume Play (3-9 LPA)
**Audience:** 1M+ aspirants per year.
**Stack:** Aptitude × 3 + Python (TCS coding round) + TCS-specific playbook + Resume + Behavioural.
**Duration:** 2 months.
**Score targets:** Ninja (3.36 LPA) / Digital (7 LPA) / Prime (9 LPA) / CodeVita.

### MERN Stack Developer — Indian Startups (8-25 LPA)
**Audience:** Tier-2 to product-startup engineers.
**Stack:** HTML / CSS / JS / React / Next + Node + Express + Postgres + Mongo + System Design + LLD + Git.
**Duration:** 6 months.
**Companies:** Razorpay, Zomato, Swiggy, Postman, CRED.

### Android Developer (Kotlin + Compose) — 6-22 LPA
**Audience:** Students targeting Indian consumer products.
**Stack:** Kotlin + Jetpack Compose + ViewModel/StateFlow + Room + Retrofit + Hilt + Coroutines + Networks + LLD + System Design + Java basics + Git.
**Duration:** 5 months.
**Companies:** Swiggy, Zomato, PhonePe, Paytm, CRED.

---

## 6. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ 559 routes (unchanged — content-only)
```

### Tests
```
npm test                                      ✓ 4 files / 27 tests pass
```

### Smoke (port 3001, prod build)

| # | Check | Result |
|---|-------|--------|
| 1 | Search index has all 7 cycle-5 entries (`tcs-nqt-playbook`, `nodejs-backend`, `python-mastery`, `android-kotlin`, `tcs-nqt-cracker`, `mern-stack-developer`, `android-developer`) — total 549 items | ✅ all 7 |
| 2 | Vitest 27/27 green | ✅ |
| 3 | Razorpay webhook bad sig → 401 | ✅ |
| 4 | `/api/me` unauthed → 401 | ✅ |
| 5 | Homepage 200 | ✅ |

---

## 7. Layer 0–4 progress vs cycle-4 end

| Layer | Cycle 4 end | Cycle 5 end | Δ |
|-------|-------------|-------------|---|
| **Layer 0 — Foundations** (12) | 7 | **8** (+Python) | +1 |
| **Layer 1 — Specialisation tracks** (15) | 4 | **6** (+MERN, +Android) | +2 |
| **Layer 2 — Interview craft** (9) | 5 | 5 | — |
| **Layer 3 — India-specific exam playbooks** (10) | 0 | **1** (+TCS NQT) | +1 |
| **Layer 4 — Portfolio / Proof of work** (5) | 0 | 0 | — |
| **Total covered** | 16/51 (31%) | **20/51 (39%)** | +4 |

The Layer 3 needle finally moved — TCS NQT is the highest-volume single-playbook in the entire map.

---

## 8. Counters

| Metric | C1 | C2 | C3 | C4 | C5 |
|--------|----|----|----|----|----|
| Routes built | 557 | 558 | 559 | 559 | 559 |
| Subjects | 50 | 51 | 53 | 58 | **62** (+4) |
| Roadmaps | 5 | 6 | 7 | 7 | **10** (+3) |
| Test files | 0 | 0 | 3 | 4 | 4 |
| Tests passing | n/a | n/a | 17 | 27 | 27 |
| Indexes on Neon | 4 | 13 | 13 | 13 | 13 |
| Cached hot paths | 0 | 2 | 4 | 4 | 4 |
| `loading.tsx` skeletons | 3 | 8 | 8 | 8 | **9** (+1) |
| Content lines on disk | ~50K | ~52K | ~55K | ~60K | **~74K** (+14K across cycles 4-5) |

---

## 9. Deferred to cycle 6

### Content (Layer 1 — track expansion)
- **Backend Engineer (Python/Go)** roadmap — separate from MERN, language-agnostic
- **Mobile — Flutter / React Native** roadmap (parallel to Android-Kotlin)
- **Data Engineer** (Spark/Airflow/dbt) roadmap
- **ML Engineer / Data Scientist** roadmap (distinct from Data Analyst — has it; from GenAI Engineer — has it)
- **QA / SDET** roadmap
- **DevSecOps / AppSec** roadmap

### Content (Layer 3 — Indian exam playbooks)
- Infosys SP / Power Programmer playbook
- Cognizant GenC + GenC Next playbook
- Capgemini Pseudocode + Game-based playbook
- AMCAT / CoCubes / eLitmus (off-campus path)
- GATE CSE
- Off-campus drive playbook (LinkedIn cold-outreach + ATS hacks)
- FAANG India internship/fresher prep

### Content (Layer 0 — remaining foundations)
- C / C++ language mastery (DSA-language for ~60% of students)
- Discrete Math + DM for CS
- OOPS Deep (currently partial via clean-code-solid)
- COA, Compiler/TOC (lower priority)

### Content (Layer 4 — portfolio, zero coverage)
- 20-project capstone bank
- Open Source contribution guide
- Hackathons playbook
- Build-in-public playbook
- Freelancing while studying

### Engineering / DX
- `revalidate: 300` on `/roadmaps`, `/subjects` (move user-specific bits to client island)
- CodeMirror 6 mobile editor (textarea remains painful on phone)
- Integration tests against a Neon test DB (especially Razorpay webhook flow end-to-end)
- Playwright e2e (signup → solve → leaderboard → upgrade flow)
- Sidebar surfacing of new roadmaps (currently only in /roadmaps page)

---

## 10. User verdict

> **Pending — awaiting verification.**

If satisfied: cycle complete. The Service / Product / TCS / MERN / Android roadmaps now form a coherent placement-prep stack — a tier-2 college student can pick exactly one and follow it end-to-end. Cycle 6 finishes the remaining Layer 1 specialisation tracks (Backend / Mobile-Flutter / Data Eng / ML Eng / QA), starts Layer 4 portfolio coverage, and ships the next 2-3 Indian exam playbooks (Infosys SP, Cognizant GenC, off-campus drive).
