# Cycle 7 — Layer 1 Finish + Layer 3 Long-tail + Layer 4 Closure

**Date:** 2026-05-02
**Theme:** Close the remaining high-volume Layer 1 tracks (Data Engineer + QA/SDET), open the long-tail Layer 3 playbooks (Off-campus + FAANG India), and finish Layer 4 (Hackathons + Build-in-Public + Freelancing).

---

## 1. Why this cycle

Cycle 6 hit 49% coverage (25/51) and got Layer 4 off zero. Cycle 7's job is to push past 60% by attacking the deferred queue's next-highest-leverage items:

1. **Data Engineer** — 2026's fastest-growing role at Indian product cos
2. **QA / SDET** — most-underrated entry into Indian tech (low bar, fast SDE upgrade)
3. **Off-Campus Drive Playbook** — tier-3 reality (40% of Indian product co hires are off-campus)
4. **FAANG India Prep** — top-1% intern programs (Google STEP / Amazon WoW / MS Engage)
5. **Hackathons + Build-in-Public + Freelancing** — Layer 4 finishers
6. **Sidebar surfacing** — Placement Tracks section so the new roadmaps actually get found

---

## 2. Audit — 5 specialist content authors in parallel

| Agent | Subject | File | Lines |
|-------|---------|------|------|
| Data Engineer author | `content/data-engineer.md` | 1459 |
| QA / SDET author | `content/qa-sdet.md` | 1121 |
| Off-Campus Drive Playbook author | `content/off-campus-playbook.md` | 1065 |
| FAANG India Prep author | `content/faang-india-prep.md` | 870 |
| Hackathons + BiP + Freelancing author | `content/hackathons-bip-freelancing.md` | 1134 |

**Total: 5649 new lines of content** in one parallel sweep.

---

## 3. Cycle plan — 8 items

| Tag | Subject |
|-----|---------|
| **CONTENT-23** | Data Engineer subject |
| **CONTENT-24** | QA / SDET subject |
| **CONTENT-25** | Off-Campus Drive Playbook |
| **CONTENT-26** | FAANG India Internship + Fresher Prep |
| **CONTENT-27** | Hackathons + Build-in-Public + Freelancing |
| **CONTENT-28** | Wire 5 new subjects + 3 new roadmaps |
| **UI-5** | Sidebar — `Placement Tracks` section linking 5 highest-leverage roadmaps |
| **CYCLE-7** | Build + smoke + this report |

---

## 4. Diffs

### Content (5 new markdown files, 5649 lines)

```
content/data-engineer.md                 NEW   1459
content/qa-sdet.md                       NEW   1121
content/off-campus-playbook.md           NEW   1065
content/faang-india-prep.md              NEW    870
content/hackathons-bip-freelancing.md    NEW   1134
```

### Wiring (mock-data updates)

```
lib/mock-data/subjects.ts                +405  5 new subject entries with topics
lib/mock-data/roadmaps.ts                +135  data-engineer / qa-sdet-cracker / off-campus-cracker; portfolio-builder gets hackathons-bip
```

### UX

```
components/dashboard/sidebar.tsx         +60   PLACEMENT_TRACKS section with 5 highest-leverage roadmaps
```

Total: ~6250 lines added across 8 files.

---

## 5. New roadmaps

### Data Engineer (14-65 LPA)
**Audience:** engineers targeting Indian product-co data orgs.
**Stack:** Python + SQL + DBMS + Spark + Airflow + dbt + Kafka + system design.
**Duration:** 7 months.
**Companies:** Razorpay, Swiggy, Zomato, CRED, Paytm.

### QA / SDET Cracker (6-25 LPA)
**Audience:** tier-2/3 students who can't crack SDE round 1 immediately.
**Stack:** Manual QA + Playwright/Cypress + API testing + k6 + Appium + LLD + Resume.
**Duration:** 5 months.
**Companies:** Razorpay, Postman, Swiggy, Zomato, CRED.
**Upgrade path:** SDET → SDE-2 within 2-3 yrs at companies with explicit ladder (Razorpay, Atlan).

### Off-Campus Drive Cracker
**Audience:** any student without a strong placement cell (most tier-3 colleges).
**Stack:** Off-campus playbook + FAANG India intern playbook + Resume + OSS + Capstone + LLD.
**Duration:** 4 months.
**Why independent:** layers on top of any specialisation — solves distribution, not knowledge.

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
| 1 | Search index has all 7 cycle-7 entries (`data-engineer`, `qa-sdet`, `off-campus-playbook`, `faang-india-prep`, `hackathons-bip-freelancing`, `qa-sdet-cracker`, `off-campus-cracker`) — total 565 items | ✅ all 7 |
| 2 | Vitest 27/27 green | ✅ |
| 3 | Razorpay webhook bad sig → 401 | ✅ |
| 4 | Homepage 200 | ✅ |

---

## 7. Layer 0–4 progress vs cycle-6 end

| Layer | Cycle 6 end | Cycle 7 end | Δ |
|-------|-------------|-------------|---|
| **Layer 0 — Foundations** (12) | 9 | 9 | — |
| **Layer 1 — Specialisation tracks** (15) | 7 | **9** (+Data Eng, +QA/SDET) | +2 |
| **Layer 2 — Interview craft** (9) | 5 | 5 | — |
| **Layer 3 — India-specific exam playbooks** (10) | 2 | **4** (+Off-campus, +FAANG India) | +2 |
| **Layer 4 — Portfolio / Proof of work** (5) | 2 | **5** (+Hackathons, +BiP, +Freelancing all in one subject) | +3 |
| **Total covered** | 25/51 (49%) | **32/51 (63%)** | +7 |

**Layer 4 is now 100% covered** (all 5 finishers shipped — Capstone Bank, OSS Guide, Hackathons, Build-in-Public, Freelancing).

---

## 8. Counters

| Metric | C1 | C2 | C3 | C4 | C5 | C6 | **C7** |
|--------|----|----|----|----|----|----|----|
| Routes built | 557 | 558 | 559 | 559 | 559 | 559 | 559 |
| Subjects | 50 | 51 | 53 | 58 | 62 | 67 | **72** (+5) |
| Roadmaps | 5 | 6 | 7 | 7 | 10 | 13 | **16** (+3) |
| Test files | 0 | 0 | 3 | 4 | 4 | 4 | 4 |
| Tests passing | n/a | n/a | 17 | 27 | 27 | 27 | 27 |
| `loading.tsx` skeletons | 3 | 8 | 8 | 8 | 9 | 9 | 9 |
| Sidebar nav items | 5 + 2 | 5 + 2 | 5 + 2 | 5 + 2 | 5 + 2 | 5 + 2 | **10 + 2** (+ Placement Tracks section) |
| Content lines on disk | 50K | 52K | 55K | 60K | 74K | 80K | **~85K** |
| Layer-4 coverage | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 | 2/5 | **5/5 (100%)** |

---

## 9. Deferred to cycle 8

### Content (Layer 1 — 6 tracks remaining)
- Backend Engineer (Python/Go) — language-agnostic, separate from MERN
- Mobile — Flutter / React Native
- DevSecOps / AppSec
- Embedded / IoT
- Game Dev (Unity / Unreal) — lower priority
- Blockchain / Web3 — lowest priority

### Content (Layer 3 — 6 playbooks remaining)
- Cognizant GenC + GenC Next
- Capgemini Pseudocode + Game-based
- AMCAT / CoCubes / eLitmus (off-campus path — but generic, distinct from off-campus playbook)
- GATE CSE
- PSU recruitment via GATE (BHEL / IOCL / ONGC)
- Accenture / Deloitte / Wipro WILP

### Content (Layer 0 — 3 foundations remaining)
- Discrete Math + DM for CS
- OOPS Deep (currently partial via clean-code-solid)
- COA, Compiler/TOC (lower priority, niche interview value)

### Layer 2 — additional interview craft
- Mock Interview Playbook (separate from STAR — covers the rubric + practice cadence)
- Group Discussion (GD) prep
- English Communication for Tech (tier-2/3 pain point)

### Engineering / DX
- `revalidate: 300` on `/roadmaps`, `/subjects` (move user-specific bits to Suspense'd client island)
- CodeMirror 6 mobile editor (textarea remains painful on phone-sized screens)
- Integration tests against a Neon test DB (especially Razorpay webhook flow end-to-end)
- Playwright e2e (signup → solve → leaderboard → upgrade flow)
- Public roadmap pages (logged-out users can preview /roadmaps to drive signup conversion)

---

## 10. User verdict

> **Pending — awaiting verification.**

Cycle 7 milestones:
- **Layer 4 is 100% complete** — every Portfolio sub-topic covered
- **Layer 1 at 60% (9/15)** — all top-volume tracks shipped except Backend, Flutter, DevSecOps
- **Layer 3 at 40% (4/10)** — TCS NQT + Infosys SP + Off-campus + FAANG covered; remaining are smaller-volume playbooks
- **Sidebar surfacing** means new roadmaps are now actually discoverable

Overall coverage **63% (32/51)**. Cycle 8 should finish Layer 1 (Backend + Flutter + DevSecOps) and tackle the next 2-3 Layer 3 playbooks (Cognizant + Capgemini + AMCAT) so we cross 75% coverage.
