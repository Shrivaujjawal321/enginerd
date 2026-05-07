# Cycle 8 — Layer 1 Finish + Layer 2 Closure + Foundation Closure

**Date:** 2026-05-02
**Theme:** Push past 75% placement-readiness coverage. Close the high-value remaining tracks (Backend Py/Go + Cross-platform mobile + DevSecOps), close the Layer 2 missing trio (Mock Interview + GD + English Comm), and close Layer 0 with Discrete Math + Advanced OOP.

---

## 1. Why this cycle

After cycle 7 we were at 63% (32/51). Cycle 8 attacks the next-highest-leverage gaps:

1. **Backend (Py/Go)** — the non-MERN backend stack at Razorpay/Swiggy/Atlan/Cred
2. **Flutter / RN** — cross-platform mobile is the dominant Indian startup mobile pattern
3. **DevSecOps / AppSec** — highest-paid + lowest-supply Indian tech track (18-100 LPA)
4. **Discrete Math + Advanced OOP** — Layer-0 closure (GATE-needed math + OOP fluency)
5. **Mock Interview + GD + English Communication** — Layer-2 closure (the trio of tier-2/3 communication gaps)

Plus an engineering UX win:

6. **Public roadmap + subject previews** — `/roadmaps` and `/subjects` now render for unauthed visitors. Per-user state (progress, mark-complete) gates inside; catalog is open. Drives signup conversion.

---

## 2. Audit — 5 specialist content authors in parallel

| Agent | Subject | File | Lines |
|-------|---------|------|------|
| Backend (Py/Go) author | `content/backend-py-go.md` | 1843 |
| Cross-platform mobile author | `content/cross-platform-mobile.md` | 1507 |
| DevSecOps / AppSec author | `content/devsecops-appsec.md` | 1231 |
| Discrete Math + OOP author | `content/discrete-math-oop.md` | 1368 |
| Mock Interview + GD + Comm author | `content/mock-interview-comm.md` | 870 |

**Total: 6819 new lines of content** in one parallel sweep.

---

## 3. Cycle plan — 8 items

| Tag | Subject |
|-----|---------|
| **CONTENT-29** | Backend Engineer (Python + Go) subject |
| **CONTENT-30** | Cross-Platform Mobile (Flutter + React Native) subject |
| **CONTENT-31** | DevSecOps / AppSec subject |
| **CONTENT-32** | Discrete Math + Advanced OOP subject |
| **CONTENT-33** | Mock Interview + GD + English Communication subject |
| **CONTENT-34** | Wire 5 new subjects + 3 new roadmaps |
| **UI-6** | `/roadmaps` and `/subjects` public — removed from `PROTECTED_PREFIXES` |
| **CYCLE-8** | Build + smoke + this report |

---

## 4. Diffs

### Content (5 new markdown files, 6819 lines)

```
content/backend-py-go.md                 NEW   1843
content/cross-platform-mobile.md         NEW   1507
content/devsecops-appsec.md              NEW   1231
content/discrete-math-oop.md             NEW   1368
content/mock-interview-comm.md           NEW    870
```

### Wiring (mock-data updates)

```
lib/mock-data/subjects.ts                +445  5 new subject entries with topics
lib/mock-data/roadmaps.ts                +135  backend-engineer / flutter-rn-developer / devsecops-engineer
```

### Engineering

```
proxy.ts                                 -2    /subjects + /roadmaps removed from PROTECTED_PREFIXES
```

Total: ~7400 lines added across 8 files.

---

## 5. New roadmaps

### Backend Engineer (Python + Go) — 12-40 LPA
**Audience:** engineers targeting non-MERN backend roles.
**Stack:** Python (FastAPI / Django) + Go (gin / fiber / chi) + REST + gRPC + DB integration + system design + LLD.
**Duration:** 6 months.
**Companies:** Razorpay (Go for payments-core, Python for risk), Swiggy (Python ETA + Go logistics), Atlan, Cred, Zerodha.

### Flutter / React Native Developer — 6-22 LPA
**Audience:** Indian startup mobile engineers (the dominant pattern).
**Stack:** Flutter (Dart + Riverpod + Bloc + go_router) AND React Native (Hermes + Fabric + Zustand + Redux Toolkit).
**Duration:** 5 months.
**Companies:** PhonePe, Paytm, Flipkart Lite (Flutter); Swiggy, Dream11 (RN).

### DevSecOps / AppSec Engineer — 18-100 LPA
**Audience:** highest-paid + lowest-supply Indian tech track.
**Stack:** OWASP + STRIDE + SAST/DAST/SCA + container/K8s security + supply chain + IAM + JWT pitfalls + IR.
**Duration:** 8 months.
**Companies:** Razorpay, Cred, Zerodha, HDFC Tech, Goldman Sachs India, Wells Fargo Tech.

---

## 6. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ clean
npm run build                                 ✓ 559 routes
```

### Tests
```
npm test                                      ✓ 4 files / 27 tests pass
```

### Smoke (port 3001, prod build)

| # | Check | Result |
|---|-------|--------|
| 1 | Search index has all 8 cycle-8 entries (`backend-py-go`, `cross-platform-mobile`, `devsecops-appsec`, `discrete-math-oop`, `mock-interview-comm`, `backend-engineer`, `flutter-rn-developer`, `devsecops-engineer`) — total 573 items | ✅ all 8 |
| 2 | `/roadmaps` unauthed → 200 (now public) | ✅ |
| 3 | `/subjects` unauthed → 200 (now public) | ✅ |
| 4 | `/home` unauthed → 307 (still gated) | ✅ |
| 5 | `/billing` unauthed → 307 (still gated) | ✅ |
| 6 | Vitest 27/27 green | ✅ |
| 7 | Razorpay webhook bad sig → 401 | ✅ |

---

## 7. Layer 0–4 progress vs cycle-7 end

| Layer | Cycle 7 end | Cycle 8 end | Δ |
|-------|-------------|-------------|---|
| **Layer 0 — Foundations** (12) | 9 | **11** (+Discrete Math, +OOPS Deep — covered together in one subject) | +2 |
| **Layer 1 — Specialisation tracks** (15) | 9 | **12** (+Backend Py/Go, +Flutter/RN, +DevSecOps) | +3 |
| **Layer 2 — Interview craft** (9) | 5 | **8** (+Mock Interview, +GD, +English Comm — one combined subject) | +3 |
| **Layer 3 — India-specific exam playbooks** (10) | 4 | 4 | — |
| **Layer 4 — Portfolio / Proof of work** (5) | 5 (100%) | 5 (100%) | — |
| **Total covered** | 32/51 (63%) | **40/51 (78%)** | +8 |

**~78% coverage. Crossed the 75% threshold.** Layer 0 (foundations) is now 11/12 — only Compiler/TOC remains. Layer 2 (interview craft) is now 8/9 — only Salary Negotiation remains as a *standalone* item (resume-behavioural already covers it briefly). Layer 1 at 12/15 — only Embedded/IoT, Game Dev, Blockchain remain (lower priority by hiring volume).

---

## 8. Counters

| Metric | C1 | C2 | C3 | C4 | C5 | C6 | C7 | **C8** |
|--------|----|----|----|----|----|----|----|----|
| Routes built | 557 | 558 | 559 | 559 | 559 | 559 | 559 | 559 |
| Subjects | 50 | 51 | 53 | 58 | 62 | 67 | 72 | **77** (+5) |
| Roadmaps | 5 | 6 | 7 | 7 | 10 | 13 | 16 | **19** (+3) |
| Test files | 0 | 0 | 3 | 4 | 4 | 4 | 4 | 4 |
| Tests passing | n/a | n/a | 17 | 27 | 27 | 27 | 27 | 27 |
| Public-discoverable pages | login + landing | + login + landing | + login + landing | + login + landing | + login + landing + /u/[handle] | + same | + same | **+ /roadmaps + /subjects** |
| Content lines on disk | 50K | 52K | 55K | 60K | 74K | 80K | 85K | **~92K** |
| Layer-2 coverage | 1/9 | 2/9 | 2/9 | 5/9 | 5/9 | 5/9 | 5/9 | **8/9 (89%)** |
| Layer-0 coverage | 4/12 | 4/12 | 4/12 | 7/12 | 8/12 | 9/12 | 9/12 | **11/12 (92%)** |

---

## 9. Deferred to cycle 9

### Content (Layer 1 — 3 niche tracks remaining)
- Embedded / IoT — PSU + chip companies
- Game Dev (Unity / Unreal) — niche but growing
- Blockchain / Web3 — volatile market

### Content (Layer 3 — 6 mid-volume playbooks remaining)
- Cognizant GenC + GenC Next
- Capgemini Pseudocode + Game-based
- AMCAT / CoCubes / eLitmus
- GATE CSE
- PSU recruitment via GATE
- Accenture / Deloitte / Wipro WILP

### Content (Layer 0 — final 1)
- Compiler / Theory of Computation (niche, MS / Adobe / Google interview asks)

### Engineering / DX
- CodeMirror 6 mobile editor (the textarea remains painful on phone-sized screens)
- Integration tests against Neon test DB (especially Razorpay webhook flow end-to-end)
- Playwright e2e (signup → solve → leaderboard → upgrade flow)
- `/practice/[slug]` previews for unauthed visitors (currently auth-gated; could expose problem statement and require auth only for code submission)
- DEPLOY.md update with cycle 6-8 highlights

---

## 10. User verdict

> **Pending — awaiting verification.**

Cycle 8 milestones:
- **78% placement-readiness coverage** — crossed the 75% threshold
- **Layer 0 = 92% (11/12)**, Layer 1 = 80% (12/15), Layer 2 = 89% (8/9), Layer 4 = 100%
- **Public catalog** — `/roadmaps` and `/subjects` discoverable to unauthed visitors, drives signup conversion
- **3 new roadmaps** in the highest-leverage remaining gaps

Cycle 9 should focus on the Layer 3 long-tail (Cognizant + Capgemini + AMCAT + GATE + Wipro WILP — service-tier coverage), one or two niche Layer 1 tracks (Embedded for PSU pull), and the engineering DX backlog (Playwright e2e + CodeMirror mobile editor + integration tests).
