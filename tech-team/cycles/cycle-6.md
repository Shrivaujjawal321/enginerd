# Cycle 6 — Portfolio + Volume Expansion

**Date:** 2026-05-02
**Theme:** Open Layer 4 (zero coverage today) + finish the foundation language gap (C++) + ship the next-biggest specialisation track (ML Engineer) + close the next-biggest exam playbook (Infosys SP).

---

## 1. Why this cycle

Cycle 5 nailed Volume + Tracks for the most-hired roles. Cycle 6 attacks the gaps that show up *after* a student has the technical foundation:

1. **Layer 4 had zero coverage** — yet portfolio + open source are what recruiters actually scan first. Two new subjects + one Portfolio Builder roadmap fix that.
2. **C/C++ is the DSA-primary language for ~60% of Indian students** — JS/Java/Python existed but the contest-fastest language did not. Foundation closure.
3. **Infosys SP is the volume #2 placement test** (~500k aspirants/year) — after TCS NQT this is the next biggest playbook.
4. **ML Engineer / Data Scientist** was missing as a distinct track from Data Analyst + GenAI Engineer — Razorpay risk / Swiggy ETA / CRED fraud / Hotstar churn teams hire here at 12-50 LPA.

---

## 2. Audit — 5 specialist content authors in parallel

| Agent | Subject | File | Lines |
|-------|---------|------|------|
| C++ Mastery author | `content/cpp-mastery.md` | 1675 |
| ML Engineer author | `content/ml-engineer.md` | 1150 |
| Infosys SP Playbook author | `content/infosys-sp-playbook.md` | 1225 |
| Capstone Bank author | `content/capstone-bank.md` | 974 |
| Open Source Guide author | `content/open-source-guide.md` | 1094 |

**Total: 6118 new lines of content** in one parallel sweep. Same template applied: Hinglish narration, precise English code/math, mermaid diagrams, runnable code (Python / C++ / scikit-learn / PyTorch / git+gh CLI), Indian product-co anecdotes, top-N interview tables, pre-interview checklists, cross-links.

---

## 3. Cycle plan — 7 items

| Tag | Subject |
|-----|---------|
| **CONTENT-17** | C / C++ Mastery subject |
| **CONTENT-18** | ML Engineer / Data Scientist subject |
| **CONTENT-19** | Infosys SP / Power Programmer Playbook |
| **CONTENT-20** | 20-Project Capstone Bank |
| **CONTENT-21** | Open Source Contribution Guide |
| **CONTENT-22** | Wire 5 new subjects + 3 new roadmaps + Portfolio category |
| **CYCLE-6** | Build + smoke + this report |

---

## 4. Diffs

### Content (5 new markdown files, 6118 lines)

```
content/cpp-mastery.md                   NEW   1675
content/ml-engineer.md                   NEW   1150
content/infosys-sp-playbook.md           NEW   1225
content/capstone-bank.md                 NEW    974
content/open-source-guide.md             NEW   1094
```

### Wiring (mock-data updates)

```
lib/mock-data/types.ts                   +1    "Portfolio" RoadmapCategory
lib/mock-data/subjects.ts                +400  5 new subject entries with topics
lib/mock-data/roadmaps.ts                +135  ml-engineer / infosys-sp-cracker / portfolio-builder
```

Total: ~6700 lines added across 8 files.

---

## 5. New roadmaps

### ML Engineer / Data Scientist (12-50 LPA)
**Audience:** engineers targeting Indian product-co ML / DS teams.
**Stack:** Python + classical ML (sklearn / XGBoost / LightGBM) + DL intro + MLOps (FastAPI / MLflow / Feast) + business framing.
**Duration:** 8 months.
**Companies:** Razorpay, Swiggy, Zomato, CRED, Hotstar.

### Infosys SP / Power Programmer Cracker (8-11.25 LPA)
**Audience:** ~500k aspirants/year.
**Stack:** Aptitude × 3 + Python + Infosys SP Playbook (pseudocode + HackerEarth coding + technical-flavoured HR) + DBMS + Resume.
**Duration:** 3 months.
**Score targets:** SP (8 LPA) / Power Programmer (11.25 LPA).

### Portfolio Builder
**Audience:** any student in any specialisation track.
**Stack:** 20-project capstone bank + open source guide + git + resume/behavioural.
**Duration:** 4 months (parallel to specialisation roadmap).
**Why independent:** unlike the technical roadmaps, this layers ON TOP of any specialisation.

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
| 1 | Search index has all 7 cycle-6 entries (`cpp-mastery`, `ml-engineer`, `infosys-sp-playbook`, `capstone-bank`, `open-source-guide`, `infosys-sp-cracker`, `portfolio-builder`) — total 557 items | ✅ all 7 |
| 2 | Vitest 27/27 green | ✅ |
| 3 | Razorpay webhook bad sig → 401 | ✅ |
| 4 | Homepage 200 | ✅ |

---

## 7. Layer 0–4 progress vs cycle-5 end

| Layer | Cycle 5 end | Cycle 6 end | Δ |
|-------|-------------|-------------|---|
| **Layer 0 — Foundations** (12) | 8 | **9** (+C/C++) | +1 |
| **Layer 1 — Specialisation tracks** (15) | 6 | **7** (+ML Engineer) | +1 |
| **Layer 2 — Interview craft** (9) | 5 | 5 | — |
| **Layer 3 — India-specific exam playbooks** (10) | 1 | **2** (+Infosys SP) | +1 |
| **Layer 4 — Portfolio / Proof of work** (5) | 0 | **2** (+Capstone Bank, +OSS Guide) | +2 |
| **Total covered** | 20/51 (39%) | **25/51 (49%)** | +5 |

**Layer 4 finally moved off zero.** Overall coverage is now nearly half the placement-readiness map.

---

## 8. Counters

| Metric | C1 | C2 | C3 | C4 | C5 | **C6** |
|--------|----|----|----|----|----|----|
| Routes built | 557 | 558 | 559 | 559 | 559 | 559 |
| Subjects | 50 | 51 | 53 | 58 | 62 | **67** (+5) |
| Roadmaps | 5 | 6 | 7 | 7 | 10 | **13** (+3) |
| Test files | 0 | 0 | 3 | 4 | 4 | 4 |
| Tests passing | n/a | n/a | 17 | 27 | 27 | 27 |
| Indexes on Neon | 4 | 13 | 13 | 13 | 13 | 13 |
| Cached hot paths | 0 | 2 | 4 | 4 | 4 | 4 |
| `loading.tsx` skeletons | 3 | 8 | 8 | 8 | 9 | 9 |
| Content lines on disk | ~50K | ~52K | ~55K | ~60K | ~74K | **~80K** |

---

## 9. Deferred to cycle 7

### Content (Layer 1 — track expansion remaining)
- Backend Engineer (Python/Go) roadmap
- Mobile — Flutter / React Native
- Data Engineer (Spark / Airflow / dbt)
- QA / SDET
- DevSecOps / AppSec

### Content (Layer 3 — Indian exam playbooks remaining)
- Cognizant GenC + GenC Next playbook
- Capgemini Pseudocode + Game-based playbook
- AMCAT / CoCubes / eLitmus (off-campus path)
- GATE CSE
- Off-campus drive playbook (LinkedIn cold-outreach + ATS hacks)
- FAANG India internship/fresher prep (Google STEP, Amazon WoW, Microsoft Engage)

### Content (Layer 0 — remaining foundations)
- Discrete Math + DM for CS
- OOPS Deep (currently partial via clean-code-solid)
- COA, Compiler/TOC (lower priority)

### Content (Layer 4 — remaining portfolio)
- Hackathons playbook
- Build-in-public + Twitter/LinkedIn engineering
- Freelancing while studying

### Layer 2 — additional interview craft
- Mock Interview Playbook (separate from STAR)
- Group Discussion (GD) prep
- English Communication for Tech

### Engineering / DX
- Sidebar surfacing of new roadmaps (currently only on `/roadmaps`)
- `revalidate: 300` on `/roadmaps`, `/subjects` (move user-specific bits to Suspense'd client island)
- CodeMirror 6 mobile editor
- Integration tests against a Neon test DB
- Playwright e2e (signup → solve → leaderboard → upgrade flow)

---

## 10. User verdict

> **Pending — awaiting verification.**

After cycle 6 we're 49% covered on the placement-readiness map and **all 5 layers have at least one entry shipped** — the platform now genuinely covers the breadth of placement preparation, not just one slice.

Cycle 7 should attack the remaining Indian exam playbooks (Cognizant + Capgemini + AMCAT + Off-campus + FAANG), the remaining Layer 1 tracks (Backend + Flutter + Data Eng + SDET), and the Layer 4 finishers (Hackathons + Build-in-public + Freelancing).
