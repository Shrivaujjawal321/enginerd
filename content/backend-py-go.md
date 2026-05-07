# Backend Engineering — Python (FastAPI/Django) + Go (gin/fiber/chi)

Bhai, MERN tujhe ek dukan kholne ka hunar de chuka hai (`nodejs-backend` padh liya hoga umeed hai), Java/Spring tu ek dussra option samajh chuka (`spring-boot-basics` se). Lekin Bharat ke real product co stacks pe agar ek **honest census** lein — Razorpay ka payments-core almost-fully **Go**, Swiggy ka delivery ETA + ML pipelines **Python** (FastAPI + Django), Atlan ka metadata service Go + Python hybrid, CRED ka risk-engine pure Python, Zerodha Kite ka core matching Go-flavoured — to tu ek third pillar miss kar raha hai. Yeh subject wahi gap close karta hai.

Goal saaf hai: **Python (FastAPI primary, Django when CRUD-heavy) + Go (gin/fiber/chi)** — dono ko production-depth pe le ja. End mein tu interview mein "Why Go vs Python vs Node?" trade-off bina ratta maare bol paaye, aur ek FastAPI service + ek gin service dono local pe boot kar paaye. Code samples runnable hain — copy-paste, save, run.

Voice Hinglish, code English, framework names original. Cross-link cadence wahi rahega jo `nodejs-backend.md` aur `dbms-complete.md` mein hai — domain bhi wahi Swiggy-lite Orders + Razorpay-lite Payments rakhenge taki tu compound learning kar sake.

> **Why this depth?** Razorpay ke senior backend interview mein literal sawaal aata hai — "Goroutine leak kaise detect karoge?" Aur Swiggy ka system design round — "FastAPI mein 50k RPS handle karne ke liye gunicorn workers kitne rakhoge, aur kyu?" Surface-level tutorials yahaan kaam nahi karenge.

Chai-pani saath rakh, ye lamba safar hai (~1000 lines) lekin har section ek interview question solve karne layak hai.

---

## 1. Why Python AND Go for backend?

### 1.1 The "two-stack" philosophy

Pehle ye dimaag mein bitha le — Python aur Go alag-alag problems solve karte hain. Tu ek hi codebase mein dono use kar sakta hai (and most large Indian product cos do). Yeh "Python *vs* Go" debate beginner ka hai; senior engineer "Python *and* Go, depending on the workload" sochta hai.

| Workload | Better fit | Reason |
|----------|-----------|--------|
| ML inference / data pipelines / ETL | **Python** | NumPy, pandas, sklearn, transformers — entire scientific Python ecosystem |
| Internal CRUD admin panel | **Python (Django)** | Django admin = free, ORM mature, server-rendered |
| External API for ML feature | **Python (FastAPI)** | Async-native, OpenAPI auto, Pydantic validation, low overhead |
| Scripting / cron / glue | **Python** | Fast to write, pip install anything |
| High-throughput payment gateway | **Go** | Compiled binary, ~10× faster than Python on CPU, low GC pressure |
| Low-latency proxy / API gateway | **Go** | Goroutines + epoll integration native, stdlib `net/http` is production-grade |
| K8s operator / CLI tool | **Go** | Single static binary, K8s itself written in Go, ecosystem fit |
| WebSocket fan-out (10k+ conns) | **Go** | Goroutines cheaper than Python threads/asyncio at very high concurrency |

### 1.2 When Python wins

- **Ecosystem leverage** — agar tera service ML model serve kar raha hai, ya pandas DataFrame transform kar raha hai, Python pe likhna no-brainer hai. Go mein numpy ka equivalent nahi hai (gonum exists but ecosystem 1/100th).
- **Developer velocity** — FastAPI mein 50 lines mein production-grade API ban jaata hai. Django mein admin + auth + ORM free milta hai. Fresher tezi se ship kar sakta hai.
- **Type-driven docs** — Pydantic + FastAPI = OpenAPI spec free + interactive Swagger UI free. Frontend team ko separate doc nahi maintain karna padta.
- **Glue / scripting** — `boto3`, `requests`, `psycopg2` — Python kuch bhi automate kar sakta hai 20 lines mein.

### 1.3 When Go wins

- **Latency floor** — Go ka P99 typically 5-10× better than Python for I/O-heavy JSON APIs at high concurrency. Garbage collector pause < 1ms, no GIL, goroutines are M:N scheduled.
- **Single static binary** — `go build` deta hai ek `~12MB` binary, no runtime, no `pip install`, no virtualenv. Deploy = `scp`. Docker image FROM scratch banti hai.
- **Concurrency primitives** — goroutines + channels native, no async/await ceremony. 100k goroutines on a 4GB box trivial.
- **K8s + cloud native** — Kubernetes, Docker, Terraform, etcd, Prometheus — sab Go mein likhe hain. Tu cloud infra likh raha hai → Go default choice.
- **Compile-time safety** — strong static types, struct contracts, no `AttributeError` at runtime.

### 1.4 Indian product-co reality

Real-talk yeh hai (mix of public engineering blogs + private informants):

- **Razorpay** — Payments-core (capture, settle, refund) almost-fully **Go** for hot path. Risk + ML services **Python (FastAPI + scikit-learn + xgboost)**. Internal tools mix of Python + Node. Dropwizard Java still in some legacy capture flows.
- **Swiggy** — ETA prediction, dispatch optimisation, ML pipelines **Python**. Order ingestion + delivery state machine **Go** (some Node legacy). Customer-facing BFF Node + TS.
- **Atlan** — Metadata service core **Go**. Crawlers, integrations **Python**. Some services Node + TS for edge.
- **CRED** — Risk-engine + member-segmentation **Python**. Core banking Kotlin + Spring. BFF Node.
- **Zerodha** — Kite matching core hand-rolled in C/Go-flavoured, Streak (algo trading) Python-heavy.
- **Meesho** — Catalog Node, search **Go + Java**, ML serving **Python (FastAPI + Triton)**.
- **PhonePe** — Java-dominant for payments, Go for newer microservices, Python for fraud-detection ML.

Pattern saaf hai — **Go for hot path + infra, Python for ML + CRUD + scripting**, Java legacy for core fintech ledger, Node for edge/BFF. Tu agar dono Python aur Go internalize kar leta hai, tu **non-edge** hiring pool ke 70% ke liye eligible ho jaata hai.

### 1.5 Salary delta — honest numbers

2024-25 fresher / SDE-1 base in tier-1 product cos (₹ LPA, base only, India location):

| Stack | Median fresher base | Median SDE-2 (3 yr) base |
|-------|---------------------|--------------------------|
| Frontend (React only) | 12-18 | 22-30 |
| Node + TS backend | 16-22 | 28-40 |
| Java + Spring | 18-25 | 32-45 |
| Python (Django/FastAPI) | 16-24 | 28-42 |
| **Go backend** | **20-28** | **35-55** |
| Go + ML / fintech mix | 24-32 | 45-65+ |

Go ~10-15% premium at fresher level, kyunki supply genuinely thin hai — engineering colleges Go nahi padhate, log self-taught hote hain. Agar tu Go + system-design + Python ML basics combo le aaya, tu Razorpay/Stripe-India ke "infra/payments" track mein top decile pe baith jaata hai.

> Cross-link: deployment economics + cloud cost modelling ke liye `cloud-fundamentals` aur `cloud-platforms` padh.

---

## 2. Python — FastAPI deep dive

FastAPI 2018 mein release hua, 2020 tak Python community ka default choice ban gaya for new APIs. Iska superpower **Pydantic + Starlette + async + auto OpenAPI** ka combo hai.

### 2.1 Why FastAPI > Flask + Django for new APIs

| Factor | FastAPI | Flask | Django |
|--------|---------|-------|--------|
| Async-native | Yes (ASGI) | No (WSGI; needs Quart fork) | Partial (3.0+) |
| Auto OpenAPI / Swagger | Yes, free | Plugin needed | DRF Spectacular |
| Validation | Pydantic v2 (Rust-backed, fast) | Manual / Marshmallow | DRF serializers |
| Dependency injection | First-class | Manual | Settings/middleware |
| Type hints | Required, drives runtime | Optional | Optional |
| Learning curve | Easy if Python typing known | Easiest | Steeper (full framework) |
| When to choose | New APIs, microservices, ML serving | Legacy / micro-tools | CRUD admin, monolith |

### 2.2 Hello FastAPI — the 10-line minimum

```python
# app/main.py
from fastapi import FastAPI

app = FastAPI(title="Swiggy-lite Orders API", version="0.1.0")

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

Run karne ka tarika:

```bash
pip install "fastapi[standard]"
fastapi dev app/main.py     # auto-reload, hot dev
# OR for prod:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Browser mein `http://localhost:8000/docs` khol — Swagger UI **automatically** generated, har endpoint try-out kar sakta hai. `http://localhost:8000/openapi.json` raw OpenAPI spec deta hai.

### 2.3 Path / query / body / header / cookie params

FastAPI har parameter ka *source* uske type hint se infer karta hai. Yeh Flask se badi shift hai.

```python
from fastapi import FastAPI, Path, Query, Header, Cookie
from pydantic import BaseModel, Field
from typing import Annotated

app = FastAPI()

class OrderCreate(BaseModel):
    restaurant_id: int = Field(..., gt=0, description="Foreign key to restaurants")
    items: list[int] = Field(..., min_length=1, max_length=20)
    delivery_address: str = Field(..., min_length=10, max_length=500)

class OrderResponse(BaseModel):
    order_id: int
    status: str
    eta_minutes: int

@app.get("/orders/{order_id}")
async def get_order(
    order_id: Annotated[int, Path(ge=1)],                      # path param
    include_items: Annotated[bool, Query()] = False,           # query param
    x_request_id: Annotated[str | None, Header()] = None,      # header
    session_token: Annotated[str | None, Cookie()] = None,     # cookie
) -> OrderResponse:
    return OrderResponse(order_id=order_id, status="placed", eta_minutes=32)

@app.post("/orders", status_code=201)
async def create_order(payload: OrderCreate) -> OrderResponse:
    # `payload` is auto-parsed + validated from JSON body
    return OrderResponse(order_id=42, status="placed", eta_minutes=28)
```

Note kar:
- `Annotated[int, Path(ge=1)]` — Pydantic ka constraint syntax. Validation auto.
- Body params for POST = Pydantic model. Path/query/header/cookie scalars by default.
- Return type hint `-> OrderResponse` — FastAPI iska use OpenAPI mein response schema dikhane ke liye karta hai, AUR runtime mein response ko Pydantic se filter karta hai (`response_model_exclude_unset` etc available).

### 2.4 Dependency injection — the killer feature

DI = "common cheez ko declare karo, framework inject kar dega." FastAPI ki DI Spring se simpler, Express middleware se cleaner.

```python
from fastapi import Depends, HTTPException, Header
from typing import Annotated
import jwt

JWT_SECRET = "change-me-in-prod"

class User(BaseModel):
    id: int
    email: str
    role: str

async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    return User(id=payload["sub"], email=payload["email"], role=payload["role"])

def require_role(role: str):
    async def _checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _checker

@app.get("/me")
async def me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user

@app.post("/admin/restaurants")
async def add_restaurant(
    admin: Annotated[User, Depends(require_role("admin"))],
):
    return {"created_by": admin.email}
```

Dependency cache: same `Depends` ek request mein multiple jagah call ho to function once-execute hota hai (default `use_cache=True`). DB session inject karne ka idiomatic pattern:

```python
async def get_db():
    async with async_session() as session:
        yield session

@app.get("/orders")
async def list_orders(db: Annotated[AsyncSession, Depends(get_db)]):
    return (await db.execute(select(Order))).scalars().all()
```

`yield` ke baad cleanup automatic — request khatam hote hi session close. Yeh Express middleware ka `next()` + cleanup pattern, but cleaner.

### 2.5 Background tasks + WebSockets + lifespan

```python
from fastapi import BackgroundTasks
import logging

def send_order_email(email: str, order_id: int):
    # blocking SMTP call — runs after response sent
    logging.info(f"emailing {email} about #{order_id}")

@app.post("/orders/{order_id}/confirm")
async def confirm(order_id: int, bg: BackgroundTasks):
    bg.add_task(send_order_email, "user@example.com", order_id)
    return {"ok": True}
```

Background task **same process** mein chalta hai — production-grade async work ke liye **Celery / RQ / arq** (Redis-based queue) use kar; `BackgroundTasks` only for fire-and-forget like email + audit-log.

WebSocket — chat / live order tracking ka backbone:

```python
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/orders/{order_id}")
async def order_track(ws: WebSocket, order_id: int):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_json({"order_id": order_id, "echo": data})
    except WebSocketDisconnect:
        logging.info(f"client disconnected: order {order_id}")
```

Lifespan = startup/shutdown hooks (DB pool init, Redis connect, model load):

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    app.state.db_pool = await create_db_pool()
    app.state.redis = await aioredis.from_url("redis://localhost")
    yield
    # shutdown
    await app.state.db_pool.close()
    await app.state.redis.close()

app = FastAPI(lifespan=lifespan)
```

### 2.6 Pydantic v2 essentials

Pydantic v2 (2023 release) Rust-backed, ~5-50× faster than v1. Validation rules:

```python
from pydantic import BaseModel, Field, field_validator, EmailStr
from datetime import datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    age: int = Field(..., ge=18, le=120)
    phone: str = Field(..., pattern=r"^\+91[6-9]\d{9}$")
    created_at: datetime | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("password must contain a digit")
        return v
```

Common gotchas:
- `EmailStr` requires `pip install email-validator`
- `model_dump()` (v2) replaces `dict()` (v1)
- `model_config = ConfigDict(from_attributes=True)` enables ORM mode (read from SQLAlchemy objects)

### 2.7 Worked example — 50-line FastAPI service with auth + DB + tests

```python
# app/main.py — Swiggy-lite Orders, single file, runnable
from datetime import datetime, timezone
from typing import Annotated
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import jwt

DATABASE_URL = "sqlite+aiosqlite:///./orders.db"
JWT_SECRET = "dev-secret"
Base = declarative_base()
engine = create_async_engine(DATABASE_URL)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    total_paise = Column(Integer, nullable=False)
    status = Column(String(20), default="placed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class OrderIn(BaseModel):
    total_paise: int = Field(..., gt=0)

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_paise: int
    status: str
    model_config = {"from_attributes": True}

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

async def get_db():
    async with SessionLocal() as s: yield s

async def current_user_id(authorization: Annotated[str | None, "Header()"] = None) -> int:
    if not authorization: raise HTTPException(401, "missing token")
    token = authorization.removeprefix("Bearer ")
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])["sub"]

@app.post("/orders", response_model=OrderOut, status_code=201)
async def create(payload: OrderIn,
                 uid: Annotated[int, Depends(current_user_id)],
                 db: Annotated[AsyncSession, Depends(get_db)]):
    o = Order(user_id=uid, total_paise=payload.total_paise)
    db.add(o); await db.commit(); await db.refresh(o)
    return o
```

Test (pytest + httpx.AsyncClient):

```python
# tests/test_orders.py
import pytest, jwt
from httpx import AsyncClient, ASGITransport
from app.main import app, JWT_SECRET

@pytest.mark.asyncio
async def test_create_order():
    token = jwt.encode({"sub": 1}, JWT_SECRET, algorithm="HS256")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        r = await c.post("/orders",
                         json={"total_paise": 24900},
                         headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
    assert r.json()["status"] == "placed"
```

Yeh ~50 lines mein tujhe DB + auth + validation + tests sab mil gaya. Production mein `pytest-asyncio`, Alembic migrations, structured logging add hoga — but core mental model yahi hai.

---

## 3. Python — Django (when CRUD-heavy)

Django 2005 ka hai, "batteries-included" philosophy. FastAPI fast hai but Django **opinionated** hai — admin, auth, ORM, migrations sab pre-baked. CRUD-heavy admin tool / CMS / internal portal — Django still 2024 ka winning move.

### 3.1 When Django > FastAPI

| Scenario | Use Django when... |
|----------|--------------------|
| Internal admin / dashboard | You need free admin UI in 5 min |
| ORM-heavy domain | Django ORM is more mature than SQLAlchemy for some teams |
| Server-rendered pages | Django templates + HTMX > React for internal tools |
| Multi-tenant SaaS CMS | Django auth + sites framework batteries |
| Don't go Django when... | High-perf JSON API; ML serving; async-heavy |

### 3.2 Models / views / serializers / urls (DRF)

```python
# orders/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Restaurant(models.Model):
    name = models.CharField(max_length=120)
    city = models.CharField(max_length=64)
    is_active = models.BooleanField(default=True)

    def __str__(self): return self.name

class Order(models.Model):
    STATUS = [("placed","placed"),("preparing","preparing"),
              ("dispatched","dispatched"),("delivered","delivered")]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.PROTECT)
    total_paise = models.IntegerField()
    status = models.CharField(max_length=16, choices=STATUS, default="placed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "-created_at"])]
```

```python
# orders/serializers.py
from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "user", "restaurant", "total_paise", "status", "created_at"]
        read_only_fields = ["id", "user", "status", "created_at"]
```

```python
# orders/views.py
from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related("restaurant")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

```python
# orders/urls.py
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
urlpatterns = router.urls
```

Bas. Yeh tujhe `GET /orders`, `POST /orders`, `GET /orders/{id}`, `PUT /orders/{id}`, `DELETE /orders/{id}` — sab free deta hai with auth + filtering.

### 3.3 Django admin — the killer feature

```python
# orders/admin.py
from django.contrib import admin
from .models import Order, Restaurant

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "is_active"]
    list_filter = ["city", "is_active"]
    search_fields = ["name"]

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "restaurant", "total_paise", "status", "created_at"]
    list_filter = ["status", "restaurant__city"]
    raw_id_fields = ["user", "restaurant"]
    date_hierarchy = "created_at"
```

Run `python manage.py runserver`, jaa `http://localhost:8000/admin/` — full CRUD admin UI ready. Razorpay's internal CS tools, Swiggy's restaurant onboarding portal — sab Django admin custom-skinned hai.

### 3.4 Celery for background tasks

```python
# config/celery.py
from celery import Celery
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
app = Celery("swiggy_lite", broker="redis://localhost:6379/0")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# orders/tasks.py
from celery import shared_task
from .models import Order

@shared_task
def send_order_confirmation_sms(order_id: int):
    o = Order.objects.get(id=order_id)
    # call Twilio / Exotel / MSG91
    return f"sent for {o.id}"

# orders/views.py
from .tasks import send_order_confirmation_sms

class OrderViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        send_order_confirmation_sms.delay(order.id)  # enqueue
```

`celery -A config worker -l info` chala — workers SMS background mein send karenge. Cron-style schedule? `celery beat`. Razorpay's payout reconciliation, Swiggy's nightly settlement — yahi pattern.

> Django shines when **admin + ORM + auth + templates** ka combo chahiye. Pure JSON API + perf + async chahiye to FastAPI. Don't pick Django for an ML inference service.

---

## 4. Go — language essentials

Go 2009 mein Google ne release kiya — Rob Pike + Ken Thompson + Robert Griesemer. Design philosophy: **"simplicity is a feature"**. No generics for 13 years (added in 1.18, 2022). No exceptions, no inheritance, no implicit conversions. Result — codebase reads like 1990s C with garbage collection.

### 4.1 The Go mental model in 60 seconds

- Compiled to native binary, no runtime, no JIT.
- Garbage collected (concurrent, low-pause < 1ms target).
- Static types, structural interfaces.
- Concurrency: goroutines (lightweight threads, ~2KB stack each, M:N scheduled by Go runtime onto OS threads) + channels.
- Error handling: explicit `if err != nil` (no exceptions).
- Tooling builtin: `go fmt`, `go test`, `go vet`, `go mod`, `go build`.

### 4.2 Hello Go — runnable

```go
// main.go
package main

import "fmt"

func main() {
    fmt.Println("Namaste, Bharat!")
}
```

```bash
go run main.go
# OR
go build -o swiggy-lite .
./swiggy-lite
```

`go build` deta hai ek static binary. No interpreter needed at runtime. `scp swiggy-lite user@server:/opt/`, run, done.

### 4.3 Goroutines + channels — the concurrency model

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {
        time.Sleep(100 * time.Millisecond) // simulate work
        results <- j * 2
        fmt.Printf("worker %d processed %d\n", id, j)
    }
}

func main() {
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    var wg sync.WaitGroup

    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    go func() { wg.Wait(); close(results) }()

    for r := range results {
        fmt.Println("result:", r)
    }
}
```

Yahaan kya ho raha:
- `go worker(...)` — naya goroutine launch. Cost: ~2KB stack + runtime bookkeeping. 1M goroutines on a 4GB box achievable.
- `chan int` — typed channel. `<-chan int` = receive-only, `chan<- int` = send-only (compile-time safety).
- `sync.WaitGroup` — barrier. `Add` before, `Done` after, `Wait` blocks till count zero.
- `close(jobs)` — sender ka contract. `for range` loop tabhi terminate hoga jab channel close ho.

```mermaid
graph LR
    M[main goroutine] -->|jobs<-1..5| J((jobs chan))
    J --> W1[worker 1]
    J --> W2[worker 2]
    J --> W3[worker 3]
    W1 -->|j*2| R((results chan))
    W2 -->|j*2| R
    W3 -->|j*2| R
    R --> M
    M -. wg.Wait .- W1
    M -. wg.Wait .- W2
    M -. wg.Wait .- W3
```

### 4.4 Interfaces — structural typing

Java mein `class Foo implements Bar` likhna padta hai. Go mein agar tera type required methods rakhta hai, automatically interface satisfy ho jaata hai — *structural*, not nominal.

```go
type PaymentProvider interface {
    Charge(amountPaise int64, customerID string) (txnID string, err error)
}

type Razorpay struct{ apiKey string }
func (r Razorpay) Charge(p int64, c string) (string, error) {
    return "rzp_txn_" + c, nil
}

type Stripe struct{ apiKey string }
func (s Stripe) Charge(p int64, c string) (string, error) {
    return "stripe_txn_" + c, nil
}

func processOrder(provider PaymentProvider, amt int64, cust string) {
    txn, err := provider.Charge(amt, cust)
    if err != nil { return }
    fmt.Println("charged via", txn)
}

// Both Razorpay{} and Stripe{} satisfy PaymentProvider — no `implements` keyword needed.
```

The empty interface `interface{}` (or `any` since Go 1.18) holds any value — Go's `Object`. Type-assert with `v.(string)` to extract.

### 4.5 Error handling — the `if err != nil` reality

Go has no exceptions. Every fallible function returns `(result, error)`. You check it. **Always.**

```go
func readConfig(path string) (Config, error) {
    f, err := os.Open(path)
    if err != nil {
        return Config{}, fmt.Errorf("open %s: %w", path, err)
    }
    defer f.Close()

    var cfg Config
    if err := json.NewDecoder(f).Decode(&cfg); err != nil {
        return Config{}, fmt.Errorf("decode config: %w", err)
    }
    return cfg, nil
}
```

`%w` verb wraps the error — caller can `errors.Is(err, os.ErrNotExist)` or `errors.As(err, &myErr)` to unwrap. This is Go 1.13+ idiom.

Sentinel errors:

```go
var ErrInsufficientBalance = errors.New("insufficient balance")

func debit(acc *Account, paise int64) error {
    if acc.Balance < paise {
        return ErrInsufficientBalance
    }
    acc.Balance -= paise
    return nil
}

if err := debit(&a, 5000); errors.Is(err, ErrInsufficientBalance) {
    // handle specifically
}
```

Looks verbose, but **explicit > implicit**. After 6 months of Go you stop noticing it; the upside is no surprise control-flow jumps.

### 4.6 Slices, maps, structs

```go
// slice — view into backing array, dynamic length
nums := []int{1, 2, 3}
nums = append(nums, 4) // may or may not allocate new array

// pre-allocate when size known — perf win
buf := make([]byte, 0, 1024) // len 0, cap 1024

// map — hash table, NOT thread-safe
m := map[string]int{"orders": 0}
m["orders"]++
delete(m, "orders")
v, ok := m["missing"] // ok=false if absent

// struct — value type by default
type Order struct {
    ID         int64     `json:"id"`
    UserID     int64     `json:"user_id"`
    TotalPaise int64     `json:"total_paise"`
    CreatedAt  time.Time `json:"created_at"`
}

o := Order{ID: 1, TotalPaise: 24900}
op := &o // pointer, share & mutate
```

Maps not safe for concurrent write — use `sync.Map` or guard with `sync.RWMutex`. Slice growth doubles capacity until 1024, then 25% increments.

### 4.7 Context propagation — the most-asked Go interview pattern

`context.Context` cancellation + deadline + request-scoped values carry karta hai. Every blocking operation (DB query, HTTP call) usse first param ke roop mein leta hai.

```go
import (
    "context"
    "net/http"
    "time"
    "database/sql"
)

func handler(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()

    rows, err := db.QueryContext(ctx, "SELECT id FROM orders WHERE user_id=$1", 1)
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }
    defer rows.Close()
    // ...
}
```

Agar 2s mein query nahi aayi, `ctx.Done()` channel close ho jaayega, DB driver query cancel kar dega. **Yeh Go ka killer pattern hai** — Java/Python mein equivalent nahi hai itna clean.

> Interview tip: jab koi puchhe "How do you cancel a long-running operation in Go?" — answer is `context.WithCancel` / `context.WithTimeout` + propagate ctx down the call chain.

### 4.8 Worked example — 60-line HTTP server with graceful shutdown

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

type Order struct {
    ID         int64 `json:"id"`
    TotalPaise int64 `json:"total_paise"`
}

var orders = []Order{{ID: 1, TotalPaise: 24900}}

func listOrders(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(orders)
}

func health(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("ok"))
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", health)
    mux.HandleFunc("/orders", listOrders)

    srv := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    go func() {
        log.Println("listening on :8080")
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("server: %v", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    log.Println("shutting down...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("forced shutdown: %v", err)
    }
    log.Println("bye")
}
```

`go run main.go` — server up. `Ctrl+C` → in-flight requests complete, then process exits. Yeh **K8s rolling update** ka basis hai — pod ko SIGTERM milta hai, 30s grace period mein in-flight requests drain hote hain, fir kill.

---

## 5. Go — gin / fiber / chi

Stdlib `net/http` great hai but routing + middleware + binding pe boilerplate hai. Tabhi web frameworks use karte hain.

### 5.1 The three contenders

| Framework | Vibe | Speed | When to pick |
|-----------|------|-------|--------------|
| **gin** | Express-like, popular | Fast | Default for most teams; biggest ecosystem |
| **fiber** | Express-clone on Fasthttp | Fastest | Ultra-low latency; willing to give up `net/http` ecosystem |
| **chi** | stdlib-friendly, idiomatic | Fast | New projects favouring stdlib compatibility |
| stdlib (1.22+ enhanced ServeMux) | Pure stdlib | Fast | Tiny services, maximum stability |

`net/http` since Go 1.22 supports method-based routes (`mux.HandleFunc("GET /orders", h)`) — for very simple services tu framework hi skip kar sakta hai.

### 5.2 gin — the Express-like champion

```go
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type CreateOrder struct {
    RestaurantID int64 `json:"restaurant_id" binding:"required,gt=0"`
    TotalPaise   int64 `json:"total_paise"   binding:"required,gt=0"`
}

func main() {
    r := gin.Default() // includes Logger + Recovery middleware

    api := r.Group("/api/v1")
    api.Use(authMiddleware())
    {
        api.GET("/orders/:id", getOrder)
        api.POST("/orders", createOrder)
    }

    r.Run(":8080")
}

func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
            return
        }
        // verify JWT here, set userID in context
        c.Set("userID", int64(42))
        c.Next()
    }
}

func getOrder(c *gin.Context) {
    id := c.Param("id")
    c.JSON(http.StatusOK, gin.H{"id": id, "status": "placed"})
}

func createOrder(c *gin.Context) {
    var body CreateOrder
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    uid := c.GetInt64("userID")
    c.JSON(http.StatusCreated, gin.H{"id": 1, "user_id": uid, "total_paise": body.TotalPaise})
}
```

`binding:"required,gt=0"` tags = validation rules (`go-playground/validator`). Same idiom as Laravel/express-validator, but compile-time wired.

### 5.3 fiber — Fasthttp speed

```go
package main

import "github.com/gofiber/fiber/v2"

func main() {
    app := fiber.New()
    app.Get("/orders/:id", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"id": c.Params("id")})
    })
    app.Listen(":8080")
}
```

Caveat — fiber `valyala/fasthttp` use karta hai, **not** stdlib `net/http`. Saari `net/http` middleware libraries (e.g., `oauth2`, opentelemetry HTTP middleware) directly compatible nahi. Razorpay-scale teams gin/chi prefer karte hain isi reason se.

### 5.4 chi — stdlib-friendly, modern recommendation

```go
package main

import (
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(60 * time.Second))

    r.Route("/api/v1", func(r chi.Router) {
        r.Use(authMW)
        r.Get("/orders/{id}", func(w http.ResponseWriter, r *http.Request) {
            id := chi.URLParam(r, "id")
            w.Write([]byte("order " + id))
        })
        r.Post("/orders", createOrderHandler)
    })

    http.ListenAndServe(":8080", r)
}
```

chi handlers use plain `func(w http.ResponseWriter, r *http.Request)` — same as stdlib. Benefit: koi bhi `net/http` middleware drop-in works. Atlan, Cloudflare-India type teams chi prefer karte hain.

### 5.5 Middleware mental model

Middleware = function that wraps handler. Express-like chain:

```go
func loggingMW(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

gin uses `c.Next()` (Express style), chi uses `next.ServeHTTP` wrapper (stdlib style). Pick based on team preference; gin's bigger community wins by default for most.

> **Personal recommendation for 2024+ greenfield**: chi for stdlib-friendliness, gin if you want the most StackOverflow answers. Avoid fiber unless latency is the literal #1 SLA.

---

## 6. REST + gRPC across both languages

### 6.1 REST design — carry-over from `nodejs-backend`

REST conventions language-agnostic hain — wahi rules jo `nodejs-backend.md` section 4 mein padhe (resource-oriented URLs, HTTP verbs, status codes, idempotency keys, pagination cursors). Implementation Python/Go mein bas syntax change hai.

| Pattern | Python (FastAPI) | Go (gin) |
|---------|------------------|----------|
| Path param | `Path()` | `c.Param("id")` |
| Query param | `Query()` | `c.Query("page")` |
| JSON body bind | Pydantic model | `c.ShouldBindJSON(&body)` |
| Status code | `status_code=201` decorator | `c.JSON(201, ...)` |
| Validation error | 422 auto from Pydantic | `binding:"..."` tags + 400 |

### 6.2 gRPC — when REST runs out of steam

gRPC = Google ka RPC framework over HTTP/2 + Protocol Buffers. Use it when:
- Service-to-service internal calls (low latency, schema enforcement)
- Polyglot fleet (Go ↔ Python ↔ Java)
- Streaming (server-stream, client-stream, bidi)
- Generated client SDKs across languages save manual work

REST jab nahi: public APIs (browsers can't natively gRPC; need gRPC-Web/Connect), human-debuggable APIs (curl-friendly).

### 6.3 .proto — the contract

```proto
// orders.proto
syntax = "proto3";

package orders.v1;

option go_package = "github.com/swiggy-lite/api/orders/v1;ordersv1";

service OrderService {
  rpc CreateOrder (CreateOrderRequest) returns (Order);
  rpc GetOrder (GetOrderRequest) returns (Order);
  rpc StreamOrderUpdates (GetOrderRequest) returns (stream OrderEvent);
}

message Order {
  int64 id = 1;
  int64 user_id = 2;
  int64 restaurant_id = 3;
  int64 total_paise = 4;
  string status = 5;
}

message CreateOrderRequest {
  int64 user_id = 1;
  int64 restaurant_id = 2;
  int64 total_paise = 3;
}

message GetOrderRequest {
  int64 id = 1;
}

message OrderEvent {
  int64 order_id = 1;
  string new_status = 2;
  int64 ts_unix_ms = 3;
}
```

```mermaid
graph TD
    P[orders.proto<br/>single source of truth] -->|protoc + plugins| G[Go stubs<br/>orders.pb.go<br/>orders_grpc.pb.go]
    P -->|protoc + plugins| Py[Python stubs<br/>orders_pb2.py<br/>orders_pb2_grpc.py]
    P -->|protoc + plugins| TS[TS stubs<br/>orders_pb.ts]
    G --> GS[Go server impl]
    G --> GC[Go client]
    Py --> PS[Python server impl]
    Py --> PC[Python client]
    GS -.HTTP/2 + binary protobuf.- PC
    PS -.HTTP/2 + binary protobuf.- GC
```

### 6.4 Server in Go

```go
import (
    "context"
    "google.golang.org/grpc"
    pb "github.com/swiggy-lite/api/orders/v1"
)

type orderServer struct {
    pb.UnimplementedOrderServiceServer
}

func (s *orderServer) CreateOrder(ctx context.Context, req *pb.CreateOrderRequest) (*pb.Order, error) {
    return &pb.Order{
        Id: 42, UserId: req.UserId, RestaurantId: req.RestaurantId,
        TotalPaise: req.TotalPaise, Status: "placed",
    }, nil
}

func main() {
    lis, _ := net.Listen("tcp", ":50051")
    s := grpc.NewServer()
    pb.RegisterOrderServiceServer(s, &orderServer{})
    s.Serve(lis)
}
```

### 6.5 Client in Python

```python
import grpc
from orders.v1 import orders_pb2, orders_pb2_grpc

channel = grpc.insecure_channel("localhost:50051")
stub = orders_pb2_grpc.OrderServiceStub(channel)
order = stub.CreateOrder(orders_pb2.CreateOrderRequest(
    user_id=1, restaurant_id=2, total_paise=24900
))
print(order.id, order.status)
```

Cross-language wire compatibility: same `.proto` → both sides agree on field numbers + types. Razorpay's intra-cluster service mesh, Atlan's metadata fabric — gRPC + protobuf based.

> Cross-link: gRPC trade-offs vs REST vs message queues — see `messaging-systems` for queue-based async patterns, `microservices` for service-mesh deployment.

---

## 7. Auth patterns

### 7.1 JWT + refresh tokens in FastAPI

```python
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

SECRET = "rotate-me-via-vault"
ALGO = "HS256"
ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=30)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def hash_pw(p: str) -> str: return pwd_ctx.hash(p)
def verify_pw(p: str, h: str) -> bool: return pwd_ctx.verify(p, h)

def make_token(sub: str, ttl: timedelta, kind: str) -> str:
    payload = {"sub": sub, "exp": datetime.now(timezone.utc) + ttl, "kind": kind}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

@app.post("/auth/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = db_get_user(form.username)
    if not user or not verify_pw(form.password, user.pw_hash):
        raise HTTPException(401, "bad creds")
    return {
        "access_token":  make_token(user.id, ACCESS_TTL, "access"),
        "refresh_token": make_token(user.id, REFRESH_TTL, "refresh"),
        "token_type": "bearer",
    }

@app.post("/auth/refresh")
async def refresh(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET, algorithms=[ALGO])
    except JWTError:
        raise HTTPException(401, "invalid refresh")
    if payload["kind"] != "refresh":
        raise HTTPException(401, "wrong kind")
    return {"access_token": make_token(payload["sub"], ACCESS_TTL, "access")}

async def current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        if payload["kind"] != "access":
            raise HTTPException(401, "wrong kind")
    except JWTError:
        raise HTTPException(401, "invalid token")
    return db_get_user_by_id(payload["sub"])
```

Production: refresh tokens DB mein store kar (or Redis with TTL), rotation pe revoke; access tokens stateless JWTs short-lived; signature secret rotate quarterly.

### 7.2 JWT in Go (golang-jwt/jwt v5)

```go
import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("rotate-me-via-vault")

type Claims struct {
    UserID int64  `json:"sub"`
    Kind   string `json:"kind"`
    jwt.RegisteredClaims
}

func makeToken(uid int64, kind string, ttl time.Duration) (string, error) {
    c := Claims{
        UserID: uid, Kind: kind,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    return jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(jwtSecret)
}

func parseToken(tok string) (*Claims, error) {
    parsed, err := jwt.ParseWithClaims(tok, &Claims{}, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected algo: %v", t.Header["alg"])
        }
        return jwtSecret, nil
    })
    if err != nil { return nil, err }
    if c, ok := parsed.Claims.(*Claims); ok && parsed.Valid {
        return c, nil
    }
    return nil, fmt.Errorf("invalid claims")
}

// gin middleware
func authMW() gin.HandlerFunc {
    return func(c *gin.Context) {
        h := c.GetHeader("Authorization")
        if !strings.HasPrefix(h, "Bearer ") {
            c.AbortWithStatusJSON(401, gin.H{"error": "missing bearer"})
            return
        }
        claims, err := parseToken(strings.TrimPrefix(h, "Bearer "))
        if err != nil || claims.Kind != "access" {
            c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
            return
        }
        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

### 7.3 OAuth2 password flow for first-party clients

Password flow = "username + password trade for token". OAuth2 spec mein de-emphasized (RFC 8252 says "use authorization code + PKCE for native apps") **but** for first-party trusted clients (your own mobile app to your own backend) acceptable. FastAPI ka `OAuth2PasswordRequestForm` directly section 7.1 mein use kiya.

For third-party / SSO: authorization code + PKCE flow. `Authlib` (Python) or `golang.org/x/oauth2` handle the dance.

### 7.4 Session-based auth for SSR Django

Django default session middleware = signed cookie + DB-backed session. Don't fight it for server-rendered apps:

```python
# settings.py
INSTALLED_APPS = [..., "django.contrib.sessions", "django.contrib.auth"]
MIDDLEWARE = [..., "django.contrib.sessions.middleware.SessionMiddleware",
              "django.contrib.auth.middleware.AuthenticationMiddleware"]
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
```

Login view:

```python
from django.contrib.auth import authenticate, login
def login_view(request):
    user = authenticate(request, username=request.POST["u"], password=request.POST["p"])
    if user: login(request, user)
    return redirect("/dashboard")
```

> Cross-link: full auth threat model + OWASP Top 10 → `frontend-security` (XSS/CSRF) and `nodejs-backend` section 7. Auth is a deep topic — cookie attributes, CSRF tokens, token rotation, leaked-token revocation all matter.

---

## 8. Database integration

### 8.1 Python — SQLAlchemy 2.0 (async), Tortoise ORM, asyncpg raw

**SQLAlchemy 2.0** is the industry default. Async-native since 2.0 (2023). Two flavors:
- ORM (declarative, models)
- Core (SQL expression language)

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy import select

class Base(DeclarativeBase): pass

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int]
    total_paise: Mapped[int]

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db",
                             pool_size=20, max_overflow=10, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_orders_for_user(uid: int) -> list[Order]:
    async with SessionLocal() as s:
        result = await s.execute(select(Order).where(Order.user_id == uid))
        return list(result.scalars())
```

**Raw asyncpg** for hot paths where ORM overhead unacceptable (~3× faster than SQLAlchemy for simple queries):

```python
import asyncpg

pool = await asyncpg.create_pool("postgresql://user:pass@localhost/db", min_size=5, max_size=20)

async with pool.acquire() as conn:
    rows = await conn.fetch("SELECT id, total_paise FROM orders WHERE user_id = $1", uid)
```

**Tortoise ORM** — Django-ORM-like API, async-native; good for FastAPI + Pydantic-friendly. Smaller community than SQLAlchemy; pick only if SQLAlchemy feels too heavy.

### 8.2 Go — GORM, sqlx, pgx (the modern winner)

| Library | Style | Pick when |
|---------|-------|-----------|
| **pgx** | Postgres-specific driver, low-level | Production: best perf, full Postgres feature support |
| **sqlx** | stdlib `database/sql` + struct scan | Multi-DB; lightweight; team prefers raw SQL |
| **GORM** | Full ORM, ActiveRecord-like | CRUD-heavy domain; willing to pay perf cost |
| **sqlc** | Code-gen from SQL → typesafe Go | Strict schema; love SQL; want compile-time safety |

```go
// pgx (recommended)
import (
    "github.com/jackc/pgx/v5/pgxpool"
)

pool, err := pgxpool.New(ctx, "postgres://user:pass@localhost/db?pool_max_conns=20")
defer pool.Close()

rows, err := pool.Query(ctx, "SELECT id, total_paise FROM orders WHERE user_id=$1", uid)
defer rows.Close()
for rows.Next() {
    var id, total int64
    if err := rows.Scan(&id, &total); err != nil { return err }
    // ...
}
```

```go
// sqlc — write SQL, generate Go
// query.sql:
//   -- name: GetOrdersByUser :many
//   SELECT id, total_paise FROM orders WHERE user_id = $1;
// generates:
//   func (q *Queries) GetOrdersByUser(ctx, userID int64) ([]Order, error)
```

sqlc 2024 mein Razorpay/Atlan teams ka favourite ban gaya — type-safe like ORM, zero runtime reflection like raw SQL.

### 8.3 Migrations

| Stack | Tool | Style |
|-------|------|-------|
| Python | **Alembic** | autogen from SQLAlchemy models |
| Python | yoyo / migra | raw SQL |
| Go | **goose** | up/down SQL files; simple |
| Go | **golang-migrate** | similar; popular |
| Go | **atlas** | declarative, modern |
| Django | built-in `makemigrations` | autogen from models |

Alembic example:

```bash
alembic init migrations
# edit env.py to point at SQLAlchemy metadata
alembic revision --autogenerate -m "add orders table"
alembic upgrade head
```

goose example:

```bash
goose -dir db/migrations create add_orders_table sql
# fills in 20240101120000_add_orders_table.sql with -- +goose Up / -- +goose Down sections
goose postgres "host=localhost ..." up
```

### 8.4 Connection pooling

| Stack | Default pool sizing rule |
|-------|--------------------------|
| FastAPI + asyncpg | pool size = 2 × CPU + a few; per-process |
| Django (sync) | use **PgBouncer** in front; Django connection per request |
| Go pgx | `pool_max_conns` ≈ DB max-connections / replica-count, capped at 25-50 typical |

> Cross-link: index design, query plans, isolation levels → `dbms-complete`. Connection-pool sizing math → `system-design-basics`.

---

## 9. Async + concurrency comparison

### 9.1 Python asyncio mental model

```mermaid
graph LR
    EL[asyncio event loop<br/>single thread] -->|await db.fetch| K1[kernel epoll]
    EL -->|await http.get| K1
    K1 -->|fd ready| EL
    EL -->|run coroutine| C1[coroutine 1]
    EL -->|run coroutine| C2[coroutine 2]
    EL -->|GIL prevents| MP[(multiprocessing<br/>for CPU)]
```

- Single thread, cooperative multitasking via `await`.
- GIL = Global Interpreter Lock → only one thread executes Python bytecode at a time. CPU-bound async won't speed up; use `concurrent.futures.ProcessPoolExecutor` or `multiprocessing` for parallelism.

```python
import asyncio, httpx

async def fetch(client, url):
    r = await client.get(url)
    return r.status_code

async def main():
    async with httpx.AsyncClient() as client:
        urls = [f"https://httpbin.org/delay/1" for _ in range(10)]
        results = await asyncio.gather(*(fetch(client, u) for u in urls))
        print(results)

asyncio.run(main())
```

10 requests, ~1.1s total (parallel via single-thread cooperative I/O).

### 9.2 Go goroutines + sync.WaitGroup + context

```go
import (
    "context"
    "net/http"
    "sync"
    "time"
)

func fetchAll(ctx context.Context, urls []string) []int {
    results := make([]int, len(urls))
    var wg sync.WaitGroup
    for i, u := range urls {
        wg.Add(1)
        go func(idx int, url string) {
            defer wg.Done()
            req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil { return }
            defer resp.Body.Close()
            results[idx] = resp.StatusCode
        }(i, u)
    }
    wg.Wait()
    return results
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    fetchAll(ctx, []string{"https://example.com", "https://golang.org"})
}
```

If timeout fires, context cancels in-flight HTTP calls — clean. No GIL: 100 goroutines genuinely parallel on 8 cores.

### 9.3 CPU-bound: Python multiprocessing vs Go goroutines

CPU-heavy work (image transform, hash crack, large CSV parse):

| Stack | Approach | Reality |
|-------|----------|---------|
| Python single-thread | `asyncio` for CPU = useless (GIL) | Don't |
| Python `threading` | GIL means 1 core ka use | Don't for CPU |
| Python `multiprocessing` | fork → real parallelism | Works, IPC overhead |
| Python `concurrent.futures.ProcessPoolExecutor` | clean wrapper | Recommended |
| Go goroutines | M:N scheduled across all cores | Just works |

For CPU-bound workloads, **Go ~5-20× faster than Python** at the same hardware. Indian fintech infra teams routinely rewrite hot Python paths in Go for this exact reason.

### 9.4 Race conditions + Go's race detector

```go
// BUG: concurrent map write + race
var counter = 0
var m = map[string]int{}

func handler() {
    counter++ // RACE — multiple goroutines
    m["k"] = 1 // PANIC under load — concurrent map writes
}
```

Go ships a built-in race detector:

```bash
go run -race main.go
go test -race ./...
```

It instruments memory accesses; running tests with `-race` catches data races at runtime. CI pe always-on. Fix:

```go
import "sync"

var (
    mu      sync.Mutex
    counter int
)

func incr() {
    mu.Lock()
    counter++
    mu.Unlock()
}

// or: atomic for simple counters
import "sync/atomic"
var c atomic.Int64
c.Add(1)
```

Python has no equivalent built-in race detector — though you rarely need one because GIL serialises bytecode (still buys you logical races, not memory-level ones).

> Cross-link: thread / process / scheduling theory → `os-complete`. Distributed concurrency (locks across nodes) → `system-design-advanced` and `messaging-systems`.

---

## 10. Production deployment

### 10.1 Python — gunicorn + uvicorn workers

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 30 \
  --access-logfile - \
  --error-logfile -
```

Worker count formula: `(2 × CPU) + 1` for I/O-bound, `CPU` for CPU-bound. Each worker = separate process (real parallelism, dodges GIL).

Dockerfile:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", \
     "--workers", "4", "--bind", "0.0.0.0:8000"]
```

Image size: ~200MB. Add `multistage build with builder + slim` to trim.

### 10.2 Go — single static binary, ~10MB Docker image

```dockerfile
# stage 1 — build
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/server ./cmd/server

# stage 2 — runtime
FROM gcr.io/distroless/static-debian12
COPY --from=builder /out/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

Final image: ~12MB. No shell, no libc, attack surface tiny. Deploy karta hai jaise *executable* — no virtualenv, no Python version pinning, no dependency hell.

### 10.3 Cloud Run / Fly.io / Railway / Render

| Platform | Vibe | Best for |
|----------|------|----------|
| **Cloud Run** | GCP serverless container | Auto-scale to 0; pay per-request; cold start ~500ms-2s |
| **Fly.io** | Global edge VMs | Low-latency global; persistent VMs |
| **Railway** | Heroku-like, generous free | Side projects, hackathons |
| **Render** | Heroku-like, more mature | Small startups |
| **AWS ECS / Fargate** | Containers without EC2 mgmt | Production scale |
| **Kubernetes (EKS/GKE)** | Full control | 10+ services |

Go's tiny image + fast cold-start is gold on Cloud Run — sub-200ms cold starts realistic. Python with FastAPI + lots of imports pe cold start 1-3s.

### 10.4 Observability — structlog (Python), zap (Go), OpenTelemetry, Prometheus

Logging:

```python
# Python — structlog
import structlog
log = structlog.get_logger()
log.info("order_created", order_id=42, user_id=7, total_paise=24900)
# emits JSON: {"event":"order_created","order_id":42,"user_id":7,"total_paise":24900,"ts":"..."}
```

```go
// Go — zap
import "go.uber.org/zap"
logger, _ := zap.NewProduction()
logger.Info("order_created",
    zap.Int64("order_id", 42),
    zap.Int64("user_id", 7),
    zap.Int64("total_paise", 24900),
)
```

Both emit structured JSON → ship to Datadog / Loki / Elasticsearch. Always structured, never `f"order {oid} created"`-style — search/filter/aggregate easier.

Metrics — Prometheus client libs in both:

```go
import "github.com/prometheus/client_golang/prometheus/promauto"

var ordersCreated = promauto.NewCounter(prometheus.CounterOpts{
    Name: "orders_created_total",
    Help: "Total orders created",
})

func createOrder(...) {
    ordersCreated.Inc()
    // ...
}
```

OpenTelemetry — distributed tracing across services. Both Python + Go have first-class SDKs (`opentelemetry-instrumentation-fastapi`, `otelhttp` for Go).

> Cross-link: deeper observability → `monitoring-observability`. Container orchestration → `docker-containers`, `kubernetes-orchestration`. CI/CD pipeline shipping → `cicd-pipelines`.

---

## 11. Testing

### 11.1 Python — pytest + httpx.AsyncClient + factory_boy

```python
# tests/conftest.py
import pytest, asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app),
                           base_url="http://test") as c:
        yield c

# tests/test_orders.py
import pytest

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_create_order_unauthorized(client):
    r = await client.post("/orders", json={"total_paise": 24900})
    assert r.status_code == 401
```

`factory_boy` for fixtures:

```python
import factory
from app.models import User, Order

class UserFactory(factory.Factory):
    class Meta: model = User
    email = factory.Sequence(lambda n: f"user{n}@swiggy.in")
    full_name = factory.Faker("name")

class OrderFactory(factory.Factory):
    class Meta: model = Order
    user = factory.SubFactory(UserFactory)
    total_paise = factory.Faker("random_int", min=10000, max=500000)

# usage in test
o = OrderFactory.build(total_paise=24900)
```

### 11.2 Go — stdlib testing + testify + httptest

```go
// orders_test.go
package main

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestCreateOrder(t *testing.T) {
    body := strings.NewReader(`{"restaurant_id":1,"total_paise":24900}`)
    req := httptest.NewRequest(http.MethodPost, "/orders", body)
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer testtoken")

    rr := httptest.NewRecorder()
    handler := buildRouter() // returns http.Handler
    handler.ServeHTTP(rr, req)

    require.Equal(t, http.StatusCreated, rr.Code)

    var resp map[string]any
    err := json.Unmarshal(rr.Body.Bytes(), &resp)
    require.NoError(t, err)
    assert.Equal(t, float64(24900), resp["total_paise"])
}

func TestGetOrderNotFound(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/orders/99999", nil)
    rr := httptest.NewRecorder()
    buildRouter().ServeHTTP(rr, req)
    assert.Equal(t, http.StatusNotFound, rr.Code)
}
```

Run: `go test ./... -race -cover`. Coverage report: `go test -coverprofile=cov.out && go tool cover -html=cov.out`.

### 11.3 Integration tests — testcontainers

Both ecosystems support `testcontainers` — spin up real Postgres/Redis in Docker for tests:

```python
# Python
from testcontainers.postgres import PostgresContainer

with PostgresContainer("postgres:16") as pg:
    url = pg.get_connection_url()
    # run real Alembic migrations + your tests against real DB
```

```go
// Go
import "github.com/testcontainers/testcontainers-go/modules/postgres"

ctx := context.Background()
pgC, _ := postgres.RunContainer(ctx,
    testcontainers.WithImage("postgres:16"),
    postgres.WithDatabase("test"))
defer pgC.Terminate(ctx)
url, _ := pgC.ConnectionString(ctx)
```

Real DB > mocks for integration. CI mein `services: postgres` add karke isko cheap rakh.

> Cross-link: test pyramid + flake hunting → `software-testing`. CI pipelines → `cicd-pipelines`.

---

## 12. Top 30 Python/Go backend interview questions

| # | Question | Crisp answer pointer |
|---|----------|---------------------|
| 1 | Why Go vs Python for a new microservice? | Latency floor + binary deploy → Go; ML/CRUD/scripting → Python |
| 2 | Explain GIL. | One thread executes Python bytecode at a time; CPU-bound use multiprocessing |
| 3 | What is a goroutine vs OS thread? | Goroutine ~2KB stack, M:N scheduled by Go runtime; OS thread ~1MB stack, kernel-scheduled |
| 4 | How does FastAPI achieve high perf? | ASGI (async) + Pydantic v2 (Rust) + Starlette + uvicorn (uvloop) |
| 5 | Explain Python asyncio event loop. | Single-thread cooperative multitasking via `await`; uses kernel epoll/kqueue |
| 6 | Difference between `async` and `threading` in Python? | async = single-thread coroutines; threading = OS threads (GIL-limited for CPU) |
| 7 | What is `context.Context` in Go? | Cancellation + deadline + request-scoped values, propagated through call chain |
| 8 | How do you handle errors in Go? | Explicit `if err != nil`; wrap with `fmt.Errorf("%w")`; sentinel errors via `errors.Is` |
| 9 | Pydantic v1 vs v2 difference? | v2 Rust-backed (~5-50× faster); `model_dump` instead of `dict` |
| 10 | When Django over FastAPI? | Admin panel + ORM-heavy + server-rendered + opinionated structure |
| 11 | What is structural typing in Go interfaces? | If type has the methods, it implicitly satisfies the interface; no `implements` |
| 12 | How do channels work in Go? | Typed conduits; `<-ch` receive blocks till data; `ch <- v` send blocks if buffer full |
| 13 | Difference between buffered and unbuffered channels? | Unbuffered = synchronous handshake; buffered = async up to capacity |
| 14 | What is a goroutine leak and how to find it? | Goroutine blocked forever on chan/network; use `runtime.NumGoroutine()` + pprof |
| 15 | How do you ensure thread-safety in Go map? | Use `sync.RWMutex` or `sync.Map`; native `map` not safe for concurrent write |
| 16 | What does `go build -ldflags="-s -w"` do? | Strip debug info + symbol table → smaller binary |
| 17 | How does FastAPI dependency injection cache work? | Same Depends call cached per-request by default (`use_cache=True`) |
| 18 | gRPC vs REST trade-offs? | gRPC: HTTP/2 + protobuf, low latency, codegen, schema; REST: human-friendly, browser-native |
| 19 | What is `select` in Go? | Multi-channel switch; first ready case wins; `default` for non-blocking |
| 20 | How to do graceful shutdown in Go HTTP server? | Catch SIGTERM, call `srv.Shutdown(ctx)` with timeout |
| 21 | How to do connection pooling in FastAPI + Postgres? | SQLAlchemy `pool_size=20, max_overflow=10, pool_pre_ping=True` |
| 22 | Goroutine vs async/await mental model? | Goroutine = preemptive M:N; asyncio = cooperative single-thread |
| 23 | Why is Go deployment so simple? | Static binary, no runtime, no deps, ~12MB; `scp` and run |
| 24 | What is sqlc in Go? | Code-gen typesafe Go from raw SQL; type-safe like ORM, fast like raw SQL |
| 25 | How to detect race conditions in Go? | `go run -race` / `go test -race`; CI mandatory |
| 26 | Celery vs FastAPI BackgroundTasks? | Celery = separate worker process + broker (Redis); BackgroundTasks = same process fire-and-forget |
| 27 | What is Pydantic's `model_config = ConfigDict(from_attributes=True)`? | Read fields from object attrs (ORM mode) instead of dict |
| 28 | Explain Go's M:N scheduler (GMP model). | G = goroutine, M = OS thread, P = logical processor; runtime multiplexes G's onto M's via P's |
| 29 | When use gRPC streaming? | Server-stream: notifications; client-stream: upload chunks; bidi: chat / live trading |
| 30 | Python alembic vs Django migrations? | Alembic = manual revision graph for SQLAlchemy; Django = built-in autogen tied to models |

---

## 13. Pre-interview checklist + what to learn next

### 13.1 The 14-day cram

**Week 1 — Python depth**
- Day 1: FastAPI hello + path/query/body/header
- Day 2: Pydantic v2 validation + Depends DI
- Day 3: SQLAlchemy 2.0 async + Alembic migrations
- Day 4: JWT auth + refresh flow + bcrypt
- Day 5: pytest + httpx.AsyncClient + factory_boy
- Day 6: Celery + Redis background jobs
- Day 7: Django admin + DRF crash + 1 ViewSet end-to-end

**Week 2 — Go depth**
- Day 8: Go basics — slices, maps, structs, interfaces
- Day 9: Goroutines + channels + sync.WaitGroup
- Day 10: context.Context propagation + graceful shutdown
- Day 11: gin + middleware + JWT auth
- Day 12: pgx + sqlc + Postgres CRUD
- Day 13: gRPC server + Python client
- Day 14: Production deploy — Dockerfile + Cloud Run + structured logging + Prometheus metric

### 13.2 The day-before-interview drill

- [ ] Boot a 50-line FastAPI service from memory (auth + DB + 1 POST + 1 GET).
- [ ] Boot a 60-line gin service from memory (JWT middleware + 1 POST + graceful shutdown).
- [ ] Explain GIL + asyncio event loop in 60 seconds.
- [ ] Explain GMP scheduler + goroutine vs thread in 60 seconds.
- [ ] Write `if err != nil { return fmt.Errorf("X: %w", err) }` chain blindfolded.
- [ ] Sketch gRPC code-gen flow on paper (proto → stubs → server + client).
- [ ] Draft a Dockerfile for Python and one for Go from memory.
- [ ] Top-30 questions table revise — at least 25/30 should feel reflexive.

### 13.3 Common interviewer traps

- **"Will more uvicorn workers help CPU-bound code?"** — yes (separate processes dodge GIL); but `--threads` won't (single GIL per process).
- **"What if you read from a closed channel in Go?"** — returns zero value + `ok=false`; safe.
- **"What if you write to a closed channel?"** — panic. Always close from sender side; only close once.
- **"FastAPI sync vs async endpoint?"** — sync (`def`) endpoints run in threadpool to avoid blocking event loop; async (`async def`) run on the loop directly. Don't mix sync DB call inside `async def` — blocks loop.
- **"Goroutine leak example?"** — goroutine waiting on channel that's never written to / never closed. Find via `pprof goroutine` profile.

### 13.4 What to learn next

- **`system-design-basics`** — load balancer, caching, partitioning. Yeh subject implementation skill deta hai; system design tujhe blueprint banane sikhata hai.
- **`dbms-complete`** — schema, indexes, transactions, isolation. Backend code DB ke saath baat karta hai; DBMS internalize hua to query plan, deadlock, MVCC sapne mein samajh aayega.
- **`nodejs-backend`** — same role, third stack. Node ka event loop + Express middleware + Mongoose pipeline samajh ke teen-stack-fluent ban.
- **`lld-design`** — class design, SOLID, design patterns in Python + Go. FastAPI + gin code architect-grade tabhi banta hai jab LLD strong ho.
- **`microservices`** — service decomposition, sagas, choreography vs orchestration. Python + Go ka real shine multi-service architecture mein dikhta hai.
- **`messaging-systems`** — Kafka / RabbitMQ / NATS — Python + Go consumer/producer patterns.
- **`docker-containers` + `kubernetes-orchestration`** — Go ecosystem ka mool yahin hai; deployment-ready engineer banne ke liye must.
- **`cicd-pipelines`** + **`monitoring-observability`** — production-grade shipping ke last mile.

---

Bas, bhai. Iss subject ko khali mat padh — har code block save kar, run kar, ek small Swiggy-lite Orders service FastAPI mein bana, fir wahi service Go gin mein dobara likh. Jab tu dono side se same business logic ship kar paayega — auth, DB, validation, tests, Dockerfile — tab tu Razorpay/Swiggy/Atlan ke "backend (Python or Go)" job listings ke liye genuinely qualified hai.

Happy hacking. Production mein milte hain.
