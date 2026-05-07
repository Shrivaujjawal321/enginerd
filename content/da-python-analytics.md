# Python for Analytics

Dekh bhai, SQL tujhe answer de sakta hai jab data warehouse mein already structured baitha ho — par real life mein 60% data ya toh CSV mein hai, ya Excel ke 17 sheets mein bikhra hai, ya kisi API se JSON aa raha hai jise koi data engineer parse karne ka time nahi rakhta. Yahin pe Python tera daily driver banta hai. Pandas + NumPy + cleaning + EDA + visualization — ye chaar pillars tujhe SQL-clerk se actual analyst banate hain. ML nahi, ML alag baby hai — ye production-grade analytics Python hai jo har Top 2% analyst Monday morning 10 baje khol ke baithta hai.

Iss subject mein tu seekhega: core Python jo analyst ke liye must hai (typing, comprehensions, error handling), Pandas ki saari power moves (GroupBy, merge, pivot, time series, memory tricks), NumPy ka vectorization mantra, data cleaning ka asli battlefield (missing data, outliers, duplicates, encoding hell), aur EDA + visualization jo CEO ko convince karne ke liye chahiye. Saath mein Polars bhi — kyunki 2026 mein Pandas akele zinda nahi rehta jab tu 50M rows pe kaam karta hai.

Real talk — agar tu Python ko sirf "for loop chala dunga" tarike se use kar raha hai toh tu 100x slow chala raha hai. Vectorization, broadcasting, columnar dtype optimization — ye small cheezein production mein 10 ghante ke job ko 6 minute ka bana deti hain. Iss subject ko complete kar, Indian unicorns ka data tere haath mein paani ki tarah behega.

---

## 1. Core Python for Analysts

Python ke base layer ko ignore karne wala analyst pehle 6 mahine mein toot jaata hai. Tujhe na sirf syntax, balki idioms, performance traps, aur clean-code practices aana chahiye.

### 1.1 Data types, control flow, comprehensions

#### Definition (kya hai?)

Python mein primitive types — `int`, `float`, `str`, `bool`, `None` — aur container types — `list`, `tuple`, `set`, `dict`. Control flow matlab `if/elif/else`, `for`, `while`. Comprehensions ek concise tarika hai list/dict/set banane ka — ek line mein, fast aur readable.

#### Why?

Analyst ka 80% Python code data ko shape karne mein jaata hai — filter, map, transform. `for` loop mein 1M rows iterate karna analyst-level crime hai. List/dict comprehensions cleaner hain, 30-50% faster (because of optimized C-level iteration), aur readable. `set` lookup O(1) hota hai vs `list` O(n) — agar tu 50K user_ids check kar raha hai membership ke liye, set use kar.

#### How (with code)

```python
# Swiggy orders — list of dicts
orders = [
    {"order_id": 1, "city": "BLR", "gmv": 450, "status": "delivered"},
    {"order_id": 2, "city": "DEL", "gmv": 320, "status": "cancelled"},
    {"order_id": 3, "city": "BLR", "gmv": 780, "status": "delivered"},
    {"order_id": 4, "city": "MUM", "gmv": 210, "status": "delivered"},
]

# List comprehension — only delivered orders
delivered = [o for o in orders if o["status"] == "delivered"]

# Dict comprehension — city-wise GMV total
city_gmv = {c: sum(o["gmv"] for o in orders if o["city"] == c and o["status"] == "delivered")
            for c in {o["city"] for o in orders}}

print(city_gmv)
# {'BLR': 1230, 'DEL': 0, 'MUM': 210}

# Set for O(1) membership lookup
vip_users = {101, 205, 309, 412}
is_vip = [uid in vip_users for uid in [101, 999, 309]]
print(is_vip)  # [True, False, True]
```

#### Real-life Example

BigBasket ka analyst 5L SKU ke availability check ke liye `for` loop laga ke 12 second laga raha tha — set comprehension mein convert kiya, 0.4 second. Dashboard refresh time 30 second se 8 second ho gaya.

#### Diagram

```mermaid
graph LR
    A[Raw Iterable] --> B{Comprehension}
    B --> C[List Comp: ordered]
    B --> D[Dict Comp: key-value]
    B --> E[Set Comp: unique]
    C --> F[O(n) memory + speed]
    D --> F
    E --> G[O(1) lookup later]
```

#### Interview Question

**Q:** Tu 1M orders ka list rakhta hai, aur har order ke liye check karna hai ki user "active subscribers" set mein hai ya nahi. Kaise karega aur kyu?

**A:** Active subscribers ko `set` mein convert karunga (O(1) lookup). Phir list comprehension ya generator expression: `[o for o in orders if o["user_id"] in active_set]`. Agar `active_subscribers` list rehti, har lookup O(n) hota — total O(n×m) = 1M × 100K = 100 billion ops, hours laga deta. Set ke saath O(n) = 1M ops, sub-second. Generator expression bhi prefer karunga agar memory tight hai — lazy evaluation, sirf jab consume hote hain tab compute hota hai.

---

### 1.2 Functions, lambdas, *args/**kwargs

#### Definition (kya hai?)

`def` se named function banate hain. `lambda` ek expression-level anonymous function hai (single line). `*args` matlab variable positional arguments tuple ke roop mein, `**kwargs` matlab variable keyword arguments dict ke roop mein.

#### Why?

Reusable analyst code function ke bina chaos hai. Lambdas Pandas `.apply()` aur sorting mein kaam aate hain. `*args/**kwargs` flexible utility wrappers banane ke liye essential hain — e.g., generic logger, retry decorator, config-driven pipeline.

#### How (with code)

```python
# Named function — reusable
def calc_take_rate(gmv: float, commission: float) -> float:
    """Razorpay-style take rate calculation."""
    if gmv == 0:
        return 0.0
    return commission / gmv

print(calc_take_rate(1000, 22))  # 0.022

# Lambda for sorting orders by GMV descending
orders = [{"id": 1, "gmv": 450}, {"id": 2, "gmv": 780}, {"id": 3, "gmv": 210}]
top = sorted(orders, key=lambda o: o["gmv"], reverse=True)
print(top[0])  # {'id': 2, 'gmv': 780}

# *args / **kwargs — flexible reporter
def report(*metrics, **filters):
    print(f"Metrics: {metrics}")
    print(f"Filters: {filters}")

report("gmv", "orders", "users", city="BLR", date="2026-04-30")
# Metrics: ('gmv', 'orders', 'users')
# Filters: {'city': 'BLR', 'date': '2026-04-30'}
```

#### Real-life Example

Flipkart ke pricing analyst ne ek `compute_discount(*products, **rules)` function banaya jo arbitrary number of products aur arbitrary discount rules accept karta hai (festival, loyalty, volume). Same function Big Billion Days, Republic Day, aur regular pricing teeno mein reuse hua — DRY win.

#### Diagram

```mermaid
graph TD
    A[Function Call] --> B{Args type}
    B --> C[Positional → tuple via *args]
    B --> D[Keyword → dict via **kwargs]
    C --> E[Loop / unpack]
    D --> E
    E --> F[Return result]
```

#### Interview Question

**Q:** Lambda vs `def` — kab kaunsa use karega?

**A:** Lambda for one-line, throwaway, expression-only functions — typically `sorted(key=...)`, `pandas.apply(...)`, `filter(...)`. `def` for anything multi-line, reused, or that needs documentation/type-hints/testing. Top 2% analyst lambda ko Pandas `.apply()` mein bhi cautiously use karta hai — vectorized solution exist karta hai toh lambda avoid, kyunki `.apply(lambda)` row-wise loop hai aur 10-100x slower hota hai vectorized vs `df["col"] * 2` ya `np.where` ke comparison mein.

---

### 1.3 File I/O, error handling, virtual envs (uv/venv)

#### Definition (kya hai?)

File I/O matlab `open()` se files read/write karna — `with` block use karte hain auto-close ke liye. Error handling `try/except/finally` se hota hai. Virtual env isolated Python environment hai — har project ke apne dependencies. `uv` 2024-25 ka modern, Rust-based, 10-100x faster replacement hai `pip + venv` ka.

#### Why?

Production analyst CSV/JSON/Parquet roz padhta hai. Bina error handling — ek corrupt row poora pipeline crash kar deti hai. Virtual env nahi use karega toh `pandas==1.5` aur `pandas==2.2` requirements alag projects mein clash karenge. `uv` aaya hai because `pip install` 5 minute lagaata tha — `uv pip install` 10 second.

#### How (with code)

```python
import json
from pathlib import Path

# File I/O with context manager — auto closes
def load_orders(path: str) -> list[dict]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data["orders"]
    except FileNotFoundError:
        print(f"[WARN] {path} not found, returning empty")
        return []
    except json.JSONDecodeError as e:
        print(f"[ERROR] Bad JSON in {path}: {e}")
        return []

orders = load_orders("zomato_orders.json")

# Pathlib for cross-platform paths
data_dir = Path("/data/swiggy")
csv_files = list(data_dir.glob("*.csv"))
```

```bash
# Virtual env with uv (modern, fast)
uv venv .venv
source .venv/bin/activate
uv pip install pandas numpy polars matplotlib seaborn

# Or classic
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Real-life Example

Zomato data team ne `pip install` se `uv pip install` migrate kiya — CI pipeline ka dependency-install step 4 min se 18 sec ho gaya. Daily 200 CI runs × saved 3.5 min = 11 hours/day developer time saved.

#### Diagram

```mermaid
graph TD
    A[Project] --> B[uv venv .venv]
    B --> C[Activate]
    C --> D[uv pip install deps]
    D --> E[Run script]
    E --> F{Error?}
    F -- FileNotFound --> G[Log + default value]
    F -- ParseError --> H[Log + skip row]
    F -- OK --> I[Continue]
```

#### Interview Question

**Q:** `try/except: pass` likhna kab dangerous hai aur kab acceptable?

**A:** Bare `except: pass` matlab silent failure — bug invisible ho jaata hai aur weeks baad pakda jaata hai jab CFO ko revenue 5% kam dikh raha ho. Acceptable: jab tu deliberately specific error ko ignore kar raha hai (e.g., `except FileNotFoundError: continue` in batch loop) AND log karta hai. Top 2% analyst always: (a) catch specific exceptions (`FileNotFoundError`, `KeyError`, `ValueError`) — never bare `except`; (b) log with context (which file, which row); (c) decide — fail loud (raise) ya graceful degrade (default value). Production pipelines mein silent failures audit ka biggest source hain.

---

### 1.4 Type hints — typing, TypedDict for clean code

#### Definition (kya hai?)

Type hints Python 3.5+ ka feature — variables, function args, return types ko annotate karte hain. Runtime pe enforce nahi hote (Python dynamic hai), but `mypy`/`pyright` se static check hota hai. `TypedDict` (PEP 589) dict ke shape ko strictly type karne ke liye hai.

#### Why?

Analyst ke code ko 6 mahine baad koi aur padhega (ya tu khud bhool jaayega). Type hints documentation + IDE autocomplete + bug catch karte hain. Production data pipelines mein TypedDict misspelled key (`"user_id"` vs `"userid"`) jaise bugs CI mein pakad leta hai — runtime crash se pehle.

#### How (with code)

```python
from typing import TypedDict, Optional
import pandas as pd

class OrderRow(TypedDict):
    order_id: int
    user_id: int
    gmv: float
    city: str
    promo_code: Optional[str]

def filter_high_value(orders: list[OrderRow], threshold: float = 500.0) -> list[OrderRow]:
    """Return orders with gmv >= threshold."""
    return [o for o in orders if o["gmv"] >= threshold]

# Pandas-aware typing
def aggregate_city_gmv(df: pd.DataFrame) -> pd.DataFrame:
    return df.groupby("city", as_index=False)["gmv"].sum()

orders: list[OrderRow] = [
    {"order_id": 1, "user_id": 101, "gmv": 450.0, "city": "BLR", "promo_code": None},
    {"order_id": 2, "user_id": 102, "gmv": 780.0, "city": "MUM", "promo_code": "FIRST50"},
]

high = filter_high_value(orders, threshold=500)
print(high)
# [{'order_id': 2, 'user_id': 102, 'gmv': 780.0, 'city': 'MUM', 'promo_code': 'FIRST50'}]
```

#### Real-life Example

Paytm ke fraud analyst team ne TypedDict adopt kiya — pehle ek bug mein "amount" key kabhi paise mein, kabhi rupees mein aata tha. Type hint + assertion add kiye, ek month mein 11 bugs CI mein pakde gaye production crash hone se pehle.

#### Diagram

```mermaid
graph LR
    A[Raw dict] --> B[TypedDict spec]
    B --> C[mypy / pyright check]
    C -- Pass --> D[Production]
    C -- Fail --> E[Fix before merge]
    D --> F[IDE autocomplete + docs free]
```

#### Interview Question

**Q:** Pandas DataFrame ko type hint kaise kare? `df: pd.DataFrame` enough hai?

**A:** `pd.DataFrame` toh kuch nahi batata kaunse columns hain. Modern stack mein options: (a) `pandera` library — schema-based validation with pandas dataframes; (b) `pydantic.BaseModel` ya `TypedDict` for "row schema", aur dataframe ko `pd.DataFrame[OrderSchema]` annotate karte hain pandera ke saath; (c) Polars LazyFrame — built-in schema enforcement. Top 2% analyst pandera use karta production mein — failed schema = pipeline failure, not silent corruption. `df: pd.DataFrame` sirf basic IDE hint deta hai, runtime safety nahi.

---

## 2. Pandas Mastery

Pandas analyst ka oxygen hai. Lekin 80% Pandas users 20% capability use karte hain — top 2% iska 80% jaante hain.

### 2.1 Series, DataFrames, Index

#### Definition (kya hai?)

`Series` ek 1D labeled array hai (kind of like a column with an index). `DataFrame` 2D table hai — multiple Series sharing the same Index. `Index` row labels hain — default 0,1,2... but custom (date, user_id) bhi ho sakta hai. Index unique nahi hota by default.

#### Why?

Index ka power samajhna critical hai — `.loc` Index pe lookup karta hai (fast), join/merge Index pe align karte hain, time series Index DateTime hota hai for `resample()`. Galat Index = galat results.

#### How (with code)

```python
import pandas as pd

# Series
s = pd.Series([450, 780, 210, 320], index=["o1", "o2", "o3", "o4"], name="gmv")
print(s["o2"])  # 780

# DataFrame
df = pd.DataFrame({
    "order_id": ["o1", "o2", "o3", "o4"],
    "user_id": [101, 102, 101, 103],
    "gmv": [450, 780, 210, 320],
    "city": ["BLR", "MUM", "BLR", "DEL"],
})
df = df.set_index("order_id")
print(df)
#           user_id  gmv city
# order_id
# o1            101  450  BLR
# o2            102  780  MUM
# o3            101  210  BLR
# o4            103  320  DEL

# Sorting by Index
df_sorted = df.sort_index()
```

#### Real-life Example

Razorpay analyst transaction_id ko Index banaya — 10M rows ka lookup `df.loc["txn_abc"]` 50 microsec mein. Pehle `df[df.transaction_id == "txn_abc"]` 800ms tha because full scan. 16000x faster.

#### Diagram

```mermaid
graph TD
    A[DataFrame] --> B[Index: row labels]
    A --> C[Columns: Series each]
    B --> D[.loc lookup O log n if sorted]
    C --> E[dtype per column]
    E --> F[int64, float64, category, datetime64, object]
```

#### Interview Question

**Q:** `df.reset_index()` aur `df.set_index()` kab use karega?

**A:** `set_index` jab tu kisi column ko row label banana chahta hai — fast lookups, joins, aur time-series operations ke liye. Common: `df.set_index("order_date")` to use `.resample("D")`. `reset_index` jab tu Index ko regular column wapas banana chahta hai — typical post-groupby (`groupby` returns grouped column as index, reset karke flat dataframe banta hai for plotting/export). Multi-index ke saath `reset_index(level=0)` bhi useful hai. Common bug: groupby ke baad bhul jaana ki Index naya hai aur `df["city"]` kaam nahi karega.

---

### 2.2 Read/write — CSV, Excel, Parquet, SQL, JSON

#### Definition (kya hai?)

Pandas ka `read_*` family — `read_csv`, `read_excel`, `read_parquet`, `read_sql`, `read_json`. Har format ke trade-offs hain — CSV human-readable but slow + dtype-loose, Parquet columnar + compressed + dtype-preserved (10-100x smaller, 5-50x faster), Excel slow but business-friendly.

#### Why?

Top 2% analyst kabhi production pipeline mein CSV nahi rakhta — Parquet rakhta hai. CSV "300 kar diya" — Parquet `int64`, `category`, `datetime64[ns]` properly preserve karta hai. Saath 80% smaller file = S3 cost saving.

#### How (with code)

```python
import pandas as pd

# CSV — most common but slow
df = pd.read_csv("flipkart_orders.csv", parse_dates=["order_date"], dtype={"user_id": "int64"})

# Parquet — production-grade
df.to_parquet("flipkart_orders.parquet", compression="snappy", index=False)
df2 = pd.read_parquet("flipkart_orders.parquet")

# Excel — multi-sheet
with pd.ExcelWriter("monthly_report.xlsx") as w:
    df.head(100).to_excel(w, sheet_name="Top100", index=False)
    df.groupby("city")["gmv"].sum().to_excel(w, sheet_name="CityWise")

# SQL — directly from BigQuery / Postgres
import sqlalchemy as sa
engine = sa.create_engine("postgresql://user:pass@host/db")
df = pd.read_sql("SELECT * FROM orders WHERE order_date >= '2026-01-01'", engine)

# JSON — nested events
df = pd.read_json("swiggy_events.jsonl", lines=True)
```

| Format | Size | Read speed | Schema |
|--------|------|------------|--------|
| CSV    | 1.0x | 1x         | None   |
| Excel  | 0.6x | 0.3x       | None   |
| JSON   | 1.4x | 0.8x       | Loose  |
| Parquet| 0.15x| 8x         | Strict |

#### Real-life Example

Meesho analytics team ne 12 GB CSV ko Parquet mein convert kiya — file 1.4 GB ho gayi. S3 cost month ka ₹40K se ₹5K ho gaya. Daily report job 22 min se 3 min ho gaya. Quarterly ₹4 lakh saving.

#### Diagram

```mermaid
graph LR
    A[Source] --> B{Format}
    B -- Operational --> C[Excel/CSV]
    B -- Production --> D[Parquet]
    B -- Live App --> E[SQL]
    B -- Logs/Events --> F[JSON Lines]
    D --> G[Columnar + Compressed]
    G --> H[Fast Analytics]
```

#### Interview Question

**Q:** 50 GB ka CSV file hai, 8 GB RAM laptop pe analysis karna hai. Strategy?

**A:** (a) `pd.read_csv(chunk_size=100_000)` — chunks mein process, aggregate karke save; (b) Convert to Parquet first via Polars or `pyarrow` streaming — Parquet ko column-wise read kar sakte hain, sirf needed columns load karo (`pd.read_parquet(columns=["user_id","gmv"])`); (c) Switch to Polars `scan_parquet` — lazy, automatic chunking; (d) Push down to DuckDB — `duckdb.query("SELECT ... FROM 'file.csv'")` queries CSV without loading. Top 2% always converts to Parquet first — 50 GB CSV often becomes 6 GB Parquet, fits in RAM directly.

---

### 2.3 .loc, .iloc, boolean masks, .query()

#### Definition (kya hai?)

`.loc[row_label, col_label]` — label-based indexing. `.iloc[row_pos, col_pos]` — integer position-based. Boolean masks — `df[df["gmv"] > 500]` style filtering. `.query("gmv > 500 and city == 'BLR'")` — string-based filter, sometimes more readable.

#### Why?

Galat indexer = silent bugs. `.loc` aur `.iloc` ka confusion top 5 Pandas bugs mein hai — Index integer ho aur `.iloc[5]` use kare, kabhi galat row aati hai. `.query()` complex filters ke liye readable, faster bhi (uses numexpr).

#### How (with code)

```python
import pandas as pd

df = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105],
    "city": ["BLR", "MUM", "BLR", "DEL", "BLR"],
    "gmv": [450, 780, 210, 320, 990],
    "promo": [True, False, True, False, True],
}).set_index("order_id")

# .loc — label based
print(df.loc[103])  # row with index 103

# .iloc — position based
print(df.iloc[0])   # first row regardless of index

# Boolean mask — most common
mask = (df["gmv"] > 400) & (df["city"] == "BLR")
print(df[mask])
#           city  gmv  promo
# order_id
# 101        BLR  450   True
# 105        BLR  990   True

# .query — readable for complex filters
print(df.query("gmv > 400 and city == 'BLR' and promo == True"))

# Chained selection — .loc with both axes
print(df.loc[df["gmv"] > 500, ["city", "gmv"]])
```

#### Real-life Example

Zomato analyst ne `df[df.gmv > 500][df.city == "BLR"]` (chained) likha — `SettingWithCopyWarning` aaya, downstream update silently failed. Switch to `df.loc[(df.gmv > 500) & (df.city == "BLR")]` — bug fixed, performance 3x better.

#### Diagram

```mermaid
graph TD
    A[Need to filter/select?] --> B{What do you have?}
    B -- Row labels --> C[.loc]
    B -- Row positions --> D[.iloc]
    B -- Conditions --> E[.loc with boolean mask]
    B -- Complex string expr --> F[.query]
    E --> G[Avoid chained []]
```

#### Interview Question

**Q:** `df[df.col == 5]["new_col"] = 10` kyu galat hai aur kya use karega?

**A:** Ye chained indexing hai — pehla `df[df.col == 5]` ek temporary copy/view returns karta hai (Pandas decide karta hai), uspe assignment SettingWithCopy warning deta hai aur original df update ho bhi sakta hai, nahi bhi. Silent bug. Correct: `df.loc[df.col == 5, "new_col"] = 10` — single `.loc` call, both row mask aur column together, guaranteed in-place. Top 2% rule: write se pehle filter ho raha hai toh hamesha `.loc[mask, col]` form.

---

### 2.4 GroupBy mechanics — split-apply-combine

#### Definition (kya hai?)

GroupBy ka mantra: **split** rows by key, **apply** function to each group, **combine** results. Hadley Wickham + Wes McKinney ka core abstraction. `df.groupby("city")["gmv"].sum()` — split by city, apply sum, combine into Series.

#### Why?

90% analytics queries GroupBy hain — "city-wise revenue", "user-wise frequency", "month-wise growth". GroupBy mastery = analyst speed. Bina iske tu nested for loops likhega, 100x slow.

#### How (with code)

```python
import pandas as pd

df = pd.DataFrame({
    "city": ["BLR", "BLR", "MUM", "MUM", "DEL", "BLR"],
    "category": ["Food", "Grocery", "Food", "Food", "Grocery", "Grocery"],
    "gmv": [450, 200, 780, 320, 150, 600],
    "user_id": [1, 2, 1, 3, 4, 2],
})

# Single agg
print(df.groupby("city")["gmv"].sum())
# city
# BLR    1250
# DEL     150
# MUM    1100

# Multi-agg — named aggs (modern, clean)
result = df.groupby("city").agg(
    total_gmv=("gmv", "sum"),
    unique_users=("user_id", "nunique"),
    avg_order=("gmv", "mean"),
    n_orders=("gmv", "count"),
).reset_index()
print(result)
#   city  total_gmv  unique_users  avg_order  n_orders
# 0  BLR       1250             2     416.67         3
# 1  DEL        150             1     150.00         1
# 2  MUM       1100             2     550.00         2

# Multi-key groupby
print(df.groupby(["city", "category"])["gmv"].sum())
```

#### Real-life Example

BigBasket ka analyst city × category × week-level GMV grid 5 levels of nested loops mein 14 min mein nikaalta tha. `groupby(["city","category","week"]).agg(...)` se 4 second. Manager impressed, code review approved same day.

#### Diagram

```mermaid
graph LR
    A[DataFrame] --> B[Split by key]
    B --> C[Group BLR]
    B --> D[Group MUM]
    B --> E[Group DEL]
    C --> F[Apply func]
    D --> F
    E --> F
    F --> G[Combine into result]
```

#### Interview Question

**Q:** `groupby(...).agg()` vs `groupby(...).transform()` — kab kaunsa?

**A:** `.agg()` reduces — input N rows per group, output 1 row per group. Result smaller dataframe. `.transform()` broadcasts — input N rows per group, output N rows per group (same shape as input). Use case: "har order ka GMV uske city ke avg se kitna upar/neeche hai" — transform: `df["delta"] = df["gmv"] - df.groupby("city")["gmv"].transform("mean")`. agg use karta toh shape mismatch hota, manual merge karna padta. Transform = elegant per-row group-relative metrics.

---

### 2.5 Merge, join, concat — when to use each

#### Definition (kya hai?)

`pd.merge(left, right, on, how)` — SQL-style join (inner, left, right, outer). `df.join(other)` — Index-based join (shortcut). `pd.concat([df1, df2])` — stack vertically (axis=0) or horizontally (axis=1) without join logic.

#### Why?

Analyst data hamesha multiple tables mein hota hai — orders + users + products. Merge fundamental hai. Galat `how` ya duplicate keys = exploded rows ya missing data. Concat for stacking month-wise files.

#### How (with code)

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id": [1, 2, 3, 4],
    "user_id": [101, 102, 101, 103],
    "gmv": [450, 780, 210, 320],
})
users = pd.DataFrame({
    "user_id": [101, 102, 104],
    "name": ["Aman", "Riya", "Karan"],
    "city": ["BLR", "MUM", "DEL"],
})

# Inner — only matched
inner = pd.merge(orders, users, on="user_id", how="inner")
print(inner)
#    order_id  user_id  gmv  name city
# 0         1      101  450  Aman  BLR
# 1         3      101  210  Aman  BLR
# 2         2      102  780  Riya  MUM

# Left — keep all orders, NaN for unmatched users
left = pd.merge(orders, users, on="user_id", how="left", indicator=True)
print(left[["order_id", "name", "_merge"]])

# Concat — stack two months
jan = pd.DataFrame({"order_id":[1,2], "gmv":[100,200]})
feb = pd.DataFrame({"order_id":[3,4], "gmv":[300,400]})
all_months = pd.concat([jan, feb], ignore_index=True)
```

#### Real-life Example

Flipkart ke seller analyst ne `merge` mein `validate="one_to_one"` add kiya — turned out dim_seller mein duplicate seller_ids the (data quality issue). Merge raised error, bug pakda gaya. Pehle `how="left"` silently inflated rows from 1M to 1.3M, GMV 30% over-reported tha 2 weeks ke dashboard mein.

#### Diagram

```mermaid
graph TD
    A[Two tables] --> B{Same keys?}
    B -- Yes, vertical stack --> C[concat axis=0]
    B -- Yes, horizontal stack --> D[concat axis=1]
    B -- Different keys, want match --> E{How}
    E -- Only matches --> F[merge how=inner]
    E -- Keep left --> G[merge how=left]
    E -- All --> H[merge how=outer]
```

#### Interview Question

**Q:** Merge ke baad rows badh gaye original se zyada — kya hua?

**A:** Right side mein duplicate keys hain. e.g., orders (1M rows) merge with users on user_id, but users table mein same user_id ke 3 rows hain (e.g., SCD Type 2 history). Result = 3M rows. Fix: (a) `validate="one_to_one"` ya `"many_to_one"` use kar — Pandas error throw karega; (b) right side ko deduplicate kar `users.drop_duplicates("user_id", keep="last")`; (c) explicit join condition with date range. Top 2% analyst hamesha pre-merge `right.duplicated(subset=["user_id"]).sum()` check karta hai — 5 sec ka check, 5 hours ka debug bachta hai.

---

### 2.6 Pivot, melt, stack, unstack, crosstab

#### Definition (kya hai?)

Reshape operations:
- `pivot` / `pivot_table` — long → wide (rows pe values, columns banane ke liye)
- `melt` — wide → long (columns ko rows mein convert)
- `stack` / `unstack` — multi-index manipulation
- `crosstab` — frequency cross-tab (count by default)

#### Why?

Different analyses different shapes maangti hain. Visualization aksar wide format chahiye, statistical models long. Convert kaise karna seedhe analyst skill hai.

#### How (with code)

```python
import pandas as pd

df = pd.DataFrame({
    "month": ["Jan","Jan","Feb","Feb","Mar","Mar"],
    "city":  ["BLR","MUM","BLR","MUM","BLR","MUM"],
    "gmv":   [100, 200, 150, 220, 180, 250],
})

# pivot — long to wide
wide = df.pivot(index="month", columns="city", values="gmv")
print(wide)
# city   BLR  MUM
# month
# Feb    150  220
# Jan    100  200
# Mar    180  250

# melt — wide to long
long = wide.reset_index().melt(id_vars="month", var_name="city", value_name="gmv")

# crosstab — quick frequency
orders = pd.DataFrame({"city":["BLR","MUM","BLR","DEL","BLR","MUM"],
                       "status":["paid","paid","cancelled","paid","cancelled","paid"]})
print(pd.crosstab(orders.city, orders.status))
# status  cancelled  paid
# city
# BLR             2     1
# DEL             0     1
# MUM             0     2

# pivot_table — handles dups via aggfunc
pt = df.pivot_table(index="month", columns="city", values="gmv", aggfunc="sum", fill_value=0)
```

#### Real-life Example

Paytm ka payment funnel team — raw events long format mein the (user_id, step, timestamp). `pivot_table(index="user_id", columns="step", values="timestamp", aggfunc="min")` = each user's funnel timeline, har step ka first-seen time. Drop-off analysis 5 min mein.

#### Diagram

```mermaid
graph LR
    A[Long Format] -- pivot --> B[Wide Format]
    B -- melt --> A
    B -- stack --> C[Multi-Index Series]
    C -- unstack --> B
```

#### Interview Question

**Q:** `pivot` vs `pivot_table` — difference?

**A:** `pivot` — strict reshape, agar duplicate (index, column) combinations hain toh error throw karta hai. `pivot_table` — aggregation built-in (`aggfunc="sum"/"mean"/"count"`), duplicates handle karta hai. Use `pivot` jab tu sure hai data already aggregated hai (e.g., monthly summary table). Use `pivot_table` for raw data jahan duplicates expected hain (orders pivoting). Default `pivot_table` aggfunc `mean` hai — hidden gotcha for analysts who expect `sum`.

---

### 2.7 Time series — resample, rolling, shift

#### Definition (kya hai?)

Pandas time-series superpowers — `df.resample("D")` (date-based groupby), `.rolling(window=7)` (windowed stats), `.shift(1)` (lag). DateTime Index mandatory for these.

#### Why?

Trend analysis, week-over-week, 7-day moving average — sab roz chahiye. Without these, manual loops + bugs.

#### How (with code)

```python
import pandas as pd
import numpy as np

dates = pd.date_range("2026-01-01", periods=30, freq="D")
df = pd.DataFrame({
    "date": dates,
    "gmv": np.random.randint(100, 500, 30),
}).set_index("date")

# Resample to weekly sum
weekly = df["gmv"].resample("W").sum()

# 7-day rolling mean (smoothing)
df["gmv_7d_avg"] = df["gmv"].rolling(window=7, min_periods=1).mean()

# Day-over-day change
df["gmv_lag1"] = df["gmv"].shift(1)
df["dod_pct"] = (df["gmv"] / df["gmv_lag1"] - 1) * 100

# Year-over-year (using .shift with freq)
df["gmv_yoy"] = df["gmv"].shift(365, freq="D")

print(df.head(10))
```

#### Real-life Example

Zomato dining analyst ne 7-day rolling reservations track kiye — kabhi-kabhi single-day spikes (festivals) misleading hote the. 7-day rolling se IPL season, weekend effect smooth hua, true trend visible. Forecast accuracy 12% se 4% MAPE.

#### Diagram

```mermaid
graph LR
    A[DateTime Indexed Series] --> B[resample]
    B --> C[Daily/Weekly/Monthly buckets]
    A --> D[rolling]
    D --> E[Window stats: mean, sum, std]
    A --> F[shift]
    F --> G[Lag for DoD/WoW/YoY]
```

#### Interview Question

**Q:** 7-day rolling mean aur 7-day resample mean mein difference kya hai?

**A:** Rolling mean — sliding window, har date ke liye output. Day 7 = avg of days 1-7. Day 8 = avg of days 2-8. Same length output. Resample mean — fixed buckets, har bucket ka ek output. Week 1 (days 1-7) = avg, Week 2 (days 8-14) = avg. Output shorter (1 row per week). Rolling for smoothing/trend, resample for aggregation/comparison.

---

### 2.8 Apply, map, transform — and when NOT to use them

#### Definition (kya hai?)

`apply` — generic row/column-wise function. `map` — Series-level element-wise mapping (often via dict). `transform` — group-wise broadcast (covered in 2.4). `applymap` (deprecated in 2.x → use `.map`) — DataFrame element-wise.

#### Why?

These are hammers — easy but slow. 10-100x slower than vectorized operations. Top 2% analyst pehle vectorized solution dhundta hai, apply ko last resort rakhta hai.

#### How (with code)

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "gmv": [450, 780, 210, 320, 990],
    "city": ["BLR","MUM","BLR","DEL","BLR"],
})

# BAD — apply with lambda (slow)
df["gmv_inr"] = df["gmv"].apply(lambda x: x * 1)  # row-wise loop

# GOOD — vectorized (10-100x faster)
df["gmv_usd"] = df["gmv"] / 83.0

# BAD — apply for conditional
df["tier"] = df["gmv"].apply(lambda x: "high" if x > 500 else "low")

# GOOD — np.where (vectorized)
df["tier"] = np.where(df["gmv"] > 500, "high", "low")

# GOOD — multi-condition with np.select
conditions = [df["gmv"] >= 800, df["gmv"] >= 400, df["gmv"] < 400]
choices = ["premium", "mid", "budget"]
df["segment"] = np.select(conditions, choices, default="unknown")

# map — dict-based mapping (vectorized, fast)
city_tier = {"BLR": "T1", "MUM": "T1", "DEL": "T1", "PUN": "T2"}
df["city_tier"] = df["city"].map(city_tier).fillna("T3")

print(df)
```

#### Real-life Example

Swiggy analyst ne 5M-row dataframe pe `df.apply(lambda r: r["gmv"] * (0.9 if r["promo"] else 1), axis=1)` likha — 38 second laga. Replaced with `df["gmv"] * np.where(df["promo"], 0.9, 1.0)` — 0.18 second. 200x faster. Notebook crash bhi nahi hua.

#### Diagram

```mermaid
graph TD
    A[Need to transform column?] --> B{Vectorizable?}
    B -- Yes arithmetic --> C[Use df.col * x]
    B -- Yes condition --> D[np.where / np.select]
    B -- Yes dict map --> E[.map dict]
    B -- No really custom --> F[.apply last resort]
    F --> G[Consider .swifter or vectorize manually]
```

#### Interview Question

**Q:** `apply(axis=1)` itna slow kyu hai?

**A:** `axis=1` matlab row-wise — Pandas har row ko Series object banata hai, Python lambda call karta hai, return value collect karta hai. Pure Python loop in disguise. Vectorized operations C-level loops use karte hain (NumPy underneath). Plus Series creation per row = object overhead. Solutions: (a) vectorize with `np.where/np.select`; (b) numpy array operations on `.values`; (c) for truly complex logic, `numba.jit` decorate; (d) convert to Polars where vectorized API is broader. Rule: if I'm writing `apply(axis=1)`, I'm probably leaving 10-100x performance on the table.

---

### 2.9 Memory optimization — dtypes, categoricals

#### Definition (kya hai?)

Pandas default dtypes are wasteful — `int64` for column with values 1-100 is 8x memory. `object` for repeated strings (cities, statuses) is 50x larger than `category`. Optimizing dtypes can shrink dataframes 5-10x.

#### Why?

50M-row dataframe with proper dtypes fits in 4 GB; with default dtypes 30 GB and OOMs your laptop. Top 2% analyst checks `df.memory_usage(deep=True)` first thing on big data.

#### How (with code)

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "user_id": np.random.randint(1, 100000, 1_000_000),
    "city": np.random.choice(["BLR","MUM","DEL","CHN","HYD"], 1_000_000),
    "status": np.random.choice(["paid","cancelled","pending"], 1_000_000),
    "gmv": np.random.randint(100, 1000, 1_000_000),
})

before = df.memory_usage(deep=True).sum() / 1e6
print(f"Before: {before:.1f} MB")

# Optimize
df["user_id"] = df["user_id"].astype("int32")        # smaller int
df["city"] = df["city"].astype("category")           # category for repeated strings
df["status"] = df["status"].astype("category")
df["gmv"] = df["gmv"].astype("int16")                # 0-1000 fits in int16

after = df.memory_usage(deep=True).sum() / 1e6
print(f"After:  {after:.1f} MB")
print(f"Reduction: {(1 - after/before)*100:.0f}%")
# Before: 89.4 MB
# After:  6.1 MB
# Reduction: 93%
```

#### Real-life Example

Razorpay analytics team ne 22 GB monthly transactions df ko optimize kiya — 22 GB → 2.4 GB. Notebook OOM stop hua, dashboard refresh 18 min se 90 sec. Saath, Parquet write 10x smaller files.

#### Diagram

```mermaid
graph TD
    A[Default dtypes] --> B[Audit memory_usage deep]
    B --> C{Column}
    C -- Repeated strings --> D[category]
    C -- Small int range --> E[int8/int16/int32]
    C -- Small float range --> F[float32]
    C -- Bool-like --> G[bool]
    D --> H[Save 50x memory]
```

#### Interview Question

**Q:** `category` dtype kab use karna chahiye aur kab nahi?

**A:** Use jab column mein repeated strings hain aur unique count << total count (e.g., city, status, plan_tier — 5 uniques in 1M rows). Memory savings 50-100x. Filtering/groupby fast. Don't use jab: (a) cardinality almost = row count (e.g., user_id, transaction_id) — overhead increases memory; (b) frequent string concat or modification — category modification expensive; (c) joining with non-category column on string key — silent dtype mismatch can cause join misses. Top 2% uses `category` for dim-like columns, regular `string` (StringDtype in 2.x) for high-cardinality text.

---

### 2.10 Polars — modern, faster Pandas alternative

#### Definition (kya hai?)

Polars — Rust-based DataFrame library, 5-30x faster than Pandas, native multi-threading, lazy evaluation, expression API. Pandas-like but cleaner. 2024-25 mein industry adoption rapid.

#### Why?

Pandas single-threaded hai (mostly), eager evaluation — har step memory mein materialize. Polars query optimizer (projection pushdown, predicate pushdown) plans pura pipeline pehle, fir execute karta hai. 10 GB CSV pe Pandas 4 min, Polars 12 sec.

#### How (with code)

```python
import polars as pl

# Lazy read (no materialization)
lf = pl.scan_csv("flipkart_orders.csv")

# Build query — nothing runs yet
result = (
    lf.filter(pl.col("status") == "delivered")
      .group_by("city")
      .agg([
          pl.col("gmv").sum().alias("total_gmv"),
          pl.col("user_id").n_unique().alias("unique_users"),
          pl.col("gmv").mean().alias("avg_order"),
      ])
      .sort("total_gmv", descending=True)
)

# .collect() executes the optimized plan
df = result.collect()
print(df)
# shape: (3, 4)
# ┌──────┬───────────┬──────────────┬───────────┐
# │ city │ total_gmv │ unique_users │ avg_order │
# ├──────┼───────────┼──────────────┼───────────┤
# │ BLR  │ 1450000   │ 4521         │ 380.5     │
# │ MUM  │ 1120000   │ 3210         │ 412.3     │
# │ DEL  │ 890000    │ 2870         │ 360.1     │
# └──────┴───────────┴──────────────┴───────────┘

# Inter-op with Pandas
pdf = df.to_pandas()
```

#### Real-life Example

Meesho ka monthly cohort job Pandas mein 47 min lagaata tha 80M rows pe. Migrated to Polars lazy — 3 min 20 sec. Cluster cost 14x lower. Analyst can iterate 10x faster on hypotheses.

#### Diagram

```mermaid
graph LR
    A[scan_csv lazy] --> B[Build expressions]
    B --> C[Query plan]
    C --> D[Optimizer: projection + predicate pushdown]
    D --> E[Multi-threaded execute]
    E --> F[collect: result]
```

#### Interview Question

**Q:** Polars vs Pandas — production analytics ke liye kaunsa pick karega?

**A:** Depends on data size and team familiarity. <1 GB data and team Pandas-fluent — Pandas fine. >5 GB ya iterations slow ho rahi — Polars worth the learning. Polars wins on: speed, memory, multi-threading, lazy eval, expression API cleaner. Pandas wins on: ecosystem (every ML lib speaks Pandas), Stack Overflow answers, IDE support. Top 2% analyst uses both — Polars for heavy lifting (ETL, aggregations), Pandas for visualization handoff (matplotlib/seaborn). Modern stack: Polars Lazy → collect to Pandas → plot.

---

## 3. NumPy Essentials

NumPy Pandas ke neeche ka engine hai. Direct use bhi bahut analytics situations mein zaroori hai.

### 3.1 ndarrays, broadcasting, vectorization

#### Definition (kya hai?)

`ndarray` — N-dimensional homogeneous typed array. C-contiguous memory, vectorized C loops underneath. Broadcasting — arrays of different shapes ko compatible banakar element-wise op karna without explicit loops.

#### Why?

Pandas internally NumPy use karta hai. Direct NumPy zyada fast hai jab tu pure numerical computation kar raha hai (no labels needed). Broadcasting ek-line mein 1M-row computation karta hai with no Python loop.

#### How (with code)

```python
import numpy as np

# 1D array
prices = np.array([100, 200, 300, 400, 500])
discount = 0.1
final = prices * (1 - discount)  # vectorized
print(final)  # [ 90. 180. 270. 360. 450.]

# 2D array — broadcasting
gmv = np.array([
    [100, 200, 300],   # BLR
    [150, 250, 350],   # MUM
    [80,  180, 280],   # DEL
])  # shape (3, 3) — cities x months

# Apply per-month inflation factor (1, 3) shape — broadcast across cities
inflation = np.array([1.05, 1.06, 1.07])
adjusted = gmv * inflation
print(adjusted)
# [[105. 212. 321.]
#  [157.5 265. 374.5]
#  [ 84. 190.8 299.6]]

# Vectorized conditional
above_avg = gmv > gmv.mean()
print(above_avg.sum())  # count of cells above mean

# Speed comparison
import time
n = 5_000_000
arr = np.random.rand(n)

t0 = time.perf_counter()
result = arr * 2 + 1                 # vectorized
print(f"NumPy: {time.perf_counter()-t0:.3f}s")  # ~0.02s

t0 = time.perf_counter()
result2 = [x*2+1 for x in arr]       # Python loop
print(f"Loop:  {time.perf_counter()-t0:.3f}s")  # ~1.2s
```

#### Real-life Example

Zerodha quant analyst ne 10-year minute-bar Nifty data (5M rows) pe rolling Sharpe ratio calculate kiya — pure NumPy with `np.lib.stride_tricks` mein 0.4 sec. Pandas `.rolling` mein same calc 8 sec. Backtest 200x faster, more hypotheses tested per day.

#### Diagram

```mermaid
graph LR
    A[Python list 1M items] --> B[for loop = 1s]
    A --> C[np.array]
    C --> D[Vectorized op = 0.01s]
    D --> E[100x faster]
    F[Broadcasting] --> G[Different shapes auto-aligned]
```

#### Interview Question

**Q:** Broadcasting kab fail hota hai?

**A:** When shapes are not compatible per NumPy's rules — trailing dimensions must be equal or 1. e.g., `(3, 4) + (3,)` fails (need `(4,)` or `(3,1)`). `(3,4) + (4,)` works (broadcasts (4,) to (3,4)). `(3,4) + (3,1)` works. Top 2% analyst always prints `.shape` before broadcast — and uses `np.newaxis` ya `.reshape(-1,1)` to align. Common pitfall: 1D array shape `(n,)` not `(n,1)` — column-vector expected operations fail.

---

### 3.2 Aggregations and reductions

#### Definition (kya hai?)

Reduce ndarray to summary stats — `sum`, `mean`, `std`, `min`, `max`, `argmin`, `argmax`, `percentile`, `median`. With `axis` parameter, reduce along specific dimension.

#### Why?

Daily analyst work — column-wise aggregation, row-wise totals, percentile cutoffs. Faster than Pandas for pure numeric arrays.

#### How (with code)

```python
import numpy as np

# 2D — cities x months GMV
gmv = np.array([
    [100, 200, 300],   # BLR
    [150, 250, 350],   # MUM
    [80,  180, 280],   # DEL
])

# Total
print(gmv.sum())               # 1890

# Per city (sum across months)
print(gmv.sum(axis=1))         # [600 750 540]

# Per month (sum across cities)
print(gmv.sum(axis=0))         # [330 630 930]

# Percentiles — outlier cutoff
arr = np.random.exponential(scale=100, size=10000)
p95 = np.percentile(arr, 95)
p99 = np.percentile(arr, 99)
print(f"95th: {p95:.1f}, 99th: {p99:.1f}")

# argmax — which index has max?
revenues = np.array([45, 78, 21, 99, 32])
print(revenues.argmax())  # 3 (index of max)

# Cumulative
cumulative_gmv = np.cumsum([100, 200, 300, 400])
print(cumulative_gmv)  # [100 300 600 1000]
```

#### Real-life Example

Paytm fraud analyst ne `np.percentile(transaction_amounts, [99, 99.5, 99.9])` use karke threshold tuning ki — ek-line mein 50M txns ke distribution se cutoffs nikle. Pandas mein bhi possible, but pure NumPy 4x faster on raw arrays.

#### Diagram

```mermaid
graph TD
    A[ndarray] --> B[axis=None]
    B --> C[Scalar result]
    A --> D[axis=0]
    D --> E[Reduce rows, keep columns]
    A --> F[axis=1]
    F --> G[Reduce cols, keep rows]
```

#### Interview Question

**Q:** `arr.mean()` vs `np.nanmean(arr)` — difference?

**A:** `arr.mean()` includes NaN values — agar koi NaN hai toh result NaN ho jaata hai (NaN propagation). `np.nanmean(arr)` ignores NaN, computes mean of remaining. Same for nansum, nanstd, nanmedian, nanpercentile. Real-world data NaN-laden hota hai (missing sensor data, opt-out users), top 2% analyst hamesha decide karta hai: NaN propagate (signal data quality issue) ya skip (assume MAR — missing at random). Without conscious choice = silent bugs.

---

## 4. Data Cleaning

Real-world data dirty hota hai. 70% analyst time data clean karne mein jaata hai — yahin pe top 2% baaki se differentiate hota hai.

### 4.1 Missing data — detect, impute, KNN, ffill/bfill

#### Definition (kya hai?)

Missing data — `NaN`, `None`, empty string, sentinel values (-999). Strategies: (a) detect; (b) understand mechanism (MCAR / MAR / MNAR); (c) handle — drop, simple impute (mean/median/mode), ffill/bfill, KNN impute, model-based.

#### Why?

Wrong handling = biased analysis. e.g., agar tu Swiggy data mein missing rating ko 5 fill karta hai (positive bias), customer satisfaction inflated dikhega. Top 2% analyst missing mechanism samjhta hai pehle.

#### How (with code)

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer

df = pd.DataFrame({
    "user_id": [1, 2, 3, 4, 5],
    "age": [25, np.nan, 30, np.nan, 45],
    "income": [50000, 60000, np.nan, 75000, np.nan],
    "city": ["BLR", "MUM", None, "DEL", "BLR"],
})

# Detect
print(df.isna().sum())
# user_id    0
# age        2
# income     2
# city       1

# Visual
print(df.isna().mean() * 100)  # missing %

# Strategy 1: drop rows with any NaN
clean1 = df.dropna()

# Strategy 2: simple impute
df["age_filled"] = df["age"].fillna(df["age"].median())
df["city_filled"] = df["city"].fillna("UNKNOWN")

# Strategy 3: ffill / bfill (time-series)
ts = pd.Series([1, np.nan, np.nan, 4, np.nan, 6])
print(ts.ffill())  # [1, 1, 1, 4, 4, 6]
print(ts.bfill())  # [1, 4, 4, 4, 6, 6]

# Strategy 4: KNN imputer (for numeric)
imputer = KNNImputer(n_neighbors=2)
numeric_cols = ["age", "income"]
df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

print(df)
```

#### Real-life Example

BigBasket loyalty analyst mein "loyalty_tier" 18% missing tha. Naive fill with mode = inflated "Silver" segment. Investigation revealed missing = users who never opted in = should be "Non-loyalty" category. Data-driven decision changed segmentation, marketing budget allocation 12% shift.

#### Diagram

```mermaid
graph TD
    A[Missing detected?] --> B{Mechanism}
    B -- MCAR random --> C[Drop or simple impute]
    B -- MAR pattern depends on observed --> D[Model-based or KNN]
    B -- MNAR depends on missing value --> E[Investigate / domain logic]
    C --> F[Validate: distribution unchanged]
    D --> F
    E --> G[Custom rule / new category]
```

#### Interview Question

**Q:** "Missing income" column ko mean se impute kar diya — kya galat ho sakta hai?

**A:** (1) Distribution flatten ho jaati hai — variance artificially reduced, downstream stats biased. (2) Outlier-driven mean (e.g., few CXOs at 5Cr income) imputed value unrealistic. (3) Mechanism MNAR ho sakta hai — high earners non-disclosure rate higher hota hai (privacy), so missing != average, missing = above average. Better: median (robust), or stratified impute (median by city/tier), or model-based (KNN, Iterative Imputer). Top 2% always: (a) check missing % first; (b) check correlation of missing flag with target; (c) compare distributions before/after imputation.

---

### 4.2 Duplicates and near-duplicates (rapidfuzz)

#### Definition (kya hai?)

Exact duplicates — same row twice. Near-duplicates — "Mumbai" vs "mumbai" vs "Mumbai " vs "Bombay" — same entity, different strings. Rapidfuzz library ke fuzzy matching algorithms (Levenshtein, Jaro-Winkler) se identify hote hain.

#### Why?

Duplicate users = inflated MAU. Duplicate orders = double-counted revenue. Near-dup merchants = fragmented merchant analytics. CFO ko "kal MAU 5L tha" bolega, real 4.2L hai — credibility gone.

#### How (with code)

```python
import pandas as pd
from rapidfuzz import fuzz, process

df = pd.DataFrame({
    "user_id": [1, 2, 3, 4, 5, 6],
    "name": ["Aman Sharma", "aman sharma", "Riya Verma", "AMAN SHARMA ", "Karan Mehta", "Riya verma"],
    "email": ["a@x.com","a@x.com","r@y.com","a@x.com","k@z.com","r@y.com"],
})

# Exact dup
print(df.duplicated().sum())          # 0 (case differences)
print(df.duplicated("email").sum())   # 3

# Normalize for exact match
df["name_norm"] = df["name"].str.lower().str.strip()
print(df.duplicated("name_norm"))

# Fuzzy match — find near-dup names
names = df["name"].tolist()
seen = []
groups = []
for n in names:
    matches = [s for s in seen if fuzz.ratio(n.lower().strip(), s.lower().strip()) > 85]
    if matches:
        groups.append(matches[0])
    else:
        groups.append(n)
        seen.append(n)
df["canonical"] = groups
print(df[["name", "canonical"]])
#             name      canonical
# 0    Aman Sharma    Aman Sharma
# 1    aman sharma    Aman Sharma
# 2     Riya Verma     Riya Verma
# 3   AMAN SHARMA     Aman Sharma
# 4    Karan Mehta    Karan Mehta
# 5     Riya verma     Riya Verma
```

#### Real-life Example

Razorpay merchant table mein "Reliance Retail Ltd", "RELIANCE RETAIL LIMITED", "Reliance Retail Pvt Ltd" — 7 different strings, same entity. Rapidfuzz + manual review se 3.4L merchants → 3.1L canonical. KAM (Key Account Mgr) coverage analysis became accurate, sales pipeline forecast improved 18%.

#### Diagram

```mermaid
graph TD
    A[Raw entity column] --> B[Normalize: lower, strip, punct]
    B --> C{Exact match}
    C -- Yes --> D[Group]
    C -- No --> E[Fuzzy match score >85]
    E -- Yes --> D
    E -- No --> F[New canonical entity]
```

#### Interview Question

**Q:** Fuzzy match threshold (e.g., 85) kaise decide karega?

**A:** Empirical — manually label 200 pairs (true match / false match), compute fuzz scores, find threshold maximizing F1. Different algos different thresholds — `fuzz.ratio` (basic Levenshtein), `fuzz.token_sort_ratio` (handles word reorder), `fuzz.partial_ratio` (substring). Use case dependent: merchant names need 90+ (false merge expensive), spam detection 75+ ok. Top 2% analyst manually validates a sample — never blind threshold. Alternative: train a classifier on labeled pairs (active learning) — far better than fixed threshold at scale.

---

### 4.3 Outliers — IQR, z-score, Isolation Forest

#### Definition (kya hai?)

Outliers — values far from typical distribution. Methods: IQR rule (below Q1-1.5×IQR or above Q3+1.5×IQR), z-score (|z| > 3), Isolation Forest (ML model isolating anomalies via random splits).

#### Why?

Outliers can be: (a) data errors (₹500000 instead of ₹500); (b) genuine extremes (CXO income); (c) fraud signals. Decide: drop, cap (winsorize), or investigate. One outlier can shift mean 30% in small samples.

#### How (with code)

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

df = pd.DataFrame({
    "txn_id": range(1, 11),
    "amount": [100, 200, 150, 180, 220, 190, 50000, 210, 175, 195],
})

# IQR method
Q1 = df["amount"].quantile(0.25)
Q3 = df["amount"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
df["is_outlier_iqr"] = (df["amount"] < lower) | (df["amount"] > upper)

# Z-score method
df["z"] = (df["amount"] - df["amount"].mean()) / df["amount"].std()
df["is_outlier_z"] = df["z"].abs() > 3

# Isolation Forest (multivariate)
iso = IsolationForest(contamination=0.1, random_state=42)
df["is_outlier_iso"] = iso.fit_predict(df[["amount"]]) == -1

print(df)
#    txn_id  amount  is_outlier_iqr      z  is_outlier_z  is_outlier_iso
# 0       1     100           False  -0.34         False           False
# 6       7   50000            True   3.00          True            True
# ...

# Winsorize — cap at 1st and 99th percentile
def winsorize(s, lower_q=0.01, upper_q=0.99):
    lo, hi = s.quantile([lower_q, upper_q])
    return s.clip(lo, hi)
df["amount_capped"] = winsorize(df["amount"])
```

#### Real-life Example

Zomato pricing analyst ne menu items pe IQR outlier check kiya — ₹15000 paratha (decimal misplaced from ₹150) pakda. Restaurant ko notify, fixed in 2 hours. Avg order value dashboard pehle artificially inflated tha — clean data ke baad real trend visible.

#### Diagram

```mermaid
graph TD
    A[Outlier detected] --> B{Investigate}
    B -- Data error --> C[Fix or remove]
    B -- Genuine extreme --> D{Action}
    D --> E[Keep but note]
    D --> F[Winsorize for stats]
    D --> G[Separate analysis: VIP segment]
    B -- Fraud signal --> H[Flag for review]
```

#### Interview Question

**Q:** IQR vs z-score — kaunsa kab use karega?

**A:** IQR — robust, works for non-normal distributions, doesn't assume Gaussian. Better for skewed data (income, transaction amounts — typical of analyst datasets). Z-score — assumes normality; if data is log-normal (most monetary data), z-score on raw values misleading. Top 2% analyst: log-transform first, then z-score, ya directly IQR. Multivariate outliers (one feature normal, combination weird) — Isolation Forest ya Mahalanobis distance. Always plot first — boxplot + histogram — outliers visible easily.

---

### 4.4 Date parsing nightmares, encoding strategies

#### Definition (kya hai?)

Date parsing — strings like "15/04/2026", "April 15, 2026", "2026-04-15T10:30:00+05:30" ko datetime banane ka kaam. Encoding — categorical columns (city, status) ko ML/stat model ke liye numerical banane ka — one-hot, ordinal, target encoding.

#### Why?

Dates analyst ka favorite trap hai — DD/MM vs MM/DD, timezones, Excel serial numbers (45412 = 2024-04-30). One bug = whole month's analysis off-by-N. Encoding wrong = cardinality explosion (1-hot 10K cities = 10K columns) or info loss.

#### How (with code)

```python
import pandas as pd

# Date parsing — explicit format always
df = pd.DataFrame({
    "raw_date": ["15/04/2026", "16/04/2026", "17/04/2026"],
})
df["date"] = pd.to_datetime(df["raw_date"], format="%d/%m/%Y")
print(df["date"].dt.day_name())
# 0    Wednesday
# 1     Thursday
# 2       Friday

# Mixed formats — errors='coerce' to get NaT for unparseable
mixed = pd.to_datetime(["2026-01-01", "garbage", "15-Jan-2026"], errors="coerce")
print(mixed)  # [Timestamp, NaT, Timestamp]

# Timezones
ts = pd.Timestamp("2026-04-15 10:00", tz="Asia/Kolkata")
ts_utc = ts.tz_convert("UTC")
print(ts, "->", ts_utc)

# Excel serial date
excel_serial = 45412
date = pd.Timestamp("1899-12-30") + pd.Timedelta(days=excel_serial)
print(date)  # 2024-04-30

# --- Encoding ---
df = pd.DataFrame({
    "city": ["BLR","MUM","DEL","BLR","MUM"],
    "tier": ["Gold","Silver","Bronze","Gold","Bronze"],
    "gmv": [500, 300, 200, 600, 250],
})

# One-hot
oh = pd.get_dummies(df["city"], prefix="city")
print(oh)

# Ordinal (manual order)
tier_order = {"Bronze": 1, "Silver": 2, "Gold": 3}
df["tier_ord"] = df["tier"].map(tier_order)

# Target encoding — replace category with mean of target
df["city_te"] = df.groupby("city")["gmv"].transform("mean")
```

#### Real-life Example

Flipkart Big Billion Days analyst ne CSV upload mein date "01/02/2026" ko Pandas ne MM/DD assume kiya (US default) — 1 Feb instead of 2 Jan. 4 hafta ka data shift, weekly trend reversed. Bug pakda gaya only after CFO question "Republic Day spike kahan?". Lesson: always `format=` explicitly, never trust default.

#### Diagram

```mermaid
graph TD
    A[Raw date string] --> B[Inspect format]
    B --> C[pd.to_datetime with explicit format]
    C --> D{Errors}
    D -- coerce --> E[NaT for invalid]
    D -- raise --> F[Fail loud]
    G[Categorical column] --> H{Cardinality}
    H -- Low --> I[One-hot]
    H -- Ordered --> J[Ordinal map]
    H -- High --> K[Target encoding]
```

#### Interview Question

**Q:** 1-hot encoding ka problem kya hai aur alternatives kya hain?

**A:** (1) Cardinality explosion — 10K unique cities = 10K columns, sparse, memory hog. (2) New categories at inference — train mein "BLR" tha, test mein "GUW" — column missing, model breaks (need handling). (3) Loses ordinal info — for ordered categories (Bronze < Silver < Gold), 1-hot treats them equally distant. Alternatives: ordinal encoding (when order known), target encoding (replace category with mean of target — but leak risk, use cv-based mean), embedding (deep learning), hashing trick (collisions but bounded dimensions), or for tree models — keep as `category` dtype, sklearn's `HistGradientBoosting` handles natively.

---

## 5. EDA & Visualization

EDA = data ke saath conversation. Visualization = stakeholder ke saath conversation. Dono master karna padega.

### 5.1 Univariate, bivariate, multivariate EDA

#### Definition (kya hai?)

- **Univariate** — single variable analysis (distribution, central tendency, spread). Tools: histogram, boxplot, summary stats.
- **Bivariate** — two-variable relationships. Tools: scatter, correlation, grouped boxplot, crosstab.
- **Multivariate** — 3+ variables. Tools: pair plots, heatmap, faceted plots, dimensionality reduction.

#### Why?

EDA without structure = wandering. Univariate first to understand each column, bivariate to find relationships, multivariate to model interactions. Skip steps = miss obvious bugs (e.g., median order value spike for new city = launch artifact).

#### How (with code)

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "user_id": range(1, 1001),
    "age": np.random.normal(30, 8, 1000).clip(18, 65),
    "city": np.random.choice(["BLR","MUM","DEL"], 1000),
    "tier": np.random.choice(["T1","T2","T3"], 1000, p=[0.3,0.5,0.2]),
    "gmv": np.random.exponential(500, 1000),
    "n_orders": np.random.poisson(3, 1000),
})

# Univariate
print(df.describe())                          # numerical summary
print(df["city"].value_counts(normalize=True))# categorical share
print(df["gmv"].quantile([0.1,0.5,0.9,0.99])) # percentiles

# Bivariate
print(df.groupby("city")["gmv"].agg(["mean","median","std"]))
print(df[["age","gmv","n_orders"]].corr())    # correlation matrix

# Multivariate
print(df.groupby(["city","tier"])["gmv"].agg(["mean","count"]).round(2))
#                  mean  count
# city tier
# BLR  T1        491.5    100
#      T2        518.7    167
#      T3        503.2     65
# ...
```

#### Real-life Example

Swiggy Instamart ke first month launch ke baad analyst ne EDA kiya — univariate showed median order ₹650 (high). Bivariate by user_age cohort — first-time users ₹400, repeat users ₹900. Insight: trial vouchers were only 1-time — repeat users were fitting Instamart into bigger basket (replacing weekly grocery shop). Strategic shift: weekly subscription bundle, repeat AOV up further 15%.

#### Diagram

```mermaid
graph TD
    A[Raw Data] --> B[Univariate]
    B --> C[Distribution per column]
    C --> D[Bivariate]
    D --> E[Pairwise relationships]
    E --> F[Multivariate]
    F --> G[Interactions / segments]
    G --> H[Hypothesis for confirmatory]
```

#### Interview Question

**Q:** EDA mein sabse pehle kya check karta hai?

**A:** Order: (1) `df.shape` aur `df.dtypes` — basic sanity (granularity, type errors); (2) `df.isna().sum()` — missing data map; (3) `df.describe()` — numerical sanity (negative GMV? max way too high?); (4) categorical `value_counts()` — typos, unexpected categories; (5) Univariate plots — histogram + boxplot for numericals, bar for categoricals; (6) Bivariate against target — if target exists (revenue, conversion, churn). Top 2% analyst writes a 1-page "data quality report" before any modeling — managers love it, prevents 80% downstream bugs.

---

### 5.2 Matplotlib + Seaborn for analysts

#### Definition (kya hai?)

Matplotlib — Python's grandfather plotting library, full control, ugly defaults. Seaborn — built on matplotlib, statistical plots with sane defaults (boxplot, violin, heatmap, pairplot, regplot).

#### Why?

For static reports, presentations, PDFs — matplotlib + seaborn standard. Plotly for interactive (next section). Top 2% analyst can produce publication-grade chart in 30 sec — annotation, legend, axes, colors all controlled.

#### How (with code)

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid", context="talk")

df = pd.DataFrame({
    "city": np.random.choice(["BLR","MUM","DEL","HYD"], 500),
    "category": np.random.choice(["Food","Grocery","Pharmacy"], 500),
    "gmv": np.random.exponential(400, 500),
    "rating": np.random.uniform(3, 5, 500),
})

# Histogram
fig, ax = plt.subplots(figsize=(8,4))
sns.histplot(df["gmv"], bins=40, kde=True, ax=ax)
ax.set_title("GMV Distribution — right-skewed (typical e-commerce)")
ax.set_xlabel("GMV (₹)")
plt.tight_layout(); plt.savefig("gmv_hist.png", dpi=120); plt.close()

# Grouped boxplot
fig, ax = plt.subplots(figsize=(10,5))
sns.boxplot(data=df, x="city", y="gmv", hue="category", ax=ax)
ax.set_title("GMV by City × Category")
plt.tight_layout(); plt.savefig("gmv_box.png"); plt.close()

# Heatmap
pivot = df.pivot_table(index="city", columns="category", values="gmv", aggfunc="mean")
fig, ax = plt.subplots(figsize=(6,4))
sns.heatmap(pivot, annot=True, fmt=".0f", cmap="Blues", ax=ax)
ax.set_title("Avg GMV ₹ — City vs Category")
plt.tight_layout(); plt.savefig("gmv_heat.png"); plt.close()

# Pairplot — multi-variable
sns.pairplot(df, hue="city", diag_kind="kde", height=2)
plt.savefig("pair.png"); plt.close()
```

#### Real-life Example

Zomato 2024 annual report ka "category-wise growth" heatmap analyst ne 4-line seaborn snippet se banaya — same chart Tableau mein 25 minute lagaata. CXO bola "screenshot le ke deck mein daal do" — done. Static plots underrated speed advantage.

#### Diagram

```mermaid
graph LR
    A[DataFrame] --> B{Question type}
    B -- Distribution --> C[histplot/kdeplot]
    B -- Comparison --> D[boxplot/violinplot]
    B -- Correlation --> E[heatmap/scatterplot]
    B -- Trend --> F[lineplot]
    B -- Multi --> G[pairplot/FacetGrid]
```

#### Interview Question

**Q:** "Default" matplotlib charts ugly hote hain — kya tweaks karta hai for stakeholder-ready?

**A:** Standard hygiene: (1) `figsize=(10,5)` for laptop screen aspect; (2) `sns.set_theme(style="whitegrid")` for clean grid; (3) explicit title with insight ("BLR drives 45% revenue") not just label ("BLR"); (4) y-axis starts at 0 for bar charts (avoid distortion); (5) consistent color palette across all charts in deck (`sns.color_palette("Blues_r")`); (6) annotations on key points; (7) `tight_layout()` always; (8) save with `dpi=150` or higher for PDFs/decks; (9) gray/black for non-emphasis bars, color for highlight (Storytelling with Data principle); (10) remove top/right spines (`sns.despine()`).

---

### 5.3 Plotly Express for interactive viz

#### Definition (kya hai?)

Plotly Express — high-level interactive charts in 1-line Python. Hover tooltips, zoom, pan, filter — out of the box. JS underneath. Output = HTML embed-friendly.

#### Why?

Stakeholders interactive dashboards prefer karte hain — "iss bar pe hover karke breakdown dikha". Static matplotlib se nahi hota. Streamlit / Jupyter notebooks / HTML reports mein direct embed.

#### How (with code)

```python
import pandas as pd
import numpy as np
import plotly.express as px

df = pd.DataFrame({
    "month": pd.date_range("2026-01-01", periods=12, freq="MS"),
    "city": np.repeat(["BLR","MUM","DEL"], 4),
    "gmv": np.random.randint(80, 200, 12),
    "orders": np.random.randint(500, 2000, 12),
})

# Line chart
fig = px.line(
    df, x="month", y="gmv", color="city", markers=True,
    title="Monthly GMV by City (interactive — hover for values)",
    labels={"gmv": "GMV (₹L)", "month": "Month"},
)
fig.write_html("gmv_trend.html")

# Scatter with size + color
fig2 = px.scatter(
    df, x="orders", y="gmv", size="gmv", color="city",
    hover_data=["month"], title="Orders vs GMV — bubble = GMV",
)
fig2.write_html("scatter.html")

# Sunburst — hierarchical
products = pd.DataFrame({
    "category": ["Food","Food","Grocery","Grocery","Pharmacy"],
    "subcat":   ["Pizza","Biryani","Veg","Fruits","OTC"],
    "gmv":      [100,150,80,120,40],
})
fig3 = px.sunburst(products, path=["category","subcat"], values="gmv",
                   title="GMV — Category > Subcategory")
fig3.write_html("sunburst.html")

# Animated time-series
df_anim = pd.DataFrame({
    "month": np.repeat(pd.date_range("2026-01-01", periods=6, freq="MS"), 3),
    "city":  ["BLR","MUM","DEL"]*6,
    "gmv":   np.random.randint(100,300, 18),
    "orders":np.random.randint(500,1500, 18),
})
fig4 = px.scatter(
    df_anim, x="orders", y="gmv", color="city", animation_frame=df_anim["month"].astype(str),
    range_x=[400,1600], range_y=[80,320], size="gmv",
    title="Animated: GMV-Orders flight per month",
)
fig4.write_html("anim.html")
```

#### Real-life Example

Paytm internal dashboard ka "transactions by state" India choropleth Plotly Express mein 6 line ka tha. Hover pe state name + TPV + WoW growth dikhata. CFO ne weekly review meeting mein "yeh dashboard production grade lagta hai" bola — Tableau license cost cut.

#### Diagram

```mermaid
graph LR
    A[DataFrame] --> B[plotly.express call]
    B --> C[Interactive HTML]
    C --> D[Embed: notebook/streamlit/email]
    D --> E[Stakeholder hovers, filters, zooms]
    E --> F[Self-serve insight]
```

#### Interview Question

**Q:** Static (matplotlib) vs interactive (Plotly) — when which?

**A:** Static for: PDFs, printed reports, exec decks (slides don't interact), academic papers, version-controlled dashboards (git diff friendly). Interactive for: web dashboards, notebooks shared with stakeholders, exploratory work where viewer wants to filter, multi-dimensional data where one static slice is insufficient. Top 2% analyst's heuristic: if same chart will be looked at 5+ times by different people asking different questions — make it interactive. Single insight for one deck = static, faster to produce and embed. Both libraries belong in the toolkit.

---

> **Bottom line:** Python for analytics ka asli edge sirf syntax knowledge nahi — it's choosing the right tool for the right scale. Pandas for <1GB iterations, Polars for big data, NumPy for pure numeric speed, vectorization over apply, dtypes optimization, and EDA discipline. Aur har step pe — "production code" lens — type hints, error handling, virtual envs. Iss ek subject ko 30+ ghante grind kar — aage SQL ho ya ML, sab tez dauadega kyunki Python bottleneck nahi rahega. Top 2% analyst bola toh top 2% Python likhna padega.
