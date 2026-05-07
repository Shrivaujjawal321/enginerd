# Backend Engineering for AI

Dekh bhai, seedha baat — Gen AI engineer ka 50% time backend pe jaata hai. FastAPI, Postgres, Redis, queues, streaming. Bina iske tumhara LLM ek toy demo hai, production product nahi. Tu Jupyter notebook me `openai.chat.completions.create()` chala ke khush ho raha hai, but jab 10,000 concurrent users aayenge, jab token-by-token streaming chahiye hogi, jab embeddings ka cache chahiye hoga, jab background me 6-ghante ka agent workflow chalana hoga — tab tujhe backend aana chahiye. Warna tu sirf "prompt engineer" reh jayega, jo har company ke liye replaceable hai.

Yeh guide tujhe senior dev style me sikhayegi: API design from FastAPI, async databases (SQLAlchemy 2.0 + asyncpg), streaming protocols (SSE, WebSocket), authentication, rate limiting, Pydantic contracts, PostgreSQL + pgvector for semantic search, Redis for caching aur queueing, SQLite for edge, aur durable workflows (Celery, Temporal, Kafka). Sab kuch production-grade, sab kuch real code ke saath. Notebook chhod, terminal khol.

Ek baat aur — backend engineering "alag stack" nahi hai AI ke liye. Wahi same fundamentals hain jo Stripe, Uber, Netflix use karte hain. Bas LLM-specific quirks hain: tokens streaming hote hain (sync nahi), embeddings 1536-dim vectors hain (text nahi), agents long-running hain (request-response nahi), aur cost per call $$$ hai (cache karna mandatory hai). In quirks ko handle karne ke liye tu jo patterns padhega yahaan, woh tujhe har AI startup me kaam aayenge.

---

## 1. APIs

API matlab woh contract jo tera frontend, mobile app, ya doosri service tere LLM service se baat karne ke liye use karega. Yahaan hum FastAPI use karenge — Python backend ka de-facto standard for AI workloads, kyunki async-first hai, Pydantic built-in hai, aur OpenAPI docs free me deta hai.

### 1.1 FastAPI deeply (DI, background tasks, websockets)

**Definition:** FastAPI ek modern Python web framework hai jo Starlette (async ASGI) + Pydantic (validation) ke upar bana hai. Iska USP: type hints se hi routing, validation, aur docs generate ho jaate hain. Dependency Injection (DI), background tasks, aur WebSocket support first-class hain.

**Why:** AI workloads me 90% time I/O-bound hota hai — LLM API call, DB query, vector search. Async framework ke bina tu ek server pe 10 concurrent users bhi handle nahi kar payega. Flask/Django (sync) yahaan choke ho jaate hain. FastAPI me ek worker process easily 1000+ concurrent connections handle kar sakta hai because event loop free rehta hai jab tak network response nahi aata.

**How:**

```python
# app/main.py
from fastapi import FastAPI, Depends, BackgroundTasks, WebSocket
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Annotated
import asyncio

app = FastAPI(title="GenAI Backend", version="1.0")

# DI: ek shared OpenAI client banao, har request me reuse ho
class LLMClient:
    def __init__(self):
        # Asli prod me yahaan AsyncOpenAI() init karega
        self.model = "gpt-4o-mini"
    async def chat(self, prompt: str) -> str:
        await asyncio.sleep(0.1)  # network simulate
        return f"Response to: {prompt}"

# Singleton dependency — pura app me ek hi instance
def get_llm() -> LLMClient:
    # Real prod: app.state se nikaalo, ya lru_cache use karo
    return LLMClient()

LLMDep = Annotated[LLMClient, Depends(get_llm)]

class ChatRequest(BaseModel):
    prompt: str
    user_id: str

@app.post("/chat")
async def chat(req: ChatRequest, llm: LLMDep):
    # DI ke through llm inject ho gaya — testing me mock kar sakte ho
    answer = await llm.chat(req.prompt)
    return {"answer": answer}

# Background task — response bhej do, fire-and-forget kaam baad me
async def log_to_analytics(user_id: str, prompt: str):
    # Imagine: Postgres insert, ya Kafka pe push
    print(f"[bg] logged {user_id}: {prompt[:50]}")

@app.post("/chat-with-log")
async def chat_with_log(
    req: ChatRequest,
    bg: BackgroundTasks,
    llm: LLMDep,
):
    answer = await llm.chat(req.prompt)
    # Yeh response ke baad chalega — user ko wait nahi karna padega
    bg.add_task(log_to_analytics, req.user_id, req.prompt)
    return {"answer": answer}

# WebSocket — bidirectional, persistent connection
@app.websocket("/ws/chat")
async def ws_chat(ws: WebSocket, llm: LLMDep = Depends(get_llm)):
    await ws.accept()
    try:
        while True:
            prompt = await ws.receive_text()
            # Token-by-token bhej (asli code me llm.stream() use karega)
            for token in (await llm.chat(prompt)).split():
                await ws.send_text(token + " ")
                await asyncio.sleep(0.05)
            await ws.send_text("[DONE]")
    except Exception as e:
        await ws.close(code=1011)
```

**Real-life Example:** Tu ek customer-support chatbot bana raha hai. User question puchta hai (`/chat`). Tu LLM se response leta hai aur turant return karta hai. Saath me background me us conversation ka summary banwa ke Postgres me daal deta hai (analytics ke liye) — user ko 200ms ka extra wait nahi. Aur agar user ko long-running session chahiye (multi-turn debugging), tu WebSocket pe switch kar deta hai.

**Mermaid Diagram:**

```mermaid
graph LR
    Client[Client] -->|HTTP POST /chat| FA[FastAPI Router]
    FA -->|Depends| DI[DI Container]
    DI --> LLM[LLMClient instance]
    FA -->|await| LLM
    LLM -->|response| FA
    FA -->|JSON| Client
    FA -.->|bg.add_task| BG[Background Task: analytics log]
    Client <-->|WebSocket /ws/chat| WS[WS Handler]
    WS <--> LLM
```

**Interview Q&A:**

*Q: FastAPI me Depends() aur direct instantiation me kya farq hai?*
A: `Depends()` lazy hai — request aane par execute hota hai, aur FastAPI usko cache karta hai per-request scope me. Iska bada faayda testing me hai — tu `app.dependency_overrides[get_llm] = lambda: MockLLM()` likh ke production code chhede bina mock inject kar sakta hai. Direct instantiation se yeh nahi ho sakta. Plus DI sub-dependencies ko bhi resolve kar leta hai (e.g., `get_db` → `get_session` → `get_engine`), poora tree automatic.

*Q: BackgroundTasks vs Celery — kab kya use kare?*
A: BackgroundTasks same Python process me chalta hai, response bhejne ke baad. Yeh sirf hlke kaam ke liye hai — log likhna, email trigger karna (queue me push karna). Agar task crash kar gaya ya server restart hua, kaam lost. Heavy/durable kaam ke liye Celery/Dramatiq/Temporal use kar — woh alag worker process me chalta hai aur retries, persistence deta hai. Rule of thumb: agar task 1 second se zyada le ya failure tolerate nahi karna, toh queue use kar.

*Q: WebSocket vs SSE for streaming tokens?*
A: SSE (Server-Sent Events) one-way hai — server → client. Simple HTTP, automatic reconnection, firewall-friendly. LLM token streaming ke liye perfect hai, kyunki client ko bas tokens receive karne hain. WebSocket bidirectional hai — agar tujhe interrupt/cancel/multi-turn voice chahiye, tab use kar. Default choice: SSE for token streaming. WebSocket for interactive agents.

---

### 1.2 Async DB (SQLAlchemy 2.0, asyncpg)

**Definition:** Async DB matlab non-blocking database driver. `asyncpg` PostgreSQL ka fastest async Python driver hai (Rust se bhi tez kuch benchmarks me, pure Python me likha hai but native protocol parser ke saath). SQLAlchemy 2.0 ne `AsyncSession` aur 2.0-style queries (`select()`, `update()`) introduce ki hain.

**Why:** Sync DB driver (`psycopg2`) ek query ke liye thread block kar deta hai. Tera FastAPI ka event loop usi pe atak jaata hai. Async driver ke saath tu ek thread pe sainkdo concurrent queries chala sakta hai — kyunki jab DB se response wait ho raha hai, dusri request ka kaam ho raha hai.

**How:**

```python
# app/db.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select, String, Integer
from typing import AsyncGenerator
import uuid

# postgresql+asyncpg:// — yeh async driver use karega
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/genai",
    pool_size=20,        # connection pool
    max_overflow=10,     # peak load me kitne extra
    pool_pre_ping=True,  # stale connections detect
)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase): pass

class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, index=True)
    prompt: Mapped[str] = mapped_column(String)
    response: Mapped[str] = mapped_column(String)
    tokens: Mapped[int] = mapped_column(Integer, default=0)

# DI ke liye session generator
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# Usage in route
from fastapi import Depends
from typing import Annotated

DBDep = Annotated[AsyncSession, Depends(get_db)]

@app.post("/save-chat")
async def save_chat(req: ChatRequest, db: DBDep, llm: LLMDep):
    answer = await llm.chat(req.prompt)
    # 2.0-style: ORM object banao, add karo
    conv = Conversation(user_id=req.user_id, prompt=req.prompt, response=answer)
    db.add(conv)
    # commit get_db ke andar auto ho jayega
    return {"id": conv.id, "answer": answer}

@app.get("/history/{user_id}")
async def history(user_id: str, db: DBDep):
    # 2.0-style select — koi .query() nahi
    stmt = select(Conversation).where(Conversation.user_id == user_id).limit(20)
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [{"id": r.id, "prompt": r.prompt} for r in rows]
```

**Real-life Example:** ChatGPT-clone bana raha hai. Har user ka conversation history Postgres me store karta hai. 5000 concurrent users hai. Sync driver ke saath tujhe 50+ Gunicorn workers chahiye honge, har worker 100MB RAM. Async ke saath 4 Uvicorn workers kaafi hain, kyunki har worker 1000+ concurrent DB queries handle kar leta hai.

**Mermaid Diagram:**

```mermaid
graph TB
    R1[Request 1] --> EL[Event Loop]
    R2[Request 2] --> EL
    R3[Request 3] --> EL
    EL -->|await query| AP[asyncpg Pool]
    AP --> PG[(PostgreSQL)]
    PG -->|response 1| AP
    PG -->|response 2| AP
    AP -->|resume| EL
    EL -->|response| R1
```

**Interview Q&A:**

*Q: Pool size kaise decide karte ho?*
A: Rule of thumb: `pool_size = (workers * avg_concurrent_queries_per_request)`. Postgres ka default `max_connections` 100 hota hai. Agar tere pas 4 Uvicorn workers hain aur har request 2 queries karta hai with 50 concurrent requests, toh `4 * 50 * 2 = 400` — Postgres choke ho jayega. Solution: PgBouncer use kar (transaction-mode pooling), ya `pool_size=10, max_overflow=20` rakh per worker. Production me hamesha PgBouncer ya RDS Proxy lagao.

*Q: `expire_on_commit=False` kyun?*
A: Default behavior me commit ke baad SQLAlchemy ORM objects "expired" mark kar deta hai — agle access pe DB hit hoga refresh ke liye. Async context me ye dangerous hai kyunki tu session close ke baad object access karna chahta hai (e.g., return karne ke liye), aur woh `MissingGreenlet` error throw kar dega. `expire_on_commit=False` rakh ke object in-memory rehta hai.

*Q: asyncpg vs psycopg3 async?*
A: Dono async hain. `asyncpg` faster hai (binary protocol, custom parser), but SQLAlchemy ke saath kuch quirks hain (statement caching). `psycopg3` (note: 3, not 2) zyada compatible hai aur prepared statements thik se support karta hai PgBouncer ke saath. Default pick: asyncpg agar performance critical hai aur tu PgBouncer ko transaction mode me chalata hai with `statement_cache_size=0`.

---

### 1.3 Streaming (SSE, WebSocket) for tokens

**Definition:** Streaming matlab response ko ek baar me nahi, tukdo me bhejna. LLM token-by-token generate karta hai (~30-100 tokens/sec). Agar tu poora response wait karke bhejega, user ko 5-10 second blank screen dikhega. Streaming me first token 200ms me dikhta hai, baki tokens flow karte rehte hain.

**Why:** Perceived latency. ChatGPT, Claude, Gemini — sab streaming use karte hain. User ko lagta hai system fast hai, even though total time same hai. Plus tu user ko cancel karne ka option de sakta hai mid-generation (cost savings).

**How (SSE):**

```python
# app/streaming.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

async def llm_stream(prompt: str):
    """Imagine yeh OpenAI ka stream=True hai."""
    fake_tokens = ["Bhai", " ", "tu", " ", "kaisa", " ", "hai", "?"]
    for tok in fake_tokens:
        await asyncio.sleep(0.1)
        yield tok

async def sse_generator(prompt: str):
    # SSE format: "data: <payload>\n\n"
    async for token in llm_stream(prompt):
        # JSON wrap karo taaki client parse kar sake
        payload = json.dumps({"token": token})
        yield f"data: {payload}\n\n"
    # End signal — client isko dekh ke close karega
    yield "data: [DONE]\n\n"

@app.get("/stream")
async def stream(prompt: str):
    return StreamingResponse(
        sse_generator(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # nginx buffering off
            "Connection": "keep-alive",
        },
    )
```

Client side (JS):

```javascript
const es = new EventSource("/stream?prompt=hello");
es.onmessage = (e) => {
  if (e.data === "[DONE]") { es.close(); return; }
  const { token } = JSON.parse(e.data);
  document.getElementById("output").innerText += token;
};
```

**WebSocket variant** (jab cancel/interrupt chahiye):

```python
@app.websocket("/ws/stream")
async def ws_stream(ws: WebSocket):
    await ws.accept()
    cancel_event = asyncio.Event()

    async def receiver():
        # Client kabhi bhi "cancel" bhej sakta hai
        while True:
            msg = await ws.receive_text()
            if msg == "cancel":
                cancel_event.set()
                break

    async def streamer(prompt):
        async for token in llm_stream(prompt):
            if cancel_event.is_set():
                await ws.send_json({"type": "cancelled"})
                return
            await ws.send_json({"type": "token", "value": token})
        await ws.send_json({"type": "done"})

    prompt = await ws.receive_text()
    await asyncio.gather(receiver(), streamer(prompt))
```

**Real-life Example:** ChatGPT ka UI dekh — tokens ek-ek karke aate hain. Yeh SSE se ho raha hai. Agar tu "Stop generating" button daba de, woh WebSocket-style cancel signal bhejta hai. Cursor (AI code editor) bhi same pattern use karta hai — har keystroke pe completion stream hota hai.

**Mermaid Diagram:**

```mermaid
sequenceDiagram
    participant C as Client
    participant S as FastAPI
    participant L as LLM API
    C->>S: GET /stream?prompt=...
    S->>L: chat.completions.create(stream=True)
    loop Each token
        L-->>S: token chunk
        S-->>C: data: {"token":"..."}
    end
    L-->>S: [DONE]
    S-->>C: data: [DONE]
    C->>C: close EventSource
```

**Interview Q&A:**

*Q: Nginx ke peeche SSE kaam kyun nahi karta sometimes?*
A: Nginx by default response buffer karta hai — toh tere chunks aggregate ho ke ek baar me jaate hain, streaming fail. Solution: response header me `X-Accel-Buffering: no` daal, aur nginx config me `proxy_buffering off; proxy_cache off; proxy_read_timeout 24h;` set kar. Cloudflare ke saath bhi same issue, "no buffering" enable karna padta hai.

*Q: SSE me reconnect kaise handle karte ho?*
A: Browser ka `EventSource` automatic reconnect karta hai. Tu server pe `Last-Event-ID` header use kar sakta hai resume karne ke liye — har event ko `id: <n>` dena hota hai. Production me yeh tricky hota hai LLM ke saath kyunki tokens replay nahi kar sakte. Common pattern: conversation ID save kar, reconnect pe pura conversation Postgres se replay kar de.

*Q: Backpressure kaise handle karoge agar client slow hai?*
A: SSE me `await response.send()` slow client pe block ho jata hai (TCP buffer full). Yeh accha hai — LLM API se aage tokens nahi maangoge. But agar tum LLM ko already pull kar chuke ho, tokens memory me build up honge. Solution: bounded queue (`asyncio.Queue(maxsize=100)`) lagao token producer aur SSE sender ke beech. Queue full ho toh producer pause ho jayega. Real prod me agar client disconnect kare, `request.is_disconnected()` check karke LLM stream cancel kar do.

---

### 1.4 Rate limiting, auth (JWT, OAuth, API keys)

**Definition:** Rate limiting matlab kisi ek user/IP ko fixed time-window me fixed requests dena. Auth matlab user identify aur authorize karna. AI APIs ke liye yeh extra critical hai kyunki har LLM call ko paisa lagta hai — abuse hua toh tera AWS bill 10x ho jayega.

**Why:** GPT-4 ka call $0.03+ ka hota hai. Agar koi attacker tera unprotected `/chat` endpoint hit kare 1M baar, tujhe $30,000 ka bill aayega. Plus regular users ke liye fairness — ek user 1000 requests/sec maar ke baki sab ko slow nahi kar sakta.

**How:**

```python
# app/auth.py
from fastapi import Depends, HTTPException, Request, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import redis.asyncio as aioredis
import os

SECRET = os.getenv("JWT_SECRET", "change-me")
ALGO = "HS256"

# Redis for rate limiting
redis = aioredis.from_url("redis://localhost", decode_responses=True)

# 1) JWT auth
oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)

async def current_user(token: str = Depends(oauth2)) -> str:
    try:
        data = jwt.decode(token, SECRET, algorithms=[ALGO])
        return data["sub"]
    except JWTError:
        raise HTTPException(401, "Invalid token")

# 2) API key auth (B2B clients ke liye)
async def api_key_user(x_api_key: str = Header(...)) -> str:
    # Real prod: hashed key Postgres me store, lookup karo
    if not x_api_key.startswith("sk-"):
        raise HTTPException(401, "Bad API key")
    # Return tenant/user ID
    return f"apikey:{x_api_key[:10]}"

# 3) Rate limiting — sliding window via Redis
async def rate_limit(user_id: str, max_per_min: int = 60):
    key = f"rl:{user_id}:{datetime.now().minute}"
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, 60)
    if current > max_per_min:
        raise HTTPException(429, "Too many requests, slow down bhai")

# Compose: auth + rate limit
async def authed_and_limited(user: str = Depends(current_user)) -> str:
    await rate_limit(user, max_per_min=30)
    return user

@app.post("/protected-chat")
async def protected_chat(req: ChatRequest, user: str = Depends(authed_and_limited)):
    return {"user": user, "answer": "..."}

# Login route
from pydantic import BaseModel
class LoginReq(BaseModel):
    email: str
    password: str

@app.post("/auth/login")
async def login(req: LoginReq):
    # Real prod: bcrypt verify against DB
    if req.password != "demo":
        raise HTTPException(401, "Wrong creds")
    return {"access_token": create_token(req.email), "token_type": "bearer"}
```

OAuth (Google sign-in) ke liye `authlib` use karte hain — flow: redirect to Google → callback with code → exchange for token → fetch user profile → issue your own JWT.

**Real-life Example:** OpenAI ka API. Tu `Authorization: Bearer sk-...` bhejta hai (API key auth). Plus woh tier-based rate limits lagaate hain — Tier 1 me 500 req/min, Tier 5 me 10000. Agar exceed kare toh `429 Too Many Requests`. Tera SaaS bhi same model use karega.

**Mermaid Diagram:**

```mermaid
graph LR
    Req[Incoming Request] --> AuthMW{Auth Check}
    AuthMW -->|JWT valid| RL{Rate Limit}
    AuthMW -->|API key valid| RL
    AuthMW -->|Invalid| R401[401 Unauthorized]
    RL -->|Under limit| Handler[Route Handler]
    RL -->|Over limit| R429[429 Too Many]
    Handler --> LLM[LLM API]
    Handler --> R200[200 OK]
```

**Interview Q&A:**

*Q: JWT vs session cookie — AI app me kya use karoge?*
A: JWT stateless hai — server pe store nahi karna padta, scale karna easy. But revoke karna mushkil (token expire hone tak valid). Session cookie me server-side state hai, instant revoke ho sakta hai. Production me hybrid: short-lived JWT (15 min) + refresh token (Redis me) jo revoke ho sake. Agent applications me JWT prefer karo kyunki agents hours tak chal sakte hain — Redis me track karo "blocked tokens" ki list.

*Q: Rate limiting algorithms — fixed window vs sliding vs token bucket?*
A: Fixed window (mera example) simple hai but boundary me 2x burst possible (minute end pe 60 + minute start pe 60 = 120 in 2 sec). Sliding window log accurate hai but Redis me memory zyada lagti hai. Token bucket smooth burst handle karta hai — pre-allocated tokens, refill rate. Production: `slowapi` ya `fastapi-limiter` use kar, woh sliding-window-counter implement karte hain Redis me. Per-endpoint different limits rakho — `/chat` strict, `/health` koi nahi.

*Q: API key rotate kaise karoge bina downtime?*
A: Multi-key support — har user ke pas 2 active keys ho sakti hain. Frontend pe "create new key" button → naya key issue, dono valid for 30 days. User code update kare new key se, fir purani revoke. DB schema: `api_keys(user_id, key_hash, status, created_at, last_used_at)`. Hash store karo (bcrypt/sha256), plaintext kabhi nahi. Display sirf creation ke time, baad me sirf last 4 chars dikhao.

---

### 1.5 Pydantic for I/O contracts

**Definition:** Pydantic data validation library hai jo Python type hints use karke runtime validation karta hai. v2 me Rust-based core hai, blazing fast. FastAPI iske upar bana hai. AI workloads me yeh tool/function calling, structured outputs, aur API contracts ke liye essential hai.

**Why:** LLMs unstructured text return karte hain. Tu chahta hai structured JSON. Pydantic schema de ke OpenAI/Anthropic ko, structured output guarantee mil jaata hai. Plus inbound request validation — tujhe `if "name" in body and isinstance(body["name"], str)...` jaisa boilerplate nahi likhna.

**How:**

```python
# app/schemas.py
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Literal, Annotated
from datetime import datetime

# Inbound request schema
class ChatRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    prompt: Annotated[str, Field(min_length=1, max_length=10000)]
    user_id: str
    temperature: Annotated[float, Field(ge=0.0, le=2.0)] = 0.7
    model: Literal["gpt-4o", "gpt-4o-mini", "claude-3-7-sonnet"] = "gpt-4o-mini"
    stream: bool = False

    @field_validator("prompt")
    @classmethod
    def no_pii(cls, v: str) -> str:
        # Custom rule: phone numbers reject (toy example)
        import re
        if re.search(r"\b\d{10}\b", v):
            raise ValueError("Don't send phone numbers, bhai")
        return v

# Outbound response
class ChatResponse(BaseModel):
    id: str
    answer: str
    tokens_used: int
    model: str
    created_at: datetime

# Structured output for LLM (tool calling / JSON mode)
class ProductExtract(BaseModel):
    """LLM se yeh schema follow karwana hai."""
    name: str = Field(description="Product ka naam")
    price_inr: float = Field(description="Price in INR, only number")
    in_stock: bool
    category: Literal["electronics", "apparel", "food", "other"]

# Usage with OpenAI structured outputs
async def extract_product(text: str) -> ProductExtract:
    # Pseudo-code, asli OpenAI client ka API similar hai
    from openai import AsyncOpenAI
    client = AsyncOpenAI()
    resp = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": text}],
        response_format=ProductExtract,
    )
    # resp.choices[0].message.parsed already validated Pydantic object hai
    return resp.choices[0].message.parsed

# FastAPI route automatically validate karega
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # req already validated — agar invalid aaya, FastAPI 422 throw karega
    return ChatResponse(
        id="abc",
        answer="hello",
        tokens_used=42,
        model=req.model,
        created_at=datetime.utcnow(),
    )
```

**Real-life Example:** Tu invoice-extraction service bana raha hai. User PDF upload karta hai, tu OCR karke text nikalta hai, LLM ko bhejta hai with `Invoice` Pydantic schema. LLM ka output guaranteed `{vendor, amount, date, line_items}` structure me aata hai. Tu directly Postgres me dump kar sakta hai bina parsing nightmare ke. Same pattern Notion AI, Mercury banking, SaaS billing me use hota hai.

**Mermaid Diagram:**

```mermaid
graph LR
    Body[Request JSON] --> P1[Pydantic ChatRequest]
    P1 -->|valid| H[Handler]
    P1 -->|invalid| E422[422 Error]
    H --> LLM[LLM Call]
    LLM -->|raw text + schema| P2[Pydantic ProductExtract]
    P2 -->|parsed| H
    H --> P3[Pydantic ChatResponse]
    P3 --> Out[Response JSON]
```

**Interview Q&A:**

*Q: Pydantic v1 vs v2 me kya badla?*
A: v2 ka core Rust me likha hai (`pydantic-core`), 5-50x tez. API thoda alag — `@validator` → `@field_validator`, `Config` class → `model_config = ConfigDict(...)`, `.dict()` → `.model_dump()`. Default `extra` behavior bhi change hua. Migration ke liye `bump-pydantic` tool hai. Sab major libraries (FastAPI, LangChain, Instructor) v2 pe shift ho gayi hain. v1 ab legacy.

*Q: LLM ko schema kaise force karte ho?*
A: Teen tareeke. (1) System prompt me JSON schema daal do — unreliable, LLM kabhi tod deta hai. (2) Function/tool calling — OpenAI/Anthropic ka native feature, model trained hai schema follow karne ke liye. (3) Structured outputs / JSON mode — model decode time pe constrained generation karta hai, 100% schema match guaranteed. Production me #3 prefer karo. Library: `instructor` library Pydantic + retries wrap karti hai elegantly.

*Q: Field-level validation vs model-level validation?*
A: `@field_validator("x")` ek field pe chalta hai. `@model_validator(mode="after")` poore model ke baad chalta hai — multi-field rules ke liye (e.g., `start_date < end_date`). `mode="before"` raw input pe chalta hai (transformation). AI use case: `model_validator` se ensure kar `if model == "gpt-4o" and temperature > 1.5: warn`. Validators me side effects mat daalo (DB call, etc.) — pure functions rakho.

---

## 2. Databases for AI

AI app me DB sirf "user data store karne ki jagah" nahi hai. Tujhe vector search chahiye (embeddings ke liye), full-text search chahiye (hybrid retrieval), aur cache chahiye (cost bachane ke liye). Smart choice: ek primary DB jo sab kar sake.

### 2.1 PostgreSQL + pgvector — your default

**Definition:** PostgreSQL world's most loved RDBMS. `pgvector` extension Postgres me native vector data type aur similarity search add karta hai — cosine, L2, inner product. AI startups ka default choice — separate vector DB (Pinecone, Weaviate) ki zaroorat nahi hoti till you hit billions of vectors.

**Why:** Ek hi DB me transactional data + vectors + full-text search. Backups, replication, monitoring — sab Postgres ka mature ecosystem milta hai. Pinecone $70/month minimum se shuru hota hai; pgvector tere existing RDS pe free hai. HNSW index 100M vectors tak smoothly handle karta hai.

**How:**

```sql
-- Extension install (once)
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table embeddings ke saath
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast ANN search (recommended over IVFFlat for most cases)
CREATE INDEX ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Query: top-5 similar docs
SELECT id, content, 1 - (embedding <=> $1) AS similarity
FROM documents
ORDER BY embedding <=> $1
LIMIT 5;
```

Python (async):

```python
# app/rag.py
from sqlalchemy import text
from openai import AsyncOpenAI

oa = AsyncOpenAI()

async def embed(text_in: str) -> list[float]:
    r = await oa.embeddings.create(model="text-embedding-3-small", input=text_in)
    return r.data[0].embedding

async def store_doc(db, content: str, metadata: dict):
    vec = await embed(content)
    # pgvector format: '[0.1, 0.2, ...]' string ya array
    await db.execute(
        text("INSERT INTO documents (content, metadata, embedding) VALUES (:c, :m, :e)"),
        {"c": content, "m": metadata, "e": str(vec)},
    )

async def search(db, query: str, k: int = 5):
    qvec = await embed(query)
    rows = await db.execute(
        text("""
          SELECT id, content, 1 - (embedding <=> :v) AS sim
          FROM documents
          ORDER BY embedding <=> :v
          LIMIT :k
        """),
        {"v": str(qvec), "k": k},
    )
    return rows.mappings().all()

# Hybrid search: BM25 (full-text) + vector
async def hybrid_search(db, query: str, k: int = 10):
    qvec = await embed(query)
    # Reciprocal rank fusion
    rows = await db.execute(
        text("""
          WITH semantic AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> :v) AS rk
            FROM documents ORDER BY embedding <=> :v LIMIT 50
          ),
          keyword AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector(content), plainto_tsquery(:q)) DESC) AS rk
            FROM documents WHERE to_tsvector(content) @@ plainto_tsquery(:q) LIMIT 50
          )
          SELECT d.id, d.content,
            COALESCE(1.0/(60 + s.rk), 0) + COALESCE(1.0/(60 + k.rk), 0) AS score
          FROM documents d
          LEFT JOIN semantic s ON s.id = d.id
          LEFT JOIN keyword k ON k.id = d.id
          WHERE s.rk IS NOT NULL OR k.rk IS NOT NULL
          ORDER BY score DESC LIMIT :k
        """),
        {"v": str(qvec), "q": query, "k": k},
    )
    return rows.mappings().all()
```

**Real-life Example:** Tu legal-doc Q&A bot bana raha hai. 50,000 contracts hain, har ek 100 pages. Chunk karke embeddings nikale — 5M vectors total. Postgres me pgvector pe HNSW index, hybrid search, metadata filters (`WHERE jurisdiction = 'India' AND year >= 2020`). Ek hi query me semantic + keyword + structured filter — Pinecone me yeh karne ke liye complex glue code likhna padta.

**Mermaid Diagram:**

```mermaid
graph TB
    Q[User Query] --> E[Embedding Model]
    E --> V[Query Vector]
    V --> PG[(Postgres + pgvector)]
    Q --> KW[BM25 / tsvector]
    KW --> PG
    PG --> HNSW[HNSW Index]
    HNSW --> Top[Top-K Docs]
    Top --> Rerank[Optional Reranker]
    Rerank --> LLM[LLM with Context]
```

**Interview Q&A:**

*Q: HNSW vs IVFFlat — kya farq hai?*
A: IVFFlat clustering-based hai (k-means se centroids), index jaldi build hota hai but recall thoda kam. HNSW graph-based hai — har vector ke neighbors maintain karta hai, recall 95%+, latency low, but build time aur memory zyada. Default HNSW use karo. IVFFlat tab use karo jab 10M+ vectors hain aur memory tight hai. Tuning: HNSW me `m=16, ef_construction=64` good defaults; query time `SET hnsw.ef_search = 100;` se recall vs speed tradeoff.

*Q: pgvector limits — kab Pinecone/Weaviate switch karoge?*
A: Practically pgvector 50M-100M vectors tak fine hai single instance pe (good hardware ke saath, 1536-dim). Beyond that latency 100ms+ jaane lagti hai. Tab dedicated vector DB (Pinecone, Qdrant, Weaviate, Milvus) — sharding, replication, hybrid query optimized. But honest truth: 95% startups kabhi 10M vectors bhi nahi cross karte. Premature optimization mat kar.

*Q: Embedding update kaise handle karoge agar document edit ho?*
A: Document update → re-embed → UPDATE row. But embeddings expensive hain (~$0.02 / 1M tokens for OpenAI). Optimization: content hash store kar (sha256). Update pe hash compare — agar same, skip embedding. Bulk migrations ke liye batched embedding (100 at a time) + Celery worker. Old embedding model deprecate hone par parallel column add karke gradual migration.

---

### 2.2 Redis (cache, queue, semantic cache)

**Definition:** Redis in-memory key-value store hai. AI workloads me 3 jagah use hota hai: (1) traditional cache (response cache), (2) semantic cache (embedding-based fuzzy match), (3) message broker (Celery/RQ ke liye). Plus pub/sub, streams, sorted sets — Swiss Army knife.

**Why:** LLM call expensive hai. Same prompt repeat aaya toh cache se serve kar — 100ms instead of 3000ms, $0 instead of $0.01. Semantic cache aur powerful: "What is RAG?" aur "Explain RAG" semantically same hain — embedding similarity match karke cached response return kar.

**How:**

```python
# app/cache.py
import redis.asyncio as aioredis
import hashlib
import json
import numpy as np

r = aioredis.from_url("redis://localhost", decode_responses=True)

# 1) Exact-match cache
async def cached_chat(prompt: str, llm) -> str:
    key = f"chat:{hashlib.sha256(prompt.encode()).hexdigest()}"
    cached = await r.get(key)
    if cached:
        return cached
    answer = await llm.chat(prompt)
    await r.setex(key, 3600, answer)  # 1 hour TTL
    return answer

# 2) Semantic cache via Redis Stack (RediSearch + vectors)
# Schema once:
"""
FT.CREATE idx:llmcache ON HASH PREFIX 1 sc:
  SCHEMA prompt TEXT response TEXT
  embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE
"""

async def semantic_cached(prompt: str, llm, embed_fn, threshold=0.95) -> str:
    qvec = np.array(await embed_fn(prompt), dtype=np.float32).tobytes()
    # KNN query
    res = await r.execute_command(
        "FT.SEARCH", "idx:llmcache",
        f"*=>[KNN 1 @embedding $vec AS score]",
        "PARAMS", "2", "vec", qvec,
        "RETURN", "2", "response", "score",
        "DIALECT", "2",
    )
    # Parse response (raw RediSearch format)
    if res[0] >= 1:
        fields = dict(zip(res[2][::2], res[2][1::2]))
        score = 1 - float(fields["score"])  # cosine distance → similarity
        if score >= threshold:
            return fields["response"]
    # Miss → call LLM, cache it
    answer = await llm.chat(prompt)
    key = f"sc:{hashlib.sha256(prompt.encode()).hexdigest()[:16]}"
    await r.hset(key, mapping={
        "prompt": prompt, "response": answer, "embedding": qvec,
    })
    return answer

# 3) Distributed lock — agent ke liye useful (one user = one running task)
async def acquire_lock(user_id: str, ttl=300) -> bool:
    return await r.set(f"lock:{user_id}", "1", nx=True, ex=ttl)

# 4) Streams — durable log of events
async def publish_event(stream: str, data: dict):
    await r.xadd(stream, {k: json.dumps(v) for k, v in data.items()})
```

**Real-life Example:** Customer support bot — top 100 questions same hote hain ("How to reset password?", "Where is my order?"). Semantic cache 70% queries free me serve kar deta hai. Saving: $5000/month → $1500/month at scale. Plus latency 50ms ho jaati hai (felt instant). Perplexity, Phind jaise products yeh aggressive caching karte hain.

**Mermaid Diagram:**

```mermaid
graph LR
    Q[Query] --> EMB[Embed Query]
    EMB --> SC{Semantic Cache<br/>cosine > 0.95?}
    SC -->|Hit| R1[Return cached]
    SC -->|Miss| EX{Exact Cache?}
    EX -->|Hit| R1
    EX -->|Miss| LLM[Call LLM]
    LLM --> Store[Store in Redis]
    Store --> R2[Return + cache]
```

**Interview Q&A:**

*Q: Cache invalidation strategy AI app me?*
A: TTL-based (simple, jaada koi case me thik). Versioning (prompt template change hua → version bump, naya namespace). Manual purge (admin endpoint). Semantic cache me threshold tuning critical — 0.99 = bahut strict (low hit rate), 0.85 = loose (wrong answers risk). A/B test karke 0.93-0.96 sweet spot. Queries jo personal data contain karti hain (user-specific), unhe cache mat kar — privacy + low hit rate.

*Q: Redis vs Memcached for AI cache?*
A: Redis jeet jata hai. Memcached pure key-value, Redis me data structures (hash, list, sorted set, stream, pub/sub, vector via RediSearch) hain. AI workflows me semantic cache, queue, distributed lock, rate limiting — sab Redis me hota hai. Memcached sirf simple cache. Redis Cluster scale karta hai 100s of GB tak. Use Redis.

*Q: Memory limit hit ho gaya — kya karoge?*
A: `maxmemory-policy` set karo — `allkeys-lru` (LRU evict) ya `volatile-ttl` (TTL wale pehle). LLM responses me bada saving hota hai compression se — `lz4` se 5x compress, slightly slower but worth it. Agar embeddings store kar rahe ho HASH me, woh memory-heavy hai — alag instance pe rakho, ya pgvector use karo. Monitoring: `redis-cli INFO memory`, alerts at 80%.

---

### 2.3 SQLite for local/edge

**Definition:** SQLite ek embedded SQL database hai — single file, no server. World ka most-deployed DB (har phone, browser me hai). AI me increasingly relevant: local-first apps, edge inference, on-device RAG, agent state for desktop tools.

**Why:** Tu CLI tool bana raha hai (think: Aider, Cursor's local cache), ya desktop app (Obsidian plugins), ya edge device — Postgres run karna overkill hai. SQLite zero-config, zero-network, transactional, full-text-search built-in (`fts5`), aur ab vector support bhi (`sqlite-vec` extension).

**How:**

```python
# app/local.py
import aiosqlite
import json
import numpy as np
import struct

DB = "agent.db"

async def init_db():
    async with aiosqlite.connect(DB) as db:
        await db.executescript("""
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            session_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_session ON messages(session_id);

          -- Full-text search
          CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts
          USING fts5(content, content='messages', content_rowid='id');

          -- Triggers to keep FTS in sync
          CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
            INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
          END;
        """)
        await db.commit()

async def save_msg(session: str, role: str, content: str):
    async with aiosqlite.connect(DB) as db:
        await db.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (?,?,?)",
            (session, role, content),
        )
        await db.commit()

async def search_history(query: str, limit: int = 10):
    async with aiosqlite.connect(DB) as db:
        async with db.execute(
            "SELECT m.id, m.content FROM messages_fts f "
            "JOIN messages m ON m.id = f.rowid "
            "WHERE messages_fts MATCH ? ORDER BY rank LIMIT ?",
            (query, limit),
        ) as cur:
            return await cur.fetchall()

# sqlite-vec for vectors (load extension)
async def init_vec():
    async with aiosqlite.connect(DB) as db:
        await db.enable_load_extension(True)
        await db.load_extension("vec0")  # sqlite-vec ext
        await db.execute("""
          CREATE VIRTUAL TABLE IF NOT EXISTS doc_vec USING vec0(
            embedding FLOAT[384]
          )
        """)
        await db.commit()

# WAL mode — concurrent reads while writing (must for any prod use)
async def configure():
    async with aiosqlite.connect(DB) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("PRAGMA synchronous=NORMAL;")
        await db.execute("PRAGMA cache_size=-64000;")  # 64MB cache
```

**Real-life Example:** Tu personal AI agent bana raha hai jo user ke local files index karta hai — emails, notes, PDFs. Cloud me nahi bhejna chahta privacy ke liye. SQLite + sqlite-vec + local embedding model (`all-MiniLM-L6-v2` ONNX) — sab on-device. Tools like Witsy, Khoj, Reor isi pattern pe bane hain. Same pattern Cursor uses for codebase indexing locally.

**Mermaid Diagram:**

```mermaid
graph LR
    App[Desktop App] --> SQLite[SQLite File]
    SQLite --> FTS[fts5 Full-Text]
    SQLite --> Vec[sqlite-vec]
    SQLite --> KV[Key-Value Tables]
    LocalLLM[llama.cpp / ONNX] --> App
    App --> User[User]
```

**Interview Q&A:**

*Q: SQLite production-grade hai?*
A: Bilkul, but specific use-cases me. Read-heavy single-server apps me SQLite Postgres se faster ho sakta hai (no network roundtrip, mmap'd file). Litestream / LiteFS use karke replication bhi mil sakta hai. But concurrent writes me locks lagte hain — multi-writer apps ke liye thik nahi. WAL mode mandatory (concurrent reads). AI use case: edge inference, single-tenant SaaS, local-first apps — perfect.

*Q: Vector search SQLite me really kaam karta hai?*
A: `sqlite-vec` extension (Alex Garcia ka) — pure C, brute-force scan with SIMD. 100K vectors tak sub-100ms. Beyond that ANN nahi hai (yet, IVF/HNSW WIP). Use cases: personal docs (10K-50K vectors), RAG demo, edge applications. Production scale (10M+) ke liye Postgres+pgvector ya dedicated vector DB.

*Q: SQLite me migrations kaise karoge?*
A: `alembic` works with SQLite (with limitations — ALTER COLUMN tricky hai, full table rebuild padta hai). Simpler approach: `PRAGMA user_version` based versioning, manual migration scripts. Atomic migrations ke liye each version ek transaction me run karo. Backup pehle hamesha — `cp agent.db agent.db.bak` (jab tak app paused hai ya `VACUUM INTO` use karo for hot backup).

---

## 3. Queues & Async Workflows

LLM calls 5-30 second le sakti hain. Agent workflows ghanton chal sakti hain. HTTP request-response me yeh fit nahi hota — timeout, retries, durability sab issues. Queues + workflow engines yeh solve karte hain.

### 3.1 Celery, RQ, Dramatiq

**Definition:** Yeh teen Python task queue libraries hain. Celery sabse mature (10+ years), feature-rich but heavy. RQ (Redis Queue) simple, Redis-only, great for simple use cases. Dramatiq middle ground — Celery jaisa lekin saaf API, fast.

**Why:** AI me background tasks: bulk embedding generation, document indexing, scheduled report generation, async email after agent run, fine-tuning job kickoff. HTTP layer pe yeh nahi karna chahiye — timeout, retries chahiye, observability chahiye, scaling separate chahiye.

**How (Celery):**

```python
# app/tasks.py
from celery import Celery
from celery.schedules import crontab

celery = Celery(
    "genai",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",  # results storage
)

celery.conf.update(
    task_acks_late=True,           # crash-resistant
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,  # important for long tasks
    task_time_limit=600,           # hard kill at 10 min
    task_soft_time_limit=540,      # graceful at 9 min
)

@celery.task(bind=True, max_retries=3, autoretry_for=(Exception,), retry_backoff=True)
def embed_document(self, doc_id: int):
    """Doc fetch karo, embed karo, save karo."""
    from app.rag import embed_sync, save_embedding
    try:
        text = fetch_doc(doc_id)
        vec = embed_sync(text)
        save_embedding(doc_id, vec)
    except Exception as e:
        # Auto-retry with exponential backoff
        raise self.retry(exc=e, countdown=2 ** self.request.retries)

# Chain — sequential pipeline
from celery import chain, group

@celery.task
def chunk_doc(doc_id):
    return [(doc_id, i, chunk) for i, chunk in enumerate(split_doc(doc_id))]

@celery.task
def embed_chunk(args):
    doc_id, idx, chunk = args
    return save_embedding(doc_id, idx, embed_sync(chunk))

# Pipeline: ingestion → chunk → embed (parallel) → notify
def index_doc(doc_id):
    return chain(
        chunk_doc.s(doc_id),
        group(embed_chunk.s(c) for c in [...]),  # fan-out
        notify_done.si(doc_id),
    )()

# Scheduled (Celery Beat)
celery.conf.beat_schedule = {
    "nightly-reindex": {
        "task": "app.tasks.reindex_changed",
        "schedule": crontab(hour=2, minute=0),
    }
}
```

FastAPI se trigger:

```python
@app.post("/index/{doc_id}")
async def trigger_index(doc_id: int):
    task = embed_document.delay(doc_id)
    return {"task_id": task.id, "status": "queued"}

@app.get("/task/{task_id}")
async def task_status(task_id: str):
    res = celery.AsyncResult(task_id)
    return {"status": res.status, "result": res.result if res.ready() else None}
```

**RQ alternative** (lightweight):

```python
from rq import Queue
from redis import Redis
q = Queue(connection=Redis())
job = q.enqueue(embed_document, doc_id=42, retry=Retry(max=3, interval=[10, 30, 60]))
```

**Real-life Example:** Notion AI me jab tu workspace import karta hai (10,000 pages), woh sab pages background me embed hoti hain. Agar HTTP me karte, timeout. Celery worker pool 50 concurrent embeddings karta hai, progress UI pe dikhta hai (websocket pe updates). Failure pe retry, partial progress saved.

**Mermaid Diagram:**

```mermaid
graph LR
    API[FastAPI] -->|enqueue| Broker[Redis Broker]
    Broker --> W1[Worker 1]
    Broker --> W2[Worker 2]
    Broker --> W3[Worker N]
    W1 --> LLM[LLM/Embedding API]
    W1 --> DB[(Postgres)]
    W1 -->|result| Result[Redis Result Backend]
    Beat[Celery Beat] -->|schedule| Broker
```

**Interview Q&A:**

*Q: Celery vs RQ vs Dramatiq — kab kya?*
A: Celery — complex workflows (chains, groups, chords), multi-broker (Redis, RabbitMQ, SQS), beat scheduler, big ecosystem. Heavy config, debugging mushkil. RQ — Redis only, simple API, great for small-medium projects, easy debugging. Dramatiq — modern alternative, type-safe, fast, fewer footguns than Celery. New project: Dramatiq for most cases. Already on AWS SQS: try Celery. Tiny app: RQ.

*Q: `acks_late` matlab kya hai aur kab use kare?*
A: Default me task worker ko diye jate hi "ack" ho jata hai broker ko. Worker crash ho jaye, task lost. `acks_late=True` se ack tabhi hota hai jab task complete hota hai. Crash hone par task waapas queue me. Long AI tasks me yeh mandatory hai. Saath me `task_reject_on_worker_lost=True` rakhna chahiye. Idempotent tasks design kar — same task 2 baar chal sakta hai.

*Q: Result backend kab use kare aur kab nahi?*
A: Agar result chahiye polling se, backend chahiye. But yeh extra Redis/DB pressure hai. Modern pattern: result backend ke bajay direct DB me final result store karo (`UPDATE document SET status='indexed'`), API woh DB se serve kare. Result backend sirf intermediate / temporary results ke liye. Webhook callback aur better — task done pe URL hit karo, polling avoid.

---

### 3.2 Temporal, Inngest (durable agent workflows)

**Definition:** Temporal aur Inngest "durable execution" engines hain. Tu workflow code likhta hai jaise normal function ho — saath me retries, state, scheduling, signals automatically handled. Crash → workflow exact same point se resume. AI agents (multi-step, long-running, human-in-the-loop) ke liye game-changer.

**Why:** Celery se ek agent workflow likhna nightmare hai — har step alag task, state DB me explicit save, retries manual, "wait for human approval for 3 days" jaisa pattern impossible. Temporal me yeh sab natural hai. AI startups (Replit, Hex, OpenAI's agent products internally) yeh pattern use karte hain.

**How (Temporal Python SDK):**

```python
# app/workflows.py
from datetime import timedelta
from temporalio import workflow, activity
from temporalio.client import Client
from temporalio.worker import Worker

# Activities — side-effectful operations (LLM calls, DB writes)
@activity.defn
async def search_web(query: str) -> list[str]:
    # Real call to search API
    return ["url1", "url2"]

@activity.defn
async def fetch_page(url: str) -> str:
    # HTTP fetch
    return f"content of {url}"

@activity.defn
async def llm_summarize(texts: list[str], goal: str) -> str:
    # Call OpenAI
    return "summary"

@activity.defn
async def send_email(to: str, body: str) -> None:
    pass

# Workflow — orchestration logic, MUST be deterministic
@workflow.defn
class ResearchAgent:
    def __init__(self):
        self.approved = False

    @workflow.signal
    def approve(self):
        self.approved = True

    @workflow.run
    async def run(self, topic: str, user_email: str) -> str:
        # Step 1: search
        urls = await workflow.execute_activity(
            search_web, topic,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=workflow.RetryPolicy(maximum_attempts=3),
        )

        # Step 2: parallel fetch (fan-out)
        contents = await asyncio.gather(*[
            workflow.execute_activity(
                fetch_page, url,
                start_to_close_timeout=timedelta(seconds=15),
            ) for url in urls
        ])

        # Step 3: summarize
        draft = await workflow.execute_activity(
            llm_summarize, contents, topic,
            start_to_close_timeout=timedelta(minutes=2),
        )

        # Step 4: human approval — wait up to 3 days
        await workflow.wait_condition(
            lambda: self.approved,
            timeout=timedelta(days=3),
        )

        # Step 5: send
        await workflow.execute_activity(
            send_email, user_email, draft,
            start_to_close_timeout=timedelta(seconds=30),
        )
        return draft

# Worker process
async def main():
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client, task_queue="ai-agents",
        workflows=[ResearchAgent],
        activities=[search_web, fetch_page, llm_summarize, send_email],
    )
    await worker.run()

# Trigger from FastAPI
@app.post("/research")
async def start_research(topic: str, user_email: str):
    client = await Client.connect("localhost:7233")
    handle = await client.start_workflow(
        ResearchAgent.run, args=[topic, user_email],
        id=f"research-{uuid.uuid4()}", task_queue="ai-agents",
    )
    return {"workflow_id": handle.id}

@app.post("/research/{wf_id}/approve")
async def approve(wf_id: str):
    client = await Client.connect("localhost:7233")
    await client.get_workflow_handle(wf_id).signal(ResearchAgent.approve)
    return {"ok": True}
```

**Inngest** ek alternative hai (TypeScript-first but Python SDK exists), serverless-friendly, simpler mental model.

**Real-life Example:** AI coding agent (think SWE-agent ya Devin clone) — analyze repo → plan changes → write code → run tests → fix failures → make PR. 30 minutes ka workflow, har step LLM + tools. Server crash ho? Temporal resume kare. Test fail → retry. Human review pe wait. Without Temporal, tu apna mini-Temporal banayega and fail karega.

**Mermaid Diagram:**

```mermaid
graph TB
    API[Trigger /research] --> WF[Temporal Workflow]
    WF --> A1[Activity: search_web]
    A1 -->|retry on fail| A1
    WF --> A2[Activity: fetch_page x N parallel]
    WF --> A3[Activity: llm_summarize]
    WF --> S{Wait for Signal<br/>up to 3 days}
    S -->|approve| A4[Activity: send_email]
    S -.->|timeout| Cancel
    History[Event History persisted in DB]
    WF -.persist.- History
    Crash[Worker Crash] -.replay from History.- WF
```

**Interview Q&A:**

*Q: Temporal "durable" kaise hai exactly?*
A: Workflow code ek event history me record hota hai (Postgres/Cassandra). Har activity call, har sleep, har signal — sab persisted. Worker crash ho? Naya worker history replay karke exact state recreate karta hai, jahan se ruka tha continue. Yeh "deterministic replay" hai — workflow code me random, time, network calls direct nahi kar sakte (only via activities). Bug fix me thoda sa overhead, but reliability worth it.

*Q: Temporal vs Celery — overlap nahi hai?*
A: Overlap hai but mental model alag. Celery = "tasks" (single units of work). Temporal = "workflows" (orchestrations of tasks). Celery me complex multi-step + human-in-loop + days-long flows pain me likhne padte hain explicit state machines se. Temporal me normal Python looks. Use Celery for fire-and-forget background tasks. Use Temporal for stateful long-running orchestrations. AI agents → Temporal hands down.

*Q: Production setup kaisa hota hai Temporal ka?*
A: Self-hosted: Temporal cluster (Frontend, History, Matching, Worker services) + Postgres/Cassandra + ElasticSearch (for search). Heavy. Better: Temporal Cloud (managed), pay-per-use. Workers tere apne infra pe (kahaani LLM, secrets, etc.). Inngest cloud-native version aur simpler hai for serverless setups, fewer features but lower bar to entry.

---

### 3.3 Redis, RabbitMQ, Kafka

**Definition:** Yeh teen message brokers / streaming systems hain. Redis (in-memory, simple lists + streams), RabbitMQ (AMQP, smart routing, classic message broker), Kafka (distributed log, high throughput, event sourcing). Queue layer ka backbone — Celery/Dramatiq/Temporal in pe rely karte hain.

**Why:** AI workloads me events flow karte hain — user query → preprocess → embed → search → LLM → stream → log. Different stages decouple karne ke liye broker chahiye. Plus event sourcing — "har user query Kafka topic me, downstream consumers feature compute, model fine-tune, analytics."

**How comparison:**

```python
# 1) Redis as broker (lists + streams)
import redis.asyncio as aioredis
r = aioredis.from_url("redis://localhost")

# Producer: list-based queue
await r.lpush("queue:embed", json.dumps({"doc_id": 42}))

# Consumer
while True:
    _, raw = await r.brpop("queue:embed", timeout=10)
    msg = json.loads(raw)
    process(msg)

# Streams (more durable, consumer groups)
await r.xadd("events", {"type": "query", "user": "u1", "text": "hi"})
# Consumer group reads:
# XREADGROUP GROUP grp1 consumer1 COUNT 10 STREAMS events >

# 2) RabbitMQ (aiopika)
import aio_pika
conn = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
ch = await conn.channel()
exchange = await ch.declare_exchange("ai", aio_pika.ExchangeType.TOPIC)

# Producer: routing key based
await exchange.publish(
    aio_pika.Message(body=json.dumps({"doc": 42}).encode()),
    routing_key="ai.embed.urgent",
)

# Consumer subscribes to pattern
queue = await ch.declare_queue("embed_workers", durable=True)
await queue.bind(exchange, routing_key="ai.embed.*")
async with queue.iterator() as q:
    async for msg in q:
        async with msg.process():
            handle(json.loads(msg.body))

# 3) Kafka (aiokafka)
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer

producer = AIOKafkaProducer(bootstrap_servers="localhost:9092")
await producer.start()
await producer.send("user-queries", json.dumps({"user": "u1", "q": "hi"}).encode())

consumer = AIOKafkaConsumer(
    "user-queries",
    group_id="embedding-pipeline",
    bootstrap_servers="localhost:9092",
    enable_auto_commit=False,
)
await consumer.start()
async for msg in consumer:
    await embed_and_store(msg.value)
    await consumer.commit()  # at-least-once delivery
```

**Real-life Example:**
- **Redis Streams** for ChatGPT-clone: every chat message → stream → consumers compute embeddings, run safety filter, log to analytics — all parallel.
- **RabbitMQ** for routing: priority queues ("urgent" model uses GPT-4, "background" uses GPT-4o-mini), dead-letter queues for failed messages.
- **Kafka** for OpenAI-scale: trillions of tokens/day, every API call event → Kafka → downstream feature stores, fine-tuning pipelines, billing aggregation, fraud detection. Replay-able log = killer feature.

**Mermaid Diagram:**

```mermaid
graph LR
    P[Producer] --> Redis[Redis<br/>simple, fast<br/>~100K msg/s]
    P --> Rabbit[RabbitMQ<br/>routing, AMQP<br/>~50K msg/s]
    P --> Kafka[Kafka<br/>distributed log<br/>~1M+ msg/s]
    Redis --> C1[Single consumer]
    Rabbit --> C2[Multiple workers<br/>by routing key]
    Kafka --> C3[Multiple consumer groups<br/>independent offsets<br/>replay history]
```

**Interview Q&A:**

*Q: Kab Redis, kab RabbitMQ, kab Kafka?*
A: Redis — simple queues, low-latency, low-medium volume, you already have Redis. RabbitMQ — complex routing (topics, fanout, headers), classic enterprise messaging, work queues with smart routing. Kafka — high throughput, event sourcing, replay needed, multiple independent consumers, integration with Spark/Flink for stream processing. AI rule of thumb: start with Redis Streams, graduate to Kafka when scale demands.

*Q: At-least-once vs at-most-once vs exactly-once?*
A: At-most-once: send and forget — message lost on failure (logs, metrics). At-least-once: ack after processing — duplicates possible (must be idempotent). Exactly-once: theoretically impossible in distributed systems but Kafka provides "effectively-once" via idempotent producers + transactional consumers. AI tasks usually at-least-once + idempotency keys (e.g., `request_id` me dedupe karo, embedding compute idempotent hai naturally).

*Q: Kafka me partition strategy AI workloads ke liye?*
A: Partition key matters — same key always same partition (ordering guarantee). User queries pe `user_id` se partition kar — ek user ke messages order me process hon. But hot user → hot partition. Skewed load. Better: composite key (`user_id + session_id`) ya consistent hashing. Embedding pipeline ke liye `doc_id` se partition. Partition count carefully choose — increase easy, decrease impossible without data migration.

---

## Resources & further reading

- **FastAPI docs** — fastapi.tiangolo.com (especially advanced section: dependency injection, middlewares, websockets)
- **SQLAlchemy 2.0 tutorial** — docs.sqlalchemy.org (the "unified tutorial")
- **asyncpg docs** — magicstack.github.io/asyncpg
- **Pydantic v2 docs** — docs.pydantic.dev
- **pgvector** — github.com/pgvector/pgvector + supabase.com/blog/openai-embeddings-postgres-vector
- **Redis Stack / RediSearch** — redis.io/docs/stack (vector search)
- **sqlite-vec** — github.com/asg017/sqlite-vec (Alex Garcia)
- **Litestream** — litestream.io (SQLite replication)
- **Celery best practices** — docs.celeryq.dev + denibertovic.com/posts/celery-best-practices
- **Temporal Python SDK** — docs.temporal.io/dev-guide/python
- **Inngest** — inngest.com/docs (Python and TS)
- **Kafka: The Definitive Guide** (book) — Gwen Shapira et al.
- **Designing Data-Intensive Applications** — Martin Kleppmann (foundational; chapter 11 on streams is gold)
- **Building LLM Applications for Production** — Chip Huyen (blog + book)
- **Anyscale's Ray Serve** docs — for advanced LLM serving patterns
- **FastAPI + LLM streaming** — github.com/tiangolo/fastapi/discussions search "streaming"
- **OpenAI Cookbook** — github.com/openai/openai-cookbook (production patterns)
- **Hugging Face Text Generation Inference** — for self-hosted LLM serving with proper streaming
- **Instructor** library — github.com/jxnl/instructor (Pydantic + LLM structured outputs)
- **LangGraph** — for stateful agent graphs (compatible with Temporal patterns)

Final advice bhai — backend skill compounding hai. FastAPI + Postgres + Redis + Celery aaj seekh, agle 10 saal AI ka stack chahe jo ho, yahi cheezein production me chalengi. Models replaceable hain, infrastructure nahi. Ab terminal khol, `uv venv` chala, aur kuch bana ke dikha. Reading is not coding. Jaa.
