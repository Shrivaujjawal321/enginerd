# CI/CD Pipelines

CI/CD basically tumhe yeh confidence deta hai ki tum din me 10 baar production deploy kar sakte ho. Manual deployment, manual testing — sab automation me convert kar deta hai. Jab tu ek startup me ya bade product company me kaam karta hai, toh ek hi cheez matter karti hai — kitni jaldi aur kitni safely tu apna code production tak pohcha sakta hai. Yeh "kitni jaldi" aur "kitni safely" ka balance — yahi CI/CD ka core philosophy hai.

CI (Continuous Integration) ka matlab hai — har developer ka code din me multiple baar ek shared branch (usually `main`) me merge ho raha hai, aur har merge pe automated build + test chal raha hai. Jab tak yeh green nahi, code merge nahi hota. CD ke do flavors hain — Continuous Delivery (har commit production-ready hai, but deploy manual button click pe hota hai) aur Continuous Deployment (har green commit automatic production me ja raha hai, zero manual intervention). Bade product companies — Google, Netflix, Amazon, Flipkart — yeh sab Continuous Deployment use karte hain. Per-engineer deploys per day ka metric track karte hain.

Is module me hum 2 mota-mota topics cover karenge — pehla, pipeline ke stages (source → build → test → deploy) aur unke beech ke gates. Doosra, build/test/deploy ke deeper concepts — artifacts, environments (dev/staging/prod), rollback strategies, aur blue-green vs canary deployment ke beech ka difference. Examples primarily GitHub Actions YAML me honge, lekin GitLab CI aur Jenkins ka basic comparison bhi hoga taaki tu interview me kisi bhi tooling pe baat kar sake.

---

## 1. Pipeline stages

### 1.1 Source → build → test → deploy — what each stage does, gates between them

#### Definition

Ek CI/CD pipeline basically ek directed acyclic graph (DAG) hai jisme stages sequentially ya parallel execute hote hain. Classic 4-stage pipeline yeh hai:

1. **Source** — Code repository se trigger. Koi developer push kare, ya PR open kare, ya scheduled cron chale — pipeline yahin se start hoti hai.
2. **Build** — Source code ko ek deployable artifact me convert karna. Java me yeh `.jar`/`.war` hai, Node me yeh `.tgz` ya Docker image hai, Go me ek static binary hai.
3. **Test** — Built artifact ke against unit tests, integration tests, contract tests, security scans, linting, etc. chalana. Yeh sabse important quality gate hai.
4. **Deploy** — Tested artifact ko ek environment (dev/staging/prod) me push karna.

In stages ke beech me **gates** hote hain — yeh basically conditional checks hain jo decide karte hain ki next stage chalega ya nahi. Common gates:

- **Build gate** — Compilation successful hua kya? Lint clean hai kya?
- **Test gate** — All tests pass hue? Code coverage threshold (e.g., 80%) cross hua?
- **Security gate** — SAST/DAST scan clean? Dependency vulnerabilities (Snyk, Dependabot) acceptable?
- **Approval gate** — Production ke pehle manual approval (Continuous Delivery) — koi senior engineer ya release manager click karega.
- **Smoke test gate** — Deploy ke baad basic health check pass hua?

Gate fail hua matlab pipeline rukti hai, developer ko notification jaata hai, aur fix karna padta hai.

#### Why?

Yeh stages aur gates kyun chahiye? Soch — agar tu seedha apne laptop se production pe `scp` karke deploy karta, toh kya hota?

1. **Reproducibility nahi hoti** — tere laptop pe `node 20.10` hai, prod pe `node 18.5` hai. Build break ho gaya. CI ek clean, reproducible environment me build karta hai (Docker container me usually).
2. **Bugs prod me jaate hain** — automated tests ke bina tu kaise sure hoga ki tera change kuch toda nahi? Manual QA scale nahi karta.
3. **Audit trail nahi hota** — kisne kya deploy kiya, kab kiya, kis commit pe — nothing logged. Compliance ke liye fail.
4. **Rollback mushkil hai** — pipeline artifacts version karti hai, toh `v1.2.3` se `v1.2.2` me rollback ek button hai.
5. **Multiple developers conflict karte hain** — Alice aur Bob dono manually deploy karein toh race condition. Pipeline serializes this.

CI/CD ka ROI: Google ki ek study (DORA report) bolti hai ki **elite performers** (jo daily multiple deploys karte hain) ke pas:
- Lead time for changes: < 1 hour
- Deployment frequency: on-demand (multiple per day)
- Change failure rate: 0-15%
- MTTR (mean time to recovery): < 1 hour

Low performers ka lead time months me hota hai. Yeh gap entirely tooling aur pipeline maturity ka hai.

#### How? (with YAML)

GitHub Actions me ek classic 4-stage pipeline kuch aisi dikhti hai:

```yaml
# .github/workflows/main-pipeline.yml
# Yeh pipeline har push aur PR pe chalti hai main branch ke liye
name: Main CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Concurrency control — agar same branch pe multiple pushes hote hain
# toh purani run cancel kar do, sirf latest chalao
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # STAGE 1: Source — implicit hai, GitHub khud checkout karta hai
  # STAGE 2: BUILD
  build:
    name: Build artifact
    runs-on: ubuntu-latest
    outputs:
      # Build job ka output — image tag — neeche ke jobs use karenge
      image-tag: ${{ steps.meta.outputs.tag }}
    steps:
      - name: Checkout source code
        # Yeh action repo ko runner pe clone karta hai
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history chahiye versioning ke liye

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # node_modules cache karega — speed boost

      - name: Install dependencies
        # npm ci — lockfile se install karta hai, deterministic build ke liye
        run: npm ci

      - name: Generate metadata
        id: meta
        run: |
          # Commit SHA ka pehla 7 char + timestamp = unique image tag
          TAG="${GITHUB_SHA::7}-$(date +%s)"
          echo "tag=$TAG" >> $GITHUB_OUTPUT

      - name: Build production bundle
        # Webpack/Vite/Next ka production build
        run: npm run build

      - name: Build Docker image
        run: |
          docker build -t myapp:${{ steps.meta.outputs.tag }} .
          # Image ko registry pe push karne ka step yahan ho sakta hai

      - name: Upload artifact
        # Build artifact ko store kar do — agle stages me reuse hoga
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ steps.meta.outputs.tag }}
          path: dist/
          retention-days: 7

  # STAGE 3: TEST — build ke baad chalega (needs: build)
  test:
    name: Run tests
    needs: build  # Yeh gate hai — build pass hua tabhi test chalega
    runs-on: ubuntu-latest
    strategy:
      # Parallel test execution — different test suites parallely chalao
      matrix:
        suite: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Run ${{ matrix.suite }} tests
        # Matrix ki wajah se yeh 3 baar parallely chalega
        run: npm run test:${{ matrix.suite }}

      - name: Upload coverage
        if: matrix.suite == 'unit'
        uses: codecov/codecov-action@v4
        with:
          fail_ci_if_error: true
          # Coverage threshold — 80% se kam hua toh fail kar do
          # Yeh ek classic test gate hai

  # SECURITY GATE — alag job hai, parallel chal sakta hai test ke saath
  security-scan:
    name: Security scan
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk vulnerability scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          # High severity vulns mile toh fail — security gate
          args: --severity-threshold=high

      - name: SAST scan with Semgrep
        # Static application security testing
        uses: semgrep/semgrep-action@v1
        with:
          config: p/owasp-top-ten

  # STAGE 4: DEPLOY — sirf main branch pe, sirf tests pass hone pe
  deploy:
    name: Deploy to production
    needs: [test, security-scan]  # Multiple gates — dono pass hone chahiye
    # Yeh condition critical hai — PR pe deploy nahi karna
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment:
      # GitHub environment — yeh approval gate add karta hai
      name: production
      url: https://myapp.com
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: ap-south-1  # Mumbai region

      - name: Deploy to ECS
        run: |
          # ECS service ko new image tag se update karo
          aws ecs update-service \
            --cluster prod-cluster \
            --service myapp-service \
            --force-new-deployment \
            --task-definition myapp:${{ needs.build.outputs.image-tag }}

      - name: Smoke test
        # Deploy ke baad basic health check — yeh bhi ek gate hai
        run: |
          for i in {1..10}; do
            if curl -fs https://myapp.com/health; then
              echo "Health check passed"
              exit 0
            fi
            sleep 10
          done
          echo "Health check failed — auto rollback trigger karo"
          exit 1
```

Notice the gates: `needs: build` ka matlab build pass hone tak test nahi chalega. `needs: [test, security-scan]` ka matlab dono parallel jobs pass hone chahiye deploy ke pehle. `if:` condition deployment ko sirf production push pe restrict karta hai.

**GitLab CI me equivalent**:

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build_job:
  stage: build
  script:
    - npm ci && npm run build
  artifacts:
    paths: [dist/]
    expire_in: 1 week

test_job:
  stage: test
  script: npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy_job:
  stage: deploy
  script: ./deploy.sh
  environment:
    name: production
  when: manual  # Manual approval gate
  only:
    - main
```

**Jenkins me equivalent (Jenkinsfile, declarative)**:

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps { sh 'npm ci && npm run build' }
        }
        stage('Test') {
            steps { sh 'npm test' }
            // Test gate — coverage check
            post {
                always {
                    publishHTML(target: [reportDir: 'coverage'])
                }
            }
        }
        stage('Deploy') {
            when { branch 'main' }
            // Approval gate
            input { message "Deploy to prod?" }
            steps { sh './deploy.sh' }
        }
    }
}
```

#### Real-life Example — Full pipeline for a Node.js e-commerce app

Soch ek real scenario — tu Flipkart-jaisa ek e-commerce app banata hai. Backend Node.js (Express), frontend Next.js, database PostgreSQL, deployed on AWS ECS Fargate. Tera pipeline kuch aisa hoga:

```yaml
# .github/workflows/ecommerce-pipeline.yml
name: E-commerce Full Pipeline

on:
  push:
    branches: [main, 'release/*']
  pull_request:

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: flipkart-clone
  NODE_VERSION: '20.10'

jobs:
  # ============== STAGE: SOURCE VALIDATION ==============
  validate:
    name: Validate commit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Conventional commit check
        # Commit message format check — feat:/fix:/chore: etc.
        # Yeh source-stage ka gate hai
        uses: wagoid/commitlint-github-action@v5

      - name: Lint code
        run: |
          npm ci
          npm run lint  # ESLint
          npm run format:check  # Prettier check

      - name: TypeScript type check
        # Compile errors yahin pakad lo, build me time waste nahi
        run: npm run typecheck

  # ============== STAGE: BUILD ==============
  build-backend:
    name: Build backend Docker image
    needs: validate
    runs-on: ubuntu-latest
    outputs:
      image-uri: ${{ steps.push.outputs.image-uri }}
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_BUILD_ROLE }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        id: push
        env:
          REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Multi-stage Docker build — final image lightweight banta hai
          docker build \
            --build-arg NODE_ENV=production \
            -t $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            -t $REGISTRY/$ECR_REPOSITORY:latest \
            ./backend
          docker push $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $REGISTRY/$ECR_REPOSITORY:latest
          echo "image-uri=$REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

  build-frontend:
    name: Build Next.js frontend
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Build Next.js
        working-directory: frontend
        run: |
          npm ci
          npm run build  # next build — static HTML + JS chunks

      - name: Upload to S3 + invalidate CloudFront
        # Frontend assets CDN pe deploy hote hain — backend se alag flow
        run: |
          aws s3 sync frontend/.next/static s3://flipkart-cdn/static \
            --cache-control "public,max-age=31536000,immutable"

  # ============== STAGE: TEST ==============
  test-unit:
    name: Unit tests
    needs: build-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.10', cache: 'npm' }
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Coverage gate
        # 80% se kam hua toh fail
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% < 80% threshold"
            exit 1
          fi

  test-integration:
    name: Integration tests
    needs: build-backend
    runs-on: ubuntu-latest
    services:
      # Real PostgreSQL container — integration test ke liye
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.10' }
      - run: npm ci
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:testpass@localhost:5432/test
      - name: Run integration tests
        run: npm run test:integration

  test-e2e:
    name: E2E tests with Playwright
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.10' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run Playwright
        # Real browser me end-to-end user flows test hote hain
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # ============== STAGE: DEPLOY ==============
  deploy-staging:
    name: Deploy to staging
    needs: [test-unit, test-integration, test-e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.flipkart-clone.com
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Update ECS task definition
        run: |
          aws ecs update-service \
            --cluster staging-cluster \
            --service flipkart-backend \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster staging-cluster \
            --services flipkart-backend
      - name: Run smoke tests against staging
        run: |
          curl -f https://staging.flipkart-clone.com/health || exit 1
          curl -f https://staging.flipkart-clone.com/api/products?limit=1 || exit 1

  deploy-production:
    name: Deploy to production
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      # Production environment — manual approval required
      # GitHub UI me reviewers configure karne padte hain
      name: production
      url: https://flipkart-clone.com
    steps:
      - name: Canary deployment — 10% traffic
        # Pehle 10% traffic ko new version pe send karo
        run: ./scripts/canary-deploy.sh 10

      - name: Monitor metrics for 5 minutes
        # Error rate, latency check — koi spike toh nahi?
        run: ./scripts/monitor-canary.sh 300

      - name: Promote to 100%
        # Sab healthy lag raha hai — full rollout
        run: ./scripts/canary-deploy.sh 100

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          slack-message: "Production deploy ${{ github.sha }} successful"
          channel-id: 'C0123DEPLOYS'
```

Yeh pipeline real-world flow dikhati hai — validate → build (parallel: backend + frontend) → test (parallel: unit + integration + e2e) → deploy staging → smoke test → manual approval → canary prod → full prod. Pure flow ~15-20 min me complete hota hai if everything is green.

**Java Spring Boot equivalent ka build stage**:

```yaml
build-java:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: 'maven'
    - name: Maven build + test
      # -B = batch mode (no interactive prompts)
      # spring-boot:build-image — buildpacks se Docker image
      run: ./mvnw -B clean verify spring-boot:build-image
    - name: Push to ECR
      run: docker push ${{ secrets.ECR_URL }}/myapp:${{ github.sha }}
```

#### Diagram

```mermaid
flowchart LR
    A[Developer push] --> B{Source<br/>checkout}
    B --> C[Validate<br/>lint, typecheck]
    C -->|Gate: clean?| D[Build<br/>Docker image]
    D -->|Gate: build OK?| E[Test Unit]
    D --> F[Test Integration]
    D --> G[Security Scan]
    E -->|Gate: 80% cov| H[Test E2E]
    F --> H
    G -->|Gate: no high CVE| H
    H -->|Gate: all green| I[Deploy Staging]
    I --> J[Smoke Tests]
    J -->|Gate: healthy| K{Manual<br/>Approval}
    K -->|Approved| L[Canary 10%]
    L -->|Gate: metrics OK| M[Canary 100%]
    M --> N[Notify + Done]

    style C fill:#fff4cc
    style E fill:#d4edda
    style F fill:#d4edda
    style G fill:#f8d7da
    style K fill:#cce5ff
    style L fill:#ffe0b2
```

#### Interview Q&A

**Q1: CI aur CD ke beech difference kya hai? Continuous Delivery aur Continuous Deployment me bhi?**

CI yaani Continuous Integration ka focus hai — developers ka code frequently (din me kai baar) ek shared branch (main/trunk) me merge ho. Har merge automated build + test trigger karta hai. Iska goal yeh hai ki integration bugs jaldi pakde jayein, "merge hell" na ho. CD ke do flavors hain. Continuous **Delivery** ka matlab hai ki har commit production-ready hai aur deployable artifact ban gaya hai, but actual production deploy ke liye ek manual button click ya approval lagti hai. Yeh enterprise environments me common hai jahan compliance ya release windows hote hain. Continuous **Deployment** ek step aage hai — har green commit automatically production tak ja raha hai, koi manual gate nahi. Iske liye tumhari testing aur observability extremely strong honi chahiye, kyunki broken commit seedha users tak pohchega. Companies jaise Netflix, Etsy, Amazon yeh practice karti hain — they deploy thousands of times per day. Interview me agar koi puche, toh bolna ki "delivery ka outcome ek shippable artifact hai, deployment ka outcome ek live system update hai."

**Q2: Pipeline me gates kya hote hain aur unhe kaise design karte ho?**

Gates basically conditional checkpoints hain jo decide karte hain ki pipeline next stage me jayegi ya nahi. Gates ke types: **technical gates** (build success, test pass, coverage threshold, security scan clean, performance benchmarks) aur **process gates** (manual approval, change advisory board signoff, release window check). Design karte waqt teen principles follow karne chahiye. Pehla, **fail fast** — sasta aur quick check pehle (lint, typecheck), expensive check baad me (E2E tests). Lint 10 second me fail hota hai, E2E 15 minute me — toh lint pehle. Doosra, **parallelism** — independent gates parallel chalao (unit + integration + security can run together). Teesra, **automation over judgment** — manual gates ko minimize karo, sirf high-risk changes (e.g., production deploy, schema migration) ke liye rakho. Mature pipelines me 95% changes manual approval ke bina merge aur deploy hote hain — sirf prod ke pehle ek optional approval hota hai for compliance.

**Q3: Tumne aaj tak ka sabse complex pipeline issue kya solve kiya?**

Yeh storytelling question hai. Ek strong answer hoga — "Hamare e-commerce app me deploy ke baad randomly p99 latency spike hota tha, but staging pe nahi. Investigation se pata chala ki Docker image build me Node.js native modules (`bcrypt`, `sharp`) Alpine Linux pe build ho rahe the, but production ECS task Ubuntu pe chal raha tha — yaani musl libc vs glibc mismatch. Pipeline me hum Alpine base use kar rahe the speed ke liye, but runtime me different libc use ho raha tha. Fix tha — base image ko production runtime se match karna (`node:20-slim` Debian-based use kiya). Saath me ek gate add kiya — Trivy scan ke alawa ek custom check jo production task definition aur build base image ka libc compare karta hai. Yeh kafi subtle bug tha aur pipeline-as-code ke discipline me hi pakda — kyunki har deploy reproducible tha, hum compare kar paye builds ko." Aisa specific answer interviewer ko convince karta hai ki tumhe production CI/CD ki real complexity ka exposure hai.

**Q4: Monorepo ke liye pipeline kaise design karoge differently?**

Monorepo (Google, Meta, Uber style) me ek bada repo hota hai jisme dozens ya hundreds of services hote hain. Naive approach — har commit pe poora repo build karna — feasible nahi, kyunki yeh hours le sakta hai. Solution hai **affected path detection** — `git diff` se determine karo ki kaunse files change hue, aur sirf un services ka pipeline trigger karo jo affected hain. Tools: Nx (`nx affected`), Bazel (build graph based incremental), Turborepo (caching + incremental). Pipeline me yeh aisa dikhega — pehla ek "detect affected" job, jo `services/auth`, `services/payment` jaise paths check karta hai, fir matrix-based parallel jobs har affected service ke liye. Caching critical hai — agar `auth` service ke files unchanged hain, toh uska last successful build ka artifact reuse karo. Doosra concern hai **shared dependency change** — agar ek shared library change hui (e.g., `libs/utils`), toh jo bhi services us pe depend karte hain unka pipeline chalega. Build graph yeh dependency map maintain karta hai. Production-grade monorepo CI me typical pipeline 80% time pe < 5 min me complete hoti hai because of aggressive caching.

---

## 2. Build → Test → Deploy

### 2.1 Artifacts, environments (dev/staging/prod), rollback strategies, blue-green vs canary

#### Definition

**Artifact** ek immutable, deployable unit hai jo build stage me produce hota hai. Yeh ho sakta hai ek Docker image (most common today), ek `.jar`/`.war` file (Java), ek `.tgz` npm package, ek static binary (Go/Rust), ya ek Lambda zip. Artifact ka **immutability** key property hai — ek baar build hua, woh kabhi modify nahi hota; sirf naye versions banti hain. Yeh isliye matter karta hai ki "build once, deploy many times" principle yaani ek hi artifact dev → staging → prod me promote hota hai. Agar tu har environment ke liye alag build karega, toh tujhe pata nahi chalega ki prod me jo run ho raha hai woh exactly woh hai jo tune test kiya tha.

**Environments** different stages hain jahan tumhara app run karta hai — typical ladder hai dev (developers ka playground, latest unstable code), staging (production ka clone, QA team yahan test karti hai), production (live users). Bade orgs me aur bhi environments hote hain — `qa`, `uat` (user acceptance testing), `pre-prod`, `canary-prod`, `prod-eu`, `prod-asia`. Har environment ka apna config (database URL, API keys, feature flags) hota hai, but **artifact same** rahta hai.

**Rollback strategy** define karti hai ki agar deploy ke baad kuch toot gaya, toh purana version kaise wapas laana hai aur kitni jaldi. Strategies:
- **Re-deploy previous version** — purana artifact wapas deploy. Slow but safe.
- **Database-aware rollback** — DB schema migration backward-compatible honi chahiye, warna code rollback kiya but DB stuck.
- **Feature flag flip** — naya feature flag ke peechhe tha, flag turn off karo. Fastest rollback.
- **Traffic switch** (blue-green) — purana version chal raha hai parallel, traffic wapas us pe point kar do.

**Blue-green deployment** ek deployment strategy hai jisme tumhare paas do identical production environments hain — Blue (current live) aur Green (new version). Tum naye version ko Green pe deploy karte ho, smoke test karte ho, fir load balancer ka traffic instantaneously Blue se Green pe switch kar dete ho. Rollback = traffic wapas Blue pe. Cost: 2x infrastructure during deployment.

**Canary deployment** ek progressive rollout hai. Naya version ko pehle ek small subset (5-10% traffic) pe deploy karte ho, metrics monitor karte ho (error rate, latency, business KPIs). Healthy lag raha hai toh slowly 25% → 50% → 100% pe scale karte ho. Issue mile toh canary cohort ko old version pe wapas bhej do, baaki users prabhavit nahi hote. Cost: thoda extra capacity, but progressive risk reduction.

#### Why?

In concepts ka business value samajh:

**Artifacts kyun**: agar tum source code se direct deploy karte (e.g., `git pull && npm start` on server), toh har deploy non-deterministic hota — npm registry temporarily down, transitive dependency new version release, OS packages different — bohot variables. Artifact ek "frozen snapshot" deta hai. Plus, artifact registry (Docker Hub, ECR, Nexus, Artifactory) ek audit trail aur rollback ka source of truth deta hai. Compliance (SOC 2, ISO 27001) ke liye yeh essential hai — auditor pooch sakta hai "September 14 ko prod me kya version chal raha tha?", aur tumhare paas artifact + manifest hona chahiye.

**Environments kyun**: dev me directly prod-grade testing nahi ho sakti — load patterns, data volume, integrations sab fake hain. Staging environment prod ka mirror hota hai (same infra, same configs, but synthetic ya anonymized data) jahan QA, performance, integration testing properly hoti hai. Production har user-facing change ka final destination hai — yahan zero tolerance for downtime. Environment isolation se cross-contamination prevent hota hai (dev ka bug prod tak nahi pohchega).

**Rollback strategies kyun**: production me kabhi kabhi pipeline ke saare gates pass karne ke baad bhi bug nikalta hai — kyunki prod traffic ka pattern unique hota hai (real user behavior, edge cases, scale). MTTR (mean time to recovery) ek key SRE metric hai — kitni jaldi tum incident resolve kar sakte ho. Strong rollback strategy MTTR ko minutes me layi hai, jab ki naive approach (manual hotfix → rebuild → re-test → re-deploy) ghante le sakti hai.

**Blue-green vs canary**: blue-green simple aur fast hai but binary (full traffic switch) — agar new version me bug hai toh 100% users hit honge during the switch window. Canary safer hai — bug ke time pe sirf 5-10% impacted hote hain, but operationally complex (traffic splitting, metric comparison, automated promotion logic). Choice depends on stakes — payment gateway? Canary. Internal admin tool? Blue-green is fine.

#### How? (with YAML)

Artifact aur environment promotion ka pipeline:

```yaml
# .github/workflows/build-deploy-promote.yml
name: Build → Promote across environments

on:
  push:
    branches: [main]

jobs:
  # ===== ARTIFACT BUILD (build once) =====
  build-artifact:
    runs-on: ubuntu-latest
    outputs:
      artifact-tag: ${{ steps.tag.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
      - name: Generate semantic version
        id: tag
        # Semantic versioning — vMAJOR.MINOR.PATCH-shortsha
        run: |
          VERSION=$(cat package.json | jq -r .version)
          TAG="v${VERSION}-${GITHUB_SHA::7}"
          echo "tag=$TAG" >> $GITHUB_OUTPUT

      - name: Build Docker image
        run: |
          # SBOM (software bill of materials) bhi generate karo
          # Yeh artifact provenance ke liye useful hai
          docker buildx build \
            --tag myapp:${{ steps.tag.outputs.tag }} \
            --label "git.sha=${GITHUB_SHA}" \
            --label "git.ref=${GITHUB_REF}" \
            --label "build.timestamp=$(date -u +%FT%TZ)" \
            --sbom=true \
            --provenance=true \
            --push .

      - name: Sign image with cosign
        # Supply chain security — image signature verify karne ke liye
        run: |
          cosign sign --yes myapp:${{ steps.tag.outputs.tag }}

  # ===== DEPLOY: DEV (auto) =====
  deploy-dev:
    needs: build-artifact
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - name: Deploy to dev cluster
        # Same artifact tag — config alag (dev DB, dev secrets)
        run: |
          helm upgrade --install myapp ./charts/myapp \
            --namespace dev \
            --set image.tag=${{ needs.build-artifact.outputs.artifact-tag }} \
            --values values/dev.yaml \
            --wait

  # ===== DEPLOY: STAGING (after dev healthy) =====
  deploy-staging:
    needs: deploy-dev
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          helm upgrade --install myapp ./charts/myapp \
            --namespace staging \
            --set image.tag=${{ needs.build-artifact.outputs.artifact-tag }} \
            --values values/staging.yaml \
            --wait

      - name: Run staging smoke tests
        run: ./scripts/smoke-tests.sh https://staging.myapp.com

      - name: Run load tests with k6
        # Staging me load test — capacity planning aur regression detection
        run: k6 run tests/load.js --vus 100 --duration 5m

  # ===== DEPLOY: PROD (canary strategy) =====
  deploy-prod-canary:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - name: Deploy canary (10% traffic)
        # Argo Rollouts ya Flagger jaisa tool yeh handle karta hai
        # Native Kubernetes me yeh complex hai
        run: |
          kubectl argo rollouts set image myapp \
            myapp=myapp:${{ needs.build-artifact.outputs.artifact-tag }} \
            -n production
          kubectl argo rollouts pause myapp -n production

      - name: Wait and monitor canary
        run: |
          # 5 min monitoring window
          for i in {1..30}; do
            ERROR_RATE=$(./scripts/get-error-rate.sh canary)
            P99_LATENCY=$(./scripts/get-p99.sh canary)

            # Threshold check — error rate > 1% ya p99 > 500ms = abort
            if (( $(echo "$ERROR_RATE > 1.0" | bc -l) )); then
              echo "Error rate $ERROR_RATE% — aborting"
              kubectl argo rollouts abort myapp -n production
              exit 1
            fi
            sleep 10
          done

      - name: Promote to 50%
        run: |
          kubectl argo rollouts set-weight myapp 50 -n production
          sleep 180  # 3 min observation

      - name: Promote to 100%
        run: |
          kubectl argo rollouts promote myapp -n production
          kubectl argo rollouts status myapp -n production --watch

  # ===== ROLLBACK (manual trigger) =====
  rollback:
    if: failure()  # Agar koi bhi previous job fail ho
    needs: deploy-prod-canary
    runs-on: ubuntu-latest
    steps:
      - name: Auto-rollback to previous version
        run: |
          # Argo Rollouts me built-in undo
          kubectl argo rollouts undo myapp -n production
          # Slack pe page on-call
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text":"PROD ROLLBACK triggered for myapp"}'
```

**Argo Rollouts CRD example for canary**:

```yaml
# k8s/rollout.yaml — declarative canary config
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      # Yeh sequence define karta hai progressive rollout ka
      steps:
        - setWeight: 10      # 10% traffic to new version
        - pause: {duration: 5m}
        - setWeight: 25
        - pause: {duration: 5m}
        - setWeight: 50
        - pause: {duration: 10m}
        - setWeight: 100
      # Automated analysis — Prometheus query se decide hota hai
      analysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: myapp
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels: { app: myapp }
    spec:
      containers:
        - name: myapp
          image: myapp:placeholder  # Pipeline updates this
```

**Blue-green ka YAML (simpler)**:

```yaml
spec:
  strategy:
    blueGreen:
      # Active service — current live traffic
      activeService: myapp-active
      # Preview service — naya version yahan deploy hota hai pre-switch
      previewService: myapp-preview
      # Auto-promote false matlab manual approval pe switch hoga
      autoPromotionEnabled: false
      # Rollback grace period — old pods 5 min tak alive
      scaleDownDelaySeconds: 300
```

#### Real-life Example — Java Spring Boot banking app

Soch ek banking app — Java Spring Boot, deployed on AWS EKS, multiple environments, strict compliance. Pipeline:

```yaml
# .github/workflows/banking-app-pipeline.yml
name: Banking App — Build, Promote, Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.ver.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Generate version
        id: ver
        run: |
          # Maven se version padho, build number append karo
          MVN_VERSION=$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout)
          echo "version=${MVN_VERSION}.${GITHUB_RUN_NUMBER}-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT

      - name: Maven build with tests
        # Spring Boot fat JAR + buildpacks Docker image
        # -P prod = production profile activate
        run: ./mvnw -B -P prod clean package spring-boot:build-image \
              -Dspring-boot.build-image.imageName=banking-api:${{ steps.ver.outputs.version }}

      - name: SCA scan with OWASP Dependency-Check
        # Banking app — security scan stricter
        run: ./mvnw org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7

      - name: Push image to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URL
          docker tag banking-api:${{ steps.ver.outputs.version }} $ECR_URL/banking-api:${{ steps.ver.outputs.version }}
          docker push $ECR_URL/banking-api:${{ steps.ver.outputs.version }}

      - name: Generate SBOM
        # Banking compliance — SBOM mandatory
        uses: anchore/sbom-action@v0
        with:
          image: banking-api:${{ steps.ver.outputs.version }}
          format: cyclonedx-json

  promote-dev:
    needs: build
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - name: Deploy to dev EKS
        run: |
          # GitOps approach — actually update karte hain ek manifest repo ko
          # ArgoCD wahan se sync karta hai
          git clone https://github.com/myorg/k8s-manifests
          cd k8s-manifests/dev
          yq -i '.image.tag = "${{ needs.build.outputs.version }}"' values.yaml
          git commit -am "deploy banking-api ${{ needs.build.outputs.version }} to dev"
          git push

  integration-tests:
    needs: promote-dev
    runs-on: ubuntu-latest
    steps:
      - name: Wait for ArgoCD sync
        run: |
          # ArgoCD status check
          argocd app wait banking-api-dev --health --timeout 600
      - name: Run contract tests
        # Pact tests — verify ki API contract bana hua hai consumers ke saath
        run: ./mvnw test -Dtest=*ContractTest

  promote-staging:
    needs: integration-tests
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          cd k8s-manifests/staging
          yq -i '.image.tag = "${{ needs.build.outputs.version }}"' values.yaml
          git commit -am "promote ${{ needs.build.outputs.version }} to staging"
          git push

      - name: Performance test
        run: |
          # Gatling load test — banking app ko 1000 concurrent users handle karna hai
          ./mvnw gatling:test -Dgatling.simulation=BankingSimulation \
            -Dgatling.users=1000 -Dgatling.duration=600

      - name: Penetration test
        # OWASP ZAP automated pentest — banking ke liye mandatory
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'https://staging.banking.com'

  promote-prod:
    needs: promote-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://banking.com
    # Manual approval — Change Advisory Board (CAB) approves
    steps:
      - name: Blue-green deploy with manual cutover
        # Banking — blue-green chosen kyunki canary me payment txns
        # split honge between versions, that's risky for double-spend etc.
        run: |
          # Deploy to "green" (preview) environment
          cd k8s-manifests/prod
          yq -i '.greenImage.tag = "${{ needs.build.outputs.version }}"' values.yaml
          git commit -am "deploy ${{ needs.build.outputs.version }} to green"
          git push

      - name: Wait for green health
        run: |
          # Green environment ko traffic nahi mil raha, but health endpoint check
          for i in {1..30}; do
            curl -fs https://green.banking.internal/actuator/health && break
            sleep 10
          done

      - name: Smoke tests on green
        run: ./scripts/smoke-banking.sh https://green.banking.internal

      - name: Cutover — switch traffic to green
        # Yeh pivotal moment hai — load balancer rule update
        run: |
          aws elbv2 modify-listener \
            --listener-arn $LISTENER_ARN \
            --default-actions Type=forward,TargetGroupArn=$GREEN_TG_ARN

      - name: Monitor for 15 minutes
        # Issue dikha toh wapas blue pe switch
        run: |
          ./scripts/monitor-prod.sh 900 || {
            aws elbv2 modify-listener \
              --listener-arn $LISTENER_ARN \
              --default-actions Type=forward,TargetGroupArn=$BLUE_TG_ARN
            echo "Rolled back to blue"
            exit 1
          }

      - name: Decommission blue (after 24h soak)
        # 24 hour soak — agar koi delayed issue mile toh rollback possible
        run: echo "Schedule blue cleanup in 24h"
```

Yeh banking pipeline real-world banking ke jaisa hai — strict compliance, blue-green chosen over canary (transactional consistency), manual CAB approval, SBOM generation, pentest gate.

#### Diagram

```mermaid
flowchart TB
    subgraph Build["Build Once"]
        A[Source code] --> B[Compile + Test]
        B --> C[Docker image<br/>v1.2.3-abc123]
        C --> D[Sign + SBOM]
        D --> E[(ECR Registry)]
    end

    subgraph Promote["Promote Same Artifact"]
        E --> F[Deploy DEV<br/>config: dev.yaml]
        F --> G[Deploy STAGING<br/>config: staging.yaml]
        G --> H{Manual<br/>Approval}
        H --> I[Deploy PROD]
    end

    subgraph Strategies["Production Deployment Strategy"]
        I --> J{Strategy?}
        J -->|Blue-Green| K[Deploy to Green]
        K --> L[Smoke test Green]
        L --> M[Switch LB: Blue → Green]
        M --> N{Healthy?}
        N -->|Yes| O[Decommission Blue]
        N -->|No| P[Switch LB back to Blue<br/>= ROLLBACK]

        J -->|Canary| Q[10% traffic → new]
        Q --> R{Metrics OK?}
        R -->|Yes| S[25% → 50% → 100%]
        R -->|No| T[Abort: 0% → new<br/>= ROLLBACK]
    end

    style E fill:#e8f5e9
    style H fill:#fff3e0
    style M fill:#ffe0b2
    style P fill:#ffcdd2
    style T fill:#ffcdd2
```

#### Interview Q&A

**Q1: Blue-green aur canary me kab kya choose karoge? Trade-offs explain karo.**

Blue-green choose karo jab tumhe binary cutover chahiye — full traffic switch, no in-between state. Iske advantages: simple mental model, easy rollback (LB rule revert), DB migration ke liye thoda manageable (kyunki ek hi version live hai at any moment, dual-write issues nahi). Disadvantages: 2x infrastructure cost during deployment window, traffic switch pe ek brief moment honest brace karna padta hai, aur agar issue 100% users pe propagate hota hai toh blast radius bada hai. Use cases: payment systems (transactional consistency), database-heavy apps, apps with stateful sessions. Canary choose karo jab tumhare paas mature observability hai (Prometheus, Datadog), tumhe progressive rollout ka risk-reduction chahiye, aur app stateless ya near-stateless hai. Advantages: blast radius small (5-10% impact during incident), progressive validation, A/B testing possibilities. Disadvantages: operationally complex (traffic splitting needs Istio/Linkerd or specialized LB), version skew issues (do versions parallel chal rahe hain — schema, API contract compatible hone chahiye), canary cohort analysis ka science seekhna padta hai. Banking apps usually blue-green choose karte hain, consumer apps (Netflix, Uber) canary. Mature companies dono use karte hain — depends on the service.

**Q2: Ek artifact ko tum dev se prod tak kaise promote karte ho? Same artifact kyun?**

"Build once, deploy many times" principle ka matlab hai ek hi artifact (Docker image with specific tag, e.g., `myapp:v1.2.3-abc123`) dev → staging → prod me promote hota hai. Configuration alag rehta hai — environment variables, secrets, feature flags, DB URLs — but binary same. Yeh kyun matter karta hai? Pehla, **trust** — agar tune staging me tested kiya `v1.2.3-abc123`, aur prod me tu rebuild karke `v1.2.3-abc123` deploy karta hai, toh tu actually woh artifact deploy nahi kar raha jo test hua. Build environment subtle differences cause kar sakta hai (npm registry timing, base image updates, transitive deps). Doosra, **provenance** — registry me ek artifact, har environment uska reference, audit trail clean. Teesra, **rollback simplicity** — pichla artifact wapas pull karo aur deploy, no rebuild needed. Implementation: pipeline me build job ek tag generate karta hai, artifact registry pe push karta hai, aur subsequent deploy jobs same tag use karte hain (often via job outputs or manifest repo). GitOps approach me yeh manifest repo me image tag update karne se hota hai, ArgoCD ya Flux us change ko detect karke environment me apply karte hain. Pure GitOps me pipeline source-of-truth git repo hota hai, na ki kubectl commands.

**Q3: Database migrations ke saath rollback strategy kaise design karoge?**

Yeh ek classic distributed systems trap hai. Agar tumne `v2` deploy kiya jo schema migration karta hai (e.g., `ALTER TABLE users DROP COLUMN old_field`), aur prod me bug mile, toh `v1` pe rollback krne se app crash hoga because `v1` `old_field` expect karta hai. Solution: **expand-contract pattern** (also known as parallel change). Migration ko 3 phases me todo. **Expand phase** — schema additive change (new column add karo, but old column rakho). Code dono read kar sakta hai. **Migrate phase** — code update karo new column use karne ke liye, old column ko backfill kar do. **Contract phase** — purane column ko drop karo (separate deployment, after weeks of stability). Har phase backward-compatible hai, toh rollback possible hai. Practically — tools jaise Flyway, Liquibase migrations version-control karte hain. Pipeline me migration aur app deploy alag steps honi chahiye. Rollback strategy: code rollback common case me schema rollback se decoupled rakho. Schema rollbacks rarely automatic hote hain — usually forward-fix (next migration jo issue resolve kare) better hai. Banking ya regulated environments me, schema changes ke pehle backup mandatory, aur rollback runbook documented hota hai. Interview me, agar koi puche "production me tumne migration deploy kiya, pakda gaya issue, kya karoge?" — answer hai "if data not corrupted, code rollback alone (because migration was expand-only); if data corrupted, restore from backup and forward-fix."

**Q4: Tumne canary deployment me kaise decide kiya ki canary failed hai? Metrics aur thresholds kya use kiye?**

Canary success/failure decide karne ke liye automated analysis chahiye, manually dekh ke decide karna scale nahi karta. Three classes of metrics. **Technical metrics**: error rate (5xx responses se measure, threshold typically <1% delta from baseline), p50/p95/p99 latency (no >10% regression), CPU/memory utilization (no spike), saturation metrics (queue depth, connection pool exhaustion). **Business metrics**: conversion rate, signup rate, payment success rate — yeh sometimes technical metrics se zyada sensitive hote hain. Imagine canary me bug hai jo silent failure cause karta hai — error rate normal but conversion 30% drop — yeh canary fail hona chahiye. **User experience metrics**: client-side errors (Sentry/Datadog RUM), page load time, feature engagement. Implementation: Argo Rollouts me `AnalysisTemplate` define karte ho jo Prometheus/Datadog queries run karta hai aur pass/fail decide karta hai. Common practice — "canary score" calculate karo (weighted combination of metrics), threshold cross hua toh abort. Important nuance: **statistical significance** — agar canary 10 minutes chala aur sirf 100 requests aaye, toh comparison meaningless hai. Minimum sample size aur duration enforce karo. Mature systems Mann-Whitney U test ya Bayesian methods use karte hain canary cohort vs baseline cohort compare karne ke liye. Real story share karne ke liye — "Hamare app me ek baar canary 5% pe deploy kiya, technical metrics sab green, lekin business analytics dashboard me revenue 8% drop dikha. Investigation ne batayi ki ek edge case me checkout button render nahi ho raha tha kuch users ke liye. Hum business metrics ko canary analysis me late add kiye, aur next iteration me pakad liya is type ke issues."

---

## Resources & further reading

**Books**:
- "Continuous Delivery" by Jez Humble & David Farley — original blueprint, heavy theory but foundational
- "Accelerate" by Forsgren, Humble, Kim — DORA metrics ki research, data-backed
- "The DevOps Handbook" by Kim, Humble, Debois, Willis — broader DevOps culture + practices
- "Release It!" by Michael Nygard — production resilience, deployment patterns

**Documentation**:
- GitHub Actions docs — `https://docs.github.com/en/actions`
- GitLab CI/CD — `https://docs.gitlab.com/ee/ci/`
- Jenkins handbook — `https://www.jenkins.io/doc/book/pipeline/`
- Argo Rollouts — `https://argo-rollouts.readthedocs.io/`
- Flagger — progressive delivery operator for Kubernetes
- Spinnaker — Netflix's multi-cloud CD platform

**Engineering blogs**:
- Netflix Tech Blog — Spinnaker, canary analysis (Kayenta)
- Google Cloud Architecture — DORA reports, four key metrics
- Etsy Code as Craft — early CI/CD pioneer's posts on deploy frequency
- GitHub Engineering — how GitHub deploys GitHub
- AWS Well-Architected — operational excellence pillar

**Tools to know**:
- Build: Docker, Buildkit, ko (Go), Jib (Java), Cloud Native Buildpacks
- Test: Jest, Pytest, JUnit, Playwright, k6, Gatling, OWASP ZAP
- Deploy: Helm, Kustomize, ArgoCD, Flux, Terraform, Pulumi
- Progressive delivery: Argo Rollouts, Flagger, LaunchDarkly (feature flags)
- Observability: Prometheus, Grafana, Datadog, Sentry, OpenTelemetry

**Practice**:
- Build ek end-to-end pipeline ek personal project ke liye — Node ya Java, ECR + ECS ya GKE
- DORA metrics measure karo apne current org me (deploy frequency, lead time, MTTR, change failure rate)
- CNCF projects contribute karo — Argo, Tekton, Flux real-world CI/CD systems hain

Yeh module tujhe interview me confident bana dega — kyunki tu ab pipeline ki anatomy, gates, artifacts, environments, rollback aur deployment strategies — sab kuch deeply samajhta hai. Practice projects build karna sabse important hai — sirf padhna nahi, banaana zaroori hai.
