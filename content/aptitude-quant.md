# Quantitative Aptitude — The Placement Gateway

Bhai, sach bata du? Tu jitna marzi DSA kar le, system design padh le, React ke 14 hooks ratta maar le — agar **TCS NQT ka aptitude section clear nahi kiya**, to teri resume kabhi recruiter tak pahunchegi hi nahi. Ye crude truth hai Indian campus placements ki. Aptitude ek **gate** hai — pass karega to interview milega, fail to system tujhe filter kar dega before any human even sees your name.

Iss subject ka motto simple hai: tujhe IIT-JEE level mathematician banane ka iraada nahi hai. Iraada hai ki tu **30 questions in 40 minutes** ko comfortably handle kar sake — yaani **80 seconds per question** — and 70%+ accuracy maintain kar paaye. Service companies (TCS, Infosys, Wipro, Cognizant, Capgemini, LTI, HCL) sab same template follow karti hain, aur AMCAT/eLitmus jaisi off-campus tests bhi same playbook pe chalti hain.

Hum 11 core topics cover karenge — number system se probability tak — har topic mein **slow formula method aur fast shortcut method** dono dikhayenge, with timings. End mein 25 trickiest interview-style questions ka rapid-fire table hai aur ek pre-test survival checklist. Chai pani saath rakh, calculator side mein rakh, aur lage raho.

---

## 1. Why aptitude is the gate — TCS NQT ki asli kahaani

### 1.1 The structure tu face karega

TCS NQT (National Qualifier Test) ka pattern roughly aisa hai:

| Section | Questions | Time | Difficulty |
|---------|-----------|------|------------|
| Numerical Ability (Quant) | 25-30 | 40 min | Moderate to Hard |
| Verbal Ability (English) | 20-25 | 25 min | Easy |
| Reasoning Ability | 25-30 | 50 min | Moderate |
| Coding (1-2 problems) | 1-2 | 45-90 min | Easy-Medium |

Quant section sabse **cutoff-deciding** hai. Why? Coding pass karna binary hai (works ya doesn't), reasoning predictable patterns hain — but quant mein **silly mistakes** se 5 marks kat jaate hain bina pata chale. AMCAT mein adaptive scoring hai (galat answer = points minus next question harder), eLitmus mein percentile-based hai (top 5% = good). Galti yahan affordable nahi.

### 1.2 The 80-second math

30 questions ÷ 40 minutes = **80 seconds per question average**. But ye uniform nahi hota:

- Easy direct-formula questions (number system, percentages basic): **20-30 sec** maaro.
- Medium (TSD trains, mixtures): **60-90 sec** dena padega.
- Hard (probability with conditional, P&C with restrictions): **120-150 sec** ya **skip**.

> **Pro tip:** Test start hote hi pehle 2 minute pure section pe ek nazar daal — easy questions identify kar le, unko pehle solve kar. "Linear order" mat follow kar. Easy ones ka 25 sec average bachega, jo tu hard ones pe invest karega.

### 1.3 Shortcuts > formulas — yahi pure subject ka soul hai

Formula ratta maarna 12th class style hai. Aptitude shortcut-driven hai. Example: "Sum of first n natural numbers" formula `n(n+1)/2` to sab jaante hain. But interviewer pucche "Sum of first 17 odd numbers?" — agar tu seedha `1+3+5+...` add karne lage, 90 sec gaye. Shortcut: **n odd numbers ka sum = n²**. So answer = 17² = 289. **Time: 5 seconds.** Ye difference hai jo tujhe top quartile mein le jayega.

Har topic mein hum dono dikhayenge — slow path (justify the formula) and fast path (one-line shortcut). Justification matter karta hai kyunki bina samjhe ratta lagayega to exam mein twist aane par phasega.

### 1.4 Realistic expectations

- **Cutoff for shortlisting** (TCS NQT, Infosys SP): roughly 60-70% in quant.
- **Top-tier (TCS Digital, Infosys DSE)**: 85%+ needed.
- **Daily prep target**: 30-40 questions for 60 days = 1800-2400 questions practiced. **Quantity matters** in aptitude — pattern recognition only develops through volume.
- Use IndiaBix, PrepInsta, Faceprep, GeeksforGeeks Aptitude — sab free hain.

---

## 2. Number System — foundation ka foundation

Ye topic 4-6 questions deta hai har test mein. Aur saare aage ke topics (HCF/LCM, remainders, ratios) issi pe build karte hain. Strong fundamentals = compounding returns.

### 2.1 Divisibility rules — ratta maar le

| Divisor | Rule |
|---------|------|
| **2** | Last digit even (0,2,4,6,8) |
| **3** | Sum of digits divisible by 3 |
| **4** | Last 2 digits divisible by 4 |
| **5** | Last digit 0 or 5 |
| **6** | Divisible by both 2 AND 3 |
| **7** | Take last digit, double it, subtract from rest. Repeat. Result divisible by 7 → original divisible. |
| **8** | Last 3 digits divisible by 8 |
| **9** | Sum of digits divisible by 9 |
| **10** | Last digit 0 |
| **11** | (Sum of digits at odd positions) − (sum at even positions) is 0 or divisible by 11 |

> **Worked example (rule of 7):** Is 2058 divisible by 7?
> - Last digit 8, double = 16. Rest = 205. 205 − 16 = 189.
> - Repeat: last digit 9, double = 18. Rest = 18. 18 − 18 = 0.
> - 0 divisible by 7 → yes, 2058 = 7 × 294.
> **Time:** ~25 sec. Slow path (long division): ~60 sec.

> **Worked example (rule of 11):** Is 95084 divisible by 11?
> - Odd-position digits (from right, position 1,3,5): 4, 0, 9. Sum = 13.
> - Even-position digits (position 2, 4): 8, 5. Sum = 13.
> - Difference = 0 → yes, divisible by 11. (95084 = 11 × 8644)
> **Time:** ~15 sec.

### 2.2 Prime, composite, co-prime

- **Prime**: only 1 and itself as factors. 2 is the only even prime — ye trick question banta hai. First 10 primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.
- **Composite**: more than 2 factors.
- **Co-prime**: HCF = 1. (8, 15) co-prime even though neither is prime.

To check if `n` is prime, only check divisors up to `√n`. Justification: if n = a × b and both a, b > √n, then a × b > n — contradiction. So at least one factor ≤ √n.

### 2.3 HCF and LCM — the factor-power trick

**HCF** (Highest Common Factor) = largest number dividing all given numbers.
**LCM** (Lowest Common Multiple) = smallest number divisible by all.

Slow method: prime-factorise both, then HCF = product of common primes with **min** power, LCM = product of all primes with **max** power.

> **Worked example:** Find HCF and LCM of 72 and 120.
> - 72 = 2³ × 3²
> - 120 = 2³ × 3¹ × 5¹
> - HCF: common primes with min power = 2³ × 3¹ = **24**
> - LCM: all primes with max power = 2³ × 3² × 5¹ = **360**
> - Sanity check: HCF × LCM = 24 × 360 = 8640 = 72 × 120 ✓
> **Time:** ~45 sec.

> **Shortcut for two numbers:** `HCF × LCM = a × b` always. So if you know HCF, LCM = (a×b)/HCF. **Time: ~10 sec** if HCF is given.

**Trick question:** "LCM of two numbers is 144, HCF is 12, one number is 36. Find other?" Answer = (144 × 12) / 36 = **48**.

### 2.4 Remainder theorems

**Theorem 1** (basic): When `a` is divided by `n`, remainder `r` satisfies `0 ≤ r < n`.

**Theorem 2** (modular arithmetic shortcut):
- `(a + b) mod n = ((a mod n) + (b mod n)) mod n`
- `(a × b) mod n = ((a mod n) × (b mod n)) mod n`

> **Worked example:** Remainder when 17 × 23 × 31 is divided by 7?
> - 17 mod 7 = 3, 23 mod 7 = 2, 31 mod 7 = 3.
> - Product mod 7 = (3 × 2 × 3) mod 7 = 18 mod 7 = **4**.
> **Time: ~20 sec.** Slow path (multiply 17×23×31 = 12121, then divide by 7): ~90 sec.

**Theorem 3** (Fermat's little, useful for big powers): If `p` is prime and `gcd(a, p) = 1`, then `a^(p-1) ≡ 1 (mod p)`.

> **Worked example:** Remainder of 2^100 divided by 7?
> - p=7 prime, so 2^6 ≡ 1 (mod 7).
> - 100 = 6 × 16 + 4. So 2^100 = (2^6)^16 × 2^4 ≡ 1 × 16 ≡ 16 mod 7 = **2**.
> **Time: ~30 sec.**

### 2.5 Last-digit cyclicity

Power ka last digit cycle karta hai. Memorise these cycles:

| Base ends in | Cycle of last digit | Cycle length |
|--------------|---------------------|--------------|
| 0, 1, 5, 6 | same digit forever | 1 |
| 4, 9 | two digits alternating | 2 |
| 2, 3, 7, 8 | four-digit cycle | 4 |

For 2: cycle is 2, 4, 8, 6 (then repeats). For 3: 3, 9, 7, 1. For 7: 7, 9, 3, 1. For 8: 8, 4, 2, 6.

> **Worked example:** Last digit of 7^123?
> - 7's cycle: 7, 9, 3, 1 (length 4).
> - 123 mod 4 = 3 → 3rd in cycle = **3**.
> **Time: ~15 sec.**

---

## 3. Percentages — the universal language of placement quant

Percentages literally har topic mein ghuste hain — profit/loss, interest, data interpretation, mixtures. Master this and 40% of quant becomes trivial.

### 3.1 Foundation

`x% = x/100`. To convert decimal to %, multiply by 100. Example: 0.375 = 37.5%.

**Common fraction-percentage equivalents** (ratta maar le, time saver):

| Fraction | % | Fraction | % |
|----------|------|----------|------|
| 1/2 | 50% | 1/8 | 12.5% |
| 1/3 | 33.33% | 1/9 | 11.11% |
| 1/4 | 25% | 1/10 | 10% |
| 1/5 | 20% | 1/11 | 9.09% |
| 1/6 | 16.67% | 1/12 | 8.33% |
| 1/7 | 14.28% | 1/16 | 6.25% |

Inko dekh ke seedha pehchanega problems mein. "What is 16.67% of 240?" → 1/6 of 240 = **40**. **Time: 5 sec.** Instead of (16.67/100) × 240 calculator madness.

### 3.2 % of % — the multiplication trick

"30% of 40% of 250" — slow method calculate each step. Fast: just multiply factors.
- = 0.30 × 0.40 × 250 = **30**.
- Or even faster: 30 × 40 / 100 = 12% of 250 = **30**.

### 3.3 Successive percentage changes

Yahi se trick questions aate hain. **Successive % is NOT additive.**

Net change formula for two successive changes a% then b%:
```
Net% = a + b + (a × b)/100
```
Where increase = positive, decrease = negative.

> **The classic salary example:** "Salary 10% badhi, fir 10% kati. Net change kya?"
> - Naive: +10 − 10 = 0%. **Wrong.**
> - Correct: +10 + (−10) + (10 × −10)/100 = −1%.
> - Salary 1% **kam** ho gayi.
> - **Why?** 100 → 110 (after +10%). Then 110 × 0.9 = 99. So you ended at 99, which is 1% less than 100.
> **Justification:** Increase ka base 100, but decrease ka base 110 — bigger base. So absolute decrease (11) > absolute increase (10).

> **Worked example:** Price increased 20% then decreased 20%. Net?
> - 20 + (−20) + (20 × −20)/100 = −4%. **4% net decrease.**
> **Time: ~10 sec.**

### 3.4 Increase / decrease conversions

**Trick:** "If A is 25% more than B, by what % is B less than A?"
- Slow: assume B=100, A=125. Then B is (25/125)×100 = 20% less than A.
- Shortcut: if x% more, then `(x / (100+x)) × 100`% less. = (25/125)×100 = **20%**.
- Reverse: if x% less, then `(x / (100−x)) × 100`% more.

### 3.5 Percentage points vs percent — most common confusion

"Interest rate 8% se 10% ho gaya." 
- **% point increase**: 10 − 8 = **2 percentage points**.
- **% increase**: (2/8) × 100 = **25%**.

Newspaper headlines often confuse these. Exam mein clearly read "by how many percentage points" vs "by what percent".

### 3.6 Percentage-driven sample question

> **Question:** A's income is 20% more than B's. B's income is 25% less than C's. By what % is A's income less than C's?
> - Let C = 100. Then B = 75 (25% less). A = 75 × 1.20 = 90.
> - A is 10% less than C. **Answer: 10%**.
> **Time with concrete numbers: ~30 sec.**
> **Time without (using formula chains): ~90 sec.**

> **Pro tip:** Jab bhi % chain mein phasaa hua mehsoos ho — **assume base = 100** (or a number that divides cleanly). Concrete > abstract in time-pressured exams.

---

## 4. Profit, Loss, Discount — shopkeeper math

This appears in 3-4 questions. The killer trap: confusing **CP** with **SP** in profit% calculation.

### 4.1 The three Ps and one M

- **CP** = Cost Price (jo dukaandar ne kharid li)
- **SP** = Selling Price (jo customer ko bechi)
- **MP** (or list price) = Marked Price (tag pe likha)
- **Discount** = MP − SP

### 4.2 Profit and loss formulas

```
Profit  = SP − CP   (when SP > CP)
Loss    = CP − SP   (when CP > SP)
Profit% = (Profit / CP) × 100      ← always on CP, NOT SP!
Loss%   = (Loss / CP) × 100
```

> **Trap:** "Item bechi ₹120 mein, profit 20% hua. CP kya?" Naive: 120 × 0.80 = 96. **Wrong.**
> - 20% profit on CP, not on SP. So SP = CP × 1.20.
> - 120 = CP × 1.20 → CP = **₹100**.
> **Time: ~15 sec** if formula clear.

### 4.3 Mark-up and discount

Shopkeeper marks up CP, then offers discount on MP:

```
SP = MP × (1 − discount%)
MP = CP × (1 + markup%)
```

### 4.4 Successive discount

Two successive discounts of d1% and d2% are NOT additive.

```
Effective discount% = 100 − [(1 − d1/100) × (1 − d2/100) × 100]
                    = d1 + d2 − (d1 × d2)/100
```

> **Worked example:** Two discounts of 20% and 10% successively. Equivalent single discount?
> - = 20 + 10 − (20 × 10)/100 = 28%. Not 30%.
> **Time: ~10 sec.**

### 4.5 False weight problem

Dishonest dukaandar 1 kg ke naam pe 900g deta hai. Profit% kya?

```
Profit% = (Error / (True value − Error)) × 100
       = (100 / 900) × 100 = 11.11%
```

Justification: he charges as if selling 1000g but actually delivers 900g. So for 900g of cost, he earns 1000g of revenue. Profit on actual goods sold = (100/900) × 100 = 11.11%.

### 4.6 Combo killer — markup + discount + tax

> **Worked example:** Shopkeeper marks up CP by 50%, gives 20% discount, buyer pays 5% tax. Net profit%?
> - CP = 100 (assume).
> - MP = 100 × 1.50 = 150.
> - SP after discount = 150 × 0.80 = 120.
> - With tax = 120 × 1.05 = 126 (but tax goes to govt, not shopkeeper, so ignore for profit calc).
> - Shopkeeper's profit = 120 − 100 = 20 → **20%**.
> **Time: ~30 sec.**

### 4.7 Loss-and-gain flat trick

"A man sold two cows at ₹1995 each. On one he gained 15%, on other he lost 15%. Total profit/loss?"

Shortcut: **Always loss** when SP same and equal % gain/loss. Loss% = (common%)² / 100 = 225/100 = **2.25% loss**.

Justification: 15% gain wali cow ka CP chhota tha (1995/1.15), 15% loss wali ka CP bada (1995/0.85). Bigger CP loses 15%, smaller CP gains 15% → net loss.

---

## 5. Ratio, Proportion, Mixtures — the silent destroyer

Questions feel simple but mistakes silently creep in. Especially mixture problems with replacement.

### 5.1 Ratio basics

`a : b` means a/b. `a : b : c` = a/k : b/k : c/k for any k. **Always reduce to lowest terms** unless asked otherwise.

### 5.2 Direct vs inverse vs compound

- **Direct**: A increases, B increases proportionally. `A/B = constant`. Example: distance ∝ time at constant speed.
- **Inverse**: A increases, B decreases. `A × B = constant`. Example: speed ∝ 1/time at constant distance.
- **Compound**: ratio of multiple variables combined. Example: men × days × hours = work.

### 5.3 The alligation rule (mixture)

Two ingredients of different prices/concentrations mixed to get a target. Quick way to find the **ratio** in which they're mixed:

```
        Cheaper (C)        Dearer (D)
              \              /
               \            /
                Mean (M)
               /            \
              /              \
         (D − M)          (M − C)
```

So ratio of cheaper : dearer = `(D − M) : (M − C)`.

> **Worked example:** Milk at ₹40/L mixed with milk at ₹60/L to get mixture worth ₹45/L. Ratio?
> - Cheaper = 40, Dearer = 60, Mean = 45.
> - Ratio = (60 − 45) : (45 − 40) = 15 : 5 = **3 : 1**.
> **Time: ~15 sec.** Slow algebra: ~60 sec.

### 5.4 Replacement formula (the milk-water classic)

Container has X litres of pure milk. Y litres removed and replaced with water. Done `n` times. Final milk%?

```
Milk fraction after n replacements = (1 − Y/X)^n
```

> **Worked example:** 40L pure milk. 4L drawn, replaced with water. Done 3 times. Milk left?
> - Fraction = (1 − 4/40)^3 = (0.9)^3 = 0.729.
> - Milk = 40 × 0.729 = **29.16 L**.
> **Time: ~25 sec.**

### 5.5 Partnership — profit-sharing

Partners A, B, C invest different amounts for different durations. Profit shared in ratio of `(investment × time)`.

> **Worked example:** A invests ₹10,000 for 12 months, B invests ₹15,000 for 8 months. Profit ₹6500. B's share?
> - Ratio = (10000 × 12) : (15000 × 8) = 120000 : 120000 = 1 : 1.
> - B's share = ₹3250.
> **Time: ~30 sec.**

### 5.6 Proportion property — ratta this

If `a : b = c : d`, then:
- `ad = bc` (cross multiplication)
- `(a + b) : (a − b) = (c + d) : (c − d)` (componendo-dividendo)

Useful when ratios are given indirectly.

---

## 6. Average, Weighted Average, Age problems

### 6.1 Basic average

```
Average = Sum / Count
```

If average of `n` numbers is `A`, sum is `n × A`. **Sum is the bridge.** Most average problems are solved by manipulating sum.

> **Worked example:** Average of 5 numbers is 30. If one number 50 is removed, new average?
> - Old sum = 5 × 30 = 150. New sum = 150 − 50 = 100. New average = 100/4 = **25**.
> **Time: ~10 sec.**

### 6.2 Weighted average

When groups have different sizes:

```
Weighted avg = (n1 × A1 + n2 × A2 + ...) / (n1 + n2 + ...)
```

> **Worked example:** Class A has 30 students, average 60. Class B has 20 students, average 80. Combined?
> - = (30 × 60 + 20 × 80) / 50 = (1800 + 1600)/50 = 3400/50 = **68**.
> **Time: ~20 sec.**

### 6.3 The shift trick

"Average of 6 numbers is 25. Add a 7th number, average becomes 27. The 7th number?"

Shortcut: when adding x to make average shift, `x = new_avg + (n × shift)`. Or simply: new_sum − old_sum.
- Old sum = 150, new sum = 7 × 27 = 189. 7th = 189 − 150 = **39**.
- **Time: ~10 sec.**

### 6.4 Replacement using alligation

"Average age of 30 students is 14. Teacher joins, average becomes 15. Teacher's age?"
- Sum increases by 30 × 1 = 30 (because all 30 averages bumped by 1) PLUS teacher contributes (s)he's own age.
- Old sum = 420. New sum = 31 × 15 = 465. Teacher's age = 465 − 420 = **45**.
- **Time: ~15 sec.**

### 6.5 Age problems — universal pattern

"Father's age is 3 times son's. 5 years ago, father was 5 times son. Find current ages."

Set son = x, father = 3x. Five years ago: (3x − 5) = 5(x − 5) → 3x − 5 = 5x − 25 → 2x = 20 → x = 10.
- Son = 10, Father = **30**.
- **Time: ~30 sec.**

> **Pro tip for age:** Always assign variable to the person whose age changes most simply. Then express others in terms of him.

---

## 7. Time and Work — the LCM-of-days trick

Work is abstract — make it concrete by **assuming total work = LCM of given days**.

### 7.1 Basic — work as 1/time

If A finishes a job in 10 days, A's 1-day work = 1/10. If B in 15 days, B's 1-day = 1/15. Together: 1/10 + 1/15 = 5/30 = 1/6. Together they take **6 days**.

### 7.2 The LCM trick — assume work in units

Same problem with LCM trick. LCM(10, 15) = 30 units. A does 30/10 = 3 units/day. B does 30/15 = 2 units/day. Together = 5 units/day. Time = 30/5 = **6 days**.

> **Why LCM trick is faster:** No fractions, just integer arithmetic. Specially helps with 3+ workers.

### 7.3 Three-worker problem

> **Worked example:** A in 12 days, B in 15 days, C in 20 days. All work together. Time?
> - LCM(12, 15, 20) = 60 units.
> - A: 5 units/day, B: 4, C: 3. Total = 12 units/day.
> - Time = 60/12 = **5 days**.
> **Time: ~25 sec.** Without LCM (fractions): ~60 sec.

### 7.4 Efficiency ratios

"A is twice as efficient as B." So if A and B together take `t` days and A alone takes `a`, then a's efficiency = 2 × b's. So a finishes in 1.5t days... actually let's derive:
- Let A = 2k units/day, B = k units/day. Together = 3k. If together = 6 days, total work = 18k. A alone = 18k/2k = 9 days. B alone = 18 days.

### 7.5 Alternating-day problem

"A takes 12 days, B takes 16 days. They work alternately starting with A. Total time?"
- LCM(12, 16) = 48 units. A = 4/day, B = 3/day. In 2 days they finish 7 units.
- After 12 days (6 cycles): 42 units done. Remaining = 6 units.
- Day 13: A works, does 4. Total = 46. Remaining = 2.
- Day 14: B works, does 3 — but only 2 needed. Time = 2/3 day.
- **Total = 13 + 2/3 days ≈ 13.67 days.**

### 7.6 Pipes and cisterns

Same as time-work, but inlet pipes fill (+) and outlet pipes drain (−).

> **Worked example:** Pipe A fills tank in 8 hours, pipe B drains in 12 hours. Both opened. Time to fill?
> - LCM(8,12) = 24. A = +3/hour, B = −2/hour. Net = +1/hour. Time = **24 hours**.
> **Time: ~15 sec.**

### 7.7 Work-money split

"A and B together earn ₹3000 for a job they finish in 6 days. A alone takes 10 days, B alone 15. How is money shared?"
- Money shared in ratio of work done = ratio of efficiencies.
- A = 1/10, B = 1/15 → ratio 3:2. A gets ₹1800, B gets ₹1200.

---

## 8. Time, Speed, Distance — TSD ki battle

The most question-heavy topic — 4-6 questions per test. Master this and you're already at the cutoff.

### 8.1 The base formula

```
Distance = Speed × Time
```

**Unit conversion** (memorise — saves precious seconds):
- 1 km/hr = 5/18 m/s
- 1 m/s = 18/5 km/hr
- 1 mile ≈ 1.6 km

### 8.2 Average speed — harmonic mean trick

If you cover **same distance** at speeds `s1` and `s2` (e.g., go and return on same route):

```
Average speed = 2 × s1 × s2 / (s1 + s2)     ← harmonic mean
```

NOT arithmetic mean! Big trap.

> **Worked example:** Go at 60 km/hr, return at 40 km/hr. Average?
> - Naive (wrong): (60 + 40)/2 = 50.
> - Correct: 2 × 60 × 40 / 100 = 4800/100 = **48 km/hr**.
> **Justification:** You spend more time at slower speed (return takes longer than going), so average pulls towards slower side.
> **Time: ~10 sec** with shortcut.

For three equal distances at s1, s2, s3:
```
Avg = 3 × s1 × s2 × s3 / (s1×s2 + s2×s3 + s3×s1)
```

### 8.3 Same time, different speeds (use AM)

If same **time** at different speeds, use arithmetic mean. But this is rare in problems.

### 8.4 Trains crossing — the four sub-cases

| Scenario | Effective distance | Effective speed |
|----------|-------------------|-----------------|
| Train crosses pole/man | Length of train | Train's speed |
| Train crosses platform/bridge | Train length + platform length | Train's speed |
| Two trains, same direction | Sum of lengths | \|s1 − s2\| (relative) |
| Two trains, opposite direction | Sum of lengths | s1 + s2 (relative) |

> **Worked example:** Two trains 200m and 150m long, speeds 50 km/hr and 40 km/hr in opposite direction. Time to cross?
> - Total length = 350 m.
> - Relative speed = 90 km/hr = 90 × 5/18 = 25 m/s.
> - Time = 350/25 = **14 seconds**.
> **Time: ~25 sec.**

### 8.5 Boats and streams

- Speed downstream = boat speed + stream speed = `b + s`
- Speed upstream = `b − s`
- Boat speed in still water = `(downstream + upstream)/2`
- Stream speed = `(downstream − upstream)/2`

> **Worked example:** Boat takes 4 hours downstream and 6 hours upstream for same 24 km. Boat speed in still water?
> - Downstream speed = 24/4 = 6. Upstream = 24/6 = 4.
> - Boat = (6 + 4)/2 = **5 km/hr**. Stream = 1 km/hr.
> **Time: ~20 sec.**

### 8.6 Relative speed — meetings

Two people start towards each other from points A and B (distance D).
- They meet when combined distance = D.
- Time to meet = `D / (s1 + s2)`.

If running on a circular track:
- Same direction: lapping happens with relative speed `|s1 − s2|`.
- Opposite direction: meeting happens with relative speed `s1 + s2`.
- First meeting time on track of length L: `L / relative_speed`.

> **Worked example:** A and B run on 400m circular track, speeds 6 m/s and 4 m/s, opposite direction. First meeting?
> - Relative = 10 m/s. Time = 400/10 = **40 seconds**.

### 8.7 The classic "delay" problem

"Train at 50 km/hr is 1 hour late. At what speed should it go to be on time?"
- Set distance = D, scheduled time = T. Original: D = 50(T+1). New: D = v × T.
- Need more info — usually problem says "to make up the time" or gives speed change explicitly. Read carefully.

---

## 9. Simple and Compound Interest

Banking domain ka favorite. 2-3 questions per test.

### 9.1 Simple Interest (SI)

Interest is on principal only:

```
SI = P × R × T / 100
Amount = P + SI = P(1 + RT/100)
```

P = principal, R = rate% per annum, T = time in years.

### 9.2 Compound Interest (CI)

Interest on (principal + accumulated interest):

```
A = P × (1 + R/100)^T
CI = A − P
```

If compounded **n times per year** (half-yearly n=2, quarterly n=4, monthly n=12):

```
A = P × (1 + R/(100n))^(nT)
```

### 9.3 SI vs CI difference shortcut (2 years)

For 2 years at rate R%, the **difference between CI and SI** is:

```
CI − SI (2 yrs) = P × (R/100)²
```

Justification: extra interest earned in 2nd year on 1st year's interest = (P × R/100) × R/100 = P × R²/10000.

> **Worked example:** P = ₹10,000, R = 10%, T = 2 years. CI − SI?
> - = 10000 × (0.10)² = 10000 × 0.01 = **₹100**.
> - Verify: SI = 10000 × 10 × 2 / 100 = 2000. CI = 10000 × 1.21 − 10000 = 2100. Difference = 100. ✓
> **Time: ~10 sec.**

For 3 years:
```
CI − SI (3 yrs) = P × R²(300 + R) / 10⁶
```

### 9.4 Half-yearly compounding

> **Worked example:** ₹8000 at 20% p.a. compounded half-yearly for 1 year.
> - Effective rate per half-year = 10%, periods = 2.
> - A = 8000 × (1.10)² = 8000 × 1.21 = **₹9680**. CI = ₹1680.
> - **Compare** with annually compounded: 8000 × 1.20 = 9600. Difference = ₹80.
> **Why half-yearly is better:** interest earns interest sooner.

### 9.5 Doubling time — Rule of 72

To approximate years for money to double at compound interest:
```
T ≈ 72 / R
```
At 8%, doubles in 9 years. At 12%, in 6 years. (Slightly inaccurate but fine for MCQs.)

For exact doubling: solve `2 = (1 + R/100)^T`. At 10%, T = log(2)/log(1.1) ≈ 7.27 years (Rule of 72 says 7.2 — close enough).

---

## 10. Permutation and Combination

Most candidates fear this. The key: **decide if order matters** before choosing formula.

### 10.1 Fundamental counting principle

If task 1 can be done in `m` ways and task 2 in `n` ways, both together = `m × n` ways. (AND → multiply, OR → add.)

### 10.2 Permutation vs Combination

```
Permutation P(n, r) = n! / (n − r)!     ← order matters
Combination C(n, r) = n! / (r! (n − r)!)  ← order doesn't matter

P(n,r) = C(n,r) × r!
```

Mnemonic: **Permutation = Position** (order), **Combination = Choosing** (no order).

> **Worked example:** From 10 students, choose 3 for a committee.
> - Order doesn't matter → C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = **120**.
> - **Time: ~15 sec.**

> **Worked example:** From 10 students, arrange 3 in 1st, 2nd, 3rd positions.
> - Order matters → P(10,3) = 10!/7! = 10 × 9 × 8 = **720**.

### 10.3 Repetition allowed

If repetition allowed, it's **n^r** for r positions. Example: 4-digit PIN (digits 0-9), repetition allowed = 10^4 = 10000.

### 10.4 Identical objects — the divide trick

Permutations of word with repeated letters:
```
n! / (p1! × p2! × ...)
```
where p1, p2 are counts of repeated letters.

> **Worked example:** Arrangements of "MISSISSIPPI" (11 letters: M=1, I=4, S=4, P=2)?
> - = 11! / (1! × 4! × 4! × 2!) = 39916800 / (1 × 24 × 24 × 2) = **34650**.

### 10.5 Circular arrangements

n distinct people around round table = `(n − 1)!` arrangements (because rotations are equivalent).

If clockwise and anticlockwise considered same (e.g., garland): `(n − 1)! / 2`.

> **Worked example:** 6 friends round a table. Arrangements?
> - (6 − 1)! = 5! = **120**.

### 10.6 The "always together / never together" trick

"5 boys and 3 girls. Arrange so that all 3 girls sit together."
- Treat 3 girls as 1 unit. Now 6 units to arrange = 6!.
- Internal arrangement of girls = 3!.
- Total = 6! × 3! = 720 × 6 = **4320**.

"Never together" = total arrangements − always together = 8! − 4320.

---

## 11. Probability — odds done right

### 11.1 Basic definition

```
P(event) = favorable outcomes / total outcomes
```

`0 ≤ P ≤ 1`. P = 0 → impossible, P = 1 → certain.

### 11.2 Mutually exclusive vs independent

- **Mutually exclusive** (cannot happen together): `P(A or B) = P(A) + P(B)`.
- **Not mutually exclusive**: `P(A or B) = P(A) + P(B) − P(A and B)`.
- **Independent** (one doesn't affect other): `P(A and B) = P(A) × P(B)`.
- **Dependent**: use conditional probability.

### 11.3 Conditional probability

```
P(A | B) = P(A and B) / P(B)
```

Read as "probability of A given B has happened".

### 11.4 Common setups

**Coins:** n tosses → 2^n outcomes. Probability of exactly k heads = C(n,k)/2^n.

**Dice:** 6 faces. Two dice → 36 outcomes. Sum = 7 ka P = 6/36 = 1/6 (highest probable sum).

**Cards:** 52 cards, 4 suits (hearts, diamonds = red; spades, clubs = black). 13 ranks. Face cards = J, Q, K (3 per suit, 12 total). Aces = 4.

> **Worked example:** Two cards drawn without replacement. Both kings?
> - First king: 4/52. Second king (given first was king): 3/51.
> - P = (4/52) × (3/51) = 12/2652 = **1/221**.
> **Time: ~25 sec.**

> **Worked example:** Coin tossed 5 times. P(at least 1 head)?
> - Easier: 1 − P(no heads) = 1 − (1/2)^5 = 1 − 1/32 = **31/32**.
> **Trick:** "At least one" almost always solved as `1 − P(none)`.

### 11.5 Probability tree (for multi-stage)

For sequential events, draw a tree, multiply along branches, add across branches.

> **Worked example:** Bag has 3 red, 4 blue. Draw 2 without replacement. P(both same colour)?
> - P(RR) = (3/7) × (2/6) = 6/42.
> - P(BB) = (4/7) × (3/6) = 12/42.
> - Total = 18/42 = **3/7**.

---

## 12. Top 25 trickiest interview-asked questions — rapid table

| # | Question | One-line shortcut | Answer |
|---|----------|-------------------|--------|
| 1 | Sum of first 100 natural numbers | n(n+1)/2 | 5050 |
| 2 | Sum of first n odd numbers | n² | n² |
| 3 | Sum of first n even numbers | n(n+1) | n(n+1) |
| 4 | LCM(a,b) × HCF(a,b) | = a × b | always |
| 5 | Last digit of 7^123 | 7's cycle 7,9,3,1; 123 mod 4 = 3 | 3 |
| 6 | Average speed for equal-distance two-way trip at 60 and 40 | Harmonic mean = 2ab/(a+b) | 48 km/hr |
| 7 | Salary +10% then −10%, net? | a + b + ab/100 = −1 | 1% loss |
| 8 | Two equal SP, 15% gain and 15% loss, net | Always loss = (15)²/100 | 2.25% loss |
| 9 | A = 25% more than B, B less than A by? | x/(100+x) × 100 | 20% |
| 10 | CI − SI (2 yrs) | P × (R/100)² | direct formula |
| 11 | Time to double money at 9% CI | Rule of 72 → 72/9 | 8 yrs |
| 12 | "At least one head" in 5 tosses | 1 − (1/2)^5 | 31/32 |
| 13 | Permutations of MISSISSIPPI | 11! / (4! 4! 2!) | 34650 |
| 14 | 6 people round circular table | (n−1)! | 120 |
| 15 | Train 200m crosses 100m platform in 30s, speed | (200+100)/30 m/s × 18/5 | 36 km/hr |
| 16 | Boat in still water if down=12, up=8 km/hr | (down+up)/2 | 10 km/hr |
| 17 | A 10d, B 15d together | 1/(1/10 + 1/15) | 6 days |
| 18 | A and B alligation milk 40 and 60, mean 45 | (D−M):(M−C) = 15:5 | 3:1 |
| 19 | False weight 800g for 1kg, profit% | 200/800 × 100 | 25% |
| 20 | 3 successive discounts 10%, 20%, 25% | 1 − 0.9×0.8×0.75 | 46% |
| 21 | Probability sum=7 on two dice | 6/36 | 1/6 |
| 22 | 5L from 50L milk replaced with water, thrice. Milk left? | (1−5/50)^3 × 50 | 36.45 L |
| 23 | Number divisible by both 6 and 8 | Divisible by LCM(6,8)=24 | check 24 |
| 24 | Father:Son age now 5:2, 8 yrs ago 7:2. Father's now? | Solve 5x−8 / 2x−8 = 7/2 | 40 |
| 25 | 100 students, 60 like cricket, 40 football, 20 both. Neither? | 100 − (60+40−20) | 20 |

> **Pro tip:** Print this table out, paste it on your study desk, glance daily. Pattern recognition through repetition.

---

## 13. Pre-test checklist + 80-second survival guide

### 13.1 Night-before checklist

- [ ] Calculator policy verify kar — TCS NQT mein on-screen calculator hota hai, eLitmus mein nahi.
- [ ] All formula tables (percentage equivalents, divisibility, last-digit cycles, unit conversions) ek A4 page pe revise.
- [ ] 5 mock tests last week mein. Less than 60% scoring? Identify weakest topic and drill 50 questions of that topic.
- [ ] 7 hour sleep. Sirf chai pe nahi chalega, brain glucose chahiye.

### 13.2 Inside-the-test playbook

1. **First 90 seconds**: skim all 30 questions. Mentally tag E (easy, < 30 sec), M (medium, 60-90 sec), H (hard, skip-for-now).
2. **Easies first**: solve all E in first 10 minutes. Aim 12-15 done.
3. **Mediums next**: solve M between 10-30 min. Don't get stuck — if a question crosses 90 sec, mark and move.
4. **Hards last**: only if time permits. Often educated-guess between two options is +EV.
5. **Last 3 minutes**: review marked questions, no new attempts. Check arithmetic errors.

### 13.3 The 80-second decision tree

When you read a question, in **first 10 seconds** decide:
- Direct formula known? → solve in 30-50 sec.
- Multi-step? → estimate effort. > 90 sec? Mark and move.
- Total blank? → mark, move, return at end.

**Never spend 3+ minutes on one question.** Three medium questions ko sacrifice karke ek hard solve karna NPV-negative hai.

### 13.4 Common silly mistakes — pre-flight check

- **Units**: km/hr vs m/s — always convert.
- **% on what?**: profit% on CP, increase% on original.
- **Cases**: "at most" vs "at least", "exactly" vs "either".
- **Off-by-one**: "from 1 to 100 inclusive" = 100 numbers, not 99.
- **Negative answer**: profit can't be negative; if you get negative, recheck.

### 13.5 Mental math gym (10 min daily)

- Squares till 30 (memorise).
- Cubes till 15.
- 1/7, 1/9, 1/11, 1/13 decimal expansions.
- Multiplication tables till 20.
- Powers of 2 till 2^10 = 1024.

These are your free 5-second wins. Worth more than knowing "trigonometry formulas" you'll never use.

---

## What to learn next

Aptitude clear ho gaya? Bahut badhiya — but ye sirf gate khulna hai, building abhi banaani hai. Next steps:

1. **Logical Reasoning** — series, syllogisms, blood relations, seating arrangement, data sufficiency. TCS NQT and Infosys both have 25+ questions of LR. Prep style is similar (pattern recognition + speed), but the muscles are different. Future module covers this.
2. **English / Verbal Ability** — synonyms, error spotting, RC. Easy section but cutoff exists. Daily 30-min reading habit (newspaper editorial like *The Hindu* op-ed) gives you free 80%+ score.
3. **DSA fundamentals** — once aptitude clears, online round mein 1-2 coding questions hote hain. Read the **DSA roadmap** module after this. Arrays, strings, hashing, two pointers — that's enough for service-company round 1.
4. **HR + Communication prep** — final round mein "tell me about yourself", "why this company" type. Practice loud, record video. 60% of rejections at this stage are communication-related, not technical.

Aptitude is repetitive practice. 1500 questions solved = 70% scorer. 3000 questions = top 10%. There are no shortcuts to volume — but with the shortcuts in this doc, every question you solve is faster, and every hour of practice goes 2x further. Lage raho, gate clear ho jayegi. All the best.
