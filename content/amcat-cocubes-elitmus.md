# AMCAT + CoCubes + eLitmus — The Off-Campus Aptitude Triad Playbook

Bhai, sun. Tu TCS NQT ka playbook padh chuka hai (`tcs-nqt-playbook.md`). Tune `off-campus-playbook.md` bhi padh liya. Ab ek brutal truth: **TCS akela india nahi hai**. Off-campus drives mein **300+ companies** hain — Hexaware, Mphasis, MindTree, Cognizant, Capgemini, ZS Associates, Genpact, Infosys laterals, Accenture, Wipro Elite — aur ye sab **TCS NQT score nahi maangti**. Ye log apna hiring teen alag-alag aptitude platforms ke through karte hain:

- **AMCAT** (by Aspiring Minds, ab SHL ka part) — ~250k aspirants/year
- **CoCubes** (Aon Hewitt ka product) — ~150k aspirants/year
- **eLitmus pH Test** — ~200k aspirants/year, percentile-based

Ek bhi platform pe agar tu **75+ score / pH85+** le aaya — tera resume **automatically 200+ companies ke shortlist pool mein chala jaata hai**. Aur tu jaanta tak nahi hoga — recruiters tujhe khud LinkedIn pe DM karenge: "Hi, we saw your AMCAT score, would you like to interview for our Bangalore office?" **Yeh ho chuka hai. Yeh roz hota hai.** Tu agar abhi tak ye 3 tests register nahi kiye — tu apne resume ka 40% reach throw kar raha hai. Period.

Yeh playbook un teeno ka **strategic manual** hai. Aptitude fundamentals tu `aptitude-quant.md`, `aptitude-logical.md`, `aptitude-verbal.md` mein already padh chuka. Yahan hum platform-specific layer build karenge — kya structure hai, kaunsi company kaunsa cutoff dekhti hai, scoring kaise kaam karti hai, negative marking ka maths, aur 30-day combined prep plan. Chai pani saath rakh, calculator side mein rakh. Lage raho.

---

# Part 1 — AMCAT (Aspiring Minds Computer Adaptive Test)

## 1.1 What AMCAT actually is

AMCAT pehla bada off-campus aptitude platform tha jab 2010 mein Aspiring Minds (founded by Varun Aggarwal & Himanshu Aggarwal) ne launch kiya. 2019 mein **SHL (a major HR-tech company)** ne acquire kar liya. Ab AMCAT officially "SHL AMCAT" branded hai — but recruiters aur students ab bhi sirf "AMCAT" bolte hain. Important baat: **AMCAT is computer-adaptive** — matlab tu jitne sahi answer dega, agle questions utne mushkil hote jaayenge. Galat answer kiya — easier questions aane lagenge, but score range automatically gir jayega. Yeh CAT ke section-adaptive jaisa hai, but fully adaptive at question-level.

### 1.1.1 The amcatScore — module-wise out of 100

AMCAT ka score **percentile-based nahi hai** — yeh **scaled score out of 100 per module** hai. Har section ka apna score:

- English (Comprehension) — 0 to 100
- Quantitative Ability — 0 to 100
- Logical Ability — 0 to 100
- Computer Programming — 0 to 100
- Domain module (Java/C++/DBMS/Networks/etc.) — 0 to 100

**Recruiter dashboards mein tera resume aa jaata hai** if your scores cross company-specific cutoffs. Companies ke pas SHL ka portal hai — "Show me all candidates with English ≥75, Quant ≥75, Logical ≥75, CS Programming ≥70 from 2025 batch." Click. List mil gayi. Tu auto-shortlist ho gaya.

### 1.1.2 Companies that consume AMCAT directly

AMCAT score se **directly hire karne wali companies** (no separate test):

| Company | Tier | Typical AMCAT Cutoff | Role |
|---------|------|---------------------|------|
| **Hexaware** | Standard | 60+ each in Eng/Quant/Logical | Software Engineer |
| **Mphasis** | Standard-Premium | 65+ each + 70+ in Programming | Mphasis Wings/NextLabs |
| **MindTree** (mid-tier hires) | Standard | 70+ all sections | Trainee Engineer |
| **Accenture** (off-campus pool) | Standard | 60+ Eng/Quant/Logical | ASE |
| **DXC Technology** | Standard | 55+ all | Associate Professional |
| **NTT Data / Dell EMC (some roles)** | Standard | 65+ all | Engineer Trainee |
| **Tech Mahindra** (some drives) | Standard | 60+ all | Tech Associate |
| **Larsen & Toubro Infotech (LTI laterals)** | Standard | 70+ all | Engineer |
| **Sapient / Publicis Sapient** | Premium | 80+ all + 75+ Programming | Associate L1 |
| **ZS Associates** (some pools) | Premium | 85+ all + Domain 80+ | Decision Analytics Associate |

Ek aur baat: AMCAT ke through **government PSU drives** bhi hote hain — BHEL, ONGC, NTPC kabhi-kabhi assessment outsource karti hain. Tera score **2 saal tak valid** rehta hai SHL portal mein.

### 1.1.3 Premium vs standard pool — the 75+ rule

Yeh rule yaad rakh — **75+ in all 3 core modules (English, Quant, Logical)** = premium pool unlock. Niche kya milta hai:

- **Below 60** in any core: forget it. Resume even pool tak nahi pahuchta.
- **60-74** in all core: standard pool. Hexaware, DXC, Tech Mahindra, etc. CTC range 3-5 LPA.
- **75-84** in all core: enhanced pool. Mphasis Wings, Accenture, LTI, Sapient. CTC 5-8 LPA.
- **85+** in all core + 80+ in Domain: premium pool. ZS, Publicis Sapient, MindTree top, NTT premium roles. CTC 7-12 LPA.

Goal clear hai: **75 minimum, 85 ideal**. Niche jaane ka koi reason nahi hai jab section-wise retake allowed hai (more on this in 1.5).

---

## 1.2 AMCAT test structure — module by module

AMCAT ek **modular test** hai. Tu choose karta hai kitne modules attempt karne hain. Compulsory modules teen hain. Programming + Domain optional but **CS/IT students ke liye mandatory** kyunki coding role ke liye coding score chahiye.

### 1.2.1 Compulsory modules — Eng / Quant / Logical

| Module | Questions | Time | Time/Q | Score Range |
|--------|-----------|------|--------|-------------|
| English (Comprehension) | 18 | 16 min | ~53 sec | 0-100 |
| Quantitative Ability | 16 | 16 min | 60 sec | 0-100 |
| Logical Ability | 14 | 16 min | ~68 sec | 0-100 |

**Total compulsory: 48 Q in 48 min** (~75-90 min including instructions, breaks, and adaptive recalibration).

### 1.2.2 Computer Programming module (CS/IT students ke liye must)

- **25 questions in 35 min** (~84 sec/Q)
- Topics: Output prediction (40%), Bug-finding (15%), Time/Space complexity (15%), Data structures basics (15%), Algorithms basics (15%)
- Languages mostly C — but pseudo-code aur Java syntax bhi aate hain
- **Score range: 0-100**

### 1.2.3 Domain module (pick exactly 1)

Tu apne stream/role ke according ek choose karta hai:

| Domain | Questions | Time | Best For |
|--------|-----------|------|----------|
| **Computer Science (Java)** | 26 | 35 min | Most companies (default pick) |
| **C++ Programming** | 26 | 35 min | Hardware/embedded/system roles |
| **DBMS / Information Systems** | 26 | 35 min | Backend/data analyst roles |
| **Networking & Telecom** | 26 | 35 min | Networking/SRE/devops |
| **Electronics & Semiconductor** | 26 | 35 min | Core electronics companies |
| **Mechanical** | 26 | 35 min | Core mech companies |
| **Automata** (live coding, optional) | 2 problems | 45 min | Higher score boost — recommended |

### 1.2.4 Personality test — AMCAT Aspiring Minds Personality Inventory (AMPI)

- **90 questions in 20 min**
- Dimensions: Extraversion, Conscientiousness, Neuroticism, Openness, Agreeableness
- **Mostly auto-pass** — but watch out for "extreme" answers. Don't always pick "Strongly Agree" or "Strongly Disagree" — system flags inconsistency.
- **Critical rule**: kabhi-kabhi same question 2 different forms mein aata hai (e.g., "I enjoy meeting new people" and "Meeting strangers makes me uncomfortable"). Inconsistent answers = flag = recruiter dashboard pe red mark.

### 1.2.5 Total time aur AMCAT slot

Compulsory (48 min) + Programming (35 min) + Domain (35 min) + Personality (20 min) + Automata optional (45 min) = **~3 hours** including instructions/breaks. AMCAT center mein book karna padta hai (Pearson VUE / SHL center) — Bangalore, Hyderabad, Pune, Delhi, Mumbai, Chennai, Kolkata mein 200+ centers. Fee: **₹880-₹1100** depending on city. Result **2 working days mein** SHL portal pe.

### 1.2.6 Section-level cutoffs — what you actually need

Module-wise minimum to be considered "qualified":

| Module | Minimum (Standard) | Premium (75+ rule) | Elite (85+) |
|--------|-------------------|---------------------|-------------|
| English | 60 | 75 | 85 |
| Quant | 55 | 75 | 85 |
| Logical | 60 | 75 | 85 |
| Programming | 55 | 70 | 85 |
| Domain (Java/etc.) | 60 | 75 | 85 |

---

## 1.3 Computer Programming module — deep dive (most students fail here)

CS students sabse zyada is module mein gir jaate hain. Reason: woh DSA padhte hain, but **C-syntax-level output prediction** practice nahi karte. AMCAT ki specialty: **trick C code with pointer arithmetic, post/pre increment, operator precedence**. Yeh CAT-level math nahi hai — yeh **C language ka 1990s-style trivia** hai.

### 1.3.1 Topic frequency distribution (last 3 years)

| Topic | % of Questions | Difficulty |
|-------|----------------|------------|
| Pointers (output prediction) | 18-22% | High |
| Loops (nested, do-while edge cases) | 15-18% | Medium |
| Recursion (output trace) | 10-12% | High |
| Arrays (indexing, 2D) | 12-15% | Medium |
| Bit manipulation | 5-8% | Medium |
| Functions (pass-by-value/reference) | 8-10% | Medium |
| Time/Space complexity | 10-12% | Easy if practiced |
| OOP basics (Java/C++) | 8-10% | Medium |
| Data structures (stacks/queues/trees) | 5-8% | Medium |

### 1.3.2 8 Worked Examples — AMCAT-typical Programming Questions

#### Q1 — Pointer arithmetic & post-increment

```c
#include <stdio.h>
int main() {
    int a[] = {1, 2, 3, 4, 5};
    int *p = a;
    printf("%d %d", *p++, *++p);
    return 0;
}
```

**Options:** (a) 1 2  (b) 1 3  (c) 2 2  (d) Undefined behavior

**Answer:** (d) Undefined behavior in pure C standard — but on **most AMCAT compilers** (gcc-style, right-to-left evaluation), output is **`2 2`**. AMCAT mein answer (c) accept karta hai. **Trick**: arguments right-to-left evaluate hote hain. `*++p` first runs (p becomes a+1, value=2). Then `*p++` runs (value=2, then p increments). Both print 2.

**Lesson:** Never assume left-to-right. Trace step-by-step.

#### Q2 — Operator precedence

```c
int main() {
    int x = 10, y = 5;
    int z = x++ + ++y - --x + y--;
    printf("%d", z);
    return 0;
}
```

**Options:** (a) 21  (b) 22  (c) 23  (d) 20

**Answer:** Trace karte hain:
- `x++` → uses 10, then x=11
- `++y` → y=6, uses 6
- `--x` → x=10, uses 10
- `y--` → uses 6, then y=5
- `z = 10 + 6 - 10 + 6 = 12`

Wait — answer 12 list mein nahi hai. Yeh AMCAT trick: options sometimes deliberately misleading. Real answer **12** — closest to (a) 21 nahi, isko discard. Real test mein agar exact answer nahi mile, recheck calculation. **Lesson:** trust your trace, double-check.

#### Q3 — Recursion output

```c
int f(int n) {
    if (n <= 1) return 1;
    return n * f(n-1) + f(n-2);
}
int main() {
    printf("%d", f(4));
    return 0;
}
```

**Options:** (a) 24  (b) 33  (c) 41  (d) 50

**Answer:** Trace bottom-up:
- f(0) = 1, f(1) = 1
- f(2) = 2*f(1) + f(0) = 2*1 + 1 = 3
- f(3) = 3*f(2) + f(1) = 3*3 + 1 = 10
- f(4) = 4*f(3) + f(2) = 4*10 + 3 = **43**

Closest option: none exactly. AMCAT often has this trap — verify your trace. Re-run: f(4) = 4*f(3) + f(2) = 40 + 3 = 43. Real answer **43**.

**Lesson:** AMCAT will give 4 wrong-looking options — pick closest only after exhaustive trace. Often you'll find an exact match if you re-check.

#### Q4 — Time complexity

```c
for (int i = 1; i < n; i *= 2)
    for (int j = 0; j < i; j++)
        // O(1) work
```

**Options:** (a) O(n)  (b) O(n log n)  (c) O(log² n)  (d) O(n²)

**Answer:** (a) **O(n)**. Outer runs log n times with i = 1, 2, 4, ..., n/2. Inner runs i times. Total work = 1 + 2 + 4 + ... + n/2 = n - 1 ≈ **O(n)** (geometric series).

**Lesson:** When loops have **multiplicative growth**, sum them as geometric series, not as product.

#### Q5 — 2D array indexing

```c
int main() {
    int arr[3][3] = {1,2,3,4,5,6,7,8,9};
    printf("%d", *(*(arr + 1) + 2));
    return 0;
}
```

**Options:** (a) 4  (b) 5  (c) 6  (d) 8

**Answer:** (c) **6**. `arr+1` points to row 1 (which is `{4,5,6}`). `*(arr+1)` derefs to row 1's first element address. `*(arr+1) + 2` moves 2 ints forward → 6. Final deref → **6**.

#### Q6 — Bit manipulation

```c
int main() {
    int x = 12;  // binary: 1100
    int y = x & (x - 1);
    printf("%d", y);
    return 0;
}
```

**Options:** (a) 11  (b) 8  (c) 4  (d) 0

**Answer:** (b) **8**. `x = 1100`, `x-1 = 1011`. AND: `1000` = 8. (This is the classic "clear the rightmost set bit" trick.)

**Lesson:** Memorize bit tricks: `x & (x-1)` clears LSB, `x | (x-1)` sets all bits below MSB, `x & -x` isolates LSB.

#### Q7 — Function pass-by-value (Java)

```java
public class Test {
    static void swap(int a, int b) {
        int t = a; a = b; b = t;
    }
    public static void main(String[] args) {
        int x = 5, y = 10;
        swap(x, y);
        System.out.println(x + " " + y);
    }
}
```

**Options:** (a) 5 10  (b) 10 5  (c) 0 0  (d) Compilation error

**Answer:** (a) **5 10**. Java is **pass-by-value** for primitives — swap function only modifies local copies. Same in C without pointers.

#### Q8 — Stack data structure

```
Push: 1, 2, 3, 4
Pop, Pop, Push 5, Push 6
Pop, Pop, Pop
```

**What is the order of popped elements?**

**Options:** (a) 4,3,6,5,2  (b) 4,3,5,6,2  (c) 1,2,3,4,5  (d) 4,3,6,5,1

**Answer:** (a) **4,3,6,5,2**. Stack state evolution:
- After Push 1,2,3,4: `[1,2,3,4]`
- Pop → 4, stack: `[1,2,3]`
- Pop → 3, stack: `[1,2]`
- Push 5, 6 → `[1,2,5,6]`
- Pop → 6, Pop → 5, Pop → 2

Final order: **4, 3, 6, 5, 2**.

**Lesson:** Always physically draw the stack/queue — don't trace mentally for AMCAT-style sequence problems.

### 1.3.3 Programming module strategy

- **First pass (15 min)**: solve all output-prediction Q (these are fastest).
- **Second pass (12 min)**: bit manipulation + complexity (formula-driven).
- **Third pass (8 min)**: recursion / 2D arrays (slowest, save for last).
- **Don't leave any blank** — Programming module mein **no negative marking**. Guess if stuck.

---

## 1.4 Domain modules — when to pick which

Domain module ek tactical pick hai. Galat module choose kiya = score waste, premium pool miss. Yahan decision matrix:

### 1.4.1 Java (Computer Science) — the default

- **Pick when**: tu IT services / SDE roles target kar raha hai. **80% companies** Java domain accept karti hain.
- **Topics**: OOP, exception handling, collections, multithreading basics, JVM, JDBC, Servlets fundamentals.
- **Difficulty**: Medium. PrepInsta Java AMCAT module practice kar — pattern almost same hota hai year-on-year.

### 1.4.2 C++ — for hardware / embedded / systems pool

- **Pick when**: tu **L&T, Bosch, Cadence, Synopsys, Wipro VLSI** target kar raha hai.
- **Topics**: STL, templates, RAII, virtual functions, polymorphism, memory management, friend functions.
- **Difficulty**: Hard. Pointer-heavy. Less companies accept — but for those who do, premium pool.

### 1.4.3 DBMS — for backend / data roles

- **Pick when**: tu **Genpact, Infosys data engineering, ZS Associates, Mu Sigma, Tiger Analytics** target kar raha hai.
- **Topics**: Normalization (1NF-5NF), SQL queries (JOINs, subqueries, window functions), transactions/ACID, indexing, ER diagrams.
- **Difficulty**: Medium-easy if your DBMS course was solid (cross-link to `dbms-complete.md`).

### 1.4.4 Networks — for networking / SRE / DevOps

- **Pick when**: tu **Cisco, Juniper, Ericsson, Nokia, Aricent (now Capgemini Engineering), HCL Network** target kar raha hai.
- **Topics**: OSI/TCP-IP layers, routing protocols (RIP, OSPF, BGP), subnetting, NAT, DNS, HTTP/HTTPS, network security basics.
- **Difficulty**: Medium. Cross-link to `networks-complete.md`.

**Default recommendation for 90% engineers**: **Java**. Broadest acceptance, easiest scoring, most prep material available.

---

## 1.5 AMCAT score boost tactics

### 1.5.1 The 75+ rule — premium pool unlock

Already covered in 1.1.3 — but yaha emphasize: **75 below mat aaja**. Companies' filters set hi 75 cutoff par hote hain. 74 mile to tu pool mein hi nahi hai.

### 1.5.2 Section-wise retake — AMCAT's hidden cheat code

**This is the secret most students don't know:** AMCAT allows **section-wise retake** for ₹450-₹650 per module. Tune Quant mein 65 score kiya — Programming mein 80 — English 60 mein. Tu **English aur Quant ko alag-alag retake** kar sakta hai. Programming ka 80 score remains valid.

**Strategy:**
1. **First attempt full test**: identify weak modules.
2. **Wait 2 weeks**: targeted prep on weak modules only.
3. **Section retake**: only retake modules below 75. **Higher of two scores** automatically counted.
4. **Maximum 3 attempts per section** in 12 months.

Practical impact: tera amcatScore artificially boost ho jaata hai bina dobara full test diye. ₹1500 ka kharcha — but 5+ extra companies tera resume dekhne lag jaati hain.

### 1.5.3 Adaptive algorithm gaming

Pehla 5-6 questions **mat galat karna**. Adaptive algo wahi se calibrate karta hai. Agar tune first 5 sahi kiye — system tujhe higher difficulty deta hai (= higher max score). Agar 2 galat karein early — system tujhe easier band mein lock karta hai (max score capped).

**Rule:** First 5 Q har module mein — extra time spend kar. Slow but accurate.

---

# Part 2 — CoCubes

## 2.1 What CoCubes actually is

CoCubes ka full form: nothing. **Branded name** hai. 2007 mein founded, 2016 mein **Aon Hewitt** ne acquire kiya — ab **Aon's Assessment Solutions** ka part hai (corporate-grade HR-tech). Aon globally Fortune-500 companies ko hire karta hai, so CoCubes platform pe **higher-end Indian and MNC companies** trust karte hain.

### 2.1.1 The CoCubes "score-card" model

CoCubes AMCAT jaisa **score-card** generate karta hai per module:
- English: 0-100 (percentile bhi shown)
- Quant: 0-100
- Logical: 0-100
- Domain (Computer Programming): 0-100

Difference from AMCAT: CoCubes **percentile-driven dashboard** show karta hai (top 10%, top 25%, top 50%). Score absolute hota hai but recruiters mostly **percentile band** dekhte hain — "top 25% in Quant" type filter.

### 2.1.2 Companies that hire through CoCubes

| Company | Tier | CoCubes Cutoff (typical) | Role |
|---------|------|--------------------------|------|
| **ZS Associates** | Premium | 80%ile all sections + Domain 75+ | Decision Analytics Associate |
| **Genpact** | Standard-Premium | 70%ile all | Process Associate / Analyst |
| **Infosys (lateral / specialist drives)** | Standard | 65%ile all | System Engineer Specialist |
| **Capgemini (some drives)** | Standard | 65%ile all | Software Engineer |
| **TCS Digital (specific drives)** | Premium | 80%ile all + Coding 75+ | Digital Specialist Engineer |
| **Aon itself / Hewitt-affiliated** | Premium | 75%ile all | Analyst |
| **Mu Sigma / Tiger Analytics** | Premium | 80%ile + Domain 80+ | Decision Scientist |
| **Hexaware (some pools)** | Standard | 65%ile all | Software Engineer |
| **Wipro Elite NLTH (specific channel)** | Standard | 70%ile all | Wipro Elite |
| **Amdocs / Accenture (off-campus)** | Standard | 70%ile all | Engineer |

**Important difference**: CoCubes is **slot-based**. Tu register karta hai, slot book karta hai (~₹650-₹800), test deta hai — score 7 days mein dashboard pe. Recruiters apply karte hain dashboard se.

### 2.1.3 Score-to-offer mapping (the percentile rule)

- **Below 50%ile** (any section): no callbacks. Resume invisible.
- **50-65%ile** (all sections): standard pool. Hexaware, Capgemini sometimes, Wipro Elite. CTC 3-5 LPA.
- **65-75%ile** (all sections): mid pool. Genpact, Infosys lateral, Aon analyst. CTC 4-6 LPA.
- **75-85%ile** (all sections): enhanced. ZS, TCS Digital, Tiger Analytics, Mu Sigma. CTC 6-10 LPA.
- **85+ %ile** (all sections + Domain 85%ile): elite pool. ZS senior, Mu Sigma top, Aon analyst II. CTC 8-15 LPA.

**Goal:** 75+%ile all-around. Same as AMCAT philosophy.

---

## 2.2 CoCubes test structure

CoCubes ka structure thoda **flexible** hai — companies decide kar sakti hain ki kaunse modules attempt karne hain. But **default "Pre-Assess" version** (most common):

| Module | Questions | Time | Notes |
|--------|-----------|------|-------|
| English (Comprehension + Grammar + Vocab) | 20 | 18 min | RC + sentence correction + synonyms |
| Quantitative Aptitude | 18 | 25 min | TCS-NQT-level, slightly harder Geometry |
| Logical Reasoning | 16 | 20 min | Series, blood relations, syllogisms, DI |
| Computer Programming | 25 | 35 min | Output prediction, debugging, MCQ |
| Domain (CS / IT / Mech / EEE) | 20 | 25 min | Stream-specific |
| Coding Round (live) | 2 problems | 45 min | C / C++ / Java / Python |

**Total: ~120 questions + 2 coding in ~170 min** (~2h 50min).

### 2.2.1 Section-wise time and scoring rules

- **No negative marking** — guess freely if stuck (different from eLitmus, important).
- **Section-wise time-locked**: 18 min ka English over hua, tu Quant pe move ho jayega — wapas English mein nahi aa sakta.
- **Adaptive? No.** CoCubes is **static** — sabko same questions same difficulty.
- **Calculator on-screen** available for Quant.
- **Cutoff bands** per company published in advance on CoCubes dashboard — tu test dene se pehle dekh sakta hai "Genpact ne 65%ile maanga hai."

### 2.2.2 English module deep

- 1 RC passage with 5 questions
- 5 sentence correction (subject-verb agreement, tense, modifier)
- 5 synonyms/antonyms
- 3 fill-in-the-blanks (collocations, prepositions)
- 2 para-jumbles

Cross-link: `aptitude-verbal.md` se RC + para-jumble strategy already aata hoga.

### 2.2.3 Quant module deep

CoCubes Quant **TCS NQT se thoda harder** hai, especially geometry aur PnC. Topic split:

- Numbers (HCF, LCM, divisibility): 15%
- Percentages, profit-loss, SI/CI: 20%
- Time-speed-distance, time-work: 15%
- Ratio, proportion, mixtures: 10%
- Geometry, mensuration: 15% (harder than NQT)
- Permutations, combinations, probability: 10%
- Data interpretation (1 set, 4-5 Q): 10%
- Algebra (linear, quadratic): 5%

### 2.2.4 Logical module deep

- Number/letter series: 4 Q
- Coding-decoding: 3 Q
- Blood relations: 2 Q
- Syllogisms: 3 Q
- Direction sense: 2 Q
- Data sufficiency: 2 Q

Cross-link: `aptitude-logical.md`.

### 2.2.5 Common cutoff bands per company (CoCubes-specific)

| Company | English | Quant | Logical | Programming | Domain |
|---------|---------|-------|---------|-------------|--------|
| ZS Associates | 80%ile | 80%ile | 80%ile | 75%ile | 75%ile |
| Genpact | 65%ile | 70%ile | 70%ile | 60%ile | — |
| TCS Digital (CC drive) | 75%ile | 80%ile | 75%ile | 80%ile | 75%ile |
| Capgemini | 60%ile | 65%ile | 65%ile | 60%ile | — |
| Mu Sigma | 80%ile | 85%ile | 80%ile | 75%ile | 80%ile |
| Aon Hewitt analyst | 75%ile | 75%ile | 75%ile | 70%ile | — |

---

## 2.3 CoCubes Coding Round — language choice + 5 worked problems

### 2.3.1 Language choice

CoCubes coding round mein languages: **C / C++ / Java / Python**. Recommendation:
- **Python** — fastest to write, fewer bugs, good for AMCAT-style array/string problems.
- **Java** — if you're Java-strong (HashMap, ArrayList save time).
- **C++** — only if you're competitive-programming-strong (STL).
- **C** — avoid unless you have no other option.

### 2.3.2 Problem typology

CoCubes coding problems usually **easy-medium DSA**:
- Array manipulation (rotation, reversal, sum)
- String processing (palindrome, anagram, frequency)
- Number theory (prime, factorial, GCD)
- Basic recursion (Fibonacci, factorial)
- Simple sorting/searching
- Simple greedy

Yeh **LeetCode Easy** level hai. Striver A2Z sheet ka first half kaafi hai.

### 2.3.3 5 Worked CoCubes-typical Problems (Python)

#### Problem 1 — Find second largest in array

**Input:** `arr = [10, 5, 8, 20, 3, 20, 15]`
**Output:** `15` (second largest unique)

```python
def second_largest(arr):
    largest = second = float('-inf')
    for x in arr:
        if x > largest:
            second = largest
            largest = x
        elif x > second and x != largest:
            second = x
    return second if second != float('-inf') else None

# Test
print(second_largest([10, 5, 8, 20, 3, 20, 15]))  # 15
```

**Edge cases:** all duplicates → None. Single element → None.

**Time:** O(n), single pass. **Space:** O(1).

#### Problem 2 — String anagram check

**Input:** `s1 = "listen"`, `s2 = "silent"`
**Output:** `True`

```python
def are_anagrams(s1, s2):
    s1, s2 = s1.lower().replace(" ", ""), s2.lower().replace(" ", "")
    if len(s1) != len(s2):
        return False
    count = {}
    for c in s1:
        count[c] = count.get(c, 0) + 1
    for c in s2:
        if c not in count or count[c] == 0:
            return False
        count[c] -= 1
    return True

# Test
print(are_anagrams("listen", "silent"))  # True
print(are_anagrams("hello", "world"))    # False
```

**Trick:** sorted(s1) == sorted(s2) is one-line, but O(n log n). Hash map version is O(n).

#### Problem 3 — Reverse words in a sentence (preserve word order)

**Input:** `"Hello World Python"` → **Output:** `"olleH dlroW nohtyP"`

```python
def reverse_each_word(sentence):
    return " ".join(word[::-1] for word in sentence.split())

# Test
print(reverse_each_word("Hello World Python"))  # olleH dlroW nohtyP
```

**Variant in test:** "reverse the order of words" → `" ".join(sentence.split()[::-1])`. Read carefully.

#### Problem 4 — Find missing number from 1 to N

**Input:** `arr = [1, 2, 4, 5, 6]`, `N = 6` → **Output:** `3`

```python
def find_missing(arr, n):
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(arr)
    return expected_sum - actual_sum

# Test
print(find_missing([1, 2, 4, 5, 6], 6))  # 3
```

**Math trick:** Gauss formula. O(n) time, O(1) space. Better than sorting (O(n log n)).

**Variant:** "find 2 missing numbers" — XOR trick, more advanced.

#### Problem 5 — Count vowels and consonants

**Input:** `"Programming is fun"` → **Output:** `vowels=5, consonants=11`

```python
def count_v_c(s):
    vowels_set = set("aeiouAEIOU")
    v = c = 0
    for ch in s:
        if ch.isalpha():
            if ch in vowels_set:
                v += 1
            else:
                c += 1
    return v, c

# Test
v, c = count_v_c("Programming is fun")
print(f"vowels={v}, consonants={c}")  # vowels=5, consonants=11
```

**Watch out:** ignore spaces, digits, punctuation. `isalpha()` filters cleanly.

### 2.3.4 Coding round strategy

- **Read both problems first (3 min)** — solve easier one first to bank time.
- **Pseudo-code on paper before typing (2 min per problem)**.
- **Write test cases yourself** — CoCubes IDE shows hidden test result, but visible test cases pass tab compile + run kar.
- **Don't optimize prematurely** — brute force first. Optimize if time left.

---

## 2.4 CoCubes vs AMCAT — quick comparison

| Aspect | AMCAT | CoCubes |
|--------|-------|---------|
| Adaptive? | Yes | No |
| Negative marking? | No | No |
| Result speed | 2 days | 7 days |
| Section retake? | Yes (paid) | No (full retest) |
| Test fee | ₹880-₹1100 | ₹650-₹800 |
| Volume of companies | Higher (~200+) | Medium (~120+) |
| Premium tier difficulty | Medium | Medium-high (Quant harder) |
| Validity | 12-24 months | 6-12 months |

---

# Part 3 — eLitmus pH Test

## 3.1 What eLitmus pH Test actually is

eLitmus ek **Bangalore-based 2005-founded** company hai, founded by Mohit Jain & Sahil Nayar — IIT-Madras alumni. Inka **pH Test (Hiring Potential Test)** India ka **most respected aptitude test** maana jaata hai by serious tech recruiters. Kyun? Kyunki **pH score 100% percentile-based hai**, **negative marking heavy hai**, aur **CAT-level difficulty** maintain karte hain.

Tu pH99+ score laaya — tu **top 1% of all test-takers in India** mein aa gaya. Yeh resume pe likhna ek **flex** hai. Aur seedhe bolo — recruiters ko pata hai **eLitmus mein cheating impossible hai** kyunki proctoring + pattern + difficulty teen ko ek saath crack karna mushkil hai.

### 3.1.1 The pH score — out of 100, percentile-driven

- pH score **integer**, range **0 to 100**.
- Score **percentile-based** hai — pH75 ka matlab tu top 25% mein hai is test cycle ka.
- **Section-wise pH score** bhi alag aata hai: pH-Quant, pH-Logical, pH-Verbal — har ek separately.
- **Overall pH** = weighted average (Quant 40%, Logical 35%, Verbal 25%).

### 3.1.2 Test structure — 60 Q in 120 min

| Section | Questions | Time | Time/Q |
|---------|-----------|------|--------|
| Quantitative Ability | 20 | 40 min | 2 min |
| Problem Solving (Logical Reasoning) | 20 | 40 min | 2 min |
| Verbal Ability | 20 | 40 min | 2 min |

**Total: 60 Q in 120 min.**

**Critical:** sections **NOT timed independently** — tu kabhi bhi switch kar sakta hai. Yeh CAT jaisa **flexible time allocation** model hai — but sirf **2 min/Q average** milte hain, jo bahut tight hai.

### 3.1.3 Negative marking — 25% per wrong (HEAVY)

Yeh eLitmus ki **defining feature** hai. Marking scheme:

- **Correct answer**: +1 mark (or +10 in some sections — varies)
- **Wrong answer**: **-0.25** mark (i.e., -25% per wrong)
- **Unattempted**: 0 (no penalty)

**Plus an extra penalty rule:**
- Agar tune ek section mein **>25% questions galat** kiye → us section mein **-1 additional penalty** lag sakta hai.

**Translation:** **Don't guess.** **Skip if not 80%+ confident.** Aur ye eLitmus ke playbook ka core rule hai — niche detail mein cover hoga.

### 3.1.4 The pH99+ club

- **pH85+** = top 15% = direct interview at Mphasis Premier, Accenture A-list pool.
- **pH90+** = top 10% = direct interview at multiple premium companies.
- **pH99+** = top 1% = **direct interview at almost ALL eLitmus partner companies** with no further screening. Resume itself becomes a "skip-the-test" pass.
- **pH99+ club**: estimated 1500-2000 students/year. Yeh log usually IIT/NIT/BITS, but **20-30% non-tier-1 colleges se aate hain** because eLitmus rewards pure problem-solving, not college brand.

### 3.1.5 Test fee + cycles

- Fee: **₹950** (sometimes ₹999) per attempt
- Test cycles: **monthly** in major cities (Bangalore, Delhi, Hyderabad, Pune, Chennai, Mumbai, Kolkata, Chandigarh)
- Validity: **24 months** — pH score 2 saal tak active hota hai
- Format: **paper-based offline** (yes, still offline in most centers — bring 2 pencils, eraser, sharpener, valid ID)
- Result: **7-10 working days** via eLitmus dashboard

---

## 3.2 Companies hiring through eLitmus

eLitmus ka network **300+ companies**, but main names:

| Company | Tier | Typical pH Cutoff | Role |
|---------|------|-------------------|------|
| **Cognizant** (off-campus, GenC Next) | Standard | pH75+ | Programmer Analyst Trainee |
| **Accenture** (off-campus pool) | Standard-Premium | pH80+ | ASE / Premier ASE pH85+ |
| **Mphasis** (Wings + NextLabs) | Standard-Premium | pH80+, Premier pH90+ | Wings Engineer |
| **MindTree** | Standard-Premium | pH80+ | Engineer Trainee |
| **Capgemini** (some drives) | Standard | pH70+ | Engineer |
| **Hexaware** | Standard | pH70+ | Software Engineer |
| **Sapient / Publicis Sapient** | Premium | pH85+ | Associate L1 |
| **Aricent (Capgemini Engineering)** | Premium | pH80+ | Engineer |
| **NTT Data Global Delivery** | Standard | pH75+ | Engineer |
| **Quinnox / Persistent / Mphasis Premier** | Premium | pH85+ | Senior Engineer Trainee |

**Repeated companies across AMCAT/CoCubes/eLitmus**: Mphasis, Hexaware, MindTree, Capgemini. Tu agar teeno tests dega — ek hi company tujhe **3 different channels** se shortlist kar sakti hai (different score = different role). Maximum reach.

---

## 3.3 Quant section — eLitmus deep dive

eLitmus Quant **TCS NQT se ~2x harder** hai aur **CAT level** ke close hota hai. Tu agar `aptitude-quant.md` padh chuka hai, foundation hai. But yahan **higher-order reasoning** chahiye.

### 3.3.1 Topic distribution (eLitmus-specific)

| Topic | % of Q | Difficulty |
|-------|--------|------------|
| Permutation & Combination | 15-20% | High |
| Probability | 10-15% | High |
| Geometry / Mensuration | 10-15% | High |
| Number Theory (HCF/LCM/divisibility/digit sum) | 10-15% | High |
| Algebra (quadratic, polynomials, inequalities) | 10% | Medium |
| Time-speed-distance | 8-10% | Medium |
| Time-work, pipes-cisterns | 5-8% | Medium |
| Percentages, ratio, mixtures | 8-10% | Medium |
| Data Interpretation (1 set, 4-5 Q) | 10% | Medium |

### 3.3.2 Why Quant is the killer

- **PnC + Probability**: 6-7 Q out of 20. CAT-level — combinatorial setups, conditional probability, geometric probability.
- **Geometry**: triangles with cevians, circles with multiple intersections, 3D coordinate geometry.
- **Number theory**: digit-sum properties, modular arithmetic, last-2-digit problems.

**Tactical advice**: Ek typical eLitmus Quant test mein **20 mein se 8-10 attempt karna realistic hai for pH75+**. Sab karne ki koi zaroorat nahi. **Quality over quantity**, especially with -25% marking.

### 3.3.3 Sample eLitmus Quant question pattern

**Q (PnC):** "8 letters are written and 8 envelopes are addressed. What is the probability that exactly 5 letters go into correct envelopes?"

**Approach:** Choose 5 correct: C(8,5) = 56. Remaining 3 must all be deranged: D(3) = 2. Total ways = 56 × 2 = 112. Total permutations = 8! = 40320. Probability = 112/40320 = 1/360.

**Lesson:** Derangement formula `D(n) = (n-1) * (D(n-1) + D(n-2))` with D(1)=0, D(2)=1. Memorize first 5: D(1)=0, D(2)=1, D(3)=2, D(4)=9, D(5)=44.

Cross-link: `aptitude-quant.md` mein PnC fundamentals + derangement section dekh.

---

## 3.4 Reasoning (Problem Solving) section deep

### 3.4.1 Cryptarithmetic — eLitmus signature

**Cryptarithmetic** = letters represent digits, find which digit. eLitmus mein **5+ questions har test mein** aate hain. Yeh almost-unique to eLitmus among Indian aptitude tests. Other platforms 1-2 dete hain max.

**Example:**
```
   S E N D
 + M O R E
 ---------
 M O N E Y
```

**Goal:** Each letter = unique digit 0-9. Find S, E, N, D, M, O, R, Y.

**Standard solution:** M=1 (carry), S=9, O=0, E=5, N=6, D=7, R=8, Y=2 → 9567 + 1085 = 10652. ✓

**Approach for eLitmus:**
1. **Identify forced digits** — leading carry (M=1 hamesha jab 4-digit + 4-digit = 5-digit).
2. **Column-by-column from right** — track carries.
3. **Eliminate impossible** — same letter = same digit, different letters = different digits.

**Practice:** PrepInsta + IndiaBix pe **50+ cryptarithmetic** problems hain. eLitmus prep = **at least 20 solve karna**.

### 3.4.2 Data Sufficiency

Format: ek question + 2 statements. Decide karna hai:
- A: Statement 1 alone is sufficient, 2 alone is not
- B: Statement 2 alone is sufficient, 1 alone is not
- C: Both together sufficient, neither alone
- D: Each alone sufficient
- E: Neither sufficient

eLitmus DS **CAT-level** difficulty. 4-5 Q per test.

### 3.4.3 Other Reasoning topics

- **Seating arrangement** (linear + circular): 3-4 Q
- **Blood relations**: 1-2 Q
- **Syllogisms**: 1-2 Q
- **Number/letter series**: 2-3 Q
- **Logical games / puzzles**: 2-3 Q

Cross-link: `aptitude-logical.md` foundation. eLitmus extra layer = cryptarithmetic mastery.

---

## 3.5 Verbal section

20 Q in ~40 min if you allocate equally — but most students compress this to 25-30 min to give Quant more time.

### 3.5.1 Topic split

- **Reading Comprehension**: 2 passages × 4 Q each = 8 Q
- **Para-jumbles**: 4 Q
- **Sentence correction**: 3-4 Q
- **Synonyms / antonyms**: 2-3 Q
- **Critical reasoning**: 2-3 Q (assumption, inference, conclusion)

### 3.5.2 Strategy

- **RC first**: invest time in passage reading, then 4 Q quick.
- **Para-jumbles second**: TOPIC-LINK-CONCLUSION method (covered in `aptitude-verbal.md`).
- **Skip critical reasoning if not strong** — these are CAT-level and time-eat.

Cross-link: `aptitude-verbal.md` for fundamentals.

---

## 3.6 The negative-marking strategy — the blank vs guess decision matrix

Yeh eLitmus ka core. Get this wrong, score destroyed.

### 3.6.1 The math of guessing

- 1 correct: +1
- 1 wrong: -0.25
- Break-even: tujhe **5 mein se 1 sahi karna padega** to net 0. Mathematically: 1×(+1) + 4×(-0.25) = 1 - 1 = 0.
- **Random guess** (4 options) = 25% accuracy. Net expected = 0. **Pure random = waste of attempt.**

### 3.6.2 The 80% confidence rule

**Attempt only if you're 80%+ confident.** Math:
- 80% × +1 + 20% × -0.25 = 0.8 - 0.05 = +0.75 expected. ✓
- 70% × +1 + 30% × -0.25 = 0.7 - 0.075 = +0.625. Still positive but marginal.
- 60% × +1 + 40% × -0.25 = 0.6 - 0.1 = +0.5. Risky.
- 50% × +1 + 50% × -0.25 = 0.5 - 0.125 = +0.375. Very risky given >25% wrong section penalty.

### 3.6.3 The "blank vs guess" decision matrix

| Confidence Level | Decision |
|------------------|----------|
| 90-100% (sure) | **Attempt immediately** |
| 70-89% (likely) | **Attempt — eliminate 1 option first** |
| 40-69% (50/50) | **Skip** (marginal expected value, hurts overall section) |
| 0-39% (clueless) | **Skip definitely** |

**Practical impact**: in 60-Q test, **attempt 35-45 questions**. **Leave 15-25 blank**. pH85+ achievable with 28 correct + 5 wrong + 27 blank.

### 3.6.4 Section-wise allocation for pH85+

| Section | Attempt | Correct (target) | Wrong (max) | Skip |
|---------|---------|------------------|-------------|------|
| Quant (20) | 12 | 9 | 3 | 8 |
| Logical (20) | 14 | 11 | 3 | 6 |
| Verbal (20) | 14 | 11 | 3 | 6 |
| **Total** | **40** | **31** | **9** | **20** |

Net score before penalty: 31 - 9×0.25 = 31 - 2.25 = **28.75**. **This translates to ~pH85.**

For pH99+, target: **35+ correct, ≤4 wrong, ~21 attempt rate.**

---

# Closing — Comparing the 3 + 30-day plan + What's next

## 4.1 The three platforms compared

| Aspect | AMCAT | CoCubes | eLitmus |
|--------|-------|---------|---------|
| **Test fee** | ₹880-₹1100 | ₹650-₹800 | ₹950 |
| **Format** | Online (test center) | Online (test center) | Offline (paper, mostly) |
| **Adaptive?** | Yes | No | No |
| **Negative marking** | None | None | **-25% per wrong** |
| **Result speed** | 2 days | 7 days | 7-10 days |
| **Difficulty (overall)** | Medium | Medium | High (CAT-level) |
| **Quant difficulty** | Medium | Medium-high | Very high |
| **Verbal difficulty** | Medium | Medium | High (CAT-level RC) |
| **Validity** | 12-24 months | 6-12 months | **24 months** |
| **Volume of companies** | **~200+** | ~120+ | ~100+ |
| **Premium pool size** | Large | Medium | Small (pH85+ club) |
| **Section retake?** | Yes (paid) | Full retest | Full retest |
| **Best for** | Volume-hire MNCs (Hexaware, Mphasis, LTI) | Mid-premium (ZS, TCS Digital, Mu Sigma) | Top-1% reach (pH99+ club) |

### 4.1.1 Difficulty hierarchy (verified by 100+ student feedback)

**eLitmus > AMCAT > CoCubes** — eLitmus mein Quant + Reasoning CAT-level. AMCAT adaptive, so harder questions only if you're scoring high. CoCubes flat-difficulty, easiest of the three.

### 4.1.2 Hiring volume hierarchy

**AMCAT > eLitmus > CoCubes** — AMCAT 200+ companies, eLitmus ~100, CoCubes ~120 (but heavier overlap with AMCAT). For pure callback volume, **AMCAT delivers most ROI**.

### 4.1.3 Negative marking is eLitmus-only

Yeh decisive feature hai. AMCAT/CoCubes mein blind guess can boost score. **eLitmus mein blind guess will destroy score.** Mindset shift zaroori hai.

---

## 4.2 30-day combined prep plan

Tu agar abhi shuru kar raha hai, ye plan follow kar:

### Week 1 (Days 1-7) — AMCAT (lowest difficulty, confidence builder)

- **Day 1-2**: Register on SHL AMCAT portal. Book test slot for Day 28 (give yourself buffer).
- **Day 3**: Take **PrepInsta full-length AMCAT mock** — identify weak modules.
- **Day 4-5**: English (RC + para-jumbles + grammar) — `aptitude-verbal.md` review.
- **Day 6-7**: Quant (TSD, percentages, geometry) — `aptitude-quant.md` revisit + 50 PrepInsta questions.

### Week 2 (Days 8-14) — Logical + Programming + AMCAT mock

- **Day 8-9**: Logical (series, blood relations, syllogisms) — `aptitude-logical.md` + 40 IndiaBix Q.
- **Day 10-12**: Computer Programming module — output prediction (50 Q), complexity (20 Q), pointers (30 Q). Cross-link: `cpp-mastery.md` first 3 chapters.
- **Day 13**: Domain module prep — pick Java (most students). Read OOP + collections + multithreading basics. Cross-link: `java-fundamentals.md`.
- **Day 14**: Take **second AMCAT mock**. If 75+ in all → schedule actual test for Day 16.

### Week 3 (Days 15-21) — CoCubes (mid-level)

- **Day 15-16**: AMCAT actual test. Then immediately register for CoCubes (~₹700).
- **Day 17-18**: CoCubes mock practice (PrepInsta CoCubes section). Quant heavier on geometry — 30 problems.
- **Day 19-20**: Coding round practice — solve 15 LeetCode Easy in Python (array + string + simple math).
- **Day 21**: Take **CoCubes actual test**. 65+%ile target → accept enhanced pool callbacks.

### Week 4 (Days 22-30) — eLitmus (hardest)

- **Day 22-24**: eLitmus Quant intensive — PnC + Probability + Geometry. 60 problems (CAT-prep books like Arun Sharma — 1 chapter daily).
- **Day 25-26**: Cryptarithmetic mastery — solve 25 problems on PrepInsta + IndiaBix. Memorize derangement values, pattern recognition.
- **Day 27-28**: eLitmus full mock (paper-based, 120 min). Practice **selective attempt strategy** — 35-40 Q with high accuracy.
- **Day 29**: Verbal review — RC speed reading + para-jumbles. Light day.
- **Day 30**: eLitmus actual test. Target pH75+ first attempt; pH85+ realistic if Week 4 done well. **Negative marking discipline non-negotiable.**

### Resource list (verified/free)

- **PrepInsta** — free mocks for all 3 platforms
- **IndiaBix** — quant + logical + cryptarithmetic banks
- **GeeksforGeeks** — programming MCQ banks
- **R.S. Aggarwal** Quantitative Aptitude — fundamentals
- **Arun Sharma CAT** — for eLitmus-level Quant
- **AmbitionBox / Glassdoor** — recent eLitmus/AMCAT question patterns

---

## 4.3 Pre-test checklist (for all 3)

- [ ] **Valid ID** (Aadhar / PAN / passport) — physical copy + digital
- [ ] **Admit card** printed (eLitmus mandatory print, AMCAT/CoCubes can show on phone)
- [ ] **Test slot location verified** 1 day before — Pearson VUE / SHL center / eLitmus paper center
- [ ] **Travel buffer 1.5 hours** — Indian traffic, never trust Google Maps for placement-day routes
- [ ] **2 pens, 2 pencils, eraser, sharpener** for eLitmus (paper-based)
- [ ] **No watch/phone/calculator** — eLitmus prohibits even basic calculator
- [ ] **Breakfast 2 hours before test** — avoid heavy/oily food
- [ ] **Sleep 7+ hours night before** — critical for Quant section accuracy
- [ ] **Mock report review** night before — focus on weak areas, don't learn new topics
- [ ] **Personality test consistency** for AMCAT — moderate answers, no extremes

---

## 4.4 What to learn next

- **`aptitude-quant.md`** — if Quant scores below 65 in any platform, foundation refresh
- **`aptitude-logical.md`** — for cryptarithmetic, syllogisms, DS practice
- **`aptitude-verbal.md`** — RC + para-jumble mastery
- **`tcs-nqt-playbook.md`** — TCS-specific (parallel pipeline, register kar already)
- **`infosys-sp-playbook.md`** — Infosys SP test (covered separately, similar structure)
- **`off-campus-playbook.md`** — once you have a good aptitude score, **how to leverage it** — LinkedIn, recruiter outreach, application strategy
- **`resume-behavioural.md`** — once you start getting interview calls, the resume + STAR-method behavioral round playbook
- **`mock-interview-comm.md`** — communication coaching for HR + technical interviews

---

Bhai, ek aakhri baat. Yeh teen tests **₹2500 ka kharcha** hain (combined). Result: tera resume **300+ companies** ke databases mein lock ho jaata hai for 12-24 months. Yeh **single best ROI** hai aapki off-campus journey mein. Tu agar abhi tak register nahi kiya — **aaj raat ko teeno register kar**. 30-day plan kal se shuru. **Lage raho.**
