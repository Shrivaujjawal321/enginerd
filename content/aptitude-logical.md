# Logical Reasoning — The Silent Filter Behind Your Placement Cutoff

Bhai, agar Quantitative Aptitude placement ka **gate** hai, to Logical Reasoning uss gate ka **chowkidaar** hai. Tu chai pee ke quant clear kar lega — formulas hain, shortcuts hain, ratta lag jaata hai. But LR mein na formula hai, na ratta — sirf **pattern recognition + cold logic + clock pe speed**. Aur isi liye students yaha pe phasaate hain.

TCS NQT mein "Reasoning Ability" ka section 25-30 questions, 50 minutes — yaani **roughly 100 seconds per question** average. Sun ke laga, "arre yaar, paisa double mil raha hai time ka quant ke comparison mein." But ruk, sach ye hai ki ek seating arrangement puzzle 4-5 questions ki cluster hota hai, aur agar tu **setup** mein 5 minute laga diya to baaki sab question time mein lambi line lag jaayegi. Hard puzzles mein 4 minute, easy series mein 20 second — average 100 sec ye rakhna hai.

Iss subject ka motto: **"Read once, model once, solve fast."** Hum 11 cluster topics cover karenge — coding-decoding se cubes-dice tak — har topic mein **slow chain method aur fast diagram method** dono dikhayenge with timings. End mein 25 trickiest questions ka rapid table hai aur ek 80-second survival guide. Pen-paper saath rakh, kyunki LR purely **diagrammatic** subject hai — sar mein puzzle solve karna disaster hai.

---

## 1. Why Logical Reasoning is the silent filter

### 1.1 The structure tu actually face karega

TCS NQT, Infosys SP, Cognizant GenC, AMCAT, eLitmus — sab ke LR section ka pattern roughly aisa hai:

| Test | LR Questions | Time | Cluster size |
|------|--------------|------|--------------|
| TCS NQT | 25-30 | 50 min | 1-2 puzzle sets of 4-5 each |
| Infosys SP | 15 | 25 min | Mixed individual + 1 puzzle |
| AMCAT | 14-16 | 16 min | Individual, fast-paced |
| eLitmus pH | 20 | 35 min | Heavy puzzle clusters, hardest |
| Cognizant GenC | 14-18 | 14 min | Individual + 1 cluster |

eLitmus is the killer — top 5 percentile dene wale companies (Mu Sigma, ThoughtWorks) yahin se hire karte hain, aur 60%+ accuracy expected hai. AMCAT mein **adaptive** scoring — galat kiya to next question harder, sahi kiya to next aur tough. So pace + accuracy dono balance karne hain.

### 1.2 The 100-second illusion

Average 100 sec lagta hai aaraam, but allocation aisa kar:

- Coding-decoding, series, blood relations, direction sense — **30-50 sec** maaro.
- Syllogism, statement-conclusion, data sufficiency — **60-90 sec**.
- Seating arrangement / puzzle cluster (4-5 sub-questions) — **4-5 minute total**, yaani 60-75 sec per sub-question after setup.
- Cubes & dice, statement-assumption — **45-75 sec**.

> **Pro tip:** First 60 seconds mein **section ka ek aerial scan** maar. Puzzles ko spot kar — agar ek puzzle clearly tough lag raha hai (10+ constraints, 3 attributes match), uss puzzle ka **last question hi solve kar** ya skip kar. Cluster solve karna all-or-nothing nahi hai.

### 1.3 Common student mistakes (jo tu mat karna)

1. **Sar mein puzzle solve karna.** Naa, paper pe diagram banao. Time bachta hai, errors girte hain.
2. **Syllogism mein "common sense" lagana.** "All cats are dogs" — ye absurd lagta hai but logically valid statement hai. World knowledge band kar, sirf dieye gaye statements pe operate kar.
3. **Coding-decoding mein har letter individually decode karna.** Pattern dhundh — usually shift consistent hai across the word.
4. **Direction problems mein north ko top maan lena automatically.** Sahi hai, but "you face east, turn right" jaisi cheez mein top-down view se sochna padega.
5. **Data Sufficiency mein actual answer nikalna.** Galti — DS mein **answer chahiye hi nahi**, sirf ye tay karna hai ki data **kafi hai ya nahi**.

### 1.4 Realistic prep targets

- **Daily**: 25-30 LR questions for 50-60 days = 1500+ questions practiced. **Volume hai pattern recognition ka jadoo.**
- **Cutoff for shortlisting**: 65-70% in LR for service companies, 80%+ for product (Cognizant Digital, Infosys DSE).
- **Free resources**: IndiaBix LR section, PrepInsta company-wise reasoning, GeeksforGeeks puzzle bank, eLitmus sample papers (Google "elitmus pH papers PDF").
- **Paid (optional)**: Manhattan / R.S. Aggarwal Verbal & Non-Verbal Reasoning. Old-school but gold for variety.

---

## 2. Coding-Decoding — the alphabet shift game

Har test mein 2-4 questions. Concept simple hai: ek word ko **transformed word** se map kiya gaya hai, tujhe transformation rule pakadni hai.

### 2.1 Memorise the alphabet position table

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13|

| N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26|

**Mid-anchors yaad rakh:** A=1, F=6, K=11, P=16, U=21, Z=26. Vowels: A=1, E=5, I=9, O=15, U=21. Reverse: A↔Z (sum 27), B↔Y, C↔X — **opposite letter sum 27**.

### 2.2 Type 1 — Direct letter shift (Caesar style)

If `CAT → DBU`, every letter shifted by +1. So `DOG → ?`. Apply +1: D→E, O→P, G→H. Answer = **EPH**.

> **Worked example (slow):** `MANGO → OCPIQ`. Code for `APPLE`?
> - M(13)→O(15) shift +2. A(1)→C(3) shift +2. N→P shift +2. Pattern confirmed = +2.
> - APPLE: A→C, P→R, P→R, L→N, E→G = **CRRNG**.
> **Time:** ~30 sec.

> **Fast version:** "Mango" mein 5 letters, sab +2 shifted hain — kabhi har letter mat check kar, **2 letters check karke pattern confirm kar**, fir target word pe blanket apply.

### 2.3 Type 2 — Position-based shift (positional)

Sometimes shift bhi position pe depend karta hai. `INDIA → JPGMF`. Decode:
- I(9) → J(10): +1
- N(14) → P(16): +2
- D(4) → G(7): +3
- I(9) → M(13): +4
- A(1) → F(6): +5

So shift = position number. Pattern = "+1, +2, +3, +4, +5". Apply for `WORLD`: W+1=X, O+2=Q, R+3=U, L+4=P, D+5=I → **XQUPI**.

### 2.4 Type 3 — Reverse + shift combo

`ROAD → WLAG`? Pehle reverse karo: ROAD → DAOR. Fir shift pakdo: D→W (+19? nahi), wait — let's check: D(4)→W(23) is +19 = -7. A(1)→L(12) is +11 = -15. Pattern nahi mil raha. Ye approach galat hai.

Try: `ROAD` ke har letter pe alternate +/-. R(18)+5=W(23), O(15)-3=L(12), A(1)+0=A — not matching. Honest answer: when pattern unclear, **try first letter k saamne all options' first letter** — eliminate.

> **Pro tip:** Coding-decoding ka hidden trick — **ek option pick kar, reverse engineer kar**. 4 options hain, decoding test karne mein 10 sec lagta hai per option. 40 sec mein answer nikal aata hai bina forward decoding kiye.

### 2.5 Type 4 — Symbol substitution

"In a code, # = +, $ = -, % = ×, @ = ÷. Find: 12 # 4 % 3 $ 8."
- Translate: 12 + 4 × 3 − 8 = 12 + 12 − 8 = **16**.
- BODMAS apply karna mat bhool — code change ho gaya hai but math precedence wahi rahegi.

### 2.6 Type 5 — Letter-to-number with operations

"BAT = 23 (because 2+1+20). What is CAT?" → 3+1+20 = **24**.

Variant: "BAT = 2×1×20 = 40. CAT?" → 3×1×20 = **60**.

**Always check both: sum and product** — first decoded word se hi pakdo.

### 2.7 Type 6 — Mirror coding

Letters ko Z-A reverse pe map karte hain. A↔Z, B↔Y... Quick formula: **mirror of letter at position p is at position (27 − p)**.

> **Worked example:** Mirror of `LION`?
> - L(12) → 27−12 = 15 → O. I(9) → 18 → R. O(15) → 12 → L. N(14) → 13 → M.
> - **OREL?** Wait, let me recheck. L=12, mirror=15=O. I=9, mirror=18=R. O=15, mirror=12=L. N=14, mirror=13=M. So LION mirror = **ORLM**.
> **Time: ~30 sec** if formula clear.

### 2.8 The 30-second decode strategy

1. Count letters of source and code — if same, simple shift likely.
2. Check first letter's shift difference. Try same shift on second letter. **Match? Done.**
3. **No match?** Check if shift = position number, or reverse word first.
4. Still no match? **Look at letter sums** — maybe code = number, not letters.

---

## 3. Number and Letter Series — pattern radar

3-5 questions har test mein. Goal: missing term ya next term.

### 3.1 Arithmetic Progression (AP)

Constant **difference**. `2, 5, 8, 11, ?`. Difference = 3. Next = 14.

General term: `a_n = a + (n − 1) × d`.

### 3.2 Geometric Progression (GP)

Constant **ratio**. `3, 6, 12, 24, ?`. Ratio = 2. Next = 48.

General term: `a_n = a × r^(n − 1)`.

### 3.3 Difference of differences (second-order AP)

`2, 5, 10, 17, 26, ?`.
- Diffs: 3, 5, 7, 9 — itself an AP with d = 2.
- Next diff = 11. Next term = 26 + 11 = **37**.

> **Pro tip:** Agar simple AP/GP nahi hai, **differences ki series banao**. 80% problems isi mein crack ho jaate hain.

### 3.4 Alternating series (interleaved)

`1, 4, 9, 16, 25, ?` — squares of 1,2,3,4,5. Next = 36.

`2, 1, 4, 3, 6, 5, 8, ?` — alternating: even-odd patterns. Even terms: 2, 4, 6, 8 (AP). Odd terms: 1, 3, 5, ? = 7. Next position is odd term (7th term) = **7**.

### 3.5 Perfect-square / cube based

`1, 8, 27, 64, ?` — cubes 1³, 2³, 3³, 4³. Next = 5³ = 125.

`1, 4, 9, 16, 25, 36, 49, ?` — squares. Next = 64.

**Memorise these series** — agar koi unusual number aaye, check if it's a perfect square (√n natural?) or cube (n^(1/3) natural?). 144 dikhaa? 12². 121 dikha? 11². 169? 13². Quick mental check.

### 3.6 Custom rule patterns

`3, 9, 27, 81` looks like ×3, but `2, 6, 12, 20, 30, ?`?
- Diffs: 4, 6, 8, 10 — AP with d = 2. Next diff = 12. Next term = **42**.
- **OR** notice: terms are n(n+1) for n=1,2,3,4,5. So next = 6×7 = **42**. Same answer, two paths.

`4, 9, 16, 25, 36, ?` — squares of 2,3,4,5,6. Next = 49.

**Some classic custom rules**:
- Triangular numbers: 1, 3, 6, 10, 15, 21 (n(n+1)/2).
- Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21 (each = sum of prev two).
- Prime series: 2, 3, 5, 7, 11, 13, 17.

### 3.7 Letter series

Same logic, alphabet positions hi numbers ban jaate hain.

`A, C, F, J, O, ?`
- Position diffs: A(1)→C(3) +2, C→F(6) +3, F→J(10) +4, J→O(15) +5. Next = +6 = O+6 = U.
- **Answer: U**.

`AZ, BY, CX, DW, ?`
- First letters: A, B, C, D — AP with d = 1. Next = E.
- Second letters: Z, Y, X, W — AP with d = -1. Next = V.
- **Answer: EV**.

### 3.8 The 30-second series decision tree

1. **Diff constant?** AP. Done.
2. **Ratio constant?** GP. Done.
3. **Diffs of diffs constant?** Second-order. Done.
4. **Numbers small + perfect?** Try squares, cubes, primes, triangular.
5. **Two interleaved patterns?** Split odd/even positioned terms.
6. **Stuck after 60 sec?** Mark and skip — never burn 90 sec on series.

---

## 4. Blood Relations — the directed graph approach

3-4 questions per test. Family tree banaana hi pure cheat code hai.

### 4.1 Standard symbols (paper pe likh ke practice kar)

- Male: square `[ ]`
- Female: circle `( )`
- Married couple: connect with `=` or `↔`
- Parent → child: vertical line down
- Siblings: horizontal line
- Plus signs: + for "and"

### 4.2 Common relations decoder

| English term | Hinglish | Relation |
|--------------|----------|----------|
| Paternal grandfather | Dada | Father's father |
| Maternal grandfather | Nana | Mother's father |
| Paternal uncle | Chacha | Father's brother |
| Maternal uncle | Mama | Mother's brother |
| Paternal aunt | Bua | Father's sister |
| Maternal aunt | Mausi | Mother's sister |
| Father-in-law | Sasur | Spouse's father |
| Brother-in-law | Saala / Jeeja | Wife's brother / Sister's husband |
| Nephew | Bhanja / Bhatija | Sister's son / Brother's son |
| Cousin | Cousin | Uncle/Aunt's child |

### 4.3 Standard problem — "pointing to a photo"

"Pointing to a photo, Ramesh said: *'She is the daughter of my grandfather's only son.'* Who is she to Ramesh?"

Step-by-step:
- Ramesh's grandfather's only son = Ramesh's father (only son means no chacha).
- Ramesh's father's daughter = Ramesh's sister.
- **Answer: Sister.**
- **Time: ~25 sec.**

> **Pro tip:** "Only son/daughter" qualifier ko miss mat karna — yeh ambiguity ko kill karta hai. Without "only", "father's son" can also mean Ramesh himself or his brother.

### 4.4 The "How is X related to Y" 2-step trace

"A is brother of B. B is daughter of C. C is wife of D. How is D related to A?"
- A is brother of B → A and B are siblings.
- B is C's daughter → C is B's parent. C is wife of D → C is female (mother), D is male (father).
- D is the father of B and A. **Answer: D is A's father.**

> **Tree on paper:**
> ```
>      D ═══ C
>            |
>      ┌─────┴─────┐
>      A           B
> ```

### 4.5 Three-generation puzzle

"P is father of Q. R is daughter of P. S is brother of P. T is mother of S. How is T related to R?"

Setup paper pe:
- P = male (father of Q).
- R is daughter of P.
- S is P's brother → S is male, also P's parent's child.
- T is S's mother → T is also P's mother (S and P are brothers, share mother).
- T is P's mother. R is P's daughter. So T is R's **paternal grandmother (dadi)**.
- **Time: ~50 sec.**

### 4.6 Coded blood relations

"A + B means A is mother of B. A − B means A is brother of B. A × B means A is father of B. If P + Q × R − S, how is P related to S?"

Decode:
- P + Q: P is mother of Q.
- Q × R: Q is father of R. So Q is male.
- R − S: R is brother of S.
- Chain: P is grandmother of R and S (S is R's sibling, R is Q's child, Q is P's child).
- **Answer: P is S's grandmother (dadi).**

### 4.7 Common traps

- **Brother of mother = mama**, not chacha. Gender of intermediate matters.
- **"Only daughter"** vs "**a daughter**" — only excludes other daughters; just "a daughter" doesn't.
- **Cousin is gender-neutral** in English. Don't assume male.
- **"Wife's husband" = self.** Sounds dumb but appears in trick questions.
- **In-laws**: same generation but spouse's side. Saala (wife's brother) vs Devar (husband's brother).

### 4.8 The 60-second blood relation playbook

1. Read once.
2. Draw tree on paper — start with the "anchor" person (one mentioned most).
3. Use squares/circles for gender, lines for relations.
4. Resolve unknowns left-to-right.
5. Read final question, trace from one node to other on tree.

---

## 5. Direction Sense — coordinate plane technique

2-3 questions per test. Pen-paper diagram is non-negotiable.

### 5.1 The compass setup

Convention: **North = up (+Y), South = down (−Y), East = right (+X), West = left (−X)**. Diagonals: NE, NW, SE, SW.

### 5.2 The 4 turn rules (memorise pucca)

If you face direction D and turn:
- **Right (clockwise 90°)**: N→E, E→S, S→W, W→N.
- **Left (anticlockwise 90°)**: N→W, W→S, S→E, E→N.
- **About-turn (180°)**: N↔S, E↔W.
- **Half-right (45°)**: N → NE, E → SE, etc.

### 5.3 The 5-step coordinate method

For multi-step direction problems:
1. Place start at (0, 0).
2. After each move, update (x, y).
3. Use vector: N = (0, +d), S = (0, −d), E = (+d, 0), W = (−d, 0).
4. Final position from origin: distance = `√(x² + y²)`, direction by sign of x, y.

> **Worked example:** Ravi walks 10m east, then 5m north, then 6m west, then 5m south. Distance from start?
> - Start (0,0). +10 east → (10, 0). +5 north → (10, 5). −6 west → (4, 5). −5 south → (4, 0).
> - Final = (4, 0). Distance = √(16 + 0) = **4 m east of start**.
> **Time: ~30 sec** with diagram.

### 5.4 Diagonal distance — Pythagoras

Most common 80-second-killer setup:

> **Worked example:** Asha walks 4m north, 3m east. Distance from start?
> - Position = (3, 4). Distance = √(9+16) = √25 = **5 m**.
> - Direction = north-east of start (since x > 0, y > 0).
> **Time: ~15 sec.**

**Memorise Pythagorean triples**: (3,4,5), (5,12,13), (8,15,17), (7,24,25). Question often uses these so √ is integer.

### 5.5 Bearing problems

"In which direction is B from A if B is 30° east of north of A?"
- Picture compass at A, rotate 30° from north towards east.
- Direction lies in **NE quadrant**, closer to north.
- Distance separately given.

### 5.6 Spinning + reflection traps

"Suresh faces north. He turns 135° clockwise. Now faces?"
- 90° clockwise from north = east. Another 45° clockwise = SE.
- **Answer: South-East.**

"He turns 270° anticlockwise from south?"
- 270° anticlockwise = 90° clockwise (since 360 − 270 = 90).
- 90° clockwise from south = west. **Answer: West.**

### 5.7 Shadow direction (sun-based)

- **Morning (sunrise in east)**: Shadow falls towards **west**.
- **Evening (sunset in west)**: Shadow falls towards **east**.
- **Noon (sun overhead)**: No shadow (or directly below).

> **Trick:** "Ramesh's shadow falls to his right at 6 AM. Which direction is Ramesh facing?"
> - At 6 AM, sun is east, shadows fall west. If shadow is on Ramesh's right, Ramesh's right = west, so Ramesh faces **north**.

### 5.8 The 45-second direction playbook

1. Draw compass (N up).
2. Plot start, walk through each instruction with arrows.
3. Mark final position.
4. Calculate displacement using x, y deltas.
5. Use Pythagoras for diagonal.

---

## 6. Syllogisms — Aristotle ka 2400-year-old gift

3-5 questions per test. Most students mess this up because they bring **world knowledge** into pure logic.

### 6.1 The four classical statements

| Type | Form | Example |
|------|------|---------|
| A (universal affirmative) | All A are B | All cats are animals |
| E (universal negative) | No A are B | No cats are dogs |
| I (particular affirmative) | Some A are B | Some men are doctors |
| O (particular negative) | Some A are not B | Some men are not doctors |

**Key rule**: "Some" = at least one, possibly all. "Some A are B" allows "All A are B" as a subset case.

### 6.2 The Venn diagram method (the 3-circle trick)

For each statement, draw circles representing classes. Premises mein given relations sketch karo:

- **All A are B**: A circle entirely inside B circle.
- **No A are B**: A and B circles disjoint (no overlap).
- **Some A are B**: A and B circles overlap (at least one shared point).
- **Some A are not B**: There exists at least one part of A outside B.

Conclusion check karne ke liye: kya conclusion **possible diagrams ke saare versions mein** true hai? Agar haan, conclusion **definitely follows**. Agar at least one valid diagram mein false, **does not follow**.

### 6.3 Worked example — classic 2-statement syllogism

> **Statements:**
> 1. All books are pens.
> 2. All pens are erasers.
>
> **Conclusions:**
> I. All books are erasers.
> II. Some erasers are books.

Diagram:
- Books ⊂ Pens (books inside pens).
- Pens ⊂ Erasers (pens inside erasers).
- So Books ⊂ Pens ⊂ Erasers.

Check conclusions:
- I. "All books are erasers" → Books ⊂ Erasers? **Yes.** Follows.
- II. "Some erasers are books" → Is there overlap? Books inside erasers → yes, books are subset of erasers, so they overlap. **Yes.** Follows.

**Both follow. Time: ~40 sec.**

### 6.4 The "all/no/some/some-not" decoder — quick rules

For 2 premise syllogisms:

| Premise 1 | Premise 2 | Valid Conclusion |
|-----------|-----------|------------------|
| All A are B | All B are C | All A are C |
| All A are B | No B are C | No A are C |
| Some A are B | All B are C | Some A are C |
| All A are B | Some B are C | Some A are C (often **invalid** — careful!) |
| No A are B | All C are A | No C are B |
| Some A are not B | All B are C | Cannot conclude |

**Universal rule:** "From two negatives or two particulars, no valid conclusion." Tu agar dekhe "Some... Some..." in premises, immediately conclusion mein "**neither follows**" probability bahut zyada.

### 6.5 The "either-or" rule for complementary pairs

If conclusion I is "Some A are B" and conclusion II is "No A are B" — these are **contradictory** (cannot both be false). Agar individually neither follows but they cover all possibilities, answer is "**Either I or II follows**".

> **Worked example:**
> - Statement: All metals are conductors.
> - Conclusion I: Some metals are not conductors.
> - Conclusion II: All metals are conductors.
>
> Statement directly says all metals are conductors → II follows. I is contradictory to statement → does not follow.
> **Answer: Only II follows.**

### 6.6 Common traps

1. **"All A are B" does NOT mean "All B are A".** Books are pens ≠ Pens are books.
2. **"Some A are B" does NOT exclude "All A are B".** Logical "some" = at least one, possibly all.
3. **"No A are B" is symmetric.** No cats are dogs ↔ No dogs are cats.
4. **Bringing real-world knowledge.** "All cats are dogs" sounds absurd but if given as premise, treat it as TRUE.
5. **3-statement syllogisms** (e.g., banking exams) need **chain through middle term**. Stuck? Eliminate options by counter-example diagram.

### 6.7 Worked example — tricky 3-statement

> **Statements:**
> 1. Some doctors are engineers.
> 2. All engineers are teachers.
> 3. No teacher is a player.
>
> **Conclusions:**
> I. Some doctors are teachers.
> II. No engineer is a player.
> III. Some doctors are not players.

Diagram:
- Doctors ∩ Engineers ≠ ∅ (some overlap).
- Engineers ⊂ Teachers (all engineers inside teachers).
- Teachers ∩ Players = ∅ (no overlap).

Check:
- I. Some doctors are teachers? Doctors overlap engineers, engineers ⊂ teachers, so doctors ∩ engineers ⊂ teachers. So those overlap doctors ARE teachers. **Follows.**
- II. No engineer is a player? Engineers ⊂ Teachers, Teachers ∩ Players = ∅, so Engineers ∩ Players = ∅. **Follows.**
- III. Some doctors are not players? Doctors who are also engineers are teachers, and teachers are not players. So those doctors are not players. So at least some doctors are not players. **Follows.**

**All three follow. Time: ~75 sec.**

### 6.8 The 60-second syllogism playbook

1. Read all premises. Convert each to Venn relationship.
2. Draw a single composite Venn diagram with all classes.
3. Mark guaranteed regions (filled circles) and possible regions (dashed).
4. Test each conclusion against diagram.
5. If any single valid diagram falsifies a conclusion → it doesn't follow.

> **Pro tip:** When stuck between "follows" and "doesn't follow", try to **draw a counter-example diagram**. If you can construct any valid arrangement of premises where conclusion fails, it does NOT follow.

---

## 7. Seating Arrangement — the 5-minute puzzle

This is **the** big-ticket cluster — usually 4-5 sub-questions worth 4-5 marks. If you crack the setup, you score the cluster. If setup goes wrong, all sub-questions fail.

### 7.1 Three formats you'll see

1. **Linear single row** — N people in a line, all face one direction.
2. **Linear double row** — two rows facing each other.
3. **Circular** — round table, facing centre OR facing outside.
4. **Square / rectangular table** — usually 8 people, 2 per side, facing centre.

### 7.2 The universal setup playbook

1. **Draw the layout first** — ek line/circle/square.
2. **List all clues numbered** 1, 2, 3...
3. **Find the "anchor" clue** — usually the most concrete (e.g., "P sits at the extreme left").
4. **Place the anchor.** Then chain: each clue gives one more position.
5. **Mark uncertainty.** If two configurations are possible, draw both and eliminate using subsequent clues.
6. **Cross-check final** with all clues. If even one clue violated, restart.

### 7.3 Linear single row — worked example (5-minute target)

**Puzzle:** Six friends — A, B, C, D, E, F — sit in a row facing north.
- A is to the immediate left of D.
- C is third from the left.
- F is at one of the ends.
- B sits between E and C.
- E is not at any end.

**Step 1: Layout.**
```
Position:  1   2   3   4   5   6
            ___ ___ ___ ___ ___ ___
                       (Facing north → right is East)
```

**Step 2: Place C.** C is third from left → position 3.
```
__ __ C __ __ __
```

**Step 3: B between E and C.** So either E−B−C (positions 1, 2, 3) or C−B−E (positions 3, 4, 5).

**Sub-case A:** E=1, B=2, C=3. But "E is not at any end" → E ≠ 1. **Reject.**
**Sub-case B:** C=3, B=4, E=5. E=5, not an end (end = 6). OK.

```
__ __ C B E __
```

**Step 4: F is at an end.** Ends are 1 and 6. Position 6 is empty, position 1 empty. F can be 1 or 6.

**Step 5: A is immediate left of D.** Remaining positions for A, D: 1 and 2 (after F). If F=6: positions left are 1, 2 for A, D → A=1, D=2. If F=1: positions left are 2 (and one of 6, but 6 occupied by no one yet). Wait, if F=1, then positions 2 empty + 6 empty for A, D. A and D adjacent → must be in 5,6 or 6 alone… Hmm position 5 is E, so A=6 means D needs to be at position 7 (doesn't exist) — invalid. So F ≠ 1.

**Therefore F = 6.** Then A=1, D=2.

**Final arrangement:**
```
A   D   C   B   E   F
1   2   3   4   5   6
```

**Verify all clues:** A immediate left of D ✓. C at 3 ✓. F at end (6) ✓. B between E and C? B=4, E=5, C=3 — yes B is between E and C ✓. E not at end ✓.

**Sub-questions** (now trivial):
- Who is at position 4? **B.**
- How many people are between A and E? **3 (D, C, B).**
- Who is to the immediate right of C? **B.**

**Total time: ~4 minutes for setup, ~10 sec each sub-question.**

### 7.4 Circular arrangement — facing rules

**Critical rule:** In circular puzzles, **left and right depend on facing direction**.
- **Facing centre**: your left is **clockwise neighbour's right** (yaani, your immediate left is the person on your **clockwise** side from outside view).
- **Facing outward**: opposite — your left is the person on your **anticlockwise** side from outside view.

Diagram tip: Always draw circle, mark each person's **face direction with arrow**. Then "left of P" is consistent.

### 7.5 Circular worked example (mini)

**Puzzle:** 5 people — P, Q, R, S, T — sit around a circle facing centre.
- P is to the immediate left of Q.
- R is opposite P.
- S is between R and T.

**Setup:**
- 5 people, no exact "opposite" (5 is odd, opposite is approximate). Actually for 5 people, "opposite" usually means 2-3 seats away. Let's interpret as "across" loosely.
- Place P at top. Facing centre → P's left (immediate clockwise from outside) = Q. So Q is at position right of P (when looking from outside).
- R is opposite P → R is at bottom.
- S between R and T: R has two neighbours, T is the other.

This is doable in ~3 minutes with diagram.

> **Pro tip:** In circular puzzles, **"facing centre" + "facing outward" mixed** is the hardest. If question says "P faces outward, Q faces centre," draw arrows on each — left/right meanings flip.

### 7.6 Square table arrangement

8 people, 2 per side. Corner persons see 2 neighbours (one corner, one side). Side persons see 2 corner neighbours. **Direction of facing matters** — usually all face centre or away.

**Strategy**: Draw square with 2 dots per side, label sides N/S/E/W. Each clue "A is to the left of B" needs facing context.

### 7.7 Common traps in arrangement

1. **"Immediate" vs "next to"** — both mean adjacent, but read carefully.
2. **"Between"** in circular = could be either direction unless specified.
3. **"Two seats away"** = with one person in between.
4. **"Faces"** — when one person faces another, it's about a double row arrangement, not their orientation.
5. **Number of positions** — "third from right" means 3rd if you count from rightmost. In 6-person row, third from right = position 4.

### 7.8 The 5-minute setup decision

If after **3 minutes** of setup, you have less than 50% positions filled and clues feel ambiguous — **mark and skip**. Cluster sacrifices entire 4-5 questions, but burning 8 minutes on stuck setup costs 6 other questions you could've nailed.

---

## 8. Puzzle Sets — the 3D grid match

Beyond seating, you'll see attribute-matching puzzles: **3-4 people, each with multiple attributes** (job, city, color, day, etc.).

### 8.1 The grid technique

Draw a table:

|       | Person 1 | Person 2 | Person 3 | Person 4 |
|-------|----------|----------|----------|----------|
| Job   |          |          |          |          |
| City  |          |          |          |          |
| Color |          |          |          |          |

For each clue, put **✓** in confirmed cell, **✗** in eliminated. Iterate till table fills.

### 8.2 Worked example — attribute matching

**Puzzle:** Four friends — Aman, Bhavna, Chetan, Divya — like different colors (red, blue, green, yellow) and live in different cities (Delhi, Mumbai, Pune, Chennai).
- Aman doesn't like red and lives in Mumbai.
- The one who likes green lives in Delhi.
- Bhavna lives in Pune.
- Chetan likes blue.
- Divya doesn't like yellow.

**Step 1: Aman → Mumbai. Cross out red for Aman.**
**Step 2: Bhavna → Pune.**
**Step 3: Chetan → Blue.**
**Step 4: Green → Delhi.** Aman is in Mumbai, so Aman ≠ green. Bhavna in Pune ≠ green. Chetan likes blue ≠ green. So **Divya likes green and lives in Delhi.**
**Step 5: Remaining cities for Chetan: Chennai (only city left).**
**Step 6: Aman doesn't like red, Chetan likes blue, Divya likes green. So Aman likes yellow or red. Aman ≠ red → Aman = yellow. Bhavna = red.**

**Final:**
| Name | City | Color |
|------|------|-------|
| Aman | Mumbai | Yellow |
| Bhavna | Pune | Red |
| Chetan | Chennai | Blue |
| Divya | Delhi | Green |

**Verify all clues:** Aman ≠ red ✓, Aman = Mumbai ✓. Green → Delhi (Divya) ✓. Bhavna → Pune ✓. Chetan = blue ✓. Divya ≠ yellow ✓ (she's green).

**Time: ~3 minutes.**

### 8.3 Comparison / ranking puzzles

"Among 5 people, A is taller than B, B is taller than C, D is shorter than C, E is taller than A."

Step: **Build chain from clues.**
- A > B (taller)
- B > C
- C > D
- E > A

Combine: E > A > B > C > D. **Tallest = E, shortest = D.**

> **Pro tip:** Use `>` consistently — if "X is heavier than Y" treat as X > Y. Don't flip mid-puzzle.

### 8.4 Scheduling puzzles

"Five meetings — M1 to M5 — held Monday to Friday, one each day."
- M3 is on Wednesday.
- M1 is two days before M4.
- M5 is on Friday.

Setup: Days Mon, Tue, Wed, Thu, Fri.
- M3 → Wed.
- M5 → Fri.
- Remaining: Mon, Tue, Thu for M1, M2, M4.
- M1 is two days before M4 → if M1 = Mon, M4 = Wed (taken). If M1 = Tue, M4 = Thu ✓. So M1 = Tue, M4 = Thu, M2 = Mon (only one left).

**Final: Mon = M2, Tue = M1, Wed = M3, Thu = M4, Fri = M5.**

### 8.5 Common traps

1. **"Before/after"** — "M1 is two days before M4" means M4 = M1 + 2 days.
2. **Day order** — Monday is day 1 in workweek; Sunday could be day 7 or day 1 depending on context.
3. **"Not consecutive"** — A and B not consecutive doesn't preclude them being in same week — only their **adjacency** is forbidden.
4. **Inclusive vs exclusive** — "Between Monday and Friday" usually means Mon-Fri inclusive.

### 8.6 The 4-minute puzzle decision

If puzzle has **5+ attributes** per entity and **8+ clues**, it's high-effort. Confirm 1 mark per question. If cluster is 5 questions, total 5 marks for 5+ minutes — break-even at best. Skip if alternative individual questions remain.

---

## 9. Statement & Conclusion / Statement & Assumption

2-4 questions per test. Conceptually subtle; many candidates over-think.

### 9.1 Statement & Conclusion — what to look for

**A conclusion follows** if it can be **directly inferred** from the statement without external knowledge or assumption.

> **Statement:** "The government has banned single-use plastic bags from January."
> **Conclusion I:** All shops will stop using plastic bags from January.
> **Conclusion II:** Plastic pollution will reduce.
>
> **Analysis:**
> - I: "Government banned" ≠ "all shops will comply." Compliance is not stated. **Does not follow.**
> - II: "Pollution will reduce" requires assumption about effectiveness. Not stated. **Does not follow.**
>
> **Answer: Neither follows.**

### 9.2 The "definitely follows" vs "may follow" distinction

- **Definitely follows**: conclusion is **logically necessary** given the statement — no scenario where statement is true but conclusion false.
- **May follow** (probably / possibly): conclusion is plausible but not necessary. Treated as "does not follow" in standard tests.

> **Pro tip:** When in doubt, ask: "Is there a possible world where statement is TRUE but conclusion is FALSE?" If yes, conclusion does NOT follow. If no, it follows.

### 9.3 Statement & Assumption

**An assumption** is something **necessarily true for the statement to make sense**. It's the **unstated premise** behind the speaker's position.

> **Statement:** "Use Patanjali toothpaste for stronger teeth."
> **Assumption I:** Patanjali toothpaste is effective.
> **Assumption II:** Other toothpastes are ineffective.
>
> **Analysis:**
> - I: For the advertisement to make sense, the speaker assumes Patanjali works. **Implicit.**
> - II: "Other are ineffective" is NOT needed for the statement. The statement only promotes Patanjali, doesn't downgrade others. **Not implicit.**
>
> **Answer: Only I is implicit.**

### 9.4 Implicit vs explicit — the boundary

- **Explicit**: directly stated.
- **Implicit (assumption)**: required to be true for the statement to make logical or practical sense.
- **Inference / conclusion**: deductive consequence of statement.

A statement can have **multiple implicit assumptions**; an inference must be **uniquely** derivable.

### 9.5 Common traps

1. **Overgeneralisation**: "Some students passed" does NOT mean "Most students passed."
2. **Causation vs correlation**: "Sales rose after ad" doesn't conclude "ad caused rise."
3. **Negation traps**: "Not impossible" ≠ "certain". "Not all" ≠ "none."
4. **Assumption ≠ desire/wish**: "I want X" implies the speaker values X, but X being true is not assumed.

### 9.6 Quick decision template

For each conclusion / assumption:
1. Read statement carefully.
2. Ask: "Is this conclusion **logically forced** by the statement alone?"
3. If yes → follows / implicit.
4. If it requires extra assumption → does not follow.
5. **Time per question: 60-75 sec.**

---

## 10. Data Sufficiency — the "do I have enough" framework

3-4 questions in CAT-style and TCS Digital tests. **Most misunderstood topic.**

### 10.1 The 5-option framework (standard format)

Every DS question gives a **question + 2 statements**. You must determine if the statements are sufficient to answer the question.

| Option | Meaning |
|--------|---------|
| A | Statement 1 alone is sufficient, but Statement 2 alone is not. |
| B | Statement 2 alone is sufficient, but Statement 1 alone is not. |
| C | Both statements together are sufficient, but neither alone is. |
| D | Each statement alone is sufficient. |
| E | Both statements together are not sufficient. |

### 10.2 The cardinal sin — actually solving the question

In DS, **never compute the actual answer**. Just check sufficiency. If solving requires only Statement 1, mark A and move. Don't waste 30 sec finding the value.

### 10.3 Worked example 1 — single sufficient

> **Question:** What is the value of x?
> **Statement 1:** x + 5 = 10.
> **Statement 2:** x is positive.
>
> **Analysis:**
> - Statement 1 alone: x = 5 (single value). **Sufficient.**
> - Statement 2 alone: x is any positive number. **Not sufficient.**
>
> **Answer: A.**
> **Time: ~15 sec.**

### 10.4 Worked example 2 — both needed

> **Question:** Is the integer n odd?
> **Statement 1:** n is divisible by 3.
> **Statement 2:** n is divisible by 5.
>
> **Analysis:**
> - Statement 1 alone: n=3 (odd) or n=6 (even). **Not sufficient.**
> - Statement 2 alone: n=5 (odd) or n=10 (even). **Not sufficient.**
> - Both: n divisible by 15. n=15 (odd), n=30 (even). **Still not sufficient!**
>
> **Answer: E.**
> **Time: ~30 sec.** Don't fall for "both must be enough" assumption.

### 10.5 Worked example 3 — each alone sufficient

> **Question:** What is the area of the circle?
> **Statement 1:** Radius = 5 cm.
> **Statement 2:** Diameter = 10 cm.
>
> **Analysis:**
> - Statement 1: Area = πr² = 25π. **Sufficient.**
> - Statement 2: Radius = 5, area = 25π. **Sufficient.**
>
> **Answer: D.**
> **Time: ~10 sec.**

### 10.6 Common DS traps

1. **Restating the same info**: Statement 2 is just statement 1 re-phrased. Both alone sufficient → D.
2. **Linear equation alone**: One equation, one unknown → sufficient. Two unknowns → need second equation.
3. **Quadratic ambiguity**: x² = 25 has two solutions. **Not sufficient** unless sign constrained.
4. **Inequality vs equality**: "x > 3" is **not** sufficient to find exact x.
5. **Yes-No questions**: For "Is x positive?", a statement is sufficient if it gives a **definite yes or no** (not "x is sometimes positive").

### 10.7 The 60-second DS playbook

1. Read question — what's being asked? Value? Yes/No?
2. Test Statement 1 alone. Sufficient? Mark A or D candidate.
3. Test Statement 2 alone. Sufficient? Mark B or D candidate.
4. If neither alone, test both together.
5. Match to A/B/C/D/E.

> **Pro tip:** For yes/no questions, find a counter-example in 30 sec. If no counter-example exists in 60 sec → likely sufficient.

---

## 11. Cubes & Dice — spatial reasoning ka mini-section

1-3 questions per test. Visualisation required, but rules are mechanical.

### 11.1 Painted cube — the small cubes problem

A big cube of side `n` is painted on all faces, then cut into `n³` small cubes of side 1.

**Counts:**
- **3 faces painted (corner cubes)**: always **8** (one per corner).
- **2 faces painted (edge cubes, not corner)**: `12 × (n − 2)`.
- **1 face painted (centre of each face, not edge)**: `6 × (n − 2)²`.
- **0 faces painted (interior)**: `(n − 2)³`.
- **Total**: `n³` (sanity check: sum should equal n³).

> **Worked example:** Cube of side 4 painted, cut into 64 small cubes. How many have exactly 1 face painted?
> - 1-face = 6 × (4−2)² = 6 × 4 = **24**.
> - Verify: 8 + 12×2 + 24 + 8 = 8 + 24 + 24 + 8 = 64 ✓.
> **Time: ~25 sec.**

### 11.2 Different colors on faces

If different faces painted different colors, count splits per color. Quick rule: each face has `(n − 2)²` cubes painted only that color (the centre region of that face).

### 11.3 Dice rotation rules

Standard die: opposite faces sum to **7**. So 1↔6, 2↔5, 3↔4.

If you see two adjacent faces (e.g., 1 and 2 visible), the third face perpendicular is either 3 or 4 (not 6 or 5 since those are opposite of visible). Use right-hand rule or memorise standard orientation.

### 11.4 Dice question — opposite face

> **Question:** A die shows 1 on top and 2 on front. What's on the right face?
> - Top-bottom pair: 1-6. Front-back pair: 2-5. Right-left pair: must be 3-4.
> - Standard right-handed die: with 1 top, 2 front, **right = 3** (left = 4).
> **Answer: 3.**

### 11.5 Two-position dice problem

"A die is shown in two positions. In position 1: 1, 2, 3 visible (top=1, front=2, right=3). In position 2: 1, 4, 6 visible. What is opposite to 4?"

Approach: in position 2, 1 is still on top (or other face — depends on rotation). Track which face moved where. **Opposite of 4 = 3** (because 4-3 are paired and never appear together).

### 11.6 Counting visible faces

Cube viewed from one corner: **3 faces visible**. From edge: 2. From face: 1.

For stack of cubes, **each top cube hides the bottom of cube above it**. Count visible squares = total exposed surface area.

### 11.7 The 30-second cube-dice playbook

1. **Painted cube**: use formula. Don't draw small cubes one by one.
2. **Dice**: write opposite pairs (1-6, 2-5, 3-4). Match clues to find unknown faces.
3. **Visualisation**: if pen-paper, draw net of cube (6 squares cross shape).
4. Don't burn 90 sec — these are formula questions.

---

## 12. Top 25 trickiest LR questions — rapid table

| # | Question | One-line shortcut | Answer |
|---|----------|-------------------|--------|
| 1 | Code: CAT → DBU. What is DOG? | Shift +1 each letter | EPH |
| 2 | Series: 2, 6, 12, 20, 30, ? | n(n+1) for n=1..5; next = 6×7 | 42 |
| 3 | A is brother of B, B is daughter of C. C is wife of D. D to A? | D is father of B, A is brother → D is father of A | Father |
| 4 | Walk 4m N, 3m E. Distance from start? | Pythagoras (3,4,5) | 5m |
| 5 | All books are pens; all pens are erasers. Some erasers are books? | Books ⊂ Pens ⊂ Erasers; subset overlaps | Yes follows |
| 6 | 6 friends linear, C is 3rd from left, F at end, A immediate left of D | Anchor C, place ends, then chain | Setup-based |
| 7 | Painted cube side 4; 1-face painted small cubes | 6(n−2)² = 6×4 | 24 |
| 8 | Die: top=1, front=2. Right face? | Standard die: opposite pairs 1-6, 2-5, 3-4 | 3 |
| 9 | Father's only son's daughter. Relation? | Son's daughter | Daughter (or self if "I") |
| 10 | Series: 1, 4, 9, 16, 25, ? | Squares of 1..5 | 36 |
| 11 | Code: BAT = 23 (sum). CAT = ? | C(3)+A(1)+T(20) = 24 | 24 |
| 12 | Same direction trains 80 m + 120 m at 60 km/hr and 40 km/hr | Relative speed 20 km/hr; total length 200m | 36 sec |
| 13 | Some doctors are engineers; all engineers are teachers. Some doctors are teachers? | Overlap chain | Follows |
| 14 | Mirror code of LION | 27−p for each letter | ORLM |
| 15 | DS: x²=25, sufficient to find x? | Two solutions ±5 | Not sufficient |
| 16 | A circular table, P opposite to S, 5 between them clockwise | Total 10 seats (= 2×5+0); position by gap | 10 seats |
| 17 | Letter series: AZ, BY, CX, DW, ? | First +1, second −1 | EV |
| 18 | Painted cube side 5, 0-face cubes | (n−2)³ = 27 | 27 |
| 19 | Pointing photo: "father of my son" — who? | Self | Speaker |
| 20 | Series: 3, 9, 27, 81, ? | GP ×3 | 243 |
| 21 | Direction: face N, turn 135° clockwise | 90° + 45° = SE | South-East |
| 22 | Some A are not B; all B are C. Conclusion: Some A are not C? | Cannot conclude (counter-example possible) | Doesn't follow |
| 23 | DS: x is even and x is divisible by 5. Is x divisible by 10? | Even ∩ div-by-5 = div by 10 | Sufficient (yes) |
| 24 | Coded: P + Q = P is mother of Q. P + Q × R, P to R? | Mother of father = grandmother | Grandmother |
| 25 | Cube side 3, painted red; 2-face painted? | 12(n−2) = 12 | 12 |

> **Pro tip:** Iss table ko study desk pe paste kar de. Daily 5 min revision = pattern hardwired in 2 weeks.

---

## 13. Pre-test checklist + 80-sec survival guide for LR

### 13.1 Night-before checklist

- [ ] Alphabet position table memorised — A=1, F=6, K=11, P=16, U=21, Z=26.
- [ ] Compass directions and turn rules (right = clockwise 90°) reflexive.
- [ ] All 4 syllogism statement types (A, E, I, O) and their Venn diagrams clear.
- [ ] Painted cube formulas in one A4 page.
- [ ] Standard dice opposite pairs: 1-6, 2-5, 3-4.
- [ ] 5 mock LR sections completed last week. Identified weakest topic.
- [ ] 7 hours sleep, brain fully rested. LR is more pattern recognition than memory — fatigue kills accuracy.

### 13.2 Inside-the-test playbook

1. **First 60 seconds**: skim all 25-30 questions. Tag E (≤30 sec), M (60-90 sec), P (puzzle cluster, 4-5 min).
2. **Easies first** (10 minutes target): coding-decoding, series, blood relations, direction sense — knock out 12-15 questions.
3. **Medium individuals next** (15 min): syllogism, statement-conclusion, data sufficiency, cubes-dice — aim 8-10 more.
4. **Puzzle cluster last** (15-20 min): take the easier-looking puzzle. Setup carefully. If 4-5 sub-questions, total 5+ min.
5. **Last 3-5 min**: review marked questions, no fresh attempts.

### 13.3 The 100-second decision tree per question

When you read a question, **first 10 seconds** decide:
- **Direct pattern recognition** (series, code, mirror)? → solve in 30-50 sec.
- **Multi-step diagram** (blood relation, direction, syllogism)? → 60-90 sec, draw on paper.
- **Cluster puzzle**? → estimate setup time. > 4 min? Skip cluster, return at end.
- **Data Sufficiency**? → don't solve, just check sufficiency. ~60 sec.

**Hard rule:** if a non-cluster question crosses **120 seconds**, mark and skip. Three medium questions sacrifice karke ek hard solve karna gaadhe ka beta hai.

### 13.4 Common silly mistakes — pre-flight check

- **Direction**: north is UP in convention; check sign of x, y after each turn.
- **Coding**: confirm pattern with **2 letters**, not 1. One coincidence misleads.
- **Blood relation**: gender of intermediate matters (mama vs chacha).
- **Syllogism**: don't bring world knowledge. "All cats are dogs" — accept and reason.
- **Seating**: facing direction flips left/right; mark arrows.
- **Data sufficiency**: don't solve. Just judge sufficiency.

### 13.5 Mental gym (10 min daily)

- **Alphabet quiz**: random letter → position number, in 2 sec.
- **Mirror practice**: spell DOG, GOD, CAT, BAT mirror in 5 sec each.
- **Direction reflex**: "face X, turn Y" → final direction in 3 sec.
- **Series patterns**: 5 series daily, identify type in 10 sec.
- **One puzzle per day**: 4-5 person seating, complete in 5 min.

These compound over 60 days. Every question 5 sec faster = 30 questions × 5 = 2.5 minute saved per test = 1-2 extra questions answered.

### 13.6 The "cluster decision" rule

LR has high-leverage clusters (4-5 questions, 4-5 marks). But **all-or-nothing risk**:
- **High-confidence cluster** (constraints clear, 3 attributes max): commit 5 min, lock the marks.
- **Ambiguous cluster** (vague constraints, 4+ attributes): solve **only the last sub-question** (often answerable from partial setup) and skip rest.
- **Both clusters look hard**? Pick the one with fewer entities (4 < 5 < 6 etc.).

> **Pro tip:** Practice clusters under 5-minute timer at home. Real test pressure adds 30% time. So home target = 4 min for safety in test.

### 13.7 Final mental check

LR mein **calmness > speed**. Panic se diagram galat banta hai, fir har sub-question fail hota hai. Deep breath, pen-paper, **trust the process**. Volume of practice = pattern memory = real-time solving without thinking.

---

## What to learn next

LR strong ho gayi? Bahut badhiya — but ye triangle ka ek vertex hai. Round 1 cutoff clear karne ke liye saare 3 vertices same level pe chahiye. Next steps:

1. **`aptitude-quant`** — agar pehle nahi padha to wahaan jaa. 11 topics, slow-vs-fast workflow, 25 trickiest table. Quant + LR same day attempt karo to dono ka stamina build hota hai.
2. **`aptitude-verbal`** — synonyms, RC, error spotting. Easy section but cutoff exists. Daily 30-min reading habit (newspaper editorial like *The Hindu*) gives 80%+ score easy. **Don't underrate verbal** — bohut students yahin marke quant ka score waste karte hain.
3. **DSA practice** — once aptitude clears, online round mein 1-2 coding questions. Read **DSA fundamentals** module. Arrays, strings, hashing, two pointers, basic recursion — that's enough for service company round 1. For product (Amazon, Microsoft), trees + graphs + DP zaruri hai.
4. **Mock interviews** — final round ki tayari. Tell-me-about-yourself in Hindi-English mix, project explanations, behavioural STAR format. Communication 60% of rejections at this stage, technical 40%.

LR ka magic: **ek baar pattern dimaag mein bait gaya, life-long retain hota hai**. Quant mein formula bhulta hai, LR mein blood relation pakdne ka reflex saath rahega. 1500 questions practiced = top quartile. 3000 = top 5%. Aapke saath 60 days ka commitment — mock tests, daily practice, weekly self-review.

Lage raho. Gate clear ho jayegi. All the best.
