# Docker

Docker basically tumhare app ko ek shipping container me daal deta hai. Container me sab kuch — code, dependencies, runtime, system libraries, env vars — ek hi package me bundle ho jaata hai. Kahin bhi run karo — apne laptop pe, CI runner pe, AWS EC2 pe, ya production Kubernetes cluster pe — behaviour exactly same rahega. "Works on my machine" wala classical bug Docker ne practically khatam kar diya. Ye magic hota hai Linux kernel ke do features se: namespaces (process isolation) aur cgroups (resource limits). Docker khud koi VM nahi hai — ye host kernel ko hi share karta hai, isliye fast hai aur lightweight hai.

Senior engineer ke liye Docker sirf `docker run` chalana nahi hai. Tumhe samajhna padega image layers kaise kaam karte hain, copy-on-write filesystem kya hai, multi-stage builds se 1.2GB image ko 80MB tak kaise laaye, Compose me dependency graph kaise bana, named volumes vs bind mounts ka tradeoff kya hai, aur bridge network me service discovery kaise hoti hai. Production me agar tumne `latest` tag use kiya, ya root user se container chala diya, ya secrets ko Dockerfile me hardcode kar diya — security audit me tumhari band baj jayegi.

Is module me hum chaar core areas cover karenge: (1) Images aur containers ka internal model, (2) Dockerfile authoring with multi-stage builds aur caching, (3) Docker Compose se multi-service orchestration, aur (4) Volumes aur networking ki deep mechanics. Har section me real prod-grade examples honge — Node.js + Postgres + Redis + Nginx wala stack — aur interview questions jo product companies (Razorpay, Swiggy, PhonePe, Atlassian, Google) me actually pooche jaate hain.

---

## 1. Images & containers

### 1.1 Image layers, copy-on-write, immutability, image vs container distinction

#### Definition

Ek **Docker image** ek read-only template hai jisme tumhare app ke saare files, dependencies, aur metadata padi hoti hai. Image multiple **layers** se bani hoti hai — har layer ek immutable filesystem diff hai. Jab tum image se ek **container** start karte ho, Docker ek thin writable layer image ke upar mount kar deta hai — yahi container ka "filesystem" hota hai. Image is the blueprint, container is the running instance. Ek image se tum thousand containers chala sakte ho, sab apni-apni writable layer ke saath, but neeche ke read-only layers sab share karte hain.

**Copy-on-write (CoW)** matlab — jab tak tum file ko modify nahi karte, woh lower layer me hi rehti hai. Jaise hi tum koi file edit karte ho ya delete karte ho, Docker us file ko writable layer me copy karta hai pehle, phir change apply karta hai. Niche ki layer untouched rehti hai. Ye trick image storage ko super efficient banati hai — agar 50 containers ek hi base image use kar rahe hain, base image ki copy disk pe sirf ek baar hoti hai.

**Immutability** matlab — image layers kabhi modify nahi hote. Agar tumne `apt-get install` chala diya ek layer me, woh layer permanent hai. Agla `RUN rm` command us file ko "delete" toh dikhayega container me, but actual disk space free nahi hoga — file pichle layer me chhupi padi hai. Isliye Dockerfile me cleanup same `RUN` command me karna padta hai (we'll see this in Topic 2).

#### Why?

Layers exist karte hain teen reasons se. **First — caching**. Jab tum image rebuild karte ho, Docker har layer ka hash check karta hai. Agar layer change nahi hua, woh cache se reuse hota hai. Isliye smart Dockerfile me dependencies install pehle hote hain (jo rarely change hote hain) aur source code copy baad me (jo har commit pe change hota hai). Build time 10 minute se 30 second pe aa jaata hai.

**Second — storage efficiency**. Ek `node:20-alpine` base image ~180MB ka hai. Agar tumhari company me 30 services hain aur sab Node.js use karti hain, sab same base layers share kar sakti hain. Disk pe woh 180MB ek hi baar store hoga. Production servers pe ye GB-level savings deta hai.

**Third — distribution speed**. Docker registry (Docker Hub, ECR, GCR) layer-by-layer push/pull karta hai. Agar tumne 500MB image push ki, but base layers already registry me hain, sirf tumhari app ki layer (maybe 5MB) actually upload hoti hai. Pull time bhi same — fast deployments milte hain.

Image vs container ka distinction critical hai — ye fundamental mental model hai. Image = class, container = object. Image immutable hai, container mutable hai (writable layer ke karan). Image registry me jaati hai, container nahi. Container me data likhna means writable layer me likhna — container delete hote hi data gone (unless tum volume mount karo, which we'll cover in Topic 4).

#### How?

Layers ko inspect karne ka basic command:

```bash
# Image ki history dekho — har layer kya add karti hai
docker history node:20-alpine

# Detailed layer info — JSON format me
docker inspect node:20-alpine

# Image ke saare layers ka dump (advanced)
docker save node:20-alpine -o node.tar
# Phir tar extract karke dekho — har layer ek directory hai
```

Container ke writable layer ko inspect karna:

```bash
# Container start karo
docker run -d --name test-container nginx:1.25-alpine

# Container ke andar ek file change karo
docker exec test-container sh -c 'echo "hello" > /tmp/test.txt'

# Diff dekho — kya kya change hua image ke comparison me
docker diff test-container
# Output:
# A /tmp/test.txt    <- A = added
# C /var/log/nginx   <- C = changed
# D /etc/old.conf    <- D = deleted
```

CoW behaviour ko prove karne ka simple experiment:

```bash
# Same image se 5 containers start karo
for i in 1 2 3 4 5; do
  docker run -d --name web-$i nginx:1.25-alpine
done

# Disk usage dekho — 5 containers, but image storage shared
docker system df -v

# Tumhe milega:
# - Image: 50MB (ek hi baar)
# - Containers: kuch KBs each (sirf writable layer)
```

Image build karte time layer creation:

```dockerfile
# Har instruction ek layer banata hai (mostly)
FROM ubuntu:22.04                      # Layer 1: base OS
RUN apt-get update                     # Layer 2: package index
RUN apt-get install -y python3         # Layer 3: python
COPY app.py /app/                      # Layer 4: source code
CMD ["python3", "/app/app.py"]         # Metadata, not a real layer
```

Ek important gotcha — agar tum bade files create karke phir delete karte ho **alag layers me**, image size badi rahegi:

```dockerfile
# GALAT — file pichle layer me chhupi rahegi, image size badegi
RUN wget https://example.com/big-file.tar.gz   # Layer A: 500MB add
RUN tar -xzf big-file.tar.gz                    # Layer B: extract
RUN rm big-file.tar.gz                          # Layer C: delete (lekin layer A me file abhi bhi hai!)

# SAHI — sab kuch ek layer me, intermediate file kabhi commit nahi hoti
RUN wget https://example.com/big-file.tar.gz \
    && tar -xzf big-file.tar.gz \
    && rm big-file.tar.gz
```

#### Real-life Example

Imagine karo tu Swiggy me kaam kar raha hai aur tumhe restaurant-search service deploy karni hai. Service Node.js me hai, dependencies bhaari hain (Elasticsearch client, geo libraries), aur tum chahte ho fast rebuilds. Yahan ek production-grade setup hai jo layer caching ko optimize karta hai:

```dockerfile
# /home/swiggy/restaurant-search/Dockerfile
# Production-grade Node.js image with smart layer caching

FROM node:20-alpine AS base
# Alpine use kar rahe hain — sirf 5MB ka base, vs Ubuntu ka 70MB
WORKDIR /app

# --- Dependency layer (rarely changes) ---
# package.json aur lock file pehle copy karte hain
# Iska reason — ye files kam change hoti hain, isliye npm install ka layer cache hit hoga
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force
# npm ci > npm install — lock file ko strictly follow karta hai, reproducible builds milte hain

# --- Source code layer (frequently changes) ---
# Source code last me copy karte hain — har commit pe ye layer rebuild hoti hai
# Lekin pichli npm install layer cache se aati hai — fast rebuild
COPY . .

# --- Runtime config ---
# Non-root user banao — security best practice
RUN addgroup -S swiggy && adduser -S swiggy -G swiggy
USER swiggy

EXPOSE 3000
CMD ["node", "server.js"]
```

Agar tu source code me ek line change karta hai aur rebuild karta hai:

```bash
# First build — saare layers banenge, ~2 minutes
docker build -t swiggy/restaurant-search:v1 .

# Source me ek typo fix karo, rebuild karo
docker build -t swiggy/restaurant-search:v2 .
# Output:
# Step 1/8 : FROM node:20-alpine ---> CACHED
# Step 2/8 : WORKDIR /app          ---> CACHED
# Step 3/8 : COPY package*.json    ---> CACHED
# Step 4/8 : RUN npm ci            ---> CACHED   <- 90% time bach gaya yahan
# Step 5/8 : COPY . .              ---> rebuilt  <- source change
# Step 6/8 : RUN addgroup...       ---> CACHED
# Build time: 8 seconds (vs 2 minutes)
```

Ye production me kya difference banata hai? Agar tumhari CI pipeline har commit pe build karti hai aur 50 engineers din me 200 commits karte hain, you save ~5 hours of compute daily — that's real money on AWS.

#### Diagram

```mermaid
graph TD
    A[Base Image: node:20-alpine<br/>180MB, READ-ONLY] --> B[Layer 2: WORKDIR /app<br/>0 bytes]
    B --> C[Layer 3: package.json + npm ci<br/>120MB, READ-ONLY]
    C --> D[Layer 4: source code COPY<br/>5MB, READ-ONLY]
    D --> E[Layer 5: USER swiggy<br/>0 bytes]
    E --> F[Container Writable Layer<br/>RW, ephemeral]

    F --> G[Container 1: writes log to /tmp]
    F --> H[Container 2: writes temp file]
    F --> I[Container 3: modifies config]

    style A fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style F fill:#fff4e1
    style G fill:#ffe1e1
    style H fill:#ffe1e1
    style I fill:#ffe1e1
```

Diagram me dikha hai — base layers (blue) saare containers share karte hain, writable layer (orange) per-container hai, aur file modifications (red) us writable layer me hote hain via copy-on-write.

#### Interview Q&A

**Q1: Image aur container me kya difference hai? Internal storage mechanism kaise kaam karta hai?**

Image ek immutable read-only template hai jo multiple stacked filesystem layers se bani hoti hai. Har layer ek tar archive hai jo previous layer ke upar diff represent karta hai. Image ka content-addressable storage hota hai — har layer ka SHA256 hash hota hai, aur Docker registry me layers hash ke basis pe deduplicate hote hain. Container is image ka runtime instance hai — Docker daemon image ke top layer ke upar ek thin writable layer mount karta hai (UnionFS via overlay2 driver) aur process ko us mounted filesystem me start karta hai with isolated namespaces (PID, network, mount, UTS, IPC, user) aur cgroups (CPU, memory limits).

Practical impact ye hai ki ek hi image se thousand containers chala sakte ho aur disk pe image sirf ek baar store hoti hai. Lekin agar tumne container me 1GB ka file likha, woh writable layer me jaata hai aur container delete hote hi gone — persistence ke liye tumhe volumes use karne padte hain. Production me iska matlab — kabhi container ke local filesystem pe critical data mat rakho. Logs, uploaded files, database data — sab volumes me jaane chahiye.

Senior engineer ke liye ek nuance ye hai ki "image" actually do cheezein hain: image manifest (JSON metadata listing layer hashes) aur actual layer blobs. Pull operation me Docker pehle manifest fetch karta hai, dekhta hai konse layers already disk pe hain, aur sirf missing layers download karta hai. Yahi reason hai ki same base image use karne wali services fast deploy hoti hain — base layers already cached hote hain.

**Q2: Copy-on-write se actually kya benefit milta hai? Aur kab ye problem ban sakta hai?**

CoW ka primary benefit storage efficiency aur fast container startup hai. Container start karne me actual filesystem copy nahi hoti — sirf overlay mount hota hai, jo millisecond me ho jaata hai. Compare karo VM startup se jo seconds-to-minutes leta hai. Memory me bhi savings — agar 100 containers same Python interpreter ke shared library use kar rahe hain, kernel page cache me woh ek hi baar load hoti hai (kernel-level shared mapping).

Problem tab aati hai jab tumhara workload write-heavy hai container filesystem pe. Har write operation me CoW overhead hota hai — file ko upper layer me copy karna padta hai pehli baar likhne pe. Agar tum 10GB ki database file modify kar rahe ho container ke andar, performance band baj jayegi. Isliye databases (Postgres, MySQL, Redis) hamesha volumes pe data store karte hain — volume direct host filesystem use karta hai bina CoW overhead ke. Production me agar tumne MySQL container chalaya bina volume ke aur 50GB data likh diya, pehli toh slow hoga, doosra container restart pe sab gone.

Ek aur subtle issue — image bloat. Agar Dockerfile me tumne file create ki ek layer me aur delete ki agle layer me, file actual disk pe rahegi (pichle layer me) aur image size badi hogi. Multi-stage builds aur single-RUN-with-cleanup patterns isi reason se exist karte hain.

**Q3: Production me image size 1.2GB se 80MB tak kaise laye?**

Multiple techniques combine karni padti hain. **First**, base image choice — `node:20` (Debian-based, ~1GB) ki jagah `node:20-alpine` (Alpine-based, ~180MB) use karo. Agar even smaller chahiye toh `node:20-slim` ya distroless images consider karo. Alpine me musl libc hai (glibc nahi) — kabhi kabhi native dependencies break ho sakti hain, isliye testing zaroori hai.

**Second**, multi-stage builds — build stage me dev dependencies aur compilers install karo, final stage me sirf runtime artifacts copy karo. Ek Java app me ye 800MB se 150MB tak la sakta hai — Maven build deps final image me nahi jaate. **Third**, layer optimization — multiple `RUN` commands ko `&&` se combine karo, especially jab cleanup ho raha ho. `apt-get install` ke baad `rm -rf /var/lib/apt/lists/*` same line me — warna package metadata image me reh jaata hai (~30MB).

**Fourth**, `.dockerignore` use karo — `node_modules`, `.git`, test files, IDE configs — sab exclude karo build context se. Maine ek company me dekha jahan `.dockerignore` missing tha aur log files (5GB) image me ja rahe the. **Fifth**, tools jaise `dive` ya `docker-slim` use karo — ye unused files detect karte hain aur image ko strip karte hain.

**Q4: Layer caching kab break hota hai aur kaise debug karte hain?**

Layer cache invalidate hota hai jab kisi layer ka input change ho jaata hai. `COPY` instruction ke liye, input hai source files ka content (mtime nahi, content hash). `RUN` instruction ke liye, input hai command string. Isliye `RUN echo $(date)` har baar cache miss karega — command string same hai but Docker still re-executes if previous layer was invalidated. Important — ek baar koi layer cache miss ho gayi, saari subsequent layers bhi rebuild hongi (cache invalidation cascades downward).

Common cache-breaking mistakes — `COPY . .` Dockerfile ke shuru me hi karna (har file change pe everything rebuilds), `apt-get update` ko alag `RUN` me rakhna (stale package index ka risk), `ARG` use karna jo har build pe change hota hai (build-arg version bumping). Solution — package manifests pehle copy karo, dependencies install karo, source code last me copy karo. Aur `--cache-from` flag use karo CI me — pichli successful build se cache pull karke local cache populate karo.

Debug karne ke liye `docker build --progress=plain` flag use karo — har step ka detailed output milega including cache hit/miss. `docker history <image>` se layer-by-layer size dekho — koi layer unexpected bada hai toh investigate karo. `dive <image>` interactive tool hai jo har layer ke andar files explore karne deta hai. Production CI me agar build slow ho rahi hai, often cache miss because of wrong COPY ordering — yahi pehle dekhna chahiye.

---

## 2. Dockerfile

### 2.1 Multi-stage builds, COPY/ADD/RUN/CMD/ENTRYPOINT, .dockerignore, best practices

#### Definition

**Dockerfile** ek text file hai jisme step-by-step instructions likhi hoti hain image banane ke liye. Har instruction ek layer banata hai (mostly), aur Docker daemon top-to-bottom execute karta hai. **Multi-stage build** matlab ek hi Dockerfile me multiple `FROM` statements use karna — har `FROM` ek naya stage start karta hai, aur tum baad wale stages me pichle stages se selectively files copy kar sakte ho. Ye pattern build-time dependencies ko final image se exclude karne ke liye game-changer hai.

Core instructions: **`FROM`** (base image), **`COPY`** (host se files copy), **`ADD`** (COPY + URL/tar extraction), **`RUN`** (build-time command execute), **`CMD`** (default container command, override-able), **`ENTRYPOINT`** (fixed entry command), **`ENV`** (env vars), **`ARG`** (build-time args), **`WORKDIR`** (cwd), **`USER`** (process user), **`EXPOSE`** (documentation hint), **`VOLUME`** (mount point declaration), **`HEALTHCHECK`** (liveness probe).

**`.dockerignore`** ek file hai (Dockerfile ke saath same directory me) jo Docker daemon ko batati hai konsi files build context me include nahi karni. Ye `gitignore` jaisi syntax follow karti hai. Critical hai — bina iske `node_modules` ya `.git` daemon ko bhej diye jaate hain, build slow ho jaata hai aur image bloat hoti hai.

#### Why?

Multi-stage builds production me mandatory hain agar tum compiled languages (Go, Rust, Java, C++) ya build-step wali apps (TypeScript, webpack, sass) use kar rahe ho. Build dependencies bhaari hote hain — Go compiler 300MB, Maven + JDK 800MB, Node + webpack ke build deps 400MB. Ye final runtime image me bilkul nahi chahiye. Multi-stage me tum build stage me compile karte ho aur sirf binary/artifacts final stage me copy karte ho — image 10x chhoti ho jaati hai.

`COPY` vs `ADD` ka difference important hai — `ADD` extra features deta hai (auto-extract tarballs, fetch URLs) but ye implicit behaviour confusing hai aur cache invalidation properly handle nahi karta. Best practice — always use `COPY` unless tumhe specifically `ADD` ka feature chahiye. `CMD` vs `ENTRYPOINT` me distinction subtle hai — `ENTRYPOINT` is the fixed executable, `CMD` is the default arguments. `docker run image foo` me `foo` `CMD` ko override karta hai, but `ENTRYPOINT` ko nahi (unless `--entrypoint` flag).

`.dockerignore` ki importance underrated hai. Build context daemon ko bheja jaata hai — agar tumhare project me 2GB ke node_modules ya 500MB ki .git history hai, woh sab daemon ko transfer hota hai (tar streamed), even if Dockerfile use nahi karti. Maine ek startup me dekha — bina .dockerignore ke build 8 minutes leti thi, .dockerignore add karne ke baad 90 seconds. Plus security — accidental `.env` ya `secrets.json` image me jaane ka risk eliminate hota hai.

#### How?

Multi-stage Go application example:

```dockerfile
# /home/razorpay/payment-gateway/Dockerfile
# Multi-stage build for Go service — final image ~15MB!

# === STAGE 1: Builder ===
FROM golang:1.22-alpine AS builder
# Alias 'builder' diya hai — baad me reference karenge

WORKDIR /build

# Dependencies pehle (caching ke liye)
COPY go.mod go.sum ./
RUN go mod download

# Source code copy aur build
COPY . .
# CGO disable kar rahe hain — pure static binary banegi
# -ldflags se symbol table strip karo, size reduce
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s" \
    -o /build/payment-gw \
    ./cmd/server

# === STAGE 2: Runtime ===
FROM alpine:3.19 AS runtime
# Alpine 3.19 sirf 7MB hai

# CA certificates chahiye HTTPS calls ke liye
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S app && adduser -S app -G app

# Sirf binary copy karo builder stage se
COPY --from=builder /build/payment-gw /usr/local/bin/payment-gw

USER app
EXPOSE 8080

# Healthcheck — Kubernetes liveness probe ke alawa Docker bhi check karega
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/health || exit 1

# ENTRYPOINT use kar rahe hain — binary fixed hai
ENTRYPOINT ["/usr/local/bin/payment-gw"]
# CMD default flags deta hai, override ho sakta hai
CMD ["--config", "/etc/payment/config.yaml"]
```

`.dockerignore` file:

```gitignore
# /home/razorpay/payment-gateway/.dockerignore
# Build context se exclude karo — daemon ko ye sab nahi bhejna

# Version control
.git
.gitignore

# Dependencies (Dockerfile khud install karega)
node_modules
vendor

# Build artifacts
dist
build
*.exe
coverage

# IDE / OS
.vscode
.idea
*.swp
.DS_Store

# Docs (image me nahi chahiye)
docs
*.md
README*

# Secrets (CRITICAL — kabhi image me nahi)
.env
.env.*
secrets/
*.pem
*.key

# Test artifacts
__tests__
*.test.js
test-results

# Logs
*.log
logs/

# Docker files khud (recursive build se bachne ke liye)
Dockerfile*
docker-compose*.yml
```

CMD vs ENTRYPOINT ka practical difference:

```dockerfile
# Approach 1: Sirf CMD
FROM alpine
CMD ["echo", "hello"]
# docker run myimage         -> "hello"
# docker run myimage world   -> "world" (CMD fully overridden)

# Approach 2: Sirf ENTRYPOINT
FROM alpine
ENTRYPOINT ["echo", "hello"]
# docker run myimage         -> "hello"
# docker run myimage world   -> "hello world" (args appended to ENTRYPOINT)

# Approach 3: ENTRYPOINT + CMD (BEST PRACTICE)
FROM alpine
ENTRYPOINT ["echo"]
CMD ["hello"]
# docker run myimage         -> "hello" (default)
# docker run myimage world   -> "world" (CMD overridden, ENTRYPOINT preserved)
# Yahi pattern services ke liye perfect hai
```

Build aur tag karna:

```bash
# Multi-platform build (ARM64 + AMD64) — production me both chahiye
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag razorpay/payment-gw:1.2.3 \
    --tag razorpay/payment-gw:latest \
    --push \
    .

# Build with cache from registry (CI optimization)
docker build \
    --cache-from razorpay/payment-gw:cache \
    --tag razorpay/payment-gw:$(git rev-parse --short HEAD) \
    .
```

#### Real-life Example

PhonePe-style transaction service — Java Spring Boot app with Gradle build. Pre-multistage me image 1.4GB thi (JDK + Gradle + sources + build cache). Yeh prod-grade multi-stage Dockerfile hai jo image 220MB tak laata hai:

```dockerfile
# /home/phonepe/txn-service/Dockerfile
# Spring Boot service — multi-stage with security hardening

# === STAGE 1: Build ===
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

# Gradle wrapper aur build files pehle (caching)
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./

# Dependencies pre-fetch karo — ye layer rarely change hota hai
RUN ./gradlew dependencies --no-daemon

# Source ab copy karo
COPY src ./src

# Build aur layer extraction (Spring Boot ke liye special)
RUN ./gradlew bootJar --no-daemon \
    && mkdir -p build/extracted \
    && java -Djarmode=layertools -jar build/libs/*.jar extract --destination build/extracted

# === STAGE 2: Runtime ===
FROM eclipse-temurin:21-jre-alpine AS runtime
# JRE hai, JDK nahi — ~150MB saving

# Security: non-root user, no shell access
RUN addgroup -S phonepe && adduser -S -G phonepe -s /sbin/nologin phonepe

WORKDIR /app

# Spring Boot layered jar — har layer alag, optimal caching
# Order matters — least-changing layer pehle
COPY --from=builder --chown=phonepe:phonepe /workspace/build/extracted/dependencies/ ./
COPY --from=builder --chown=phonepe:phonepe /workspace/build/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=phonepe:phonepe /workspace/build/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=phonepe:phonepe /workspace/build/extracted/application/ ./

USER phonepe

# Container me JVM ko memory limit aware banao
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Exec form use kar rahe hain — signals properly forward honge
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
```

Corresponding `.dockerignore`:

```gitignore
# /home/phonepe/txn-service/.dockerignore
.git
.gitignore
.idea
.vscode
*.iml
build
.gradle
out
target
node_modules
*.log
coverage
.env*
secrets
HELP.md
README.md
docker-compose*.yml
Dockerfile*
k8s/
helm/
```

CI build script:

```bash
#!/bin/bash
# /home/phonepe/txn-service/scripts/build.sh
# CI-friendly build with caching aur scanning

set -euo pipefail

IMAGE_NAME="phonepe/txn-service"
GIT_SHA=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Build with BuildKit (better caching, parallelism)
DOCKER_BUILDKIT=1 docker build \
    --cache-from type=registry,ref=${IMAGE_NAME}:buildcache \
    --cache-to type=registry,ref=${IMAGE_NAME}:buildcache,mode=max \
    --tag ${IMAGE_NAME}:${GIT_SHA} \
    --tag ${IMAGE_NAME}:${BRANCH} \
    --build-arg BUILD_VERSION=${GIT_SHA} \
    .

# Security scan — Trivy se vulnerabilities check karo
trivy image --severity HIGH,CRITICAL --exit-code 1 ${IMAGE_NAME}:${GIT_SHA}

# Image size check — agar 300MB se zyada hai toh fail karo
SIZE_MB=$(docker image inspect ${IMAGE_NAME}:${GIT_SHA} --format='{{.Size}}' | awk '{print int($1/1024/1024)}')
if [ "$SIZE_MB" -gt 300 ]; then
    echo "Image size ${SIZE_MB}MB exceeds 300MB threshold"
    exit 1
fi

# Push to registry
docker push ${IMAGE_NAME}:${GIT_SHA}
docker push ${IMAGE_NAME}:${BRANCH}

echo "Build complete: ${IMAGE_NAME}:${GIT_SHA} (${SIZE_MB}MB)"
```

#### Diagram

```mermaid
graph LR
    subgraph "Build Stage (discarded)"
        A[FROM golang:1.22-alpine<br/>800MB] --> B[COPY go.mod go.sum<br/>+1KB]
        B --> C[RUN go mod download<br/>+150MB]
        C --> D[COPY source<br/>+5MB]
        D --> E[RUN go build<br/>output: 15MB binary]
    end

    subgraph "Runtime Stage (final image)"
        F[FROM alpine:3.19<br/>7MB] --> G[apk add ca-certificates<br/>+2MB]
        G --> H[adduser app<br/>+0KB]
        H --> I[COPY --from=builder<br/>binary: 15MB]
        I --> J[USER app + ENTRYPOINT<br/>Final: ~24MB]
    end

    E -.copy artifact.-> I

    style A fill:#ffcccc
    style C fill:#ffcccc
    style D fill:#ffcccc
    style E fill:#ffcccc
    style J fill:#ccffcc
```

Diagram me red stage build artifacts hain jo final image me nahi jaate. Green stage final shippable image hai — sirf 24MB.

#### Interview Q&A

**Q1: Multi-stage builds kaise work karte hain aur kab use karne chahiye?**

Multi-stage builds ek hi Dockerfile me multiple `FROM` instructions allow karte hain. Har `FROM` naya stage start karta hai with fresh filesystem. Pichle stages se files `COPY --from=<stage>` se aati hain. Build done hone ke baad sirf last stage final image banti hai — pichle stages discard ho jaate hain (build cache me reh sakte hain, but final image me nahi). Internally Docker BuildKit DAG banata hai stages ka aur unrelated stages parallel build kar sakta hai.

Use cases — kisi bhi compiled language me mandatory (Go, Rust, Java, C/C++, Swift). JavaScript me jab tum TypeScript/webpack/Vite use karte ho — build stage me Node + dev deps + bundler, runtime stage me sirf nginx serving static files (ya minimal node:alpine for SSR). Python me agar wheels compile karne padte hain native deps ke liye, builder stage me build-essentials install karo, runtime me sirf wheels copy karo. Distroless images ke saath bhi multi-stage chahiye — distroless me shell tak nahi hota, sab build builder me karna padta hai.

Advanced patterns — multiple parallel stages for testing, linting, security scanning. Ek `test` stage tests run karta hai, ek `lint` stage code quality check karta hai, ek `prod` stage final image banata hai. CI me `--target test` se sirf tests run karo, `--target prod` se prod image banao. Same Dockerfile, multiple use cases.

**Q2: CMD aur ENTRYPOINT me difference detail me samjhao. Exec form vs shell form kya hai?**

`ENTRYPOINT` defines karta hai konsa executable run hoga — ye fixed hai container ke liye. `CMD` default arguments deta hai jo `ENTRYPOINT` ko pass hote hain. Jab tum `docker run image arg1 arg2` karte ho, `arg1 arg2` `CMD` ko replace karta hai, but `ENTRYPOINT` waise hi rehta hai. Agar tumhe `ENTRYPOINT` bhi override karna hai, `--entrypoint` flag pass karo. Combination pattern (`ENTRYPOINT` + `CMD`) most flexible hai — service ko by default start karta hai with default flags, but user override kar sakta hai for debugging (`docker run image bash`).

Exec form (`["cmd", "arg1"]`) aur shell form (`cmd arg1`) ka difference critical hai. Exec form direct exec syscall karta hai — shell process spawn nahi hota, signals (SIGTERM, SIGINT) directly process ko milte hain. Shell form `/bin/sh -c "cmd"` ke through chalata hai — ek extra shell process hota hai, aur signals shell ko jaate hain, app ko nahi (PID 1 problem). Production me hamesha exec form use karo, especially for `ENTRYPOINT` aur `CMD`. Warna Kubernetes pod terminate karte time SIGTERM honor nahi hoga aur graceful shutdown break ho jayega.

Ek edge case — agar tumhe shell features chahiye (env var expansion, pipes), exec form me shell explicitly invoke karo: `ENTRYPOINT ["sh", "-c", "exec myapp $MY_VAR"]`. Yahan `exec` important hai — woh shell ko replace karta hai myapp se, tabhi PID 1 myapp banta hai aur signals properly milte hain. `tini` ya `dumb-init` jaise init systems bhi PID 1 problem solve karte hain — production images me use kar sakte ho.

**Q3: Layer caching ko CI me kaise optimize karein?**

Pehle Dockerfile structure optimize karo — least-changing things pehle, most-changing last. Base image, system packages, language deps, app deps, source code — yahi order. `COPY package*.json ./` aur `RUN npm ci` source code se pehle — npm ci ka cache hit hoga jab tak deps unchanged hain.

CI me cache persist karne ke do main approaches hain. **Approach 1: Registry-based cache** — `--cache-from registry.io/myimage:cache --cache-to registry.io/myimage:cache,mode=max` flags use karo. Cache layers registry me push hote hain, agla CI run unhe pull karke local cache populate karta hai. `mode=max` se intermediate stages bhi cache hote hain (default sirf final hota hai). **Approach 2: Filesystem cache** — `--cache-from type=local,src=/cache --cache-to type=local,dest=/cache,mode=max`. Ye works if CI runner has persistent disk (GitHub Actions self-hosted, GitLab runners with cache volumes).

BuildKit features bhi use karo. `RUN --mount=type=cache,target=/root/.npm` syntax se npm cache directory ko cross-build persistent banao — har build me npm package downloads reuse honge. Same trick Maven (`/root/.m2`), pip (`/root/.cache/pip`), Go (`/root/go/pkg/mod`) ke liye. `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc` se secrets ko secure way me build me inject karo bina image me leak kiye.

**Q4: .dockerignore me kya kya include hona chahiye aur kyun?**

`.dockerignore` build context size aur security control karta hai. Build context daemon ko stream hota hai every build pe — agar 5GB ka context hai, daemon ko 5GB transfer karna hai even if Dockerfile sirf 100MB use karta hai. First priority — VCS metadata (`.git`, `.svn`) — yahan often gigabytes ki history hoti hai jo image me nahi chahiye. Plus `.git` me access tokens, hooks, configs leak ho sakte hain.

Second — dependency directories jo image me Dockerfile khud install karega. `node_modules`, `vendor`, `target`, `__pycache__`, `*.pyc`. Ye host pe dev environment ke liye hain, container me Dockerfile fresh install karega correct platform ke liye. Agar tumne Mac pe `npm install` kiya aur woh node_modules image me copy ho gaya, native modules (sharp, bcrypt) Linux me crash karenge — platform mismatch.

Third aur most critical — secrets. `.env`, `.env.local`, `*.pem`, `*.key`, `secrets/`, `credentials.json`, `.aws/`, `.kube/`. Maine multiple companies me security audit me dekha hai jahan dev ne accidentally `.env` ya AWS credentials image me include kar diye, image registry me push ho gayi, aur secrets leak. `.dockerignore` first line of defense hai. Build me bhi `--secret` flag use karo build-time secrets ke liye, image me kabhi mat embed karo.

Fourth — IDE/OS files (`.vscode`, `.idea`, `.DS_Store`), test files (`__tests__`, `*.test.*`), docs (`docs/`, `*.md`), Docker files khud (`Dockerfile*`, `docker-compose*.yml`). Docker files include karne se kabhi recursive build issues nahi aate, but unnecessary hain. Aur a sneaky one — log files (`*.log`, `logs/`) — kuch teams ne dekha hai 10GB+ ke log files accidentally image me ja rahe the.

---

## 3. Docker Compose

### 3.1 Multi-container apps, services, networks, depends_on, profiles

#### Definition

**Docker Compose** ek tool hai jo multi-container applications declaratively define karne aur run karne ke liye use hota hai. Tum ek `docker-compose.yml` (ya `compose.yaml`) file me apne saare services, networks, volumes, configs ek jagah define karte ho, aur `docker compose up` se sab kuch start ho jaata hai. Production single-host deployments, local dev environments, integration testing — sab me Compose use hota hai.

Core concepts: **services** (containers, with image/build, ports, env, volumes), **networks** (custom bridge networks for service isolation aur DNS-based discovery), **volumes** (named volumes for persistence), **depends_on** (startup order aur health-based readiness), **profiles** (conditional service activation), **configs** aur **secrets** (file-based config injection). Compose v2 (Go-based, integrated into `docker` CLI) ne pichle Python-based v1 ko replace kar diya hai — `docker compose` (space) is the modern command.

Compose Kubernetes nahi hai — single-host orchestration hai. Multi-host production workloads ke liye Kubernetes ya Docker Swarm chahiye. But local dev, CI integration tests, aur small production deployments (single VM with 5-10 services) ke liye Compose perfect hai. Most companies me dev workflow Compose-based hota hai, prod Kubernetes-based — same Dockerfiles dono jagah use hote hain.

#### Why?

Real applications kabhi single container nahi hote. Ek typical web app me hota hai — API server, database (Postgres), cache (Redis), message queue (RabbitMQ/Kafka), background workers, reverse proxy (Nginx), monitoring (Prometheus). Bina Compose ke tumhe har container manually start karna padta — `docker run` saath me network create karo, env vars set karo, volumes mount karo, port maps karo. Ek developer onboarding karne me 2 ghante lag jaate the. Compose se `docker compose up` aur 30 second me sab ready.

`depends_on` startup ordering deta hai — API ko Postgres ke baad start karo, workers ko Redis ke baad. Healthcheck integration ke saath, dependency ready hone tak wait karega — sirf container start hone tak nahi. Networks isolation dete hain — frontend services aur backend services alag networks me, frontend backend ko access kar sake but reverse nahi. Service discovery automatic hai — service name DNS hostname ban jaata hai, `http://api:8080` directly use kar sakte ho.

Profiles ka use case important hai — same Compose file me alag-alag environments ke services define karo. Dev me sirf core services chahiye, integration testing me extra (mock-server, kafka), staging me observability stack (prometheus, grafana). Profiles activate karke selectively services launch karo — `docker compose --profile dev up` vs `docker compose --profile full up`.

#### How?

Basic Compose file with all major features:

```yaml
# /home/myntra/storefront/docker-compose.yml
# Multi-service e-commerce stack — local dev environment

# Compose file format version (modern me optional, top-level field hi enough)
name: storefront-dev

services:
  # === Application Services ===

  api:
    # Build se image banao (dev me code hot-reload chahiye)
    build:
      context: ./services/api
      dockerfile: Dockerfile
      target: development  # Multi-stage me 'development' stage use karo
    container_name: storefront-api
    ports:
      - "8080:8080"   # host:container
      - "9229:9229"   # Node debugger port
    environment:
      # Sensitive values .env file se aate hain
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@postgres:5432/storefront
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      LOG_LEVEL: debug
    volumes:
      # Source code bind mount — local changes reflect honge container me
      - ./services/api/src:/app/src:ro
      - ./services/api/package.json:/app/package.json:ro
      # Anonymous volume — node_modules ko host pe mat overlay karo
      - /app/node_modules
    depends_on:
      # Healthcheck-based wait — Postgres ready hone tak wait karega
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend
    restart: unless-stopped
    # Resource limits — local me bhi production-like behaviour
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  worker:
    build:
      context: ./services/worker
      target: development
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@postgres:5432/storefront
      REDIS_URL: redis://redis:6379
      QUEUE_CONCURRENCY: 5
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - backend
    # Multiple worker instances dev me bhi
    deploy:
      replicas: 2

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infra/nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - api
    networks:
      - frontend

  # === Data Stores ===

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: storefront
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      # Performance tuning dev me bhi
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --locale=C"
    volumes:
      # Named volume — data persist hoga across container restarts
      - postgres-data:/var/lib/postgresql/data
      # Init scripts — pehli baar run pe execute honge
      - ./infra/postgres/init:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"  # Host se direct access (dev only, prod me expose mat karo)
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d storefront"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # === Optional Services (profiles) ===

  prometheus:
    image: prom/prometheus:v2.48.0
    profiles: ["observability"]  # Sirf 'observability' profile pe activate hoga
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - backend

  grafana:
    image: grafana/grafana:10.2.0
    profiles: ["observability"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    ports:
      - "3001:3000"
    networks:
      - backend
    depends_on:
      - prometheus

  mailhog:
    # Sirf 'dev' profile me — email testing
    image: mailhog/mailhog:latest
    profiles: ["dev"]
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - backend

# === Networks ===
networks:
  # Frontend network — public-facing services
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24

  # Backend network — internal services, koi external access nahi
  backend:
    driver: bridge
    internal: false  # Set true for fully isolated (no internet)
    ipam:
      config:
        - subnet: 172.21.0.0/24

# === Volumes ===
volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
```

Common Compose commands:

```bash
# Saare services start karo (no profiles)
docker compose up -d

# Specific profile activate karke
docker compose --profile observability --profile dev up -d

# Specific service rebuild aur restart
docker compose up -d --build api

# Logs tail karo (multiple services)
docker compose logs -f api worker

# Service ke andar shell open karo
docker compose exec api sh

# Ek-time command run karo (new container)
docker compose run --rm api npm run migrate

# Sirf specific services start
docker compose up -d postgres redis

# Saare resources cleanup (volumes bhi)
docker compose down -v

# Service ko scale karo
docker compose up -d --scale worker=5

# Config dekho — variables expanded ke saath
docker compose config

# Service health status
docker compose ps
```

Environment file:

```bash
# /home/myntra/storefront/.env
# Compose automatically picks this up

DB_PASSWORD=local_dev_password_123
GRAFANA_PASSWORD=admin
COMPOSE_PROJECT_NAME=storefront
```

#### Real-life Example

Full prod-grade Compose setup for a fintech-style application — hypothetical "Razorpay-lite" with payment API, fraud detection worker, Postgres for transactions, Redis for rate limiting, Kafka for event streaming, aur Nginx as edge proxy. Production-ready features included — secrets management, logging, healthchecks, restart policies, network segmentation.

```yaml
# /home/fintech/payment-stack/docker-compose.prod.yml
# Production deployment — single VM (8 vCPU, 32GB RAM)

name: payment-stack

x-common-logging: &default-logging
  # YAML anchors — DRY principle
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "5"
    labels: "service,env"

x-common-restart: &default-restart
  restart: unless-stopped

services:
  nginx:
    <<: *default-restart
    image: nginx:1.25-alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/conf.d:ro
      - nginx-cache:/var/cache/nginx
    secrets:
      - source: tls_cert
        target: /etc/nginx/certs/cert.pem
      - source: tls_key
        target: /etc/nginx/certs/key.pem
    depends_on:
      payment-api:
        condition: service_healthy
    networks:
      - edge
    logging: *default-logging
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  payment-api:
    <<: *default-restart
    image: registry.fintech.io/payment-api:${VERSION:-latest}
    environment:
      NODE_ENV: production
      PORT: 8080
      DATABASE_URL_FILE: /run/secrets/db_url
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:9092
      LOG_LEVEL: info
      OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317
    secrets:
      - db_url
      - api_signing_key
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      kafka:
        condition: service_healthy
    networks:
      - edge
      - data
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          memory: 512M
    logging: *default-logging
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/health/ready"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

  fraud-worker:
    <<: *default-restart
    image: registry.fintech.io/fraud-worker:${VERSION:-latest}
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:9092
      KAFKA_GROUP_ID: fraud-detection
      ML_MODEL_PATH: /models/fraud-v3.pkl
    secrets:
      - db_url
    volumes:
      - ml-models:/models:ro
    depends_on:
      kafka:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - data
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.5'
          memory: 2G
    logging: *default-logging

  postgres:
    <<: *default-restart
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: payments
      POSTGRES_USER: payments_app
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
      # WAL aur replication ready
      POSTGRES_INITDB_ARGS: "--data-checksums"
    secrets:
      - postgres_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    networks:
      - data
    deploy:
      resources:
        limits:
          memory: 8G
        reservations:
          memory: 4G
    logging: *default-logging
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U payments_app -d payments"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 60s

  redis:
    <<: *default-restart
    image: redis:7-alpine
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --maxmemory
      - 2gb
      - --maxmemory-policy
      - allkeys-lru
      - --requirepass
      - ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - data
    deploy:
      resources:
        limits:
          memory: 2.5G
    logging: *default-logging
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  kafka:
    <<: *default-restart
    image: bitnami/kafka:3.6
    environment:
      KAFKA_CFG_NODE_ID: 0
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 0@kafka:9093
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CFG_LOG_RETENTION_HOURS: 168  # 7 days
    volumes:
      - kafka-data:/bitnami/kafka
    networks:
      - data
    deploy:
      resources:
        limits:
          memory: 4G
    logging: *default-logging
    healthcheck:
      test: ["CMD-SHELL", "kafka-topics.sh --bootstrap-server localhost:9092 --list"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  otel-collector:
    <<: *default-restart
    image: otel/opentelemetry-collector-contrib:0.91.0
    profiles: ["observability"]
    volumes:
      - ./otel/config.yaml:/etc/otelcol-contrib/config.yaml:ro
    networks:
      - data
      - edge
    logging: *default-logging

networks:
  edge:
    driver: bridge
    ipam:
      config:
        - subnet: 172.30.0.0/24
  data:
    driver: bridge
    internal: false  # Internal true karne se internet access band ho jata hai
    ipam:
      config:
        - subnet: 172.31.0.0/24

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  kafka-data:
    driver: local
  nginx-cache:
    driver: local
  ml-models:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/ml-models  # Host directory bind

secrets:
  db_url:
    file: ./secrets/db_url.txt
  api_signing_key:
    file: ./secrets/api_signing_key.txt
  postgres_password:
    file: ./secrets/postgres_password.txt
  tls_cert:
    file: ./secrets/tls/cert.pem
  tls_key:
    file: ./secrets/tls/key.pem
```

Deployment script:

```bash
#!/bin/bash
# /home/fintech/payment-stack/deploy.sh

set -euo pipefail

VERSION=${1:?Version required}
COMPOSE_FILE="docker-compose.prod.yml"

echo "Deploying version: $VERSION"

# Pull latest images
VERSION=$VERSION docker compose -f $COMPOSE_FILE pull

# Rolling deploy — services ek-ek karke restart
# (Compose true rolling deploy nahi karta — Swarm/K8s ke liye chahiye)
# Yahan staged restart karte hain
for service in payment-api fraud-worker; do
    echo "Updating $service..."
    VERSION=$VERSION docker compose -f $COMPOSE_FILE up -d \
        --no-deps --build $service

    # Health check
    sleep 10
    if ! docker compose -f $COMPOSE_FILE ps $service | grep -q "healthy"; then
        echo "Health check failed for $service"
        exit 1
    fi
done

# Cleanup unused images
docker image prune -f

echo "Deployment complete"
```

#### Diagram

```mermaid
graph TB
    Internet((Internet)) --> Nginx[Nginx<br/>:80, :443]

    subgraph "edge network (172.30.0.0/24)"
        Nginx --> API1[payment-api #1]
        Nginx --> API2[payment-api #2]
        Nginx --> API3[payment-api #3]
    end

    subgraph "data network (172.31.0.0/24)"
        API1 --> PG[(Postgres<br/>:5432)]
        API2 --> PG
        API3 --> PG

        API1 --> Redis[(Redis<br/>:6379)]
        API2 --> Redis
        API3 --> Redis

        API1 --> Kafka[Kafka<br/>:9092]
        API2 --> Kafka
        API3 --> Kafka

        Kafka --> W1[fraud-worker #1]
        Kafka --> W2[fraud-worker #2]

        W1 --> PG
        W2 --> PG
        W1 --> Redis
        W2 --> Redis
    end

    PG -.volume.-> V1[(postgres-data)]
    Redis -.volume.-> V2[(redis-data)]
    Kafka -.volume.-> V3[(kafka-data)]

    style Nginx fill:#ffd700
    style PG fill:#ccccff
    style Redis fill:#ffcccc
    style Kafka fill:#ccffcc
```

Diagram me clearly visible hai network segmentation — Nginx edge network me bhi hai aur edge-data dono pull karta hai. Workers sirf data network me hain — internet se directly access nahi ho sakte. Ye defense-in-depth pattern hai.

#### Interview Q&A

**Q1: depends_on actually kya guarantee karta hai? Common misconception kya hai?**

`depends_on` ka most common misconception hai ki ye dependency ke "ready" hone tak wait karta hai. Default behaviour me ye sirf container **start** hone tak wait karta hai — process running hai (PID 1 alive) but service ready ho ya na ho. Postgres container start ho jaata hai 2 second me, but DB actually accept connections 15-30 seconds me karta hai. Agar API container start hote hi DB connect karta hai, fail hoga aur crash karega — restart loop me jayega.

Solution hai `condition` field with healthcheck. `depends_on: { postgres: { condition: service_healthy } }` likhne par Compose target service ke healthcheck ke success hone tak wait karega. Healthcheck me `pg_isready` ya equivalent likhna padta hai. `service_started` (default), `service_healthy`, `service_completed_successfully` (one-shot init containers ke liye) — teen options hain. Production me hamesha `service_healthy` use karo for stateful services.

Ek aur nuance — `depends_on` Compose v2 me sirf startup ordering control karta hai, runtime restart pe nahi. Agar Postgres crash ho gaya during operation, Compose API container ko restart nahi karega even though dependency unhealthy hai. Application code me retry logic chahiye — circuit breakers, exponential backoff. Production me ye discipline critical hai. Kubernetes me readiness probes aur init containers ye gap better fill karte hain.

**Q2: Compose me service discovery kaise kaam karti hai? Custom networks ki zaroorat kyun?**

Compose har project ke liye ek default bridge network create karta hai (jab tak tum custom define na karo). Saare services automatically usse attach hote hain. Docker daemon embedded DNS server provide karta hai — service name DNS hostname ban jaata hai us network me. So `payment-api` service `redis` service ko `redis:6379` se reach kar sakti hai bina IP janne. Ye hostname auto-update hota hai when containers restart with new IPs.

Custom networks ki zaroorat segmentation aur security ke liye padti hai. Default network me sab services ek doosre se communicate kar sakte hain — flat topology. Production me tum chahte ho frontend services backend services ko reach karein, but reverse nahi. Custom networks me services ko selectively attach karke ye control hota hai. Mere example me `nginx` aur `payment-api` `edge` network me hain, `payment-api`, workers, aur databases `data` network me. Workers ko internet access nahi chahiye (potentially), so `data` network ko `internal: true` banane se isolation milti hai.

Networks ka aur ek use case — alag protocols ka isolation. `internal: true` flag se network ko fully isolated bana sakte ho — no external internet access. Ye database network ke liye useful hai — DB ko npm packages download nahi karne. Plus tum custom IPAM (subnet, gateway, IP range) define kar sakte ho — production troubleshooting me predictable IPs help karte hain. Multi-host scenarios me overlay driver use hota hai (Swarm/K8s context).

**Q3: Profiles ka use case kya hai aur kab use karein?**

Profiles same Compose file me services ko conditionally activate karne deta hai. Ek service me `profiles: ["dev", "debug"]` likhne par woh service tabhi start hogi jab koi matching profile activate ho — `docker compose --profile dev up`. Bina profile activate kiye, profile-tagged services skip ho jaati hain.

Use cases — environment-specific services. Dev me `mailhog` chahiye (fake SMTP server), prod me nahi. Tools jaise `pgadmin`, `redis-commander` dev me convenience ke liye, prod me security risk. Profiles se same compose file dono jagah use hoti hai — different `--profile` flags se. Doosra use case — observability stack. Prometheus, Grafana, Loki — heavy services hain, sab ko har time start nahi karna. `--profile observability` se on-demand activate.

Third use case — testing. CI me integration tests ke liye extra services chahiye — kafka-test, mock-payment-gateway, test-data-seeder. Ye `--profile integration-tests` me. Local dev me developer normally `--profile dev` chalata hai, kabhi-kabhi `--profile observability` agar metrics dekhne hain. Profiles ka beauty hai — code repetition zero, environments per file fork karne ki zaroorat nahi.

Anti-pattern — profiles ko production-vs-dev distinction ke liye **alone** use mat karo. Production me bahut configs change hote hain (replicas, resources, image tags). Better pattern hai `docker-compose.yml` (base) + `docker-compose.prod.yml` (prod overrides) + `docker-compose.dev.yml` (dev overrides). `docker compose -f docker-compose.yml -f docker-compose.prod.yml up` se merge hoke run hota hai. Profiles iss layered config ke complement hain, replacement nahi.

**Q4: docker-compose vs docker compose ka difference? Production me Compose use karna chahiye ya Kubernetes?**

`docker-compose` (hyphen) original Python-based v1 tool hai jo separately install hota tha aur `pip` se distribute hota tha. Slow startup, parsing issues, limited features. `docker compose` (space) v2 hai — Go-based plugin jo Docker CLI ka extension hai. v2 me bahut features add hue — profiles, build secrets, GPU support, better IPv6, BuildKit integration. v1 deprecated hai 2023 se. Aaj jab koi compose ki baat kare, woh v2 hi mean kar raha hota hai.

Compose vs Kubernetes — ye scale ka question hai. Compose single-host orchestration hai. Ek VM ya bare-metal machine pe chalega. Multi-host nahi karta — agar tumne 3 VMs pe deploy karna hai, Compose nahi karega. Auto-scaling nahi hai, advanced rolling updates nahi hain (basic restart hai), self-healing limited hai (restart policies tak), service mesh nahi, RBAC nahi. Kubernetes ye sab provide karta hai but operational complexity bahut zyada hai.

Production decision framework — agar single VM/bare-metal pe deploy kar rahe ho, traffic moderate hai, team chhoti hai, ops budget kam hai — Compose works. Many SaaS startups me production ek high-spec EC2 instance pe Compose chalata hai successfully. Agar multi-region, auto-scaling, complex deployments, large team — Kubernetes (with EKS/GKE/AKS managed control plane). Common pattern — local dev aur CI Compose, production K8s. Same Dockerfiles dono jagah, deployment manifests alag.

Hybrid — Docker Swarm bhi exist karta hai jo Compose syntax extend karta hai multi-host scenarios ke liye. Lightweight K8s alternative. Adoption kam hai but valid choice hai mid-size deployments ke liye. Mere experience me — startup ke pehle 2 saal Compose, jab 10+ services aur multi-region requirement aaye, Kubernetes migration karo.

---

## 4. Volumes & networking

### 4.1 Persistence (named volumes, bind mounts), bridge/host/overlay networks

#### Definition

Container ka filesystem ephemeral hai — container delete hone pe writable layer me likha hua sab data gone. **Volumes** Docker ka mechanism hai data ko container lifecycle se decouple karne ke liye. Teen types hote hain — **named volumes** (Docker manage karta hai, `/var/lib/docker/volumes/` me store hote hain), **bind mounts** (host path directly container me mount hota hai), aur **tmpfs mounts** (memory-only, persistent nahi). Volumes containers ko replace karne pe bhi survive karte hain — production me databases, uploaded files, logs sab volumes pe.

**Networking** containers ke beech communication aur outside world se communication enable karta hai. Docker me four major network drivers hote hain — **bridge** (default, single-host containers ke beech), **host** (container directly host network use karta hai, no isolation), **overlay** (multi-host networking via VXLAN, Swarm/K8s me), **macvlan** (container ko apna MAC address mile, physical network me direct participate kare). Custom bridge networks (default bridge se different) automatic DNS-based service discovery dete hain.

Linux me ye sab namespaces aur virtual ethernet (veth) interfaces pe build hota hai. Bridge network ek virtual switch hai (`docker0` by default), aur containers ke veth pairs us bridge se attach hote hain. iptables rules NAT aur firewall logic handle karte hain. Senior engineer ko ye low-level mechanics samajhne chahiye — production network debugging me bahut help karte hain.

#### Why?

Persistence ke bina containers serious applications nahi run kar sakte. Database container restart ho gaya, saara data gaya — disaster. Volumes data ko container ke baahar persistent storage me rakhte hain. Named volumes preferred hote hain stateful services ke liye (databases, caches with persistence) — Docker manage karta hai, backup-restore commands available hain, performant hain (no CoW overhead). Bind mounts dev environments me useful hain (host code container me mount karna for hot reload), aur kuch production scenarios me jab tum specific host directory use karna chahte ho (jaise `/data` partition pe SSD).

Networking ki understanding production debugging me critical hai. "Service A service B ko reach nahi kar pa rahi" — ye 50% of microservice issues hain. Bridge networks me embedded DNS hai, but default bridge me nahi (sirf custom bridges me) — yahi gotcha bahut companies me dekha hai. Host network performance critical apps me use hota hai (no NAT overhead) but isolation sacrifice hoti hai. Overlay multi-host me chahiye but complexity badhati hai.

Volumes vs bind mounts ka tradeoff important hai. Named volumes portable hain — containers across machines move ho sakte hain. Bind mounts host-specific path dependency rakhte hain. Performance — Linux pe both same hote hain (direct filesystem access). Mac/Windows pe Docker Desktop me bind mounts slow hote hain (filesystem translation layer) — yahan named volumes prefer karo. Security — bind mounts me container host filesystem access kar sakta hai (potential escape vector), named volumes safer hain.

#### How?

Volume operations:

```bash
# Named volume create karo explicitly
docker volume create postgres-data

# Volume ko inspect karo — actual host path dekho
docker volume inspect postgres-data
# Output me "Mountpoint": "/var/lib/docker/volumes/postgres-data/_data"

# Saare volumes list
docker volume ls

# Container start karte time named volume mount
docker run -d \
    --name postgres \
    -v postgres-data:/var/lib/postgresql/data \
    -e POSTGRES_PASSWORD=secret \
    postgres:16-alpine

# Bind mount — host path container me
docker run -d \
    --name nginx \
    -v /home/myapp/configs/nginx.conf:/etc/nginx/nginx.conf:ro \
    -v /var/log/nginx:/var/log/nginx \
    nginx:1.25-alpine
# :ro = read-only flag (security best practice for configs)

# tmpfs mount — memory-only, fast, ephemeral
docker run -d \
    --tmpfs /tmp:rw,size=100m,noexec \
    myapp:latest

# Volume backup
docker run --rm \
    -v postgres-data:/source:ro \
    -v $(pwd):/backup \
    alpine \
    tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz -C /source .

# Volume restore
docker run --rm \
    -v postgres-data:/target \
    -v $(pwd):/backup \
    alpine \
    sh -c 'cd /target && tar xzf /backup/postgres-backup-20240115.tar.gz'

# Cleanup unused volumes (DANGEROUS — confirm first)
docker volume prune
```

Network operations:

```bash
# Custom bridge network create karo (DNS chalega)
docker network create \
    --driver bridge \
    --subnet 172.25.0.0/24 \
    --gateway 172.25.0.1 \
    --opt com.docker.network.bridge.name=br-myapp \
    myapp-network

# Container ko specific network me attach
docker run -d \
    --name api \
    --network myapp-network \
    --network-alias api-server \
    myapp/api:latest

# Multiple networks me attach (multi-NIC)
docker network connect another-network api

# Network inspect — connected containers, IPs
docker network inspect myapp-network

# Host networking — no isolation
docker run -d --network host nginx:alpine
# nginx ab host ke port 80 pe directly bind karega, NAT nahi

# Container ke andar network info dekho
docker exec api ip addr
docker exec api cat /etc/resolv.conf
docker exec api nslookup postgres

# Macvlan — container ko apna MAC mile
docker network create -d macvlan \
    --subnet=192.168.1.0/24 \
    --gateway=192.168.1.1 \
    -o parent=eth0 \
    macvlan-net
```

Compose me complete volumes + networks setup:

```yaml
# /home/foodtech/order-service/docker-compose.yml

services:
  api:
    image: foodtech/order-api:1.0
    volumes:
      # Named volume — uploads persist
      - uploads:/app/uploads
      # Bind mount — config from host
      - ./config/api.yaml:/app/config.yaml:ro
      # tmpfs — sensitive temp files memory me
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100M
    networks:
      - frontend
      - backend

  postgres:
    image: postgres:16-alpine
    volumes:
      # Named volume with explicit driver options
      - type: volume
        source: pgdata
        target: /var/lib/postgresql/data
        volume:
          nocopy: true  # Initial container content overlay mat karo
    networks:
      - backend

  cache-warmer:
    image: foodtech/cache-warmer:1.0
    volumes:
      # Read-only bind mount — security best practice
      - type: bind
        source: ./data/seed
        target: /seed
        read_only: true
    networks:
      - backend

networks:
  frontend:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1450  # MTU tuning for cloud
    ipam:
      config:
        - subnet: 172.40.0.0/24

  backend:
    driver: bridge
    internal: false
    ipam:
      config:
        - subnet: 172.41.0.0/24

volumes:
  uploads:
    driver: local
  pgdata:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/ssd/postgres  # SSD mount for performance
```

Multi-host overlay network (Swarm context):

```bash
# Swarm initialize karo
docker swarm init --advertise-addr 10.0.0.1

# Worker nodes add karo (token from manager)
docker swarm join --token SWMTKN-... 10.0.0.1:2377

# Overlay network — multi-host
docker network create \
    --driver overlay \
    --subnet 10.10.0.0/24 \
    --attachable \
    swarm-net

# Service deploy multi-host
docker service create \
    --name api \
    --network swarm-net \
    --replicas 5 \
    foodtech/order-api:1.0
# Replicas different nodes pe distribute ho sakte hain, lekin service discovery same network pe kaam karega
```

#### Real-life Example

Production-grade setup for a SaaS analytics platform — Mixpanel-style. Heavy data write workload, multiple persistence patterns, network segmentation. Hosts data on SSD for performance, archive on HDD for cost.

```yaml
# /home/saas/analytics/docker-compose.prod.yml

name: analytics-platform

services:
  # Edge layer
  envoy:
    image: envoyproxy/envoy:v1.28-latest
    ports:
      - "443:443"
      - "9901:9901"  # Admin (internal only)
    volumes:
      - type: bind
        source: ./envoy/envoy.yaml
        target: /etc/envoy/envoy.yaml
        read_only: true
      - type: bind
        source: /etc/letsencrypt/live/analytics.example.com
        target: /certs
        read_only: true
      - envoy-logs:/var/log/envoy
    networks:
      - public
      - api-tier

  # API tier
  ingest-api:
    image: registry.io/ingest-api:${VERSION}
    deploy:
      replicas: 4
      resources:
        limits: {cpus: '2', memory: 1G}
    volumes:
      # tmpfs for fast event buffering before flush to Kafka
      - type: tmpfs
        target: /buffer
        tmpfs: {size: 500M}
    environment:
      KAFKA_BROKERS: kafka-1:9092,kafka-2:9092,kafka-3:9092
      BUFFER_PATH: /buffer
    networks:
      - api-tier
      - data-tier
    depends_on:
      kafka-1: {condition: service_healthy}

  query-api:
    image: registry.io/query-api:${VERSION}
    deploy:
      replicas: 2
      resources:
        limits: {memory: 4G}
    volumes:
      # Read-only config bind mount
      - ./query-api/config.yaml:/etc/query/config.yaml:ro
      # Cache directory — named volume per replica? No, shared OK
      - query-cache:/var/cache/query
    environment:
      CLICKHOUSE_URL: http://clickhouse:8123
      REDIS_URL: redis://redis-cache:6379
    networks:
      - api-tier
      - data-tier

  # Data tier — heavy persistence
  clickhouse:
    image: clickhouse/clickhouse-server:24.1
    deploy:
      resources:
        limits: {memory: 16G}
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    volumes:
      # Critical data — SSD bind for performance
      - type: bind
        source: /mnt/ssd/clickhouse/data
        target: /var/lib/clickhouse
      # Logs separate disk — sequential writes, HDD OK
      - type: bind
        source: /mnt/hdd/clickhouse/logs
        target: /var/log/clickhouse-server
      # Config from host
      - ./clickhouse/config.xml:/etc/clickhouse-server/config.xml:ro
      - ./clickhouse/users.xml:/etc/clickhouse-server/users.xml:ro
    networks:
      - data-tier
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8123/ping"]
      interval: 30s
      retries: 3
      start_period: 120s

  redis-cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 4gb --maxmemory-policy allkeys-lru --save ""
    deploy:
      resources:
        limits: {memory: 5G}
    # No volume — pure in-memory cache, persistence not needed
    networks:
      - data-tier

  kafka-1: &kafka-template
    image: bitnami/kafka:3.6
    volumes:
      # Named volume on SSD-backed driver
      - type: volume
        source: kafka-1-data
        target: /bitnami/kafka
    environment:
      KAFKA_CFG_NODE_ID: 1
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      # ... (truncated for brevity)
    networks:
      - data-tier
    healthcheck:
      test: ["CMD-SHELL", "kafka-topics.sh --bootstrap-server localhost:9092 --list"]
      interval: 30s

  kafka-2:
    <<: *kafka-template
    volumes:
      - type: volume
        source: kafka-2-data
        target: /bitnami/kafka
    environment:
      KAFKA_CFG_NODE_ID: 2

  kafka-3:
    <<: *kafka-template
    volumes:
      - type: volume
        source: kafka-3-data
        target: /bitnami/kafka
    environment:
      KAFKA_CFG_NODE_ID: 3

  # Backup service — periodic snapshots
  backup-runner:
    image: registry.io/backup-runner:1.0
    volumes:
      # Read-only access to data volumes
      - type: bind
        source: /mnt/ssd/clickhouse/data
        target: /source/clickhouse
        read_only: true
      # Write access to backup destination
      - type: bind
        source: /mnt/backup
        target: /backup
      - type: bind
        source: ./backup/config.yaml
        target: /etc/backup/config.yaml
        read_only: true
    environment:
      S3_BUCKET: analytics-backups
      AWS_REGION: ap-south-1
    networks:
      - data-tier

networks:
  public:
    driver: bridge
    ipam:
      config: [{subnet: 172.50.0.0/24}]
  api-tier:
    driver: bridge
    ipam:
      config: [{subnet: 172.51.0.0/24}]
  data-tier:
    driver: bridge
    internal: false  # backup-runner ko S3 access chahiye
    ipam:
      config: [{subnet: 172.52.0.0/24}]

volumes:
  envoy-logs:
    driver: local
  query-cache:
    driver: local
  kafka-1-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/ssd/kafka/1
  kafka-2-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/ssd/kafka/2
  kafka-3-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/ssd/kafka/3
```

Backup script using volumes:

```bash
#!/bin/bash
# /home/saas/analytics/scripts/backup.sh
# Volume-aware backup script

set -euo pipefail

BACKUP_DIR="/mnt/backup/snapshots/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Postgres-style consistent backup using volume snapshot
echo "[$(date)] Starting Clickhouse backup..."

# Pause writes for consistency (or use ClickHouse BACKUP TO command)
docker compose exec -T clickhouse \
    clickhouse-client --query "SYSTEM STOP MERGES"

# Volume backup using helper container
docker run --rm \
    -v /mnt/ssd/clickhouse/data:/source:ro \
    -v "$BACKUP_DIR":/backup \
    alpine:3.19 \
    tar czf /backup/clickhouse.tar.gz -C /source .

docker compose exec -T clickhouse \
    clickhouse-client --query "SYSTEM START MERGES"

echo "[$(date)] Uploading to S3..."
aws s3 cp "$BACKUP_DIR" s3://analytics-backups/$(basename "$BACKUP_DIR")/ \
    --recursive --storage-class GLACIER

echo "[$(date)] Cleaning local snapshot..."
find /mnt/backup/snapshots -mtime +7 -type d -exec rm -rf {} +

echo "[$(date)] Backup complete: $BACKUP_DIR"
```

#### Diagram

```mermaid
graph TB
    Internet((Internet)) --> Envoy

    subgraph "public network"
        Envoy
    end

    subgraph "api-tier network"
        IngestAPI[ingest-api x4]
        QueryAPI[query-api x2]
    end

    subgraph "data-tier network"
        Kafka1[kafka-1]
        Kafka2[kafka-2]
        Kafka3[kafka-3]
        CH[clickhouse]
        Redis[redis-cache]
        Backup[backup-runner]
    end

    Envoy --> IngestAPI
    Envoy --> QueryAPI
    IngestAPI --> Kafka1
    IngestAPI --> Kafka2
    IngestAPI --> Kafka3
    QueryAPI --> CH
    QueryAPI --> Redis

    CH -.bind mount.-> SSD[(/mnt/ssd/clickhouse<br/>SSD)]
    CH -.bind mount.-> HDD[(/mnt/hdd/clickhouse-logs<br/>HDD)]
    Kafka1 -.named vol.-> K1V[(/mnt/ssd/kafka/1)]
    Kafka2 -.named vol.-> K2V[(/mnt/ssd/kafka/2)]
    Kafka3 -.named vol.-> K3V[(/mnt/ssd/kafka/3)]
    IngestAPI -.tmpfs.-> Mem[(memory:<br/>500MB buffer)]

    Backup -.read.-> SSD
    Backup -->|S3 upload| S3((AWS S3<br/>Glacier))

    style SSD fill:#ffcc99
    style HDD fill:#cccccc
    style Mem fill:#ffcccc
    style S3 fill:#99ccff
```

Diagram me clearly visible — different storage tiers (SSD for hot data, HDD for logs, tmpfs for buffers, S3 for backups), aur three-tier network segmentation.

#### Interview Q&A

**Q1: Named volumes vs bind mounts ka tradeoff kab kya use karna chahiye?**

**Named volumes** Docker daemon manage karta hai. Storage location `/var/lib/docker/volumes/<name>/_data` me hota hai by default, but driver opts se override kar sakte ho. Advantages — portable (Dockerfile/Compose me name reference karte ho, host path nahi), backup-restore tooling exists, permission management Docker handle karta hai (ownership issues kam), volume drivers extensible hain (NFS, EBS, GCS plugins available). Use cases — databases, persistent caches, uploaded files in production.

**Bind mounts** specific host path container me mount karte hain. Tum exact location specify karte ho — `/mnt/ssd/data:/var/lib/postgres`. Advantages — full control over storage location (specific disk, specific path), easy host-side access (logs ko host se directly tail kar sakte ho, files ko external tools se manipulate kar sakte ho), dev environments me code hot-reload (host code container me mount). Disadvantages — host-specific (containers move karo to different machine, path adjust karna padta hai), permission issues common (host user UID vs container user UID mismatch), security risk (container host filesystem access kar sakta hai).

Production guidelines — stateful services (DBs, queues) ke liye named volumes preferred unless tumhe specific storage tier control chahiye (SSD vs HDD). Configuration files (read-only) ke liye bind mounts perfect hain — host pe edit karo, container me reflect ho jaye on restart. Logs ke liye both work — bind mount agar host pe log aggregator already configured hai (Filebeat reading from `/var/log`). Dev environments me bind mounts source code ke liye essential hain for hot reload.

**Q2: Default bridge network aur custom bridge network me kya difference hai?**

Default bridge network (`docker0`) Docker installation pe automatically banta hai. Containers `docker run` me bina `--network` flag ke is se attach hote hain. Limitation — **DNS-based service discovery nahi hai** default bridge me. Containers ek doosre ko sirf IP se reach kar sakte hain, hostname se nahi. IP daemon assign karta hai aur container restart pe change ho sakti hai — bilkul brittle setup. Plus default bridge me containers ke beech traffic by default flow karta hai (no isolation), aur publishing port ke alawa external access ka mechanism limited hai.

Custom bridge networks (`docker network create -d bridge mynet`) production me always use karne chahiye. **Embedded DNS server** automatically containers ke service names ko resolve karta hai us network me — `redis`, `postgres`, etc. directly hostnames jaise use hote hain. Multiple custom networks ke beech isolation hai by default — container-A network-1 me hai aur container-B network-2 me, woh ek doosre ko reach nahi kar sakte unless explicitly both networks me attach ho. Custom networks me network aliases bhi configure kar sakte ho — load balancing patterns ke liye useful.

Compose by default custom bridge network create karta hai project ke liye — yahi reason hai Compose me service discovery seamlessly chalti hai. Manual `docker run` me custom network use karna habit banao. Aur har project/stack ke liye apna network — cross-stack pollution prevent karne ke liye.

**Q3: Host network mode kab use karein? Trade-offs kya hain?**

Host network mode (`--network host`) container ko host ki networking namespace directly use karne deta hai — koi isolation nahi, koi NAT nahi, koi virtual ethernet pair nahi. Container ke andar `eth0` host ka actual interface hota hai. Container ports directly host ports hote hain — no `-p` flag needed (and ignored anyway).

Use cases — **performance-critical workloads** jahan NAT overhead matter karta hai. High-throughput proxies, real-time streaming, network monitoring tools (Prometheus node-exporter), packet processing apps. Bridge mode me hr packet iptables NAT rules se guzarta hai — tiny but non-zero overhead, aur high pps me significant ho jaata hai. Host mode me native speed.

Tradeoffs critical hain — **port conflicts** bilkul possible hain. Container apna port choose kar sakta hai but host pe woh free hona chahiye. 80 port pe nginx host me already chal raha ho aur container bhi 80 chahta ho — conflict, container start hi nahi hoga. **Multi-instance impossible** — same image se 2 container same host pe nahi chala sakte (port collision). **Security weaker** — container host ki networking dekh sakta hai, all interfaces, all ports open to it. Network namespace isolation gone.

Mostly avoid host mode. Modern Docker me bridge mode performance enough hai 99% workloads ke liye. Sirf jab profiling se prove ho jaye ki NAT bottleneck hai — tab consider karo. Linux pe host mode kaam karta hai, but Docker Desktop (Mac/Windows) pe limitations hain because there is a VM in between. Production me agar host mode use kar rahe ho, dedicated VM/host hi rakho us container ke liye — multi-tenancy se bachao.

**Q4: Overlay networks kab zaroorat padti hai? Multi-host networking ka actual mechanism kya hai?**

Overlay networks multi-host scenarios me chahiye — Docker Swarm, ya older Kubernetes setups jahan CNI plugin Docker overlay use karta hai. Single-host me sirf bridge enough hai. Overlay ka key feature — containers different physical/virtual hosts pe chal rahe hain but ek logical network me appear hote hain. Service-A host-1 pe hai, service-B host-2 pe, par dono `mynet` overlay me hain — service-A sirf `service-b:8080` likhe aur reach ho jaaye.

Mechanism VXLAN encapsulation hai. Container A host-1 par container B (host-2 pe) ko packet bhejna chahta hai. Container A overlay network ke virtual interface se packet bhejta hai. Host-1 ka Docker daemon packet ko VXLAN frame me wrap karta hai (UDP encapsulation, default port 4789), real network pe host-2 ke physical IP pe bhejta hai. Host-2 receive karke decapsulate karta hai aur container B ko deliver karta hai. Containers ke liye ye transparent hai — woh sochte hain ek hi LAN me hain.

Overlay use karne ke liye **distributed key-value store** chahiye host coordination ke liye. Swarm me built-in raft-based store hota hai, K8s me etcd. Networks aur service discovery state yahan store hote hain. Hosts ke beech control plane traffic bhi hota hai (Swarm me port 7946 TCP/UDP). Production me overlay network setup karte time firewall rules properly khol-ne padte hain — VXLAN port (4789), control plane (7946), Swarm management (2377).

Performance overhead hai — VXLAN encapsulation har packet me ~50 bytes add karta hai, aur UDP wrapping CPU cycles consume karta hai. High-bandwidth scenarios me concern ho sakta hai. Modern Linux kernels me VXLAN offload supported hai (network cards ke through), so overhead kam hai. K8s me ab Cilium (eBPF-based) jaise modern CNI plugins overlay overhead bypass karte hain — direct routing use karte hain. Lekin pure Docker (Swarm) workloads ke liye overlay still standard mechanism hai.

---

## Resources & further reading

**Official Docs**
- Docker Engine: https://docs.docker.com/engine/
- Dockerfile reference: https://docs.docker.com/engine/reference/builder/
- Compose file reference: https://docs.docker.com/compose/compose-file/
- BuildKit advanced: https://docs.docker.com/build/buildkit/

**Books**
- "Docker Deep Dive" by Nigel Poulton — fundamentals + internals
- "Docker in Practice" by Ian Miell, Aidan Hobson Sayers — patterns & recipes
- "Docker: Up & Running" by Sean Kane, Karl Matthias — production focus

**Important Tools**
- `dive` (https://github.com/wagoodman/dive) — interactive layer explorer
- `docker-slim` — minify images automatically
- `trivy` — vulnerability scanner for images
- `hadolint` — Dockerfile linter
- `lazydocker` — TUI for Docker management

**Production Reading**
- Google's distroless images: https://github.com/GoogleContainerTools/distroless
- Best practices for writing Dockerfiles (Docker official): https://docs.docker.com/develop/dev-best-practices/
- OWASP Docker Security Cheat Sheet
- "Container Security" by Liz Rice — runtime security deep dive

**Adjacent Topics (next-level after Docker)**
- Container Runtime Interface (CRI), containerd, runc internals
- Kubernetes (orchestration at scale)
- Service mesh (Istio, Linkerd)
- eBPF-based networking (Cilium, Calico)
- Image signing & supply chain security (Cosign, Sigstore, SLSA)

**Hands-on Labs**
- Play with Docker: https://labs.play-with-docker.com/
- KillerCoda Docker scenarios
- Docker challenges on HackerRank/Coderbyte

Tu ab tayyaar hai Docker pe deep technical conversation karne ke liye. Interview me jab pooche jaaye "kaise kaam karta hai", layers + namespaces + cgroups se start karna. "How would you optimize" pe multi-stage + .dockerignore + cache-from. "Production setup kaise karoge" pe Compose + named volumes + network segmentation + healthchecks. Theory clear hai, practice karke confidence build kar.
