# QA / SDET — The Underrated Cheat-Code into Indian Tech

Bhai, agar tu tier-2 / tier-3 college se hai, CGPA 7-ish hai, DSA mein "median ka median" sun ke pasine aate hain — **ruk**. Ek raasta hai jo placement portal pe chamakta nahi, LinkedIn flex mein dikhta nahi, lekin **Razorpay, Postman, Swiggy, Zomato, Atlan, PhonePe** sab silently roz hire karte hain: **QA / SDET**. Salary kam nahi hai — fresher SDET 6-15 LPA Indian product co. mein, 2-3 saal mein SDE-2 ladder pe 25-40 LPA. Aur entry-bar SDE roles se 30-40% lower hai because the supply pool is thinner — log "QA boring hai" assume karke apply hi nahi karte.

Yeh module poora QA pyramid cover karta hai: manual QA fundamentals (test case design, bug reports), automation (Selenium / Playwright / Cypress), API testing (Postman, REST Assured, pytest), performance testing (JMeter, k6), mobile testing (Appium, Espresso, XCUITest), aur sabse important — **SDET ka asli kaam: test infrastructure**. Test data factories, flaky test detection, parallelisation, CI/CD integration. End mein tu QA → SDET → SDE-2 ka 2-saal upgrade roadmap dekhega jo Razorpay aur Atlan publicly publish kar chuke hain.

Ek myth pehle tod dete hain: SDET "manual QA ka glorified version" nahi hai. SDET **engineer hota hai jo testing platforms banata hai** — wahi log Razorpay ka FlakeBuster, Postman ka internal QA infra, Swiggy ka test data factory build karte hain. Coding nahi chhutti — sirf coding ka surface area shift hota hai (production code → test infra code). Aur ye infra code aksar production code se zyada interesting hota hai because parallelism, flakiness, observability — sab ek hi codebase mein.

---

## 1. QA / SDET kyun — aur Manual QA se kaise alag hai

### 1.1 Teen distinct roles, teen distinct salary brackets

Industry mein "QA" ek umbrella word hai jo teen alag-alag jobs ko cover karta hai. Inko alag-alag samajhna critical hai because **interview prep, salary expectation, aur career path teeno alag hain**.

| Role | Kya karta hai | Tools | Indian fresher salary | Career ceiling |
|------|---------------|-------|------------------------|----------------|
| **Manual QA / Tester** | Test cases likhna, manually run karna, bugs report karna | Excel, Jira, TestRail, browser | 4-7 LPA | QA Lead 12-18 LPA |
| **Automation QA** | Selenium / Playwright scripts likhna existing test cases ke liye | Selenium, Cypress, Java/JS | 7-12 LPA | Automation Architect 18-30 LPA |
| **SDET** | Test infrastructure / framework engineer; flaky-test detection, parallel runners, test data factories, CI integration | Playwright + custom framework, k6, Docker, GitHub Actions | 12-25 LPA | Principal SDET 50-80 LPA, or pivot to SDE-2/SDE-3 |

**Manual QA** = test runner. Sprint mein dev ne feature banaya, manual QA browser kholega, Jira mein test cases padhke ek-ek step manually karega, bugs report karega. Important kaam hai but ceiling hai — repeatable, partly outsourceable, partly automatable.

**Automation QA** = ek step upar. Manual QA ne 200 test cases identify kiye; Automation QA Selenium / Playwright mein woh 200 cases ko code mein convert karta hai taaki har release pe ek-click run ho jaye. Coding skill chahiye — but limited scope (existing test cases automate karo).

**SDET (Software Development Engineer in Test)** = full software engineer **jo test platform banata hai**. Production code likh sakta hai, lekin uska role hai infra build karna jo hazaaron tests parallel chala sake, flaky tests detect kare, test data on-demand generate kare, CI mein integrate kare, results dashboards mein dikhe. SDET ka resume **production engineering ke barabar** hota hai — distributed systems, Docker, Kubernetes, observability sab.

### 1.2 Indian product co. SDET teams — proof that this is real

| Company | SDET initiative | Why it matters |
|---------|------------------|-----------------|
| **Razorpay** | **FlakeBuster** — internal framework jo flaky tests auto-detect aur quarantine karta hai | Razorpay engineering blog pe public hai; SDET role separately hire hota hai |
| **Postman** | Apna internal QA platform; Postman product khud QA tool hai | SDETs work on the testing-of-the-testing-tool — meta-QA |
| **Swiggy** | **Test data factories** for restaurant/order/delivery scenarios | Order system test karna without real food = SDET infra problem |
| **Zomato** | Performance + chaos testing teams separate | k6 + Gremlin-style chaos pipelines |
| **Atlan** | Explicit **SDET → SDE-2 ladder** documented internally | 18-24 month upgrade path, publicly mentioned in their careers blog |
| **PhonePe** | Mobile automation team (Appium + Espresso) for transaction flows | Mobile-first product = mobile SDET demand |
| **Flipkart** | Pre-prod load testing infra; chaos engineering team | k6 + JMeter hybrid pipelines |

### 1.3 "QA boring hai" — 2026 mein yeh myth galat kyun hai

Ek decade pehle "QA = Selenium + Excel" tha. Aaj?
- **AI-assisted test generation** (GitHub Copilot for tests, Mabl, Testim) — SDETs evaluate aur integrate karte hain
- **Chaos engineering** (Gremlin, Litmus) — SDET responsibility hai
- **Contract testing** (Pact) — microservices ke beech contract verify karna pure engineering hai
- **Visual regression** (Percy, Chromatic) — pixel-diff infra
- **Synthetic monitoring** (Datadog Synthetics) — production tests

Modern SDET = **testing-flavoured backend engineer**. Salary 25 LPA+ Senior SDET ke liye normal hai; Principal SDET (Razorpay, Postman, Atlassian-Bangalore) 60+ LPA scale.

### 1.4 Bar lower hai — kyun?

DSA bar simpler hota hai (LeetCode-Easy + selected Medium vs SDE jahan Hard expected). System design round mostly absent for SDET-1. Coding round mein "ek test framework design kar" jaisa scenario problem aata hai — pure software engineering, but lower algorithmic intensity. Tier-2/3 student ka **fast track** yahi hai: 6 months solid prep → SDET offer → 2 saal mein SDE-2 lateral.

---

## 2. Manual QA fundamentals — bina iske SDET nahi banta

Bahut log seedha "Selenium seekh ke automation pe kood jayein" karte hain — galat. Manual QA fundamentals na ho to tu **galat cheez automate karega**. Test case design, equivalence partitioning, boundary value — yeh foundational skills hain jo automated tests mein bhi same apply hote hain. Bas script ke andar.

### 2.1 Test case design techniques

**Equivalence Partitioning (EP)**: Inputs ko classes mein divide kar jahan har class ke saare values "same way" treat hote hain. Test ek representative per class.

Example — Razorpay checkout `amount` field:
- Class 1: `amount < 1` → invalid (zero/negative)
- Class 2: `1 <= amount <= 1,00,00,000` → valid
- Class 3: `amount > 1,00,00,000` → invalid (exceeds max)

Tu sirf 3 tests likhega — ek per class — instead of 1000 random values. Coverage same, effort 1/300th.

**Boundary Value Analysis (BVA)**: 80% bugs **boundaries pe milte hain**. EP ke baad har boundary ke `low-1`, `low`, `low+1`, `high-1`, `high`, `high+1` test kar.

For amount [1, 1,00,00,000]:
- `0`, `1`, `2` (lower boundary)
- `99,99,999`, `1,00,00,000`, `1,00,00,001` (upper boundary)

Total 6 tests, **catches off-by-one bugs that EP alone misses**.

**Decision Tables**: Multiple inputs ke combinations test karne ke liye. Razorpay payment routing example:

| Card type | Amount | Has 3DS | Expected outcome |
|-----------|--------|---------|-------------------|
| Visa | < 5000 | No | Direct charge |
| Visa | < 5000 | Yes | 3DS challenge |
| Visa | >= 5000 | No | Force 3DS |
| Visa | >= 5000 | Yes | 3DS challenge |
| AmEx | any | any | Reject (not supported) |

5 rules, 5 tests — clean, exhaustive, no missed combination.

**State Transition Testing**: Stateful flows (order: PENDING → PAID → SHIPPED → DELIVERED). Test valid transitions AND invalid ones (e.g., DELIVERED → PENDING should error).

### 2.2 Test plan vs test strategy

Confused freshers — ye alag documents hain:

- **Test Strategy** — high-level, project-level, written once. "Hum unit + integration + e2e use karenge; CI mein run hoga; tools Jest + Playwright + k6." Static document.
- **Test Plan** — per-release / per-feature. "Release v2.4 mein checkout-2.0 ship ho raha hai. Yeh 12 test cases run honge, owners X/Y, exit criteria 100% pass + 0 P0 bugs." Dynamic.

Interview mein "test strategy kya hoti hai" pucha jaata hai — answer mein dono distinguish kar.

### 2.3 Bug report — quality matters

Ek `"login broken"` bug 5 round-trips chalega dev ke saath. Ek high-quality bug report **ek baar mein fix** ho jaata hai.

Template:
```
Title: [Checkout] UPI payment fails with "Invalid VPA" for valid VPA on iOS Safari 17.2

Severity: P1 (revenue-blocking, ~3% checkouts affected)
Priority: P1 (must fix in next hotfix)

Environment:
- App version: 4.12.3
- OS: iOS 17.2
- Browser: Safari 17.2
- Device: iPhone 14 Pro
- Network: 4G

Steps to reproduce (every time):
1. Open app, login as user 9999912345
2. Add Rs 100 to cart, go to checkout
3. Select UPI, enter VPA "test@okhdfc"
4. Tap "Pay"

Expected: Payment initiates, UPI app launches
Actual: Toast shows "Invalid VPA. Please re-enter."

Evidence:
- Screen recording: [link]
- Network log (HAR): [link]
- Backend trace ID: tr_abc123

Hypothesis: Frontend regex stricter than backend; rejects valid 'test@okhdfc' format.

Logs:
[2026-04-30 14:23:01] VPA_VALIDATE_FAILED test@okhdfc regex_v2
```

**Severity** = impact on user (P0 prod down → P3 cosmetic).
**Priority** = how soon to fix (P0 = now → P3 = backlog).
Yeh dono **alag** hain — ek typo on landing page = high severity (looks bad, brand impact) but low priority (no revenue impact).

### 2.4 Five worked test cases — Razorpay-like checkout

| # | Test case | Type | Steps (abbr.) | Expected |
|---|-----------|------|----------------|----------|
| TC-01 | Valid card payment INR 1000 | Positive / EP | Enter valid 4111... visa, CVV, OTP → confirm | Order success, txn_id returned |
| TC-02 | Card payment with zero amount | Negative / BVA | Set amount=0, attempt checkout | Frontend blocks submit; backend returns 422 |
| TC-03 | UPI payment with invalid VPA | Negative / EP | VPA = "abcdef" (no @) | "Invalid VPA" inline error |
| TC-04 | Card declined by issuer | Negative / Decision Table | Use test card 4000-0000-0000-0002 (decline) | Order fails with `card_declined` reason; user shown retry option |
| TC-05 | Concurrent payment same order | Stress / Race | Hit `/pay` twice within 200ms | Idempotency key dedupes; only one charge |

Yeh paanch industry mein **mandatory regression suite** ka starting set hai. Real Razorpay suite ke 4000+ test cases hain.

---

## 3. Automation testing — UI

UI automation matlab browser khulta hai, clicks hote hain, form fills hote hain, assertions hote hain — sab code se. Yahan teen contenders hain: **Selenium** (legacy king), **Playwright** (modern winner), **Cypress** (developer-friendly). Interview mein teeno expected.

### 3.1 Selenium WebDriver — abhi bhi 60% Indian companies

Selenium 2004 se hai. Pros: language-agnostic (Java/Python/JS/C#), huge community, supports IE/legacy. Cons: slow, flaky, no auto-wait, manual driver management.

**Locators hierarchy (best → worst):**
1. `id` — fastest, unique
2. `name` — usually unique on forms
3. CSS selector — flexible, fast
4. XPath — powerful but slow, brittle
5. Class name / tag — too generic, avoid

**Waits:**
- **Implicit**: global timeout, applied to all `findElement` calls. Anti-pattern aaj — masks real timing bugs.
- **Explicit (`WebDriverWait`)**: condition-based — `wait.until(ExpectedConditions.elementToBeClickable(...))`. Industry standard.
- **Sleep (`Thread.sleep`)**: never. Newbie mistake.

**Page Object Model (POM)** — selectors aur actions ko page-level classes mein encapsulate kar:

```java
public class LoginPage {
    private final WebDriver driver;
    private final By emailInput = By.id("email");
    private final By passwordInput = By.id("password");
    private final By submitBtn = By.cssSelector("button[type=submit]");

    public LoginPage(WebDriver driver) { this.driver = driver; }

    public DashboardPage loginAs(String email, String password) {
        driver.findElement(emailInput).sendKeys(email);
        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(submitBtn).click();
        return new DashboardPage(driver);
    }
}
```

Test code mein selectors **kabhi nahi** dikhne chahiye — sirf POM methods.

### 3.2 Playwright — 2026 ka winner

Microsoft ne 2020 mein release kiya. Reasons it dominates:
- **Auto-wait** — element ready hone ka intezaar khud karta hai; no `WebDriverWait` boilerplate
- **Multi-browser** out of the box (Chromium, Firefox, WebKit)
- **Codegen** — `npx playwright codegen` browser action record karke test code generate karta hai
- **Trace viewer** — har test ka full DOM snapshot + network log + screenshot timeline; debugging gold
- **Network interception** (`page.route()`) — backend mock kar sakte ho without changing app code
- **Parallelism native** — workers config se 4-8 parallel browsers

Razorpay, Atlan, Postman — sab Playwright pe migrate ho chuke hain ya migration mein hain.

**Worked example: login flow + assertion**

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('valid user can login and reaches dashboard', async ({ page }) => {
    // Arrange
    await page.goto('https://app.example.com/login');

    // Act
    await page.getByLabel('Email').fill('qa+sdet@example.com');
    await page.getByLabel('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Assert — auto-waits for nav + element
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByTestId('user-menu')).toContainText('qa+sdet');
  });

  test('invalid password shows inline error', async ({ page }) => {
    await page.goto('https://app.example.com/login');
    await page.getByLabel('Email').fill('qa+sdet@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toHaveText(/invalid credentials/i);
    await expect(page).toHaveURL(/\/login/); // didn't navigate
  });
});
```

**Config (playwright.config.ts)** — production-grade:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,        // flaky tolerance only in CI
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['junit', { outputFile: 'results.xml' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',              // record on flake
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox',  use: devices['Desktop Firefox'] },
    { name: 'webkit',   use: devices['Desktop Safari'] },
    { name: 'mobile',   use: devices['Pixel 7'] },
  ],
});
```

**Locator strategy in Playwright** — `getByRole`, `getByLabel`, `getByTestId` use kar (accessibility-first). Brittle CSS/XPath last resort.

### 3.3 Cypress — developer's friend

Cypress runs **inside the browser** (not via WebDriver). Result: blazing fast, debug-in-DevTools, time-travel. But:
- Single-tab (no multi-tab tests)
- Browser limited (Chrome family + Firefox; no Safari/WebKit until 2024 alpha)
- Same-origin restrictions earlier (improved with `cy.origin()`)

Frontend devs love it; QA teams pe Playwright leads.

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  it('logs in with valid creds', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('qa@example.com');
    cy.get('[data-cy=password]').type('Test@1234');
    cy.contains('Sign in').click();
    cy.url().should('include', '/dashboard');
    cy.contains(/welcome back/i).should('be.visible');
  });
});
```

### 3.4 Tool selection matrix

| Need | Pick | Why |
|------|------|-----|
| Multi-browser including Safari/WebKit | Playwright | Native WebKit support |
| Legacy IE/old enterprise | Selenium | Only one that supports |
| Frontend devs writing tests, fast iteration | Cypress | DX is unmatched |
| Mobile web emulation | Playwright | `devices` API built-in |
| Visual regression | Playwright + Percy | Trace viewer + Percy diff |
| Cross-tab / multi-window | Playwright | Cypress can't, Selenium awkwardly |

Default for greenfield 2026 = **Playwright**. Don't overthink.

---

## 4. API testing

UI tests slow + flaky. **API tests** = same business logic verify, 100x faster. Modern QA pyramid mein API tests **majority share** hote hain (50%+).

### 4.1 Postman + Newman (CLI runner)

Postman GUI tool — request banao, save kar, collection mein group karo. **Newman** woh collection ko CLI / CI mein run karta hai.

```bash
# Install
npm install -g newman

# Run a collection from CI
newman run razorpay-api.postman_collection.json \
  -e staging.postman_environment.json \
  --reporters cli,junit \
  --reporter-junit-export results.xml
```

Postman scripts (JS) test assertions handle karte hain:

```javascript
// In Postman "Tests" tab
pm.test("status is 201", () => {
  pm.response.to.have.status(201);
});
pm.test("returns order_id", () => {
  const json = pm.response.json();
  pm.expect(json.order_id).to.match(/^ord_[A-Za-z0-9]{14}$/);
  pm.environment.set("order_id", json.order_id);
});
pm.test("response time < 500ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

Pros: GUI for exploration, easy onboarding. Cons: collections ka version control awkward; logic complex hote hi unmaintainable.

### 4.2 REST Assured — Java SDET ka standard

```java
// src/test/java/api/CreateOrderTest.java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class CreateOrderTest {

    @BeforeAll
    static void setup() {
        RestAssured.baseURI = "https://api.example.com";
        RestAssured.authentication = preemptive().basic("rzp_test_abc", "secret");
    }

    @Test
    void createOrder_validPayload_returns201() {
        String body = """
            { "amount": 50000, "currency": "INR", "receipt": "rcpt_001" }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/v1/orders")
        .then()
            .statusCode(201)
            .body("id", matchesPattern("^order_[A-Za-z0-9]{14}$"))
            .body("amount", equalTo(50000))
            .body("status", equalTo("created"))
            .time(lessThan(500L));
    }
}
```

Fluent BDD-style (`given().when().then()`) — readable like English. Industry standard for Java backends (Spring Boot teams).

### 4.3 pytest + requests — Python SDET

```python
# tests/api/test_create_order.py
import re
import pytest
import requests

BASE_URL = "https://api.example.com"
AUTH = ("rzp_test_abc", "secret")

@pytest.fixture
def order_payload():
    return {"amount": 50_000, "currency": "INR", "receipt": "rcpt_001"}

def test_create_order_returns_201(order_payload):
    r = requests.post(f"{BASE_URL}/v1/orders", json=order_payload, auth=AUTH, timeout=5)

    assert r.status_code == 201
    body = r.json()
    assert re.match(r"^order_[A-Za-z0-9]{14}$", body["id"])
    assert body["amount"] == 50_000
    assert body["status"] == "created"
    assert r.elapsed.total_seconds() < 0.5

@pytest.mark.parametrize("amount,expected_status", [
    (0,        422),    # min boundary
    (-1,       422),    # negative
    (1,        201),    # min valid
    (10**9,    422),    # exceeds max
])
def test_create_order_amount_boundaries(amount, expected_status):
    r = requests.post(
        f"{BASE_URL}/v1/orders",
        json={"amount": amount, "currency": "INR", "receipt": "rcpt"},
        auth=AUTH, timeout=5,
    )
    assert r.status_code == expected_status
```

`@pytest.mark.parametrize` = boundary value testing in 4 lines instead of 4 separate test methods. **Pytest ka killer feature**.

### 4.4 Schema validation + contract testing

Endpoints **shape badalte rehte hain** — backend dev field rename kar deta hai, frontend tut-ta hai. Schema validation guards this.

**JSON Schema validation:**

```python
# tests/api/test_schema.py
from jsonschema import validate

ORDER_SCHEMA = {
    "type": "object",
    "required": ["id", "amount", "currency", "status", "created_at"],
    "properties": {
        "id":         {"type": "string", "pattern": "^order_[A-Za-z0-9]{14}$"},
        "amount":     {"type": "integer", "minimum": 1},
        "currency":   {"type": "string", "enum": ["INR", "USD", "EUR"]},
        "status":     {"type": "string", "enum": ["created", "paid", "attempted"]},
        "created_at": {"type": "integer"},
    },
    "additionalProperties": True,
}

def test_order_response_matches_schema():
    r = requests.post(f"{BASE_URL}/v1/orders", json={"amount": 1000, "currency": "INR"}, auth=AUTH)
    validate(instance=r.json(), schema=ORDER_SCHEMA)
```

**Contract testing (Pact)** — consumer-driven. Frontend (consumer) declares "I expect API to return this shape." Backend (provider) verifies it can serve that shape. Microservices ke beech contract drift catch karta hai. Razorpay, Swiggy microservice teams pe widely used.

### 4.5 Express endpoint — full worked test

```javascript
// app.js (system under test)
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/orders', (req, res) => {
  const { amount, currency } = req.body ?? {};
  if (!Number.isInteger(amount) || amount < 1) return res.status(422).json({ error: 'invalid_amount' });
  if (!['INR', 'USD'].includes(currency))      return res.status(422).json({ error: 'invalid_currency' });
  const id = 'order_' + Math.random().toString(36).slice(2, 16);
  res.status(201).json({ id, amount, currency, status: 'created' });
});
module.exports = app;

// tests/orders.test.js
const request = require('supertest');
const app = require('../app');

describe('POST /api/orders', () => {
  test('happy path', async () => {
    const res = await request(app).post('/api/orders').send({ amount: 1000, currency: 'INR' });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^order_/);
    expect(res.body.status).toBe('created');
  });
  test.each([
    [{ amount: 0,    currency: 'INR' }, 'invalid_amount'],
    [{ amount: -1,   currency: 'INR' }, 'invalid_amount'],
    [{ amount: 1000, currency: 'XYZ' }, 'invalid_currency'],
    [{},                                 'invalid_amount'],
  ])('rejects %j', async (payload, expectedError) => {
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.status).toBe(422);
    expect(res.body.error).toBe(expectedError);
  });
});
```

`supertest` directly Express app ko test karta hai without booting server — fastest API tests in Node ecosystem.

---

## 5. Performance testing

API correct hai matlab **fast bhi hai** — yeh assumption galat hai. Performance testing alag discipline hai. Indian product co. mein **100M+ requests / day** scale pe load testing P0 priority.

### 5.1 Test types — distinguish karna mandatory

| Type | Goal | Duration | Load pattern |
|------|------|----------|---------------|
| **Smoke** | "Sanity check" — service standing hai? | 1-2 min | 1-5 VUs |
| **Load** | Expected production load handle hota hai? | 15-30 min | Steady (e.g., 200 VUs) |
| **Stress** | Breaking point kahan hai? | 30-60 min | Ramp up until failure |
| **Spike** | Sudden traffic surge (sale day) survive karta hai? | 5-10 min | 0 → 1000 VUs in 30s |
| **Soak / Endurance** | Memory leak / resource exhaustion 24h mein? | 4-24 hours | Steady, long |
| **Scalability** | Add hardware → throughput linearly badhta hai? | varies | Compare configs |

### 5.2 JMeter vs k6

**Apache JMeter** — Java-based, GUI, XML config. Old-school, banks/enterprise pe abhi bhi heavy. Pros: mature, distributed testing, plugin ecosystem. Cons: GUI heavy, XML test plans VC-unfriendly, scripting in Beanshell/Groovy clunky.

**k6** (Grafana Labs) — JavaScript-based, CLI-first, 2017+. Modern winner because:
- Tests = `.js` files = git-friendly
- Single binary, no JVM
- Native cloud version (k6 Cloud) but OSS fully usable
- Great Grafana integration
- Razorpay, Swiggy, Postman — all k6

### 5.3 SLA + percentiles — which one matters when

**Average is a lie.** If 99 requests = 100ms and 1 request = 10s, average = 199ms but **1% of users had 10s wait**. Always reason in **percentiles**.

| Percentile | What it means | When critical |
|------------|----------------|----------------|
| p50 (median) | Half users below this | Baseline UX |
| p95 | 5% users slower than this | Standard SLO |
| p99 | 1% users slower than this | Payment / critical paths |
| p99.9 | 0.1% — tail latency | Trading systems, ads bidding |

**Real SLA examples:**
- Razorpay payment API: p95 < 250ms, p99 < 500ms
- Swiggy search: p95 < 200ms
- Zomato cart: p99 < 800ms

**Rule of thumb:** Optimise the percentile that matters. For checkout, p99 — because the 1% who hit slow path = lost orders. For analytics, p50 fine.

### 5.4 Worked k6 script — 100 VU load test

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate   = new Rate('errors');
const orderLatency = new Trend('order_create_latency_ms');

export const options = {
  stages: [
    { duration: '1m',  target: 50  },   // ramp-up
    { duration: '3m',  target: 100 },   // hold at 100 VUs
    { duration: '1m',  target: 0   },   // ramp-down
  ],
  thresholds: {
    'http_req_duration{endpoint:create_order}': ['p(95)<250', 'p(99)<500'],
    'errors': ['rate<0.01'],            // < 1% errors
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'https://staging-api.example.com';

export default function () {
  group('create order', () => {
    const payload = JSON.stringify({
      amount:   Math.floor(Math.random() * 100000) + 100,
      currency: 'INR',
      receipt:  `rcpt_${__VU}_${__ITER}`,
    });

    const res = http.post(`${BASE}/v1/orders`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags:    { endpoint: 'create_order' },
    });

    const ok = check(res, {
      'status is 201':        (r) => r.status === 201,
      'has order_id':         (r) => r.json('id') !== undefined,
      'latency under 500ms':  (r) => r.timings.duration < 500,
    });

    errorRate.add(!ok);
    orderLatency.add(res.timings.duration);
  });

  sleep(1);  // think time
}

export function handleSummary(data) {
  return {
    'summary.json':  JSON.stringify(data),
    stdout:          textSummary(data),
  };
}
```

Run: `k6 run --out cloud load-test.js` or `k6 run --out json=results.json load-test.js`.

`thresholds` agar fail hue, **k6 process exit code 99** se exit hota hai → CI red ho jaata hai. SLA-as-code ka practical implementation.

---

## 6. Mobile testing

India = mobile-first market. PhonePe, CRED, Zerodha — mobile transactions dominant. Mobile QA / SDET separate skillset hai.

### 6.1 Appium — cross-platform king

Appium = Selenium for mobile. Same WebDriver protocol, runs both iOS + Android tests, supports Java/Python/JS clients. Pros: one codebase tests both platforms. Cons: slower than native, brittle, setup hell on macOS/Xcode/Android SDK.

```python
# Appium + pytest
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy

caps = {
    "platformName": "Android",
    "appium:deviceName": "Pixel_7",
    "appium:app": "/path/to/app-debug.apk",
    "appium:automationName": "UiAutomator2",
}

def test_login_flow():
    driver = webdriver.Remote("http://localhost:4723", caps)
    driver.find_element(AppiumBy.ID, "com.example:id/email").send_keys("qa@example.com")
    driver.find_element(AppiumBy.ID, "com.example:id/password").send_keys("Test@1234")
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "sign_in_button").click()

    welcome = driver.find_element(AppiumBy.ID, "com.example:id/welcome_text")
    assert "Welcome" in welcome.text
    driver.quit()
```

### 6.2 Espresso — Android native

Google's first-party Android UI testing. Runs **inside the app process**, so no IPC overhead → 5-10x faster than Appium. Kotlin/Java only.

```kotlin
@Test fun loginFlow_validCreds_navigatesToHome() {
    onView(withId(R.id.email)).perform(typeText("qa@example.com"))
    onView(withId(R.id.password)).perform(typeText("Test@1234"), closeSoftKeyboard())
    onView(withId(R.id.sign_in_button)).perform(click())
    onView(withId(R.id.welcome_text)).check(matches(withText(containsString("Welcome"))))
}
```

### 6.3 XCUITest — iOS native

Apple's first-party. Swift/Obj-C. Same idea — runs in-process, fast, deterministic.

```swift
func testLoginFlow() {
    let app = XCUIApplication()
    app.launch()
    app.textFields["email"].tap()
    app.textFields["email"].typeText("qa@example.com")
    app.secureTextFields["password"].typeText("Test@1234")
    app.buttons["Sign in"].tap()
    XCTAssert(app.staticTexts["welcome"].waitForExistence(timeout: 5))
}
```

### 6.4 Cloud device farms — Indian-friendly

Local pe 50 device-OS combos test karna impossible. Cloud farms:

| Provider | Strengths | India angle |
|----------|-----------|--------------|
| **BrowserStack** | Indian-founded (Mumbai), 3000+ real devices | Best support, INR billing, local payments |
| **Sauce Labs** | US, mature, enterprise-friendly | Used by global teams |
| **LambdaTest** | Indian-founded (Noida), competitive pricing | Strong Indian SDET adoption |
| **Firebase Test Lab** | Google's farm, Android-strong | Free tier good for indie |
| **AWS Device Farm** | Pay-per-device-minute | Hooks into AWS CI |

Interview tip — BrowserStack / LambdaTest founder stories Indian SDET communities mein famous hain (BrowserStack now $4B+ valuation). Naam mention kar.

---

## 7. Test infrastructure — yahi SDET ka asli kaam

Manual / automation QA = test cases likhta hai. **SDET = test platform banata hai** jis pe sab tests run hote hain. Yeh chapter most important hai for SDET interview.

### 7.1 Test data factories

Hardcoded data tests ko brittle banata hai:

```python
# BAD
user = User(id=1, email="test@test.com", name="Test User")
order = Order(id=1, user_id=1, amount=100)

# What happens when 50 tests use user_id=1? DB conflicts, race conditions, data leakage.
```

**Factory pattern** — har test fresh, unique, realistic data:

```python
# tests/factories.py
import factory
from faker import Faker
from myapp.models import User, Order

fake = Faker('en_IN')  # Indian locale - "Rajesh Sharma", "+91 99999..."

class UserFactory(factory.Factory):
    class Meta:
        model = User
    id     = factory.Sequence(lambda n: n)
    name   = factory.LazyFunction(fake.name)
    email  = factory.LazyAttribute(lambda o: f"{o.name.lower().replace(' ', '.')}@test.com")
    phone  = factory.LazyFunction(lambda: fake.phone_number())

class OrderFactory(factory.Factory):
    class Meta:
        model = Order
    id     = factory.Sequence(lambda n: 1000 + n)
    user   = factory.SubFactory(UserFactory)
    amount = factory.Faker('random_int', min=100, max=100_000)
    status = 'created'

# Usage:
def test_order_total_includes_tax():
    order = OrderFactory(amount=1000)              # fresh user, fresh order
    assert calculate_total_with_tax(order) == 1180

def test_bulk_orders():
    orders = OrderFactory.create_batch(50)         # 50 unique orders
    assert len(set(o.user.email for o in orders)) == 50
```

`faker` (Python) / `faker-js` (Node) / `mimesis` (faster Python alternative) — staple SDET tools.

**Swiggy ka use case**: `OrderFactory` jo `Restaurant` + `MenuItem` + `Cart` + `DeliveryAddress` sab compose karta hai realistically. Without factories, 5000 tests likhna impossible.

### 7.2 Test environment management — Docker

Production-shaped environment har dev + CI machine pe locally chahiye. Docker = solution.

```yaml
# docker-compose.test.yml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB:   testdb
    tmpfs: /var/lib/postgresql/data    # in-memory = fast wipe between runs
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "test"]
      interval: 2s
      retries: 10

  redis:
    image: redis:7-alpine

  api:
    build: .
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_started }
    environment:
      DATABASE_URL: postgres://test:test@postgres:5432/testdb
      REDIS_URL:    redis://redis:6379
    ports: ["3000:3000"]

  tests:
    build: ./tests
    depends_on:
      api: { condition: service_started }
    environment:
      BASE_URL: http://api:3000
    command: ["npx", "playwright", "test"]
```

Run: `docker compose -f docker-compose.test.yml up --abort-on-container-exit`. Tear down: `docker compose down -v`. Hermetic, reproducible, parallelisable.

### 7.3 Parallelisation

Tests serial = 200 tests × 5s = 17 min. Tests parallel @ 8 workers = ~2.5 min.

**Concerns:**
1. **Test isolation** — koi test kisi aur ke data ko corrupt na kare. Solution: per-test transactions (rollback at end), or per-test schema/db.
2. **Shared state** — Redis cache ek test ne polluted, doosra fail ho gaya. Solution: namespaced keys (`test_${workerId}_${key}`) or flush between tests.
3. **Resource contention** — 8 browsers each 500MB → 4GB RAM gone. Plan worker count for hardware.

Playwright config: `workers: 4`. pytest: `pytest -n auto` (with `pytest-xdist`).

### 7.4 Flaky test detection — Razorpay's FlakeBuster style

Flaky test = same code, sometimes pass sometimes fail. Mostly kills SDET teams' credibility ("CI red rehta hai, log ignore karne lagte hain"). Solution = systematic detection + quarantine.

**Strategy:**

1. **Retry once** — first retry pe pass hua = flaky candidate (NOT a real fix; just a signal).
2. **Track history** — last 100 runs mein test ka pass-rate. < 99% = flaky.
3. **Auto-quarantine** — flaky test ko separate suite mein move kar; main CI block na kare; weekly review.
4. **Root-cause** — common causes: timing, network, shared state, ordering.

```python
# tools/flake_detector.py — runs nightly on test history DB
import sqlite3, json
THRESHOLD = 0.99

conn = sqlite3.connect('test_history.db')
flaky = conn.execute("""
    SELECT test_id,
           AVG(CASE WHEN result='pass' THEN 1.0 ELSE 0.0 END) AS pass_rate,
           COUNT(*) AS runs
    FROM test_runs
    WHERE timestamp > datetime('now', '-7 days')
    GROUP BY test_id
    HAVING runs >= 20 AND pass_rate < ?
""", (THRESHOLD,)).fetchall()

with open('flaky-tests.json', 'w') as f:
    json.dump([{"test": t, "pass_rate": p, "runs": r} for t, p, r in flaky], f, indent=2)

print(f"Flagged {len(flaky)} flaky tests")
```

Tag those tests `@pytest.mark.quarantine` or `test.skip()` in Playwright until fixed. **Razorpay's FlakeBuster** does exactly this at scale — and SDETs who built it now lead infra teams.

### 7.5 Test reporting

CI logs unreadable. Reporters convert results into HTML dashboards.

| Tool | Stack | Strengths |
|------|-------|-----------|
| **Allure** | Java/Python/JS | Beautiful HTML, history graphs, attachments |
| **ReportPortal** | All | Real-time, AI-suggested defect classification |
| **Tesults** | All | Hosted SaaS, simple |
| **Playwright HTML reporter** | Playwright | Built-in, trace links, fast |

Allure example tags:

```python
import allure

@allure.feature("Checkout")
@allure.story("Card payment")
@allure.severity(allure.severity_level.CRITICAL)
def test_visa_card_payment_succeeds():
    with allure.step("Add item to cart"):
        ...
    with allure.step("Enter card details"):
        ...
    with allure.step("Submit"):
        allure.attach.file('screenshot.png', attachment_type=allure.attachment_type.PNG)
        ...
```

Allure dashboard mein test run karte hi feature/story/severity-wise drill-down.

---

## 8. CI/CD integration

Test infra ka asli benefit tabhi milta hai jab har commit pe automatically run hota hai.

### 8.1 Test pyramid — ratios that work

```mermaid
graph TD
  A[E2E Tests<br/>~10%<br/>slow, brittle, full-stack] --> B[Integration Tests<br/>~20%<br/>API + DB, medium speed]
  B --> C[Unit Tests<br/>~70%<br/>fast, isolated, deterministic]

  style A fill:#ffaaaa
  style B fill:#ffd699
  style C fill:#aaffaa
```

**Anti-pattern: ice-cream cone** — 70% E2E, 10% unit. CI 45 min lagayega, flake rate 20%, devs disable tests. Don't do this.

### 8.2 Pre-merge vs post-merge

| Stage | What runs | Goal | Time budget |
|-------|-----------|------|--------------|
| **Pre-commit hook** (local) | Lint, format, fast unit | Catch typos | < 10s |
| **PR / Pre-merge CI** | Unit + integration + smoke E2E | Block bad PRs | < 10 min |
| **Post-merge CI** | Full E2E suite + contract tests | Catch integration issues main branch pe | < 30 min |
| **Nightly** | Full E2E + perf load tests + security scan | Deep coverage, perf regression | hours OK |
| **Pre-release** | Soak test + chaos test | Production confidence | 4-24h |

Rule: **fast-feedback before slow-feedback**. PR mein 30-min E2E suite = devs ka morale kill.

### 8.3 GitHub Actions — production-grade pipeline

```yaml
# .github/workflows/test.yml
name: Test Pipeline
on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 5s
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
          REDIS_URL:    redis://localhost:6379

  e2e-playwright:
    needs: integration
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]                       # 4-way parallel
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-trace-${{ matrix.shard }}
          path: test-results/

  perf-k6:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: perf/load-test.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

  report:
    needs: [unit, integration, e2e-playwright]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - name: Publish Allure report
        uses: simple-elf/allure-report-action@v1
        with:
          gh_pages: gh-pages
          allure_results: allure-results
```

Notice:
- **Sharding** — Playwright tests 4-way parallel
- **Service containers** — Postgres + Redis spin up per job
- **Conditional perf** — k6 only on main, not every PR (saves time)
- **Trace upload on failure** — Playwright trace viewer = debug gold

---

## 9. Career path: QA → SDET → SDE

Yeh section sabse important hai for tier-2/3 students.

```mermaid
graph LR
  A[Manual QA<br/>4-7 LPA<br/>Year 0-1] --> B[Automation QA<br/>7-12 LPA<br/>Year 1-2]
  B --> C[SDET I<br/>12-18 LPA<br/>Year 2-3]
  C --> D[SDET II / Sr SDET<br/>18-28 LPA<br/>Year 3-5]
  D --> E1[Principal SDET<br/>40-80 LPA<br/>Year 6+]
  D --> E2[Lateral to SDE-2<br/>30-50 LPA<br/>Year 4-5]
  E2 --> F[SDE-3 / Tech Lead<br/>50-90 LPA<br/>Year 6-8]

  style A fill:#ffe4b5
  style B fill:#ffd700
  style C fill:#90ee90
  style D fill:#87ceeb
  style E1 fill:#dda0dd
  style E2 fill:#dda0dd
  style F fill:#ff69b4
```

### 9.1 The 2-year SDET → SDE upgrade — Razorpay / Atlan model

Both companies publicly mention SDET → SDE-2 transitions:

- **Year 0-1 (SDET I):** Master one automation framework deeply (Playwright or REST Assured). Contribute to test infra (e.g., add a flake-detector module). Read production code daily.
- **Year 1-2 (SDET I → II):** Lead a sub-system migration (e.g., "migrate suite from Selenium to Playwright"). Start writing **production code** for non-test features (e.g., admin dashboard). Get added to the dev rotation.
- **Year 2 conversion:** Internal SDE-2 interview — system design (HLD + LLD) + DSA + behavioural. Pass = lateral SDE-2 with no salary cut, often with bump.

**Why companies allow this:** SDETs already know the codebase, debugging skills strong, system thinking present. Internal lateral cheaper than external SDE-2 hire.

### 9.2 Skills you must add to make the jump

| Track | Skill | Resource (this site) |
|-------|------|----------------------|
| Design | OOP + design patterns + LLD | `lld-design`, `design-patterns`, `clean-code-solid` |
| Distributed systems | HLD basics | `system-design-basics`, `system-design-advanced` |
| One backend deep | Node.js / Java / Python production | `nodejs-backend`, `python-mastery`, `spring-boot-basics` |
| DSA | LeetCode 200 problems (Easy + Medium) | DSA tracks |
| DBMS | Indexes, transactions, query plans | `dbms-complete`, `database-sql` |

DSA bar SDET → SDE-2 mein lift hota hai but interviews are forgiving — they've seen you contribute code for 2 years.

### 9.3 The portfolio play — "I built FlakeBuster"

The single best thing on a SDET resume = **a custom test infrastructure tool you built**. Examples:

- "Built a flaky-test detector that scans CI history, auto-quarantines tests with < 99% pass rate. Reduced false-failure noise 70%."
- "Built a test data factory using `faker-js` + Postgres seeding. Replaced 4000 lines of hardcoded fixtures across 1200 tests."
- "Built a cross-browser visual regression pipeline using Playwright + Pixelmatch. Caught 12 production CSS regressions in Q1."

Such projects = direct evidence of SDET-level engineering. **More valuable than 10 LeetCode mediums** for SDET interviews.

Open-source angle: contribute to Playwright / pytest / Allure repos. PRs merged = proof of code quality at industry standard.

---

## 10. Top 30 QA / SDET interview questions

| # | Question | Topic |
|---|----------|-------|
| 1 | Difference between Manual QA, Automation QA, and SDET? | Career fundamentals |
| 2 | Severity vs Priority — define with example | Manual fundamentals |
| 3 | Equivalence partitioning vs boundary value analysis | Test design |
| 4 | What is a decision table? When to use it? | Test design |
| 5 | Test Plan vs Test Strategy | Process |
| 6 | What makes a good bug report? | Process |
| 7 | Selenium implicit vs explicit wait — which to use and why? | Selenium |
| 8 | What is Page Object Model? Why use it? | Architecture |
| 9 | Why is `Thread.sleep` an anti-pattern in tests? | Best practices |
| 10 | Playwright vs Selenium vs Cypress — pick one and defend | Tool selection |
| 11 | How does Playwright's auto-wait work internally? | Playwright internals |
| 12 | What is a flaky test? How do you detect and fix? | SDET infra |
| 13 | Explain the test pyramid. What's the ice-cream cone anti-pattern? | Architecture |
| 14 | Difference between stub, mock, spy, fake | Testing theory |
| 15 | What is contract testing? When does it help? | API testing |
| 16 | JSON Schema validation — how would you implement? | API testing |
| 17 | Load test vs Stress test vs Soak test | Performance |
| 18 | Why p99 matters more than average for SLAs? | Performance |
| 19 | Write a k6 script for 100 VUs hitting `/api/orders` | Performance live coding |
| 20 | Appium vs Espresso vs XCUITest — when to pick each | Mobile |
| 21 | How do you run tests in parallel without data corruption? | SDET infra |
| 22 | How do you set up a hermetic test environment? | Docker / infra |
| 23 | Write a test data factory in Python or JS | Live coding |
| 24 | Pre-merge vs post-merge tests — what runs where? | CI/CD |
| 25 | Design a test framework for a payment gateway (LLD) | System design |
| 26 | How would you test a feature with a flaky dependency? | Real-world |
| 27 | What is shift-left testing? | Process |
| 28 | TDD vs BDD — explain with example | Methodology |
| 29 | How do you measure test suite quality? (coverage, mutation, flake rate) | Metrics |
| 30 | How would you migrate a 5000-test Selenium suite to Playwright? | Architecture |

---

## 11. Pre-interview checklist + what to learn next

Before you walk into an SDET interview:

- [ ] One Playwright suite live on GitHub — at least 20 tests covering happy + edge paths
- [ ] One pytest API suite — parametrised, schema-validated, in CI
- [ ] One k6 script with thresholds — committed, runnable
- [ ] GitHub Actions workflow that runs the above on every PR
- [ ] Allure or Playwright HTML report deployed to GitHub Pages
- [ ] One blog post / README explaining a flaky test you debugged
- [ ] LeetCode: 50 Easy, 50 Medium done; comfortable in arrays, strings, hashmaps, two-pointer
- [ ] LLD basics revised — know Strategy, Factory, Singleton, Observer
- [ ] Read **one** real engineering blog: Razorpay's FlakeBuster, Postman's testing infra, Swiggy's chaos engineering write-ups
- [ ] STAR-format stories for behavioural: "Tell me about a tough bug" / "Tell me about a flaky test you fixed" / "Conflict with a dev"

### What to learn next

To level up from QA / SDET into well-rounded engineering:

- **`lld-design`** — design patterns + class diagrams. Mandatory for SDET-2 and above.
- **`system-design-basics`** — when interviewer asks "design a test orchestrator at scale," HLD reasoning chahiye.
- **`nodejs-backend`** ya **`python-mastery`** — pick one production language; SDETs jo backend code likh sakte hain woh upgrade fast karte hain.
- **`git-version-control`** — branching strategy, rebase, conflict resolution; PR hygiene matters.
- **`docker-containers`** + **`cicd-pipelines`** — test infra is half-DevOps; these complete the picture.
- **`software-testing`** — refresh unit/integration testing fundamentals if rusty.
- **`design-patterns`** + **`clean-code-solid`** — for the SDET → SDE-2 jump.

Bhai, QA / SDET koi consolation prize nahi hai. Yeh ek fast lane hai jisko log avoid karte hain because the marketing is bad. Tu pad le, build kar, ship kar — 2 saal mein tu wahi log hoga jo Razorpay ka FlakeBuster build kar raha hai, aur 4 saal mein SDE-2 / SDE-3 ladder pe normal SDE-route walon se aage. Lag ja.
