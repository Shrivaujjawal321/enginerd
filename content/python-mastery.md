# Python Mastery — From `print("hello")` to Production

Bhai dekh, Python tujhe teen jagah bachayega — DSA contest mein jab time kam ho aur tu C++ ka boilerplate likhte-likhte TLE kha jaye, ML/Data project mein jab tujhe pandas + sklearn ek raat mein chalana ho, aur TCS NQT / Infosys / Wipro coding round mein jahaan har problem 10 lines mein clean ho jaati hai. Java aur JavaScript tu seekh chuka hai is platform pe — ab Python ka turn hai.

Iss subject ka goal: tu `print("hello world")` se shuru hua hai, end tak tu **production-grade Python** likhega — type hints ke saath, async I/O ke saath, decorators jo retry/log karein, dataclasses jo Money handle karein, aur packaging jo PyPI pe ja sake. Hum casual `for i in range(n)` script kid se uth ke wahaan jaayenge jahaan tu Razorpay/Swiggy/Zerodha ke senior engineers ke saath PR review kar sake.

> **Why Python depth matters:** Razorpay ke ML team ka 80% code Python hai, Swiggy ka demand forecasting Python pe chalta hai, Zerodha ka backtesting engine Python + Cython hai. CRED data team Python-only hai. Agar tu sirf "syntax aata hai" wala Python jaanta hai, tu intern tak pahunchega. Production Python — idioms, async, typing, packaging — wo SDE-1+ ka filter hai.

Chai garam kar le, ye 800+ line ka safar hai. Har section ek interview question ya production scenario solve karta hai. Modern Python 3.10+ syntax (`match/case`, `list[int]`, `T | None`) — kyuki 2026 mein purane `typing.List` likhne ka koi reason nahi.

---

## 1. Why Python — and when not

### 1.1 When Python wins

| Use case | Why Python |
|----------|-----------|
| **Machine Learning / Data Science** | numpy, pandas, scikit-learn, PyTorch, TensorFlow — sab Python-first. C++ ya Java mein equivalent ecosystem hi nahi hai. |
| **DSA contest fast-prototype** | LeetCode / Codeforces pe `[a for a in arr if cond]` likhne mein 5 seconds, C++ mein 30. Tu logic pe focus kar sakta hai, syntax pe nahi. |
| **Glue / scripting** | Two APIs ko join karna, log file parse karna, S3 se file upload karna — Python 20 lines mein ho jata hai. Bash se zyada readable, Java se 10x kam code. |
| **Data analysis** | Jupyter notebook + pandas = analyst's best friend. Excel ke baad next step yahi hai. |
| **Backend (medium scale)** | Django / FastAPI / Flask — Instagram, Pinterest, Reddit, Dropbox sab Python pe scale ho gaye. |
| **Automation / DevOps** | Ansible, Fabric, custom CI scripts — Python is the duct tape of cloud. |
| **Education / interview prep** | Pseudocode-like syntax, GFG/LeetCode ke 90% solutions Python mein readable hain. |

### 1.2 When Python loses

| Use case | Why NOT Python |
|----------|---------------|
| **CPU-bound production hot path** | Pure Python 50-100x slower than C++ for tight loops. Trading low-latency engines, game engines, real-time signal processing — C++/Rust/Go. |
| **Mobile apps** | iOS = Swift, Android = Kotlin. Python mobile (Kivy, BeeWare) is a toy. |
| **Real-time systems** | GIL + GC + interpreter overhead → unpredictable latency. Avionics / HFT / kernel — never Python. |
| **Memory-constrained embedded** | Python interpreter alone is ~10-20 MB. MicroPython exists but is a niche. |
| **Multi-core CPU parallelism** | GIL (next section) — true parallelism needs `multiprocessing` (heavy) or C extensions. |
| **Type-safety at compile time** | mypy is opt-in, not enforced. Java / Kotlin / Rust catch more bugs at compile. |

### 1.3 The GIL in one paragraph

**Global Interpreter Lock** — CPython interpreter mein ek time pe sirf ek thread Python bytecode execute kar sakta hai. Matlab tere paas 16-core machine hai, par tu pure Python threading se ek hi core saturate karega. **I/O-bound** kaam (HTTP calls, DB queries, file reads) ke liye GIL release ho jata hai — toh `asyncio` / threading wahaan helpful hai. **CPU-bound** kaam (matrix multiplication, image processing) ke liye `multiprocessing` use kar (separate processes, no GIL) ya numpy/PyTorch use kar (C/CUDA mein chalta hai, GIL release karta hai). Python 3.13+ mein experimental "free-threaded" build (PEP 703) aaya hai jo GIL hata deta hai, par 2026 mein production mein abhi nahi gaya.

> **Indian context:** Razorpay ka payment routing engine Go mein hai (latency-critical), but fraud detection ML pipeline Python mein hai (ML ecosystem). Right tool, right job.

---

## 2. Pythonic idioms — likhna seekh, banana seekh

Python sirf syntax nahi hai, ek **culture** hai. "Pythonic" matlab idiomatic. Tu Java se aaya hai toh tu `for(int i=0; i<n; i++)` likhne ki aadat lekar aaya hoga — yahaan se nikal. Ek-ek idiom dekh.

### 2.1 Truthy / Falsy

Python mein har object truthy ya falsy hai. Falsy values yaad rakh — interview classic:

```python
# Falsy: False, None, 0, 0.0, "", [], {}, set(), tuple()
# Sab kuch baaki truthy hai

users = []
if not users:           # Pythonic
    print("no users")

if len(users) == 0:     # ❌ unpythonic — chal jaata hai par "C-like"
    print("no users")
```

### 2.2 Walrus operator `:=` (3.8+)

Assignment expression — variable assign karo aur saath mein use karo. Useful in `while` loops aur comprehensions.

```python
# Without walrus — repeat read
line = input()
while line != "quit":
    process(line)
    line = input()

# With walrus — DRY
while (line := input()) != "quit":
    process(line)

# Comprehension filtering with expensive function
results = [y for x in data if (y := expensive(x)) is not None]
```

### 2.3 Ternary

```python
status = "adult" if age >= 18 else "minor"

# Chain (avoid >2 levels)
grade = "A" if marks >= 90 else "B" if marks >= 75 else "C"
```

### 2.4 Multiple assignment + tuple unpacking

```python
# Swap — no temp variable
a, b = b, a

# Unpack
name, age, city = ("Aryan", 22, "Pune")

# Star-unpacking (rest)
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2,3,4], last=5

# Function returning multiple values is just a tuple
def min_max(arr):
    return min(arr), max(arr)

lo, hi = min_max([3, 1, 4, 1, 5])

# Ignore values with _
_, important, _ = ("ignore", "keep", "ignore")
```

### 2.5 String formatting — f-strings only

Three eras of Python string formatting. Sirf teesra use kar.

```python
name, score = "Aryan", 87.456

# Era 1: % formatting (Python 2 era — DEAD)
s = "Hi %s, score %.2f" % (name, score)

# Era 2: .format() (Python 2.6+ — fine but verbose)
s = "Hi {}, score {:.2f}".format(name, score)

# Era 3: f-strings (Python 3.6+ — USE THIS)
s = f"Hi {name}, score {score:.2f}"

# f-string superpowers
s = f"{name=}, {score=:.2f}"        # debug: "name='Aryan', score=87.46"
s = f"{1 + 2}"                      # arbitrary expressions
s = f"{'='*20}"                     # any expression
s = f"{score:>10.2f}"               # right-align, width 10, 2 decimal
```

### 2.6 Slicing — full grammar

`seq[start:stop:step]` — har position optional, negative allowed.

```python
arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

arr[2:5]        # [2, 3, 4]              start inclusive, stop exclusive
arr[:5]         # [0,1,2,3,4]            from beginning
arr[5:]         # [5,6,7,8,9]            till end
arr[::2]        # [0,2,4,6,8]            every 2nd
arr[::-1]       # [9,8,7,6,5,4,3,2,1,0]  REVERSE — favourite trick
arr[-3:]        # [7, 8, 9]              last 3
arr[:-3]        # [0,1,2,3,4,5,6]        all except last 3
arr[1:-1]       # [1,2,3,4,5,6,7,8]      strip first + last

# Strings = sequences too
"hello"[::-1]   # 'olleh'

# Slicing is non-destructive — returns new list
# Slice assignment IS destructive
arr[2:5] = [99, 99]   # arr is now [0,1,99,99,5,6,7,8,9]
```

### 2.7 `is` vs `==`

| Operator | Checks |
|----------|--------|
| `==` | Value equality — calls `__eq__` |
| `is` | Identity — same object in memory (same `id()`) |

```python
a = [1, 2, 3]
b = [1, 2, 3]
a == b      # True  — same value
a is b      # False — different objects

x = None
x is None   # ✅ correct way
x == None   # ❌ unpythonic, also: works but slower

# Small int caching (CPython quirk — DON'T rely on this)
a = 256; b = 256; a is b  # True  (cached)
a = 257; b = 257; a is b  # False (not cached on most systems)
```

**Rule:** `is` only for `None`, `True`, `False`, and sentinel objects. Everything else, use `==`.

### 2.8 EAFP — Easier to Ask Forgiveness than Permission

Python culture: try the operation, handle the exception. Don't pre-check.

```python
# LBYL (Look Before You Leap) — Java-style, unpythonic
if "key" in d and isinstance(d["key"], int) and d["key"] > 0:
    use(d["key"])

# EAFP — Pythonic
try:
    val = d["key"]
    if val > 0:
        use(val)
except (KeyError, TypeError):
    pass
```

EAFP is also **race-condition safe** in concurrent code — between the `if` check and the actual use, the world can change.

### 2.9 `enumerate` and `zip`

```python
# Index + value together — never write `for i in range(len(arr))`
for i, v in enumerate(["a", "b", "c"]):
    print(i, v)

# Parallel iteration
names = ["Aryan", "Priya", "Rohan"]
scores = [87, 92, 78]
for n, s in zip(names, scores):
    print(n, s)

# Python 3.10+: strict zip raises if lengths differ
for n, s in zip(names, scores, strict=True):
    ...
```

---

## 3. Built-in data structures — deep dive

Python ke 4 core containers — `list`, `tuple`, `set`, `dict` — aur `collections` module ke specialty containers. Tu jab DSA solve karega, choice yehi banayegi solution accepted hoga ya TLE.

### 3.1 list — mutable sequence

| Operation | Time | Notes |
|-----------|------|-------|
| `lst[i]` | O(1) | random access |
| `lst.append(x)` | O(1) amortized | end |
| `lst.insert(0, x)` | O(n) | shift everything — slow |
| `lst.pop()` | O(1) | end |
| `lst.pop(0)` | O(n) | shift — use `deque` instead |
| `x in lst` | O(n) | linear scan — for membership use `set` |
| `lst.sort()` | O(n log n) | in-place, stable (Timsort) |

```python
# Pre-size an array — Java mein new int[n], Python mein:
arr = [0] * n

# 2D array — common gotcha
grid = [[0] * cols for _ in range(rows)]   # ✅
grid = [[0] * cols] * rows                 # ❌ all rows are SAME ref!
```

### 3.2 tuple — immutable sequence

```python
point = (3, 4)
# point[0] = 5   # TypeError — tuples are immutable

# Why use tuple over list?
# 1. Hashable — can be a dict key or set element
# 2. Slightly faster + smaller memory
# 3. Signals "this is a fixed record"

cache = {}
cache[(3, 4)] = "value"   # tuple as key — ✅
cache[[3, 4]] = "value"   # ❌ TypeError — list unhashable
```

### 3.3 set — hash set, O(1) lookup

```python
seen = set()
seen.add(5)
5 in seen       # O(1)

# Set operations — DSA gold
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a | b           # union: {1,2,3,4,5,6}
a & b           # intersection: {3,4}
a - b           # difference: {1,2}
a ^ b           # symmetric diff: {1,2,5,6}

# frozenset — hashable set
fs = frozenset([1, 2, 3])
{fs: "ok"}      # works — frozenset can be dict key
```

### 3.4 dict — hash map, insertion-ordered (3.7+)

Python 3.7+ guarantees dict iteration order = insertion order. Iss se pehle CPython mein 3.6 mein implementation detail tha, 3.7 mein language guarantee bana.

```python
d = {"a": 1, "b": 2}
d["c"] = 3
list(d)        # ['a', 'b', 'c'] — insertion order

# Get with default
v = d.get("missing", 0)    # 0 if missing — no KeyError

# Setdefault — get or insert
groups.setdefault(key, []).append(val)

# Dict merge (3.9+)
merged = d1 | d2

# Iteration patterns
for k in d: ...
for v in d.values(): ...
for k, v in d.items(): ...

# Reverse a dict
inv = {v: k for k, v in d.items()}
```

### 3.5 collections module — specialty containers

```python
from collections import defaultdict, Counter, deque, namedtuple
```

#### defaultdict — auto-init missing keys

```python
# Group anagrams without setdefault gymnastics
groups = defaultdict(list)
for word in words:
    key = "".join(sorted(word))
    groups[key].append(word)
# groups[unseen_key] auto-creates empty list — no KeyError
```

#### Counter — multiset / frequency map

```python
text = "mississippi"
Counter(text)          # {'i':4, 's':4, 'p':2, 'm':1}
Counter(text).most_common(2)   # [('i', 4), ('s', 4)]

# Add / subtract
c1 = Counter("apple")
c2 = Counter("ape")
c1 + c2    # combined counts
c1 - c2    # subtract (negatives dropped)
```

#### deque — double-ended queue, O(1) both ends

```python
from collections import deque

q = deque([1, 2, 3])
q.appendleft(0)    # O(1)
q.popleft()        # O(1)
q.append(4)        # O(1)
q.pop()            # O(1)

# BFS template — ALWAYS use deque, never list
def bfs(start):
    q = deque([start])
    while q:
        node = q.popleft()
        ...

# Sliding window with maxlen
window = deque(maxlen=3)
for x in stream:
    window.append(x)   # auto-evicts oldest
```

#### OrderedDict — mostly redundant since 3.7

```python
# Pre-3.7 — needed for ordered iteration. 2026 mein use karne ke 2 reasons:
# 1. .move_to_end() method (LRU cache implementations)
# 2. Equality comparison checks order (dict doesn't)
from collections import OrderedDict
od = OrderedDict()
od["a"] = 1
od.move_to_end("a")    # move to end (LRU "touch")
```

#### namedtuple — lightweight record

```python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p.y      # named access
p[0]          # also indexable
# Immutable. For mutable + typed records, use @dataclass (next section).
```

### 3.6 heapq — priority queue

Python ka built-in min-heap. Max-heap chahiye toh values ko negate kar.

```python
import heapq

heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 1)
heapq.heappush(heap, 3)
heapq.heappop(heap)    # 1 (smallest)

# Top-K largest — DSA classic
heapq.nlargest(3, [5, 1, 9, 3, 7, 2])      # [9, 7, 5]
heapq.nsmallest(3, [5, 1, 9, 3, 7, 2])     # [1, 2, 3]

# Max-heap trick: negate values
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -1)
-heapq.heappop(max_heap)   # 5 (was -5)

# Custom priority — push tuples (priority, item)
tasks = []
heapq.heappush(tasks, (1, "urgent"))
heapq.heappush(tasks, (3, "later"))
heapq.heappush(tasks, (2, "soon"))
heapq.heappop(tasks)       # (1, 'urgent')
```

### 3.7 bisect — sorted list operations

For maintaining a sorted list with binary-search insertion / lookup. O(log n) search, O(n) insert (list shift), so use only when reads >> writes.

```python
import bisect

arr = [1, 3, 5, 7, 9]
bisect.bisect_left(arr, 5)    # 2 (leftmost position to insert)
bisect.bisect_right(arr, 5)   # 3 (rightmost)
bisect.insort(arr, 6)         # arr is now [1,3,5,6,7,9]

# DSA use: longest increasing subsequence in O(n log n)
def lis(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
```

### 3.8 The "comprehension over filter+map" rule

Functional friends `filter()` aur `map()` Python mein available toh hain, par idiomatic Python comprehension prefer karta hai.

```python
nums = [1, 2, 3, 4, 5]

# ❌ filter + map — works, ugly
result = list(map(lambda x: x*x, filter(lambda x: x % 2, nums)))

# ✅ Comprehension — clear
result = [x*x for x in nums if x % 2]
```

Comprehension wins on readability. `filter`/`map` survive only when you already have a named function.

---

## 4. Comprehensions + Generators — list ka guru, memory ka raja

### 4.1 List comprehensions

```python
# Basic
squares = [x*x for x in range(10)]

# With condition
evens = [x for x in range(20) if x % 2 == 0]

# Nested loops
pairs = [(i, j) for i in range(3) for j in range(3) if i != j]

# Nested list flatten
flat = [x for row in matrix for x in row]

# Conditional expression (different from filter!)
labeled = ["even" if x % 2 == 0 else "odd" for x in range(5)]
```

### 4.2 Set + dict comprehensions

```python
# Set comp
unique_lengths = {len(w) for w in words}

# Dict comp
sq_map = {x: x*x for x in range(5)}    # {0:0, 1:1, 2:4, 3:9, 4:16}

# Invert dict
inv = {v: k for k, v in d.items()}
```

### 4.3 Generator expressions — laaj se memory bachao

`(...)` instead of `[...]` — returns a **generator** object, lazy-evaluated.

```python
# List — materializes ALL squares in memory
squares = [x*x for x in range(10**8)]   # ~3 GB RAM, OOM

# Generator — yields one at a time
squares = (x*x for x in range(10**8))   # ~ a few bytes
total = sum(squares)                    # streams through, never materializes
```

`sum`, `max`, `min`, `any`, `all`, `''.join(...)` — sab generators accept karte hain. Itni baar tu list bana ke pass karega — har baar memory waste.

### 4.4 `yield` and `yield from`

Generator function — function jo `yield` use karta hai, return karne pe ek **generator object** deta hai.

```python
def fibonacci():
    a, b = 0, 1
    while True:           # infinite stream — fine, lazy
        yield a
        a, b = b, a + b

import itertools
first_10 = list(itertools.islice(fibonacci(), 10))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# yield from — delegate to sub-generator
def chain(*iterables):
    for it in iterables:
        yield from it     # equivalent to: for x in it: yield x

list(chain([1,2], [3,4], [5]))   # [1,2,3,4,5]
```

### 4.5 Generator pipelines — UNIX-style data flow

```python
# Read huge log file, find ERROR lines, extract timestamp, count by hour
def lines(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()

def errors(lines):
    for ln in lines:
        if "ERROR" in ln:
            yield ln

def timestamps(lines):
    for ln in lines:
        yield ln.split()[0]   # first token

# Chain — nothing is read until you consume
pipeline = timestamps(errors(lines("app.log")))
from collections import Counter
hour_counts = Counter(ts[:13] for ts in pipeline)
```

5 GB log file? Memory usage stays at a few KB. Sab kuch ek-ek line streaming hota hai. **Yeh hai Python ka real production muscle.**

### 4.6 When generators beat lists

| Scenario | Choose |
|----------|--------|
| Need to index, slice, or iterate twice | List |
| Single-pass over huge / infinite data | Generator |
| You'll pass to `sum`/`max`/`any`/`join` | Generator |
| You need `len()` | List |
| Memory tight | Generator |
| You'll call it from another function as input | Generator (composable) |

---

## 5. Functions + Decorators — Python ka killer combo

### 5.1 args, kwargs, and the `*` `/` separators

```python
# Positional + keyword
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"

greet("Aryan")                      # "Hello, Aryan"
greet("Aryan", greeting="Namaste")  # "Namaste, Aryan"

# *args — extra positional
# **kwargs — extra keyword
def log(level, *args, **kwargs):
    print(level, args, kwargs)

log("INFO", "user", "login", user_id=42, ip="1.2.3.4")
# INFO ('user', 'login') {'user_id': 42, 'ip': '1.2.3.4'}

# Unpack at call site
args = (1, 2, 3)
kwargs = {"sep": "-"}
print(*args, **kwargs)   # 1-2-3
```

#### Positional-only `/` and keyword-only `*` (3.8+)

```python
def f(pos_only, /, both, *, kw_only):
    ...

f(1, 2, kw_only=3)        # ✅
f(1, both=2, kw_only=3)   # ✅
f(pos_only=1, ...)        # ❌ TypeError — pos_only is positional-only
f(1, 2, 3)                # ❌ TypeError — kw_only must be keyword
```

API design: lock callers into clear contracts. `/` for "implementation detail params", `*` for "boolean flags / config — must name to avoid `func(True, False)` type confusion."

### 5.2 The default mutable argument footgun

**Most asked Python gotcha question. Yaad rakh.**

```python
def append_item(item, target=[]):    # ❌ DANGER
    target.append(item)
    return target

append_item(1)   # [1]
append_item(2)   # [1, 2]  ← WHAT?! Same list across calls.
append_item(3)   # [1, 2, 3]
```

Why? Default value evaluated **once** when function is defined, not each call. The `[]` is shared mutable state.

**Fix:**

```python
def append_item(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```

### 5.3 First-class functions + closures

Functions are objects. Pass them, return them, store them.

```python
def make_multiplier(factor):
    def multiply(x):
        return x * factor    # closure — captures `factor`
    return multiply

double = make_multiplier(2)
double(5)   # 10

triple = make_multiplier(3)
triple(5)   # 15
```

### 5.4 Decorators — `@` syntax

A decorator is a function that takes a function and returns a (usually wrapped) function.

```python
def loud(fn):
    def wrapper(*args, **kwargs):
        print(f">>> calling {fn.__name__}")
        result = fn(*args, **kwargs)
        print(f"<<< done")
        return result
    return wrapper

@loud
def add(a, b):
    return a + b

add(2, 3)
# >>> calling add
# <<< done
# 5

# @loud is sugar for: add = loud(add)
```

### 5.5 functools.wraps — preserve metadata

Decorator wrapping breaks `__name__`, `__doc__`, type signatures. Always use `@wraps`.

```python
from functools import wraps

def loud(fn):
    @wraps(fn)            # ← preserves fn's metadata on wrapper
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper
```

### 5.6 Decorators with arguments (3-level nesting)

```python
def repeat(n):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def hello():
    print("hi")

hello()    # prints 'hi' three times
```

### 5.7 Class decorators

A decorator that takes a class and returns (modified) class.

```python
def add_repr(cls):
    def __repr__(self):
        return f"{cls.__name__}({self.__dict__})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class User:
    def __init__(self, name):
        self.name = name

repr(User("Aryan"))   # "User({'name': 'Aryan'})"
```

`@dataclass` is the most famous class decorator (Section 6).

### 5.8 functools toolkit

```python
from functools import lru_cache, partial, reduce

# lru_cache — memoization
@lru_cache(maxsize=None)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

fib(100)   # instant — memoized

# partial — pre-bind some args
from functools import partial
power = lambda x, e: x ** e
square = partial(power, e=2)
square(5)   # 25

# reduce — left-fold
from functools import reduce
reduce(lambda a, b: a*b, [1,2,3,4,5])   # 120 (factorial)
# Note: prefer comprehensions / sum / math.prod when possible
```

### 5.9 Worked example: production-grade retry decorator

```python
import time, random
from functools import wraps

def retry(times=3, delay=0.5, backoff=2.0, exceptions=(Exception,)):
    """Retry decorator with exponential backoff + jitter."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exc = None
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
                    if attempt == times:
                        raise
                    sleep_for = current_delay * (1 + random.random() * 0.1)
                    print(f"[retry] {fn.__name__} failed ({e}); "
                          f"attempt {attempt}/{times}, sleeping {sleep_for:.2f}s")
                    time.sleep(sleep_for)
                    current_delay *= backoff
            raise last_exc
        return wrapper
    return decorator

@retry(times=4, delay=1.0, backoff=2.0, exceptions=(ConnectionError,))
def fetch_user(user_id):
    # imagine an HTTP call to Razorpay's user API
    ...
```

Yeh decorator real Razorpay/Swiggy backend mein chalta hai — flaky upstream API ke against retries with exponential backoff aur jitter. Tu PR mein submit karega aur senior tujhe nodding mein dekhega.

---

## 6. OOP + Dunder Methods — Python ki real power

### 6.1 Class basics

```python
class User:
    # class variable — shared across instances
    company = "EngiNerd"

    def __init__(self, name, email):     # constructor
        self.name = name                  # instance variable
        self.email = email

    def greet(self):                      # instance method
        return f"Hi, I'm {self.name}"

u = User("Aryan", "a@x.com")
u.greet()           # "Hi, I'm Aryan"
User.company        # "EngiNerd"
```

### 6.2 instance vs class vs static methods

```python
class Math:
    PI = 3.14159

    def instance_method(self, x):
        return x * self.PI       # self bound

    @classmethod
    def class_method(cls, x):
        return x * cls.PI        # cls bound — useful for alt constructors

    @staticmethod
    def static_method(x):
        return x * 3.14159        # neither — just namespaced

# Common pattern: alternative constructor via @classmethod
class Date:
    def __init__(self, y, m, d):
        self.y, self.m, self.d = y, m, d

    @classmethod
    def from_string(cls, s):           # "2026-05-02"
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)

d = Date.from_string("2026-05-02")
```

### 6.3 Inheritance + MRO (Method Resolution Order)

```python
class Animal:
    def speak(self):
        return "generic sound"

class Dog(Animal):
    def speak(self):
        return "bhonk bhonk"

class Puppy(Dog):
    pass

Puppy().speak()      # "bhonk bhonk" — MRO: Puppy → Dog → Animal → object

# Multiple inheritance — diamond
class A:
    def hello(self): return "A"
class B(A):
    def hello(self): return "B"
class C(A):
    def hello(self): return "C"
class D(B, C):
    pass

D().hello()           # "B"
D.__mro__             # (D, B, C, A, object)  — C3 linearization
```

`super()` calls next-in-MRO — not "the parent". Critical distinction in diamond hierarchies.

### 6.4 dataclass — boilerplate killer (3.7+)

```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    email: str
    age: int = 18                                # default
    tags: list[str] = field(default_factory=list)  # default mutable — use factory

u = User("Aryan", "a@x.com", 22)
print(u)         # User(name='Aryan', email='a@x.com', age=22, tags=[])
u == User("Aryan", "a@x.com", 22)   # True — auto __eq__
```

`@dataclass` auto-generates `__init__`, `__repr__`, `__eq__`. Frozen variant — immutable + hashable:

```python
@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float

p = Point(3, 4)
# p.x = 5    # FrozenInstanceError
hash(p)      # works because frozen → hashable

# slots=True (3.10+) — no __dict__, ~30% memory savings + faster attribute access
```

`@dataclass(frozen=True)` ka use Razorpay/Swiggy mein DTO (Data Transfer Object) ke liye hota hai — payload immutable, equality reliable, set/dict mein use ho sakta hai.

### 6.5 Abstract base classes

```python
from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount: int) -> str: ...

    @abstractmethod
    def refund(self, txn_id: str) -> bool: ...

class RazorpayGateway(PaymentGateway):
    def charge(self, amount):
        return "rzp_txn_123"
    def refund(self, txn_id):
        return True

# PaymentGateway()   # TypeError — can't instantiate abstract class
```

### 6.6 Dunder methods — operator overloading + protocols

| Dunder | Purpose |
|--------|---------|
| `__init__` | constructor |
| `__repr__` | unambiguous string for debugging — `repr(obj)` |
| `__str__` | human-friendly string — `str(obj)`, `print(obj)` |
| `__eq__`, `__ne__` | equality |
| `__lt__`, `__le__`, `__gt__`, `__ge__` | ordering — `total_ordering` decorator gives the rest from `__eq__` + `__lt__` |
| `__hash__` | hashability — must be consistent with `__eq__`. Default if mutable: not hashable |
| `__len__` | `len(obj)` |
| `__getitem__`, `__setitem__` | `obj[i]` |
| `__iter__`, `__next__` | iteration protocol |
| `__contains__` | `x in obj` |
| `__call__` | makes instance callable — `obj()` |
| `__enter__`, `__exit__` | context manager — `with obj:` |
| `__add__`, `__sub__`, `__mul__`, `__truediv__` | arithmetic |

### 6.7 Worked example — `Money` class

Production fintech rule: **never use `float` for money** — `0.1 + 0.2 = 0.30000000000000004`. Use integer paise (or `Decimal`) + a custom class.

```python
from dataclasses import dataclass
from functools import total_ordering

@total_ordering
@dataclass(frozen=True, slots=True)
class Money:
    paise: int            # store as int paise — no floats
    currency: str = "INR"

    def __post_init__(self):
        if not isinstance(self.paise, int):
            raise TypeError("paise must be int")
        if self.currency not in {"INR", "USD", "EUR"}:
            raise ValueError(f"unsupported currency {self.currency}")

    @classmethod
    def from_rupees(cls, rupees: float | str, currency="INR") -> "Money":
        # safe parse — strings preferred to avoid float roundoff
        from decimal import Decimal
        paise = int(Decimal(str(rupees)) * 100)
        return cls(paise, currency)

    def _check(self, other):
        if self.currency != other.currency:
            raise ValueError(
                f"currency mismatch: {self.currency} vs {other.currency}")

    def __add__(self, other: "Money") -> "Money":
        self._check(other)
        return Money(self.paise + other.paise, self.currency)

    def __sub__(self, other: "Money") -> "Money":
        self._check(other)
        return Money(self.paise - other.paise, self.currency)

    def __mul__(self, factor: int | float) -> "Money":
        return Money(int(self.paise * factor), self.currency)

    __rmul__ = __mul__   # 3 * money also works

    def __lt__(self, other: "Money") -> bool:
        self._check(other)
        return self.paise < other.paise

    def __str__(self):
        return f"{self.currency} {self.paise / 100:.2f}"


m1 = Money.from_rupees("1499.50")
m2 = Money.from_rupees("500")
m1 + m2                     # Money(paise=199950, currency='INR')
print(m1 + m2)              # INR 1999.50
m1 * 3                      # Money(paise=449850, ...)
m1 < m2                     # False
sorted([m1, m2])            # [Money(50000), Money(149950)]
```

`@total_ordering` derives `<=`, `>`, `>=` from `<` + `==`. `frozen=True` means hashable, comparable, immutable — production fintech ka template hai.

### 6.7 Context manager via dunders

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, *exc):
        self.elapsed = time.perf_counter() - self.start
        # return False (or None) → don't suppress exceptions

with Timer() as t:
    sum(range(10**6))
print(f"took {t.elapsed:.3f}s")
```

For simpler context managers, `contextlib.contextmanager` decorator wraps a generator:

```python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"took {time.perf_counter() - start:.3f}s")

with timer():
    do_stuff()
```

---

## 7. Async Python — concurrency without threads

### 7.1 The 3 concurrency models in Python

| Model | What it parallelizes | Best for | API |
|-------|---------------------|----------|-----|
| **threading** | I/O wait (GIL releases) | Blocking I/O libs you can't change | `threading.Thread` |
| **multiprocessing** | CPU work (separate processes) | CPU-bound work | `multiprocessing.Pool`, `concurrent.futures.ProcessPoolExecutor` |
| **asyncio** | I/O wait (cooperative) | Many concurrent I/O ops | `async def` + `await` |

**Rule of thumb:**
- 100s of HTTP calls? → asyncio
- Image resize on 16 cores? → multiprocessing
- Legacy lib that's blocking? → threading

### 7.2 asyncio basics

```python
import asyncio

async def fetch(url):           # async def → coroutine function
    print(f"fetching {url}")
    await asyncio.sleep(1)      # yields control while "waiting"
    return f"<html for {url}>"

async def main():
    # Sequential — total 3s
    a = await fetch("a")
    b = await fetch("b")
    c = await fetch("c")

    # Concurrent — total 1s
    a, b, c = await asyncio.gather(
        fetch("a"), fetch("b"), fetch("c")
    )
    print(a, b, c)

asyncio.run(main())             # entry point — sets up event loop
```

`async def` defines a coroutine. Calling it returns a coroutine object — does NOT run it. Use `await` (or `asyncio.run`/`gather`/`create_task`) to actually execute.

### 7.3 The event loop in 30 seconds

Single thread. List of "ready" tasks. Pick one, run until it `await`s something (I/O, timer). Park it. Run next ready task. When the I/O completes, mark task ready again. Repeat. **No threads, no locks, no race conditions on shared variables** (within the same loop) — but if you call a blocking sync function from an async coroutine, you **freeze the entire loop**.

### 7.4 async HTTP — httpx

```python
import asyncio, httpx

async def fetch_user(client, user_id):
    r = await client.get(f"https://api.example.com/users/{user_id}")
    r.raise_for_status()
    return r.json()

async def fetch_all(user_ids):
    async with httpx.AsyncClient(timeout=10) as client:
        tasks = [fetch_user(client, uid) for uid in user_ids]
        return await asyncio.gather(*tasks, return_exceptions=True)

users = asyncio.run(fetch_all(range(1, 1001)))
# 1000 HTTP calls in seconds, not minutes
```

### 7.5 Bounded concurrency — Semaphore

Don't fire 10000 requests at once — kill the upstream and yourself.

```python
async def fetch_with_limit(client, sem, url):
    async with sem:                 # blocks if N already in flight
        r = await client.get(url)
        return r.json()

async def main(urls):
    sem = asyncio.Semaphore(20)     # max 20 concurrent
    async with httpx.AsyncClient() as client:
        tasks = [fetch_with_limit(client, sem, u) for u in urls]
        return await asyncio.gather(*tasks)
```

### 7.6 asyncio.gather vs TaskGroup (3.11+)

```python
# gather — older, returns list
results = await asyncio.gather(t1(), t2(), t3())

# TaskGroup — modern, structured concurrency, cancels siblings on error
async with asyncio.TaskGroup() as tg:
    a = tg.create_task(t1())
    b = tg.create_task(t2())
    c = tg.create_task(t3())
# all done. results: a.result(), b.result(), c.result()
```

If any task raises in TaskGroup, all siblings auto-cancel. `gather` doesn't do that by default — you'd have manual cleanup.

### 7.7 Common asyncio footguns

1. **Calling sync blocking I/O inside async code** — freezes the loop. Use `asyncio.to_thread(sync_fn, args)`.
2. **Forgetting `await`** — `coro_fn()` without `await` returns coroutine object, doesn't run. Linters catch this.
3. **Mixing libraries** — `requests` (sync) inside `async def`? Wrong. Use `httpx` or `aiohttp`.
4. **CPU-bound in async** — async doesn't make CPU work parallel; one tight loop blocks all tasks.

### 7.8 Worked example — bounded parallel scraper

```python
import asyncio, httpx, time

URLS = [f"https://httpbin.org/delay/{i%3+1}" for i in range(50)]

async def fetch(client, sem, url):
    async with sem:
        try:
            r = await client.get(url, timeout=5)
            return url, r.status_code
        except Exception as e:
            return url, f"error: {e}"

async def main():
    sem = asyncio.Semaphore(10)
    t0 = time.perf_counter()
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            *(fetch(client, sem, u) for u in URLS)
        )
    print(f"50 requests, max 10 in flight, took {time.perf_counter()-t0:.2f}s")
    return results

asyncio.run(main())
```

Sequential = 50 × 2s avg = 100s. With concurrency=10 → ~10s. Production scrapers Razorpay reconciliation, Swiggy menu sync — sab is pattern pe chalte hain.

---

## 8. Type hints + mypy — runtime is loose, dev-time is tight

Python is **gradually typed** — you opt in. Type hints are not enforced at runtime; tools like `mypy`, `pyright`, `pyre` check them statically.

### 8.1 Basics — 3.10+ syntax

```python
def greet(name: str, count: int = 1) -> str:
    return f"hi {name}!" * count

# Built-in generics — no `from typing import List` anymore
def process(items: list[int]) -> dict[str, int]:
    return {"sum": sum(items), "count": len(items)}

# Union — pipe syntax (3.10+)
def find(id: int) -> User | None:
    ...

# Optional[X] is just X | None — old syntax, prefer the pipe
```

### 8.2 typing module — beyond builtins

```python
from typing import Callable, Iterable, Iterator, Sequence, Mapping, Any

def apply(fn: Callable[[int], int], xs: Iterable[int]) -> list[int]:
    return [fn(x) for x in xs]

# More precise than `list` — accept any iterable
def sum_all(xs: Iterable[int]) -> int:
    return sum(xs)
```

### 8.3 Generics — TypeVar

```python
from typing import TypeVar

T = TypeVar("T")

def first(xs: list[T]) -> T:
    return xs[0]

first([1, 2, 3])         # int
first(["a", "b"])        # str — type narrowed from input

# Bounded TypeVar
from typing import TypeVar
N = TypeVar("N", bound=int | float)
def double(x: N) -> N: return x * 2

# Python 3.12+ has cleaner generic syntax
def first[T](xs: list[T]) -> T:    # 3.12+ — no TypeVar import
    return xs[0]
```

### 8.4 Protocol — structural typing (duck typing with types)

Java is **nominal** — you must explicitly `implements Foo`. Python's `Protocol` is **structural** — if it walks like a duck, it IS a duck (statically too).

```python
from typing import Protocol

class HasArea(Protocol):
    def area(self) -> float: ...

class Circle:
    def __init__(self, r): self.r = r
    def area(self): return 3.14159 * self.r ** 2

class Square:
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

def total_area(shapes: list[HasArea]) -> float:
    return sum(s.area() for s in shapes)

total_area([Circle(3), Square(4)])    # mypy ok — neither inherits HasArea
```

### 8.5 mypy strict mode

```bash
pip install mypy
mypy --strict app/
```

Strict mode catches: untyped functions, implicit Any, missing return types, etc. Library code? Always strict. One-off scripts? Skip — overhead > value.

### 8.6 When type hints help vs hurt

| Scenario | Type hints? |
|----------|-------------|
| Library / API surface | YES, strict |
| Production app codebase | YES, gradual adoption |
| Data analysis notebook | NO, too noisy |
| 50-line throwaway script | NO |
| ML training code | Lightly — model types change often |

`mypy` finding bugs in your CI is the cheapest bug-prevention tool you can adopt. Razorpay, Swiggy, CRED ke backend repos all run mypy in CI — agar tu naya joining hai aur mypy errors push kar diye, PR bounce.

---

## 9. Standard library essentials

Python's "batteries included" philosophy — half the things you'd `pip install` in another language are stdlib here.

### 9.1 pathlib — replace `os.path`

```python
from pathlib import Path

# Don't ever do os.path.join(...) anymore
data = Path("data") / "users" / "2026.csv"     # cross-platform
data.parent                                    # Path('data/users')
data.suffix                                    # '.csv'
data.stem                                      # '2026'
data.exists()
data.is_file()
data.read_text()
data.write_text("hello")
list(Path("logs").glob("*.log"))               # all log files
list(Path("/etc").rglob("*.conf"))             # recursive
```

### 9.2 subprocess.run — shell out properly

```python
import subprocess

# Capture output, raise on failure
result = subprocess.run(
    ["git", "rev-parse", "HEAD"],
    capture_output=True, text=True, check=True,
    timeout=10,
)
print(result.stdout.strip())

# DON'T use shell=True with user input (shell injection)
# DON'T use os.system, os.popen — they're old
```

### 9.3 argparse — CLI in 5 lines

```python
import argparse

parser = argparse.ArgumentParser(description="Sync DB")
parser.add_argument("--source", required=True)
parser.add_argument("--dry-run", action="store_true")
parser.add_argument("--batch", type=int, default=100)
args = parser.parse_args()

print(args.source, args.dry_run, args.batch)
```

For richer CLIs (subcommands, colors, prompts), `click` or `typer` (built on click + type hints) are favorites.

### 9.4 json / csv / yaml

```python
import json, csv

# JSON
data = json.loads(s)
s = json.dumps(data, indent=2, default=str)   # default=str handles datetimes

# CSV
with open("users.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["email"])

with open("out.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=["a", "b"])
    writer.writeheader()
    writer.writerows([{"a":1, "b":2}])

# YAML — pip install pyyaml
import yaml
config = yaml.safe_load(open("config.yml"))
```

### 9.5 datetime + zoneinfo

```python
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

now_utc = datetime.now(timezone.utc)
now_ist = datetime.now(ZoneInfo("Asia/Kolkata"))

# Parse / format
dt = datetime.fromisoformat("2026-05-02T14:30:00+05:30")
dt.isoformat()
dt.strftime("%d %b %Y, %I:%M %p")

# Math
yesterday = now_utc - timedelta(days=1)
```

**Production rule:** Always store / transmit in UTC. Convert to local only at display.

### 9.6 re — regex

```python
import re

# Pattern compile once, use many
PHONE = re.compile(r"^\+?91[-\s]?(\d{10})$")

m = PHONE.match("+91 9876543210")
if m:
    print(m.group(1))   # '9876543210'

re.findall(r"\d+", "got 12 apples and 5 mangoes")  # ['12', '5']
re.sub(r"\s+", " ", "  too   many   spaces  ")     # ' too many spaces '

# Named groups
pat = re.compile(r"(?P<year>\d{4})-(?P<month>\d{2})")
pat.match("2026-05").groupdict()  # {'year': '2026', 'month': '05'}
```

### 9.7 logging — properly

`print` for scripts, `logging` for everything else.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger(__name__)

log.info("Starting sync")
log.warning("Disk usage at 85%%")
log.error("Failed to fetch user %s", user_id, exc_info=True)
```

In production: structured JSON logs (`python-json-logger`), shipped to ELK / Datadog / Cloudwatch.

---

## 10. Packaging + virtualenv — apna code dusro tak pahunchao

### 10.1 virtual environments — kyu zaruri hai

System Python ko mat chho — alag-alag projects ki dependency versions clash karengi. Har project ke liye isolated env.

```bash
# venv — built-in, no install needed
python -m venv .venv
source .venv/bin/activate     # Linux/Mac
# .venv\Scripts\activate      # Windows
pip install -r requirements.txt
deactivate
```

### 10.2 The 2026 toolchain — venv vs poetry vs pipenv vs uv

| Tool | What it does | Verdict |
|------|--------------|---------|
| **venv + pip + requirements.txt** | Built-in, simple | Fine for small projects |
| **pipenv** | Adds lockfile to pip | Was popular ~2018, now declining |
| **poetry** | Dep mgmt + build + publish, lockfile | Polished but slow |
| **uv** | Rust-based, 10-100x faster than pip | **2026 favorite** — drop-in pip + venv replacement |

```bash
# uv — modern, fast (Astral, makers of ruff)
pip install uv
uv venv                          # creates .venv
uv pip install fastapi httpx
uv pip compile requirements.in   # → requirements.txt with pins
```

### 10.3 pyproject.toml — modern config

PEP 517/518/621 — single config file replaces `setup.py`, `setup.cfg`.

```toml
[project]
name = "my-pkg"
version = "0.1.0"
description = "Demo"
requires-python = ">=3.10"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2",
]

[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff"]

[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[tool.ruff]
line-length = 100
```

### 10.4 requirements.txt vs lockfile

| File | Purpose |
|------|---------|
| `requirements.in` | Top-level deps you want |
| `requirements.txt` | Pinned + transitive (lockfile equivalent) |
| `poetry.lock` / `uv.lock` | Cryptographic lockfile |

**Production rule:** lockfile pinned to exact versions in CI / Docker. Reproducible builds = no "works on my machine."

### 10.5 Publishing to PyPI in 5 commands

```bash
# 1. Write your code + pyproject.toml as above
# 2. Build
python -m build              # produces dist/ with .whl + .tar.gz
# 3. Install twine
pip install twine
# 4. Upload to TestPyPI first
twine upload --repository testpypi dist/*
# 5. Upload to real PyPI
twine upload dist/*
```

`pip install my-pkg` — globally available. Razorpay ki `razorpay` SDK, Zerodha ki `kiteconnect` — ye sab is pipeline pe public hain.

---

## 11. Testing — pytest is the answer

```bash
pip install pytest pytest-cov
```

### 11.1 Basics

```python
# test_math.py
def add(a, b): return a + b

def test_add_basic():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0

# Run
# $ pytest -v
```

`pytest` auto-discovers `test_*.py` / `*_test.py`, no boilerplate (unlike `unittest`).

### 11.2 Fixtures — DRY setup/teardown

```python
import pytest

@pytest.fixture
def sample_users():
    return [{"id": 1, "name": "Aryan"}, {"id": 2, "name": "Priya"}]

def test_count(sample_users):
    assert len(sample_users) == 2

@pytest.fixture
def db():
    conn = create_connection()
    yield conn          # everything before yield = setup
    conn.close()        # everything after = teardown
```

### 11.3 parametrize — table-driven tests

```python
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

### 11.4 Mocking with unittest.mock

```python
from unittest.mock import patch, MagicMock

def get_user_email(user_id):
    response = httpx.get(f"https://api.example.com/users/{user_id}")
    return response.json()["email"]

def test_get_user_email():
    with patch("httpx.get") as mock_get:
        mock_get.return_value = MagicMock(
            json=lambda: {"email": "a@x.com"}
        )
        assert get_user_email(42) == "a@x.com"
        mock_get.assert_called_once()
```

### 11.5 Coverage

```bash
pytest --cov=app --cov-report=term-missing
# shows % coverage + uncovered line numbers
```

**Production rule:** new code 80%+ coverage as CI gate. 100% is vanity, 0% is criminal.

---

## 12. Top 30 Python interview questions

| # | Question | One-line answer |
|---|----------|-----------------|
| 1 | What is the GIL? | Global lock — only one thread runs Python bytecode at a time; affects CPU-bound threading, not I/O-bound or numpy/C extensions |
| 2 | `is` vs `==`? | `is` checks identity (same object); `==` checks value (calls `__eq__`) |
| 3 | List vs tuple? | List mutable, tuple immutable + hashable + slightly faster + smaller |
| 4 | Why are dicts ordered now? | Python 3.7+ guarantees insertion order; was CPython detail in 3.6 |
| 5 | Mutable default argument bug? | Default evaluated once at definition; shared across calls. Use `None` + `if x is None: x = []` |
| 6 | Shallow vs deep copy? | `copy.copy` copies outer container, inner refs shared; `copy.deepcopy` recurses |
| 7 | `*args` vs `**kwargs`? | `*args` collects extra positionals as tuple; `**kwargs` collects extra keywords as dict |
| 8 | What does `@staticmethod` do? | Function inside a class with no `self`/`cls` — just namespaced |
| 9 | What is a decorator? | A higher-order function that takes a function and returns a wrapped function; `@deco` is sugar |
| 10 | What does `functools.wraps` do? | Copies `__name__`, `__doc__`, signature from wrapped fn to wrapper — preserves metadata |
| 11 | List comp vs generator expression? | List comp builds full list in memory; gen expr lazy-evaluates one at a time |
| 12 | When to use `yield`? | Generator — for streaming / infinite / memory-friendly iteration |
| 13 | `__init__` vs `__new__`? | `__new__` creates the instance, `__init__` initializes it — usually only override `__init__` |
| 14 | What is MRO? | Method Resolution Order — C3 linearization for multiple inheritance |
| 15 | What is `super()`? | Calls next-in-MRO method — not "the parent" in diamond inheritance |
| 16 | What does `@dataclass` give? | Auto `__init__`, `__repr__`, `__eq__`; with `frozen=True`, also hashable + immutable |
| 17 | `__str__` vs `__repr__`? | `__str__` for users (`print`), `__repr__` for developers (`repr`, debugger). Repr should be unambiguous |
| 18 | What is duck typing? | "If it walks/quacks like a duck, it IS a duck" — type by behavior, not class |
| 19 | What is a Protocol? | typing's structural-typing equivalent of an interface — class doesn't need to inherit |
| 20 | asyncio vs threading vs multiprocessing? | asyncio: cooperative I/O; threading: I/O with blocking libs; multiprocessing: CPU parallel |
| 21 | What does `await` do? | Suspends current coroutine, lets event loop run others until awaited thing completes |
| 22 | `asyncio.gather` vs `TaskGroup`? | gather — older, returns list, manual cancellation. TaskGroup — structured concurrency, auto-cancels siblings on error (3.11+) |
| 23 | `lru_cache` purpose? | Memoizes function calls — cache hit returns cached result. Saves recomputation |
| 24 | `lambda` vs `def`? | `lambda` is single-expression anonymous; `def` is full-statement named — prefer `def` for >1 line |
| 25 | f-string benefits? | Inline expressions, debug-print (`{x=}`), faster than `.format`, support format specs |
| 26 | Walrus `:=`? | Assignment expression — assign + use in same expression (3.8+) |
| 27 | What's pip vs venv? | `pip` installs packages; `venv` isolates them per-project; complement, not alternative |
| 28 | `pyproject.toml` vs `setup.py`? | Modern PEP 621 declarative config replaces imperative setup.py |
| 29 | What is mypy? | Static type checker — catches type mismatches at dev time; runtime untouched |
| 30 | `try/except/else/finally`? | else: runs if no exception. finally: always runs (cleanup). Use else to keep try block minimal |

---

## 13. Pre-interview checklist

Walk-in confidence — mentally tick:

- [ ] Can I explain GIL in one paragraph + when it bites + when it doesn't?
- [ ] Can I distinguish list/tuple/set/dict by mutability + lookup time + use case?
- [ ] Can I write a decorator with arguments using `functools.wraps`?
- [ ] Can I explain the mutable-default-arg bug + show the fix?
- [ ] Can I write a generator function and a generator pipeline?
- [ ] Can I implement a custom class with `__eq__`, `__hash__`, `__lt__`?
- [ ] Can I explain `@dataclass(frozen=True)` and when to use slots?
- [ ] Can I write a context manager two ways (class + `@contextmanager`)?
- [ ] Can I write a small `asyncio.gather` with bounded concurrency via Semaphore?
- [ ] Can I explain when threading wins vs multiprocessing wins vs asyncio wins?
- [ ] Can I write `list[int]` vs `dict[str, int]` type hints + use Protocol?
- [ ] Can I parse JSON, slice CSV, format datetime in IST, write a regex?
- [ ] Do I use `pathlib` over `os.path`?
- [ ] Can I write a pytest fixture + parametrize a test?
- [ ] Can I read a `pyproject.toml`?
- [ ] Can I explain `is` vs `==` + when each is correct?
- [ ] Can I do tuple unpacking, `*rest`, `enumerate`, `zip(strict=True)`?
- [ ] Can I explain `*` and `/` in function signatures?
- [ ] Can I name 6 dunder methods + their purpose?
- [ ] Can I explain MRO + diamond inheritance + what `super()` actually does?

18+ ticks → you walk in confident. Python interviewers reward depth over rote — agar tu *kyu* bata sakta hai (kyu list slow at front, kyu set O(1), kyu mutable default broken), tu jeet jayega.

---

## What to learn next

Python solid ho gaya — ab compounding ke liye yeh order:

- **DSA practice (LeetCode + Codeforces)** — Python ki speed of expression DSA mein cash karo. Top patterns: two-pointer, sliding window, BFS/DFS, DP, heap.
- **`dbms-complete`** — Python ka backend code 90% time DB ke saath baat karta hai. Schema + indexes + transactions samajh.
- **`genai-classical-ml`** — pandas, sklearn, numpy ka deep dive. Python ka real ML use case.
- **`genai-deep-learning`** + **`genai-frameworks`** — PyTorch / TensorFlow Python ki gen-AI capital hain.
- **`system-design-basics`** — FastAPI + async Python ko production architecture mein fit karna.
- **`docker-containers`** — apna Python service Dockerfile mein wrap karna seekh, deployment-ready ban.

Python ka asli leverage tab milta hai jab tu ise stack ke baaki tools ke saath compose karta hai. Ek language nahi, ek superpower hai — agar tu idiomatic likhta hai, tu 10x productive engineer banta hai. Best of luck.
