# MongoDB Deep Dive

Bhai, agar tu Indian backend interview de raha hai aur tujhe lagta hai "Mongo to bas `db.collection.find({})` hai", to tu seedha Round 1 mein cut hoga. MongoDB pichle 8 saal mein Indian startup ecosystem ka **default document database** ban gaya hai — Razorpay analytics, Swiggy menu, PhonePe ledger metadata, Zomato reviews, CRED rewards — sab ke production mein Mongo hai. MERN stack ka 'M' yahi hai, MEAN ka bhi yahi, aur Atlas free tier ki wajah se har college student aaj `mongosh` shell ke saath khel chuka hai.

Lekin "khel chuka hai" aur "production-grade samajhta hai" ke beech ek ocean hai. Tu Atlas pe ek cluster spin karke `insertOne` chala leta hai — wo SDE intern level hai. SDE-1 ke liye chahiye aggregation pipeline, indexes ki ESR rule, replica set election, shard key tradeoffs. SDE-2 ke liye chahiye explain plans padhna, performance advisor reading, schema design ke 6 patterns. Staff engineer ke liye chahiye **kab Mongo nahi use karna** — wo wisdom alag level hai.

Ye subject content/database-nosql.md ka 2x deep dive hai — wahan generic NoSQL family thi (MongoDB + Cassandra + Dynamo + Redis), yahan sirf MongoDB hai but har topic 2x tak khulta hai. Reference: MongoDB 7.0 documentation, MongoDB University M001/M201/M312 free courses, aur 5 saal ka production scar tissue. Code mongosh aur Node.js driver dono mein — kyunki 2026 mein interview mein dono expect hote hain. Comments English mein (code clean rahe), prose Hinglish mein (taaki tu yahi vocabulary interview mein use kar sake).

Chai garam kar le, ye 1400+ line ka safar hai. End mein tu Mongo ke baare mein wo cheez bhi jaanega jo Atlas ke "Try Free" button click karne wala 99% developer kabhi nahi seekhta. Chal shuru karte hain.

---

## 1. Why MongoDB is the most-asked NoSQL DB in Indian backend interviews

### 1.1 The MERN tax — every JavaScript backend role tests Mongo

Tu agar 2018 ke baad ka Indian engineering grad hai, to tu MERN stack pe project zaroor banaya hoga — collegeke 4th sem ka mini-project ho ya GFG ka 30-day challenge. MongoDB is stack ka default DB hai. Reason simple — MongoDB ka native data format **BSON** hai jo JSON ka extended binary cousin hai, aur Node.js mein JSON to native object hai. Toh tu apne Node.js code se JavaScript object directly Mongo mein dump kar sakta hai — koi ORM mapping, koi schema migration, koi `CREATE TABLE` boilerplate nahi.

Ye seamlessness Indian startup hiring ke liye golden hai. Razorpay, Swiggy, Zerodha, Cred, Meesho — sab ki backend mein Node.js + Mongo ka kuch combination hai. Razorpay ka **analytics platform** Mongo pe banaya gaya hai (event ingestion + aggregation pipeline real-time dashboards ke liye). Swiggy ka **menu management** Mongo mein hai (har restaurant ka menu ek document, items embedded, fast retrieval at order time). PhonePe ka **ledger metadata** layer Mongo pe hai (actual money transactions PostgreSQL mein, but transaction metadata, retry state, idempotency keys — Mongo). CRED ka **rewards catalog** Mongo mein hai (offer documents with nested rules).

Toh jab tu MERN/Node.js role apply karta hai, interviewer ye assume karta hai ki tu Mongo ko relational DB jitna seriously samjha hai. Wo question puchhega — "ESR rule kya hai", "compound index kab banayega", "$lookup ka latency tradeoff kya hai", "sharded cluster mein writes kaise route hote hain". In sab ka jawab "thoda thoda" se kaam nahi chalta — depth chahiye.

### 1.2 Salary band signal — Mongo depth = SDE-2 territory

Ek raw salary signal samjho. Indian product startups mein 2026 mein:

| Role band | CTC range (LPA) | Mongo expectation |
|-----------|-----------------|-------------------|
| SDE-Intern / SDE-0 | 6-12 | CRUD aata ho, basic find/insert |
| SDE-1 | 18-32 | Aggregation pipeline, basic indexes, schema embed vs reference |
| SDE-2 | 35-65 | Explain plans, ESR, replica set basics, transactions, schema patterns |
| SDE-3 / Staff | 70-150+ | Sharding strategy, working set sizing, performance advisor, when to switch off Mongo |

Razorpay ka ek SDE-2 interview maine personally dekha hai — 4 questions Mongo specific the. "Ek `orders` collection 50 crore documents ka hai, query `{ userId, status: 'PENDING' }` slow hai — kya karoge?" — yahan tujhe explain plan padhna aana chahiye, ESR rule samjhana chahiye, partial index ka case banana chahiye. Atlas ke `find` button se kaam nahi chalega.

Swiggy ka SDE-3 interview mein system design round mein "Design a menu service for 5 lakh restaurants with 10x traffic spike at lunch hour" — yahan embedding vs referencing, working set calculations, read replica fan-out, sharding by city — sab cheezen aati hain. Agar tu sirf `find/insert` jaanta hai, tu lunch hour ke pehle hi cut ho jayega.

### 1.3 Atlas free tier — the de-facto teaching tool

Ek aur reason Mongo Indian interviews mein dominate karta hai — **MongoDB Atlas ka free tier (M0)**. Koi credit card nahi chahiye, 512 MB storage milta hai, 3-node replica set deployed hai (real production topology), aur tu 5 minute mein cluster ready kar sakta hai. Postgres ka equivalent free tier (Supabase, Neon) bhi hai but wo limited features dete hain — Mongo Atlas free tier mein tu **actual production-grade replica set** ke saath play kar sakta hai, including failover testing, change streams, full aggregation pipeline.

College mein professor MongoDB padhane ke liye Atlas use karte hain. YouTube tutorials Atlas use karte hain. NeetCode aur Striver ke system design videos Mongo ke screenshots Atlas se hote hain. Ye network effect hai — har student ka first hands-on document database experience Mongo + Atlas hai. Toh interviewer assume kar leta hai ki tujhe Atlas ka basic UI to aata hi hoga, aur seedha aggregation aur indexes pe kud jata hai.

Bottom line: MongoDB depth Indian backend roles ke liye **non-negotiable** hai. Tu agar 2026 mein 30+ LPA ka package chahta hai aur backend track pe hai, in 16 sections ko ratta nahi, samajh ke padhna padega. Chai phir se garam kar — section 2 mein BSON ki kahani.

---

## 2. BSON vs JSON — what actually flies on the wire

### 2.1 The format that powers everything

JSON tu jaanta hai — text format, human-readable, har programming language parse kar leti hai. MongoDB ka native storage aur wire format **BSON (Binary JSON)** hai. Ye JSON ka binary-encoded extended cousin hai — har key-value pair ek binary block ke roop mein store hota hai with type tags, length prefixes, aur extended types jo plain JSON mein nahi hote.

Pehla sawal jo interview mein aata hai — "Bhai BSON aur JSON mein difference kya hai? MongoDB JSON kyu nahi use karta?". Iske teen layered jawab hain:

1. **Type fidelity** — JSON mein `Date` type nahi hai (sirf string convention), `int` aur `float` ka distinction nahi (sab `number`), binary data nahi (sirf base64 string). BSON mein **20+ explicit types** hain — `Int32`, `Int64`, `Double`, `Decimal128`, `Date`, `Binary`, `ObjectId`, `Timestamp`, `RegEx`, etc. Ye production mein matter karta hai — `Decimal128` paisa store karne ke liye essential hai (floats banking apps mein paisa eat kar jate hain).

2. **Wire efficiency** — BSON binary hai, parsing tezz hai. JSON parse karne mein har byte read karke string-to-number convert karna padta hai; BSON mein number directly binary representation se read ho jata hai. Storage mein BSON kabhi-kabhi JSON se thoda bigger hota hai (length prefixes overhead) but **faster traversal** ke liye trade kiya gaya hai.

3. **Schema metadata** — BSON ka design fast in-place updates ke liye optimized hai. Document ke har field ka type aur length pre-known hai, toh `$inc` ya `$set` operation pura document re-serialize kiye bina specific bytes overwrite kar sakta hai.

### 2.2 BSON types you'll actually use

```javascript
// mongosh — BSON types in action
db.users.insertOne({
  // ObjectId — 12-byte unique ID, default _id type
  _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),

  // String (UTF-8)
  name: "Ratnesh Sharma",

  // Int32 — explicit (default for numbers without decimal in JS shell)
  age: NumberInt(28),

  // Int64 — for values > 2^31
  followerCount: NumberLong("9999999999"),

  // Double — default for decimals
  rating: 4.7,

  // Decimal128 — exact decimal arithmetic, for money
  // CRITICAL: never store rupees as Double — floating-point rounding will eat money
  walletBalance: NumberDecimal("12345.67"),

  // Date — actual binary date, not string
  createdAt: new Date("2026-05-04T10:30:00Z"),

  // Binary — raw bytes (e.g., for hashes, encryption keys, small files)
  passwordHash: BinData(0, "abc123base64=="),

  // Boolean
  emailVerified: true,

  // Null
  middleName: null,

  // Array — heterogeneous allowed
  roles: ["user", "premium"],

  // Embedded document (sub-doc)
  address: {
    city: "Bengaluru",
    pincode: "560001"
  }
});
```

```javascript
// Node.js driver — BSON types from JS code
import { ObjectId, Decimal128, Long, Binary, Double } from 'mongodb';

const userDoc = {
  _id: new ObjectId(),
  name: "Priya Iyer",
  age: 26,                                    // JS number → Double in BSON
  walletBalance: Decimal128.fromString("500.50"), // exact money
  followerCount: Long.fromNumber(2000000000),     // explicit Int64
  createdAt: new Date(),
  profilePic: new Binary(Buffer.from('...'), 0)
};
await db.collection('users').insertOne(userDoc);
```

### 2.3 ObjectId decomposition — interview classic

ObjectId is the default `_id` type in MongoDB. Ye 12-byte (24 hex chars) unique identifier hai, aur har interview mein puchha jata hai — **"ObjectId ke 12 bytes kya represent karte hain?"**.

```
ObjectId: 65a1b2c3d4e5f6a7b8c9d0e1
         |--------|------|----|------|
            4         5      3   ← bytes
            ts      machine  ctr
```

- **4 bytes — Unix timestamp (seconds)**: Document creation time. Tu `ObjectId.getTimestamp()` se nikal sakta hai. Ye property kaam aati hai — agar tujhe document creation date chahiye but tu `createdAt` field bhulna chahta hai, ObjectId already deta hai.
- **5 bytes — random value per process**: Pehle ye "machine ID + process ID" tha (3 bytes machine hash + 2 bytes PID), but MongoDB 3.4 se simplified — bas 5 bytes random per mongod process startup pe. Reason — Docker/Kubernetes mein machine ID predictable nahi tha, collisions ho rahe the.
- **3 bytes — incrementing counter**: Process-level counter, har new ObjectId pe `+1`. Random initial value se start hota hai (taaki app restart ke baad collision na ho). 3 bytes = 16 million unique IDs per second per process — practically unbounded.

```javascript
// mongosh — ObjectId properties
const id = ObjectId("65a1b2c3d4e5f6a7b8c9d0e1");
id.getTimestamp();    // ISODate("2024-01-12T...")
id.toHexString();     // "65a1b2c3d4e5f6a7b8c9d0e1"

// Query "documents created in last 24 hours" without createdAt field
const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
const minId = ObjectId.createFromTime(oneDayAgo);
db.orders.find({ _id: { $gte: minId } });
// Why this works: ObjectId is monotonic-ish on time prefix, so range query on _id ≈ time-range
```

**Why is this important in production?** ObjectId's timestamp prefix means **default `_id` ordering is approximately time-ordered**. Iska side-effect — agar tu `_id` ko shard key banata hai (which you should NOT for write-heavy collections), saari nayi writes latest shard pe jayengi (hot shard problem). Ye section 9 mein detail mein khulega.

### 2.4 BSON size limit — 16 MB per document

Har BSON document **16 MB hard limit** ke saath aata hai. Ye design choice hai, bug nahi. Reasons:

- **Working set RAM** — agar document 1 GB ka ho, tu RAM mein fit nahi hoga, har read disk se aayegi.
- **Network packets** — 16 MB se bade payloads gateway/load balancer choke karte hain.
- **Replication lag** — bada document oplog mein bada entry, replicas ko sync karne mein zyada time.

Agar document 16 MB cross kar raha hai, schema redesign karo — ya **bucket pattern** (time-series ke liye), ya **GridFS** (large blobs ke liye, ye section 7 mein detail), ya **outright split** (embed ko reference mein convert).

**Pro tip**: Aggregation pipeline mein intermediate documents ye 16 MB limit hit kar sakte hain agar `$group` aur `$push` se massive arrays bante hain. Solution — `{ allowDiskUse: true }` flag use karo aggregate call mein.

---

## 3. CRUD with mongosh + Node.js driver

### 3.1 Insert — single, many, ordered, unordered

```javascript
// insertOne — returns { acknowledged, insertedId }
db.orders.insertOne({
  userId: ObjectId("65a..."),
  items: [{ name: "Masala Dosa", price: 120, qty: 2 }],
  totalAmount: NumberDecimal("240.00"),
  status: "PLACED", createdAt: new Date()
});

// insertMany — bulk; ordered:false continues on per-doc errors
db.swiggy_orders.insertMany([
  { userId: 1, total: 250, city: "Mumbai" },
  { userId: 2, total: 180, city: "Delhi" }
], { ordered: false });
```

```javascript
// Node.js driver — bulk with partial-failure handling
try {
  const r = await orders.insertMany(docArray, {
    ordered: false, writeConcern: { w: 'majority' }
  });
} catch (err) {
  if (err.code === 11000) console.log('duplicate keys present');
  console.log(`inserted before failure: ${err.result.insertedCount}`);
}
```

### 3.2 Find — the workhorse

```javascript
// Equality + range, with projection
db.users.find({ isPremium: true }, { name: 1, email: 1, _id: 0 });

// Sort + limit + skip — but skip is O(skipped) — for real pagination use cursor below
db.orders.find({ userId: ObjectId("...") })
  .sort({ createdAt: -1 }).limit(10);

// Cursor-based pagination — production pattern, O(log n + page)
const lastSeenId = ObjectId("65a1b2c3...");
db.orders.find({ _id: { $lt: lastSeenId } }).sort({ _id: -1 }).limit(20);

// Count — pick wisely
db.orders.countDocuments({ status: "PLACED" }); // accurate, indexed scan
db.orders.estimatedDocumentCount();              // metadata, instant, rough
```

```javascript
// Node.js — cursor for large result sets (low memory)
for await (const doc of orders.find({ status: 'PLACED' })) {
  await processOrder(doc);
}
// .toArray() loads everything in memory — only for small results
```

### 3.3 Update — atomic operators are your best friend

```javascript
db.users.updateOne(
  { _id: ObjectId("65a...") },
  {
    $set: { lastLogin: new Date(), city: "Pune" },
    $inc: { loginCount: 1, walletBalance: -50 },
    $push: { recentSearches: "biryani" },
    $addToSet: { tags: "verified" },
    $pull: { recentSearches: "old" },
    $unset: { tempToken: "" },
    $currentDate: { updatedAt: true }
  }
);

// Bulk update + upsert with $setOnInsert (insert-only fields)
db.userSettings.updateOne(
  { userId: ObjectId("65a...") },
  {
    $set: { lastSeen: new Date() },
    $setOnInsert: { createdAt: new Date() }
  },
  { upsert: true }
);

// Array updates — positional $ and arrayFilters
db.users.updateOne(
  { _id: ObjectId("65a..."), "addresses.type": "home" },
  { $set: { "addresses.$.pincode": "560001" } }
);
db.users.updateOne(
  { _id: ObjectId("65a...") },
  { $set: { "addresses.$[el].verified": true } },
  { arrayFilters: [{ "el.type": { $in: ["home", "office"] } }] }
);

// findOneAndUpdate — atomic read-modify-write, returns doc
db.counters.findOneAndUpdate(
  { name: "orderId" },
  { $inc: { value: 1 } },
  { returnDocument: "after", upsert: true }
);
```

```javascript
// Atomic check-and-decrement (no race) — condition lives in filter
const r = await products.updateOne(
  { _id: productId, stock: { $gte: requestedQty } },
  { $inc: { stock: -requestedQty } }
);
if (r.modifiedCount === 0) throw new Error('Insufficient stock');
```

**Why atomic operators**: single-document ops are atomic. `read → modify → write` pattern races; `$inc`, `$push`, `$pull` server-side atomic — concurrent-safe.

### 3.4 Replace and delete

```javascript
// replaceOne — full document overwrite (drops fields not in new doc)
db.users.replaceOne({ _id: ObjectId("65a...") }, { name: "Ratnesh", email: "..." });

// delete and findOneAndDelete (atomic queue pop pattern)
db.sessions.deleteOne({ token: "expired-xyz" });
db.logs.deleteMany({ timestamp: { $lt: oneMonthAgo } });
db.tasks.findOneAndDelete({ status: "READY" }, { sort: { priority: -1 } });
```

### 3.5 Realistic Indian-context CRUD example — Razorpay payments

```javascript
// Node.js — payment lifecycle in 4 atomic operations
const payments = client.db('razorpay').collection('razorpay_payments');

// 1. Create
await payments.insertOne({
  _id: new ObjectId(),
  userId, merchantId,
  amount: Decimal128.fromString(amount.toString()),
  status: "CREATED", attempts: 0, createdAt: new Date()
});

// 2. Atomic state transition — only succeeds if status matches expected
await payments.findOneAndUpdate(
  { _id: paymentId, status: { $in: ["CREATED", "FAILED"] } },
  {
    $inc: { attempts: 1 },
    $set: { status: "ATTEMPTING", lastGateway: gateway },
    $push: { attemptLog: { gateway, timestamp: new Date() } }
  },
  { returnDocument: "after" }
);

// 3. Mark success — guard with current status
await payments.updateOne(
  { _id: paymentId, status: "ATTEMPTING" },
  { $set: { status: "SUCCESS", gatewayTxnId, completedAt: new Date() } }
);

// 4. Query: user's last 10 successful payments
await payments.find(
  { userId, status: "SUCCESS" },
  { projection: { amount: 1, merchantId: 1, completedAt: 1 } }
).sort({ completedAt: -1 }).limit(10).toArray();
```

Atomic guards (`status` in filter) prevent race conditions. Production-grade Mongo code aisa hi dikhta hai.

---

## 4. Query operators deep-dive

MongoDB ka query language operator-driven hai. Har filter ek operator combination hai. Categories: **comparison, logical, element, array, evaluation**.

### 4.1 Comparison operators

```javascript
// $eq, $ne — equality / not-equal
db.users.find({ status: { $ne: "BANNED" } });

// $gt, $gte, $lt, $lte — numeric / date range
db.orders.find({
  totalAmount: { $gte: 500, $lte: 5000 },
  createdAt: { $gte: ISODate("2026-01-01") }
});

// $in / $nin — value in / not in array
db.users.find({ city: { $in: ["Mumbai", "Pune", "Nashik"] } });
db.users.find({ status: { $nin: ["BANNED", "DELETED"] } });
```

### 4.2 Logical operators

```javascript
// Multiple field-conditions are implicit $and
db.users.find({ age: { $gte: 18, $lt: 60 } });

// $or — at least one must match
db.users.find({
  $or: [{ isPremium: true }, { walletBalance: { $gte: 1000 } }]
});

// $nor — none must match; $not — negate a single operator
db.users.find({ $nor: [{ status: "BANNED" }, { emailVerified: false }] });
db.products.find({ price: { $not: { $gt: 5000 } } });
```

### 4.3 Element operators

```javascript
// $exists — field present check; matches null too
db.users.find({ phone: { $exists: true, $ne: null } });

// $type — BSON type check
db.users.find({ age: { $type: "int" } });
```

### 4.4 Array operators

```javascript
// $elemMatch — all conditions on SAME array element (not across elements)
db.products.find({
  reviews: { $elemMatch: { rating: { $gte: 4 }, verified: true } }
});

// $size — exact length; $all — contains all values
db.users.find({ addresses: { $size: 0 } });
db.products.find({ tags: { $all: ["electronics", "5g", "smartphone"] } });

// dot notation by index
db.users.find({ "addresses.0.city": "Mumbai" });
```

### 4.5 Evaluation operators

```javascript
// $regex — anchored prefix uses index; free regex = collection scan
db.users.find({ email: { $regex: /@razorpay\.com$/ } });   // can use index

// $expr — compare two fields in the same document
db.invoices.find({ $expr: { $gt: ["$paidAmount", "$totalAmount"] } });

// $text — full-text search; requires text index
db.articles.find({ $text: { $search: "mongodb sharding" } });

// AVOID: $where runs JS, no index, slow. Prefer $expr.
```

### 4.6 Worked example — Swiggy refund eligibility

"Mujhe sare orders chahiye jo: Mumbai/Pune se hain, total ≥ 500, status PLACED ya CONFIRMED, items array mein koi ek "non-veg" tag wala item hai with quantity > 0, aur lastUpdatedAt 60 min se purana hai":

```javascript
db.swiggy_orders.find({
  city: { $in: ["Mumbai", "Pune"] },
  totalAmount: { $gte: 500 },
  status: { $in: ["PLACED", "CONFIRMED"] },
  items: {
    $elemMatch: {
      tags: "non-veg",
      qty: { $gt: 0 }
    }
  },
  lastUpdatedAt: { $lt: new Date(Date.now() - 3600 * 1000) }
});
```

Notice — comparison ($in, $gte, $lt), logical (implicit $and across fields), array ($elemMatch), all combined. Yahi pattern interview mein milega.

---

## 5. The aggregation pipeline — THE interview topic

### 5.1 Why pipeline matters

Aggregation pipeline MongoDB ka data processing framework hai. Tu input collection deta hai, **stages** ke through data flow hota hai, har stage previous ka output input ke roop mein leta hai. Unix pipes jaisa concept — `cat file | grep "x" | sort | uniq -c | head -10`. Mongo mein same idea, but documents pe.

Interview mein ye topic isliye dominate karta hai kyunki real-world queries simple `find` se zyada hoti hain. "Last 30 days mein top 10 restaurants by revenue, grouped by city, with month-over-month growth" — ye ek 8-stage pipeline hai. Aata hai to tu SDE-2 candidate, nahi to entry-level.

### 5.2 The core stages

```javascript
// $match — filter (always first if possible — uses indexes)
{ $match: { status: "DELIVERED", city: "Mumbai" } }

// $project — select / reshape fields
{ $project: { _id: 0, restaurantId: 1, total: 1, dayOfWeek: { $dayOfWeek: "$createdAt" } } }

// $group — group by + aggregate
{
  $group: {
    _id: "$restaurantId",
    totalRevenue: { $sum: "$total" },
    orderCount: { $sum: 1 },
    avgOrder: { $avg: "$total" },
    uniqueUsers: { $addToSet: "$userId" }
  }
}

// $sort — order results
{ $sort: { totalRevenue: -1 } }

// $limit + $skip — pagination
{ $limit: 10 }
{ $skip: 20 }

// $unwind — explode array → one doc per element
{ $unwind: "$items" }
// Optional: preserveNullAndEmptyArrays for left-join semantics
{ $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }

// $lookup — left outer join
{
  $lookup: {
    from: "restaurants",
    localField: "restaurantId",
    foreignField: "_id",
    as: "restaurant"
  }
}

// $facet — multiple parallel sub-pipelines
{
  $facet: {
    byCity: [{ $group: { _id: "$city", count: { $sum: 1 } } }],
    byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
    totalRevenue: [{ $group: { _id: null, total: { $sum: "$amount" } } }]
  }
}

// $bucket — fixed buckets
{
  $bucket: {
    groupBy: "$totalAmount",
    boundaries: [0, 200, 500, 1000, 5000],
    default: "Above5K",
    output: { count: { $sum: 1 } }
  }
}

// $bucketAuto — auto-distribute into N buckets
{
  $bucketAuto: { groupBy: "$totalAmount", buckets: 5 }
}

// $addFields — add new fields without losing existing ones
{ $addFields: { discount: { $multiply: ["$total", 0.1] } } }

// $merge — write pipeline result to a collection (replaces $out's older limited form)
{
  $merge: {
    into: "monthly_revenue_report",
    on: ["restaurantId", "month"],
    whenMatched: "merge",
    whenNotMatched: "insert"
  }
}
```

### 5.3 Building a real pipeline — MoM revenue per restaurant for Swiggy

Goal: "Pichle 60 din ka data le. Har restaurant ke liye, current month revenue aur last month revenue calculate kar. Month-over-month growth percentage aur ranking nikal. Top 20 restaurants chahiye city-wise grouped, with restaurant name from join."

```javascript
db.swiggy_orders.aggregate([
  // Stage 1: Filter to last 60 days, only delivered orders
  // Critical: $match first, with indexed fields, to reduce dataset early
  {
    $match: {
      status: "DELIVERED",
      createdAt: { $gte: new Date(Date.now() - 60 * 86400 * 1000) }
    }
  },

  // Stage 2: Add month bucket field for grouping
  {
    $addFields: {
      monthBucket: {
        $cond: {
          if: { $gte: ["$createdAt", new Date(Date.now() - 30 * 86400 * 1000)] },
          then: "current",
          else: "previous"
        }
      }
    }
  },

  // Stage 3: Group by (restaurantId, monthBucket) — revenue per restaurant per bucket
  {
    $group: {
      _id: { restaurant: "$restaurantId", bucket: "$monthBucket" },
      revenue: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 }
    }
  },

  // Stage 4: Re-pivot — one doc per restaurant with both month figures
  {
    $group: {
      _id: "$_id.restaurant",
      monthData: {
        $push: {
          bucket: "$_id.bucket",
          revenue: "$revenue",
          orders: "$orderCount"
        }
      }
    }
  },

  // Stage 5: Compute current/previous from the array, then growth %
  {
    $addFields: {
      currentRevenue: {
        $ifNull: [{ $first: { $filter: { input: "$monthData", as: "m",
          cond: { $eq: ["$$m.bucket", "current"] } } } }, { revenue: 0 }]
      },
      previousRevenue: {
        $ifNull: [{ $first: { $filter: { input: "$monthData", as: "m",
          cond: { $eq: ["$$m.bucket", "previous"] } } } }, { revenue: 0 }]
      }
    }
  },
  {
    $addFields: {
      growthPct: {
        $cond: [
          { $eq: ["$previousRevenue.revenue", 0] }, null,
          { $multiply: [{ $divide: [
            { $subtract: ["$currentRevenue.revenue", "$previousRevenue.revenue"] },
            "$previousRevenue.revenue"
          ]}, 100] }
        ]
      }
    }
  },

  // Stage 6: Lookup restaurant details
  {
    $lookup: {
      from: "restaurants",
      localField: "_id",
      foreignField: "_id",
      as: "restaurant"
    }
  },
  { $unwind: "$restaurant" },

  // Stage 7: Sort by current revenue
  { $sort: { currentRevenue: -1 } },

  // Stage 8: Limit + final projection
  { $limit: 20 },
  {
    $project: {
      _id: 0,
      restaurantId: "$_id",
      name: "$restaurant.name",
      city: "$restaurant.city",
      currentRevenue: 1,
      previousRevenue: 1,
      growthPct: { $round: ["$growthPct", 2] }
    }
  }
],
{ allowDiskUse: true });
```

### 5.4 Pipeline performance tips

- **`$match` jaldi rakho**: index use hota hai, dataset jaldi shrink hota hai.
- **`$project` jaldi rakho**: sirf needed fields rakho, memory pressure kam.
- **`$sort` ke pehle index align karo**: `$sort` after `$match` — agar combined fields ka index hai (ESR rule), sort in-memory bypass ho jata hai.
- **`$lookup` mehenga hai**: jab possible ho, denormalize karo (extended reference pattern). Lookup hash-join nahi hai, nested-loop scan hai (kuch optimizations 5.0+ se aaye hain).
- **`$facet` parallelize karta hai**: independent aggregations ek query mein club karna saves round-trips.
- **`allowDiskUse: true`**: agar pipeline 100 MB memory cross karega, ye flag must hai (otherwise error).
- **`$merge` for materialized views**: scheduled jobs se daily report ek collection mein merge kar do — read time pe full pipeline run nahi hoga.

### 5.5 Aggregation operators cheat sheet

| Category | Operators |
|----------|-----------|
| Arithmetic | `$add`, `$subtract`, `$multiply`, `$divide`, `$mod`, `$pow`, `$round` |
| Comparison | `$eq`, `$ne`, `$gt`, `$lt`, `$gte`, `$lte`, `$cmp` |
| Logical | `$and`, `$or`, `$not`, `$cond`, `$ifNull`, `$switch` |
| Array | `$size`, `$arrayElemAt`, `$first`, `$last`, `$slice`, `$filter`, `$map`, `$reduce` |
| String | `$concat`, `$substr`, `$toUpper`, `$toLower`, `$split`, `$trim`, `$regexMatch` |
| Date | `$year`, `$month`, `$dayOfWeek`, `$dateToString`, `$dateFromString`, `$dateDiff` |
| Conversion | `$toString`, `$toInt`, `$toDouble`, `$toDecimal`, `$convert` |
| Accumulator | `$sum`, `$avg`, `$min`, `$max`, `$push`, `$addToSet`, `$first`, `$last` |
| Window (5.0+) | `$setWindowFields` with `$rank`, `$denseRank`, `$rollingAverage` |

---

## 6. Indexes — what every staff engineer should know

### 6.1 Why indexes — the 800ms vs 2ms story

Bina index ke MongoDB **collection scan** karta hai — har document read karke condition check. Time complexity O(n). 50 lakh documents ka collection mein simple `find({ email: "x@y.com" })` 800ms+ le sakta hai.

Index ke saath — typically B-tree — query O(log n) ho jata hai. Same query 2ms. Hard truth: **production mein har query ek index hit karni chahiye, varna scale pe app marega**.

### 6.2 Index types

#### Single-field index

```javascript
db.users.createIndex({ email: 1 });           // ascending
db.orders.createIndex({ createdAt: -1 });     // descending
db.users.createIndex({ email: 1 }, { unique: true });  // uniqueness constraint
```

Direction (1 vs -1) sort queries ke liye matter karta hai, equality ke liye nahi.

#### Compound index — and the ESR rule

Compound index multiple fields combine karta hai. Order **critical** hai — galat order mein index waste ho jata hai.

**ESR rule**: **E**quality, **S**ort, **R**ange — yahi order rakho.

```javascript
// Query: find({ status: "ACTIVE", city: "Mumbai" }).sort({ createdAt: -1 })
//        where age: { $gte: 18 }

// Equality fields: status, city
// Sort field: createdAt
// Range field: age

// Optimal compound index:
db.users.createIndex({
  status: 1,      // E
  city: 1,        // E
  createdAt: -1,  // S
  age: 1          // R
});
```

Reason: Equality fields jaldi rakho — wo selectivity dete hain (scan range narrow). Sort field next — taaki MongoDB ko separate sort step na karna pade. Range last — wo bounds banata hai but scan span deta hai, agar pehle rakha to baad ke fields effective nahi rahenge.

**Galat order ka cost**: agar tu `{ age: 1, status: 1 }` rakhta hai aur query `{ status: "ACTIVE", age: { $gte: 18 } }` hai, MongoDB pehle age range scan karega phir har match pe status check karega — woh almost full collection scan jaisa hai.

#### Multikey, hashed, text, geo, partial, sparse, TTL

```javascript
// Multikey — array field, one entry per element. Limit: only one multikey field per compound index.
db.products.createIndex({ tags: 1 });

// Hashed — even-distribution shard key; bad for range queries
db.users.createIndex({ userId: "hashed" });

// Text — full-text search; only ONE text index per collection
db.articles.createIndex({ title: "text", body: "text" });
db.articles.find({ $text: { $search: "mongodb sharding" } });

// 2dsphere — geo for Zomato/Swiggy "near me", Uber pickup zones
db.restaurants.createIndex({ location: "2dsphere" });
db.restaurants.find({
  location: { $near: {
    $geometry: { type: "Point", coordinates: [77.5946, 12.9716] }, // Bengaluru
    $maxDistance: 5000
  }}
});

// Partial — index only docs matching a filter (huge storage savings on long-tail terminal states)
db.orders.createIndex(
  { userId: 1, createdAt: -1 },
  { partialFilterExpression: { status: "ACTIVE" } }
);

// Sparse — skips docs missing the field (subset of partial; prefer partial)
db.users.createIndex({ phone: 1 }, { sparse: true });

// TTL — auto-delete after seconds; background sweeper runs every 60s
db.sessions.createIndex({ lastActivity: 1 }, { expireAfterSeconds: 3600 });
db.otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });
```

### 6.3 Reading explain output

```javascript
db.orders.find({ userId: ObjectId("65a..."), status: "PLACED" })
  .sort({ createdAt: -1 })
  .explain("executionStats");
```

Output mein dekhna hai:

```
{
  queryPlanner: {
    winningPlan: {
      stage: "FETCH",
      inputStage: {
        stage: "IXSCAN",                   // GOOD — index used
        indexName: "userId_1_status_1_createdAt_-1",
        keyPattern: { userId: 1, status: 1, createdAt: -1 },
        ...
      }
    },
    rejectedPlans: [...]
  },
  executionStats: {
    nReturned: 12,
    totalKeysExamined: 12,                  // GOOD — equal to nReturned
    totalDocsExamined: 12,
    executionTimeMillis: 4
  }
}
```

**Red flags**:
- `stage: "COLLSCAN"` — full collection scan, no index used. Fix: add index.
- `totalKeysExamined >> nReturned` — index scanning too many keys, low selectivity. Fix: better compound index, ESR rule.
- `totalDocsExamined > nReturned` — index has key but doc fetched for further filtering. Fix: covered query (next).
- `executionTimeMillis > 100` for OLTP query — investigate.

### 6.4 Covered queries

Agar index mein **all queried fields** hain, MongoDB document fetch hi nahi karega — index se hi data return. Ye **covered query** hai, fastest possible.

```javascript
db.users.createIndex({ email: 1, name: 1 });

db.users.find(
  { email: "x@y.com" },
  { _id: 0, email: 1, name: 1 }    // _id excluded; email and name in index
).explain();
// Look for: "stage": "PROJECTION_COVERED"
```

### 6.5 Working set RAM rule of thumb

**Working set** = frequently-accessed data (hot data + indexes). Ye RAM mein fit hona chahiye.

Rule of thumb:
- **Indexes pe RAM hamesha sufficient hona chahiye** — agar index disk se aata hai, har query disk hit karega.
- **Hot documents bhi RAM mein**: typically last 7 days ka data hot maana jata hai e-commerce mein.
- **Cold data**: older data archive mein bhej do (separate collection ya cold storage).

Sizing example: 1 crore documents @ 2 KB each = 20 GB. Indexes ~5 GB. Hot subset ~3 GB. Total working set ~8 GB. **Provision 16 GB RAM** (working set + WiredTiger cache + OS overhead).

### 6.6 Indexes ka cost — kab nahi banana

Indexes free nahi hain:
1. **Write cost**: har insert/update mein har relevant index update karna padta hai. 5 indexes = 5x write amplification.
2. **Storage**: indexes typically 10-30% of collection size.
3. **Query planner overhead**: zyada indexes hain to planner ko har query pe choose karna padta hai.

**Anti-pattern**: "har field pe index banao". Wrong. Sirf **frequently queried + sorted + range** fields pe banao. `db.collection.aggregate([{ $indexStats: {} }])` chala — kabhi-kabhi 30% indexes used hi nahi hote, drop kar do.

---

## 7. Schema design — embedding vs referencing — the 6 patterns

Mongo schema design "entity-relationship" se nahi, "**access patterns**" se drive hota hai. Pehle decide kar — kaun si query frequent hai? Kaun sa data ek saath fetch hota hai? Phir embed/reference decide kar.

### 7.1 Pattern 1 — One-to-Few (embed)

User → 2-5 addresses. Bounded, always-together access.

```javascript
{ _id, name: "Ratnesh", addresses: [
  { type: "home", city: "Mumbai", pincode: "400001" },
  { type: "office", city: "Mumbai", pincode: "400069" }
]}
```

### 7.2 Pattern 2 — One-to-Many (embed with cap)

Product → top-10 reviews embedded for product card UI; full reviews in separate `reviews` collection. Maintain top-N via update logic.

```javascript
{ _id, name: "Dell XPS 13", topReviews: [/* cap at 10 */], totalReviewCount: 1247 }
```

### 7.3 Pattern 3 — One-to-Squillions (reference)

User → 1 lakh+ transactions. Cannot embed (16 MB cap). Reference + index `{ userId: 1, createdAt: -1 }` on the child collection.

### 7.4 Pattern 4 — Polymorphic (discriminator)

Events collection with mixed types — common fields at top, type-specific in `data`. Index `{ type: 1, timestamp: -1 }`.

```javascript
{ _id, type: "page_view",  userId, timestamp, data: { url: "/home" } }
{ _id, type: "purchase",   userId, timestamp, data: { amount: 1200, items: [...] } }
```

### 7.5 Pattern 5 — Bucket (IoT / time-series)

1 sensor × 60 readings/hour = 1440 docs/day naive. Bucket: 1 doc per (sensor, hour) with 60 readings + pre-computed min/max/avg.

```javascript
{
  sensorId: "mumbai-001", bucketStart: ISODate("2026-05-04T10:00:00Z"),
  count: 60, min: 28.1, max: 29.4, avg: 28.7,
  measurements: [{ ts: "10:00:00", temp: 28.5 }, /* 60 */]
}
```

MongoDB 5.0+ has native **time-series collections** — use them for new projects.

### 7.6 Pattern 6 — Extended reference

Order references product but duplicates `productName` + `priceAtPurchase`. Saves a `$lookup` on every list page; snapshot semantics for historical correctness.

```javascript
{ _id, userId, items: [{
  productId: ObjectId(),  // canonical
  productName: "Dell XPS 13",  // duplicated
  priceAtPurchase: 95000,      // historical snapshot
  qty: 1
}]}
```

### 7.7 Razorpay-like payments collection — full walkthrough

Requirements: per-user history (paginated), per-merchant daily settlement, refund flow, fraud detection, immutable audit trail.

```javascript
// payments — main collection (extended reference + polymorphic method + bounded attempts)
{
  _id: ObjectId(), userId, merchantId,
  merchantName: "Swiggy",                  // extended ref for list UIs
  amount: NumberDecimal("450.00"), currency: "INR",
  status: "SUCCESS",                       // CREATED → ATTEMPTING → SUCCESS / FAILED / REFUNDED
  method: "UPI",
  methodDetails: { upi: { vpa: "user@paytm" } },  // polymorphic by method
  attempts: [{ gateway: "razorpay", status: "FAILED", reason: "...", at: ... }],
  createdAt, completedAt
}

// Indexes — match access patterns
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ merchantId: 1, status: 1, completedAt: -1 });
db.payments.createIndex({ status: 1, createdAt: -1 },
  { partialFilterExpression: { status: { $in: ["CREATED", "ATTEMPTING"] } } });
db.payments.createIndex({ "methodDetails.upi.vpa": 1 }, { sparse: true });
```

Refunds are a separate collection referencing original payment by `paymentId`. Audit log is an immutable collection (TTL after legal retention). Sharded by `merchantId` (zone-based for region routing) + indexes on access patterns — this design handles Razorpay scale (~50 crore txns/year).

---

## 8. Replica sets — how Mongo gets HA

### 8.1 Anatomy

Replica set = **3 (typically) nodes** running same data. One **primary** (writes), rest **secondaries** (replicate from primary). Optionally one **arbiter** (no data, just votes in elections).

```
        Client
          ↓
       Primary  ──→  Oplog  ──→  Secondary 1
                              ──→  Secondary 2
```

**Oplog** (operations log) primary ki har write log karta hai capped collection mein. Secondaries oplog tail karte hain aur apply karte hain. Ye **logical replication** hai — exact write replay.

### 8.2 Election protocol — Raft-like

Primary down ho gaya? Secondaries election shuru karte hain:

1. **Heartbeats fail** — secondaries primary ko 10 sec se nahi sun pa rahe.
2. **Vote request** — koi secondary "I want to be primary" announce karta hai.
3. **Quorum needed** — majority votes (n/2+1).
4. **New primary selected** — highest-priority + most up-to-date secondary jeetta hai.

Total downtime: typically **5-12 seconds**. Apps mein retryable writes ho to user-facing impact zero.

### 8.3 Why arbiter exists

3-node replica set: 1 primary + 2 secondaries. Cost = 3x storage. Arbiter alternative: 1 primary + 1 secondary + 1 arbiter (data nahi rakhta, sirf vote karta hai). Cost = 2x storage. **Tradeoff**: redundancy kam — agar secondary down ho jaye aur primary bhi, data unrecoverable.

**Best practice**: 3 full data-bearing nodes for production. Arbiter sirf strict cost-constrained dev/staging mein use karo. **Arbiter on production prod cluster — antipattern**.

### 8.4 Read preference

`primary` (default, strong consistency), `primaryPreferred`, `secondary` (eventually consistent), `secondaryPreferred`, `nearest` (lowest latency, multi-region).

```javascript
db.users.find({}).readPref('secondaryPreferred');  // offload analytics from primary
```

Use case routing: banking → `primary`; dashboards → `secondaryPreferred`; multi-region → `nearest`.

### 8.5 Read concern

What data is visible: `local` (default, includes unreplicated), `available` (sharded fast-path), `majority` (no rollback risk), `linearizable` (strongest), `snapshot` (txn-scoped).

```javascript
db.payments.findOne({ _id: paymentId }, { readConcern: { level: 'majority' } });
```

### 8.6 Write concern

When a write is acknowledged: `w: 1` (primary only — fast, lossy on primary crash); `w: 'majority'` (durable); `w: 0` (fire-and-forget, only for non-critical telemetry); `j: true` (journaled to disk).

```javascript
// Banking rule: always w: 'majority', j: true for money operations
db.payments.insertOne({ ... }, { writeConcern: { w: 'majority', j: true, wtimeout: 5000 } });
```

### 8.7 Failover scenario walkthrough

Cluster: Primary (Mumbai), Secondary (Pune), Secondary (Hyderabad). Mumbai loses power at `t=0`. By `t=10s` Pune/Hyderabad detect missed heartbeats; `t=12s` election starts; `t=14s` Pune becomes primary, writes route there. With retryable writes (default 4.0+) the app sees a 5-15s blip. Reads on `secondaryPreferred` keep working throughout. When Mumbai comes back, it rejoins as secondary and syncs from new primary's oplog (full resync if 24h+ oplog window passed).

**Bonus interview gotcha**: 2 nodes simultaneously down in a 3-node set → quorum unreachable (1 < 2) → no primary elected → cluster goes read-only with majority concern. Solution: 5-node cluster (tolerates 2 failures) or geographic distribution.

---

## 9. Sharding — when one box stops being enough

### 9.1 When to shard

Pre-shard checklist:
- Single replica set RAM saturate? (working set > RAM)
- Write throughput single primary se > 10k ops/sec?
- Disk size > 2 TB on primary?
- Backup time > maintenance window?

**Don't shard** prematurely. Operational overhead 5x. Sharded transactions slow. Scatter-gather queries (queries that don't include shard key) hit ALL shards.

### 9.2 Architecture

```
              Client
                ↓
              mongos (router)
              ↓     ↓     ↓
         Shard1  Shard2  Shard3
         (RS)    (RS)    (RS)
                ↑
          Config Servers (RS)
          (cluster metadata)
```

- **Shards**: Each is a replica set, holds a chunk range of data.
- **mongos**: Stateless query router. Apps connect to it.
- **Config servers**: Replica set storing cluster metadata (chunk → shard mapping).

### 9.3 Shard key selection — the hardest decision

Shard key = field(s) used to partition data across shards. **Once chosen, hard to change** (resharding exists since 5.0 but slow).

**Good shard key properties**:
1. **High cardinality**: many unique values. Example: `userId` (millions). Bad: `country` (200 values).
2. **Evenly distributed values**: writes spread across shards. Bad: monotonically increasing (ObjectId, timestamp) → all writes hit one shard ("hot shard").
3. **Query-aligned**: most queries should include shard key (so router targets one shard, not scatter-gather).

**Examples**:

| Collection | Bad shard key | Good shard key | Reason |
|---|---|---|---|
| swiggy_orders | `createdAt` | `{ city: 1, _id: 1 }` | Time monotonic = hot shard. City + _id = even distribution + locality |
| razorpay_payments | `_id` | `{ merchantId: "hashed" }` or `{ merchantId: 1, createdAt: 1 }` | _id monotonic. Hashed merchantId = even spread, queries usually filter by merchant |
| users | `country` | `{ userId: "hashed" }` | Country has low cardinality + Indians >> rest |
| chat_messages | `userId` | `{ chatId: 1, _id: 1 }` | Chat-centric reads work better |

### 9.4 Hot shard problem

**Bhai zone-based shard key kyu safer hai**? Sun.

`createdAt` shard key with range sharding — saari nayi writes latest chunk pe jati hain, jo ek shard pe hai. **Wo ek shard saari write traffic kha jata hai**. Baki shards idle. Ye "hot shard" hai. Same problem `_id: 1` (ObjectId) pe — kyunki ObjectId timestamp prefix se monotonic hai.

Solutions:
1. **Hashed shard key**: `{ _id: "hashed" }` — values hash hote hain, even distribution. But range queries inefficient (scatter-gather).
2. **Compound shard key with high-cardinality first**: `{ userId: 1, createdAt: 1 }` — writes spread across users.
3. **Zone-based sharding**: based on geography or business tier.

### 9.5 Zone-based sharding — India vs EU regulatory

India ka data India mein (DPDPA 2023), EU ka EU mein (GDPR). Tag shards by zone, then range-bind.

```javascript
sh.addShardToZone("shard-mumbai", "IN");
sh.addShardToZone("shard-pune", "IN");
sh.addShardToZone("shard-frankfurt", "EU");

sh.shardCollection("razorpay.razorpay_payments", { region: 1, _id: 1 });
sh.updateZoneKeyRange("razorpay.razorpay_payments",
  { region: "IN", _id: MinKey }, { region: "IN", _id: MaxKey }, "IN");
sh.updateZoneKeyRange("razorpay.razorpay_payments",
  { region: "EU", _id: MinKey }, { region: "EU", _id: MaxKey }, "EU");
```

Compliant by design — Indian payments physically on India shards, EU on Frankfurt.

### 9.6 Chunk migration

Data ko **chunks** mein divide karta hai (default 128 MB). Balancer background mein chunks ko shards ke beech move karta hai if distribution uneven.

**Migration process**:
1. Source shard chunk lock karta hai (write block on chunk).
2. Source data destination ko stream karta hai.
3. During migration, oplog updates bhi sync hote hain.
4. Final cut-over: very brief lock, metadata switch, lock release.
5. Source shard chunk delete karta hai.

**Production gotcha**: balancer maintenance hours mein run karna better — peak hours mein migrations latency spike karte hain. `sh.setBalancerState(false)` peak time pe disable kar do.

### 9.7 mongos query routing

```javascript
// Targeted query (good): includes shard key
db.razorpay_payments.find({ merchantId: ObjectId("...") });
// → mongos sends to one shard

// Scatter-gather (bad): doesn't include shard key
db.razorpay_payments.find({ amount: { $gt: 10000 } });
// → mongos sends to ALL shards, gathers, returns
// Latency = max(shard latencies); throughput = aggregate of all shards
```

**Goal**: 80%+ queries should be targeted. If you find yourself doing many scatter-gathers, shard key wrong hai.

### 9.8 Real example — ledger collection 5 TB

**Scenario**: Fintech ka ledger collection. 5 TB data, 50 crore documents, growing 10 GB/day.

**Single replica set issues**:
- Index size 200 GB > 64 GB RAM → indexes from disk → slow queries.
- Daily backup takes 8 hours.
- Write throughput plateauing at 5k ops/sec.

**Shard plan**:
- Shard key: `{ accountId: 1, txnDate: 1 }` (compound).
- 4 shards, each 1.5 TB.
- Indexes: `{ accountId: 1, txnDate: -1 }` (matches shard key prefix).

**Result**:
- Account-centric queries (most common) targeted to one shard, ~5ms.
- Aggregate reports run as scatter-gather but parallelized → 4x faster.
- Per-shard backup: 2 hours each, parallel = 2 hours total.
- Write throughput scales with shard count.

---

## 10. Transactions

### 10.1 The history

Pre-MongoDB 4.0 — sirf single-document atomicity. Multi-document transactions nahi the. Logic embedding aur idempotent design pe shifted tha.

**MongoDB 4.0 (2018)**: Multi-document transactions on replica sets.
**MongoDB 4.2 (2019)**: Distributed transactions across sharded clusters.
**MongoDB 5.0+**: Improved performance, longer transaction limits.

### 10.2 When to use transactions

**Use**:
- Money transfer between two accounts.
- Order placement (decrement stock + create order + add to user history).
- Audit + main operation (both succeed or both fail).

**DON'T use**:
- Single-document updates (already atomic).
- Bulk insert of independent docs (use `insertMany`).
- Anything that can be redesigned as single-doc operation.

**Rule**: agar tu 10%+ operations transaction mein wrap kar raha hai, schema design wrong hai (over-normalized).

### 10.3 Snapshot isolation

MongoDB transactions use **snapshot isolation**. Transaction start hote hi ek consistent point-in-time snapshot freeze ho jata hai. Saari reads usi snapshot se. Concurrent writes outside transaction visible nahi hote.

**Conflict detection**: Agar transaction X aur Y dono same document update karne try karein, dusra fail hota hai with `WriteConflict` error. Application retry karta hai (driver auto-retries also configurable).

### 10.4 Code sample — wallet transfer

```javascript
async function transferWallet(fromUserId, toUserId, amount) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const wallets = client.db('app').collection('wallets');
      const ledger = client.db('app').collection('ledger');

      // 1. Atomic debit with balance guard in filter
      const debit = await wallets.updateOne(
        { userId: fromUserId, balance: { $gte: amount } },
        { $inc: { balance: -amount } }, { session }
      );
      if (debit.modifiedCount === 0) throw new Error('Insufficient balance');

      // 2. Credit (upsert if recipient new)
      await wallets.updateOne(
        { userId: toUserId },
        { $inc: { balance: amount }, $setOnInsert: { createdAt: new Date() } },
        { session, upsert: true }
      );

      // 3. Audit
      await ledger.insertOne(
        { type: 'TRANSFER', fromUserId, toUserId, amount, timestamp: new Date() },
        { session }
      );
    }, {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority', j: true },
      readPreference: 'primary',
      maxCommitTimeMS: 5000
    });
  } finally {
    await session.endSession();
  }
}
```

`session.withTransaction()` auto-retries on `TransientTransactionError` and `UnknownTransactionCommitResult`.

### 10.5 Retryable writes

Default in 4.0+. Transient network errors (primary failover, momentary disconnect) pe driver auto-retries the write **once**. Idempotency guaranteed via session ID + transaction number.

```javascript
const client = new MongoClient(uri, { retryWrites: true });  // default
```

Kab off karna hai? Almost never. Off karne se app code mein retry logic likhna padta hai everywhere — antipattern.

### 10.6 Transaction limits

- **60 second default time limit** — long-running transactions abort. Configurable to higher but design issue.
- **16 MB transaction size** — total write payload.
- **Cross-shard 2-phase commit** — significantly slower than single-shard.

**Banking workload truth**: Most banking apps **ek-document atomic** ke saath kaam chal jata hai if schema designed well. Account balance ek document, transactions ek alag immutable collection. `findOneAndUpdate` with conditional filter = atomic. Multi-document transactions tab use karo jab sach mein cross-document atomicity chahiye.

---

## 11. Performance tuning

### 11.1 Reading explain output — the practical guide

```javascript
db.swiggy_orders.find({ city: "Mumbai", status: "PLACED" })
  .sort({ createdAt: -1 })
  .limit(20)
  .explain("executionStats");
```

Key fields:

```
{
  queryPlanner: {
    winningPlan: { ... },         // chosen plan
    rejectedPlans: [ ... ]         // alternates considered
  },
  executionStats: {
    nReturned: 20,
    totalKeysExamined: 24,
    totalDocsExamined: 24,
    executionTimeMillis: 5,
    executionStages: { ... }
  }
}
```

**Healthy ratios**:
- `nReturned ≈ totalKeysExamined ≈ totalDocsExamined` → high selectivity.
- `executionTimeMillis < 50` for OLTP, `< 5000` for analytics.

**Sick ratios**: `totalDocsExamined > 10x nReturned` (bad index, fix ESR); `totalDocsExamined > totalKeysExamined` (projection not covered); `stage: "COLLSCAN"` (no index at all).

### 11.2 Profiler — find slow queries in production

```javascript
// Enable profiler — log queries slower than 100ms
db.setProfilingLevel(1, { slowms: 100 });

// Query slow queries
db.system.profile.find({ millis: { $gt: 1000 } }).sort({ ts: -1 }).limit(20);

// Disable profiler when done
db.setProfilingLevel(0);
```

**MongoDB 6.0+** also has `$listSampledQueries` for sampling-based monitoring without performance overhead.

### 11.3 $currentOp — what's running NOW

```javascript
db.currentOp({
  active: true,
  secs_running: { $gt: 5 }
});

// Kill a stuck operation
db.killOp(opid);
```

Use case: production query frozen, identify aur kill.

### 11.4 Atlas Performance Advisor

Cluster → Performance Advisor tab gives slow-query suggestions, index recommendations, and schema anti-pattern flags (bloated docs, missing indexes). Free tier supported. Check weekly in production.

### 11.5 Common pitfalls — spot and fix

**Pitfall 1: free `$regex` on unindexed field.** `db.users.find({ email: { $regex: "razorpay" } })` → COLLSCAN. Fix: anchored prefix `/^ratnesh/` (index-usable), or text index, or Atlas Search.

**Pitfall 2: `$unwind` blow-up.** `$unwind` on 100k-element arrays explodes intermediate docs into millions, requires `allowDiskUse`. Fix: use `$filter` + `$size` to compute aggregates without unwinding; or denormalize the array into a separate collection.

```javascript
// FIXED — filter array in-place, no unwind
db.users.aggregate([
  { $project: { successfulLogins: { $size: { $filter: {
    input: "$loginHistory", cond: "$$this.success"
  }}}}},
  { $group: { _id: null, total: { $sum: "$successfulLogins" } } }
]);
```

**Pitfall 3: `$lookup` before `$match`.** Lookup loads all docs, then filter discards most. Fix: switch the pipeline driver collection so the filter runs first; or denormalize via extended reference. If a join runs 100+ times/min in prod, denormalize.

**Pitfall 4: deep skip pagination.** `find({}).skip(20000).limit(20)` scans 20k docs. Fix: cursor-based with last seen `_id`: `find({ _id: { $lt: lastSeenId } }).sort({ _id: -1 }).limit(20)`.

**Pitfall 5: ESR violation in compound index.** `{ createdAt: -1, status: 1, userId: 1 }` doesn't help `find({ userId, status }).sort({ createdAt: -1 })` because userId is not a prefix. Fix: rebuild as `{ userId: 1, status: 1, createdAt: -1 }`.

### 11.6 Connection pool tuning

```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 50,             // max concurrent connections per app instance
  minPoolSize: 10,              // keep 10 warm
  maxIdleTimeMS: 30000,         // close idle after 30s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
});
```

Rule of thumb: `maxPoolSize` ≈ expected concurrent requests / app instance. Don't over-provision — too many connections crash mongod.

---

## 12. Security checklist

### 12.1 Auth, TLS, network

- **Authentication**: SCRAM-SHA-256 default; X.509 / Kerberos / LDAP for enterprise. **NEVER** deploy without auth — open Mongo instances on the internet have been mass-ransomed (2017, 2020).
- **TLS**: Atlas forces TLS by default; self-hosted needs `tls: true` + cert files in driver.
- **Network IP allowlist**: Atlas Network Access tab. **Never `0.0.0.0/0` in production** — only office IPs, backend / VPC peering, bastion hosts.

### 12.4 Role-based access (RBAC)

Built-in roles: `read`, `readWrite`, `dbAdmin`, `dbOwner`, `userAdmin`, `clusterAdmin`, `backup`/`restore`.

```javascript
db.createUser({
  user: "app_user", pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "razorpay" },
    { role: "read", db: "analytics" }
  ]
});
// Custom collection-scoped role
db.createRole({
  role: "ordersReadOnly",
  privileges: [{ resource: { db: "swiggy", collection: "orders" }, actions: ["find"] }],
  roles: []
});
```

Principle of least privilege — app user gets only what the app needs.

### 12.5 Field-level encryption (FLE)

MongoDB 4.2+ supports **client-side field-level encryption**:

```javascript
// PII fields encrypted client-side before sending to server
const schema = {
  bsonType: 'object',
  properties: {
    email: { encrypt: { keyId: '...', algorithm: 'AEAD_AES_256_CBC_Deterministic' } },
    phone: { encrypt: { keyId: '...', algorithm: 'AEAD_AES_256_CBC_Random' } },
    name: { bsonType: 'string' }    // not encrypted
  }
};
```

Use case: even DBAs can't read PII. Compliance with GDPR, DPDPA, HIPAA.

**Queryable Encryption (6.0+)**: equality and range queries on encrypted fields. Game-changer for India banking compliance.

### 12.6 Audit log

Enterprise/Atlas feature:

```yaml
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.json
  filter: '{ atype: { $in: ["authenticate", "createCollection", "dropDatabase"] } }'
```

Logs every administrative action. Required for SOC 2, ISO 27001 compliance.

### 12.7 DPDPA 2023 compliance

India's Digital Personal Data Protection Act, 2023. MongoDB hooks:
- **Data localization**: zone-based sharding ensures India data stays in India shards.
- **Right to erasure**: app must support hard delete. TTL indexes for retention policy enforcement.
- **Audit trail**: changeStreams + audit log = full compliance trail.
- **Encryption at rest**: WiredTiger native encryption, Atlas auto-enabled.
- **Encryption in transit**: TLS mandatory.

### 12.8 Security checklist (TL;DR)

- Auth enabled (SCRAM-SHA-256 minimum)
- TLS enforced
- IP allowlist (no 0.0.0.0/0)
- Least-privilege RBAC
- FLE for sensitive PII
- Audit log enabled
- Atlas backups encrypted
- mongod not exposed to public internet
- Secrets in env vars / vault, not committed
- Patch promptly — Mongo CVEs do happen

---

## 13. MongoDB Atlas crash course

### 13.1 Setup in 5 minutes

1. Sign up at cloud.mongodb.com — Google/GitHub login works.
2. **Create cluster** → Free Tier (M0, 512 MB).
3. **Choose region** → Mumbai (`ap-south-1`) for India low-latency.
4. **Add network access** → "Add my current IP" (for dev).
5. **Add database user** → username + auto-generated password.
6. **Connection string** → Copy `mongodb+srv://...` URI.

### 13.2 Driver code

```javascript
import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

await client.connect();
const db = client.db('myapp');
```

### 13.3 Snapshot vs continuous backups

**Snapshot backups** (free tier and above): point-in-time snapshots, typically every 6 hours. Restore granularity: hourly.

**Continuous backups** (M10+): oplog-based, restore to any second. Cost: ~30% more.

**Production rule**: continuous backups for primary databases. Snapshots OK for analytics / staging.

### 13.4 Atlas Search — Lucene without ES

Atlas Search is **Lucene** embedded in MongoDB cluster. Free in M0 cluster (limited). Powerful features:
- Full-text relevance scoring
- Fuzzy search ("razrpay" → "razorpay")
- Autocomplete
- Faceting
- Highlighting

```javascript
db.products.aggregate([
  {
    $search: {
      index: 'default',
      text: {
        query: 'iphone 15',
        path: ['name', 'description'],
        fuzzy: { maxEdits: 1 }
      }
    }
  },
  { $limit: 20 }
]);
```

**ROI**: dedicated Elasticsearch cluster = 10k INR/month minimum. Atlas Search = free on M10+. For most apps, Atlas Search is sufficient.

### 13.5 Atlas Charts, Triggers, Vector Search

- **Atlas Charts**: built-in BI dashboard, drag-drop, live-updates from collection — kills the need for a separate BI tool for product dashboards.
- **Atlas Triggers & Functions**: serverless JS on DB events / cron / HTTP endpoints. Replaces a Lambda for "email on payment success".
- **Atlas Vector Search (5.x+)**: KNN over stored embeddings for RAG / LLM apps; integrates with OpenAI embeddings via `$vectorSearch` aggregation stage.

```javascript
db.products.aggregate([{
  $vectorSearch: {
    index: 'product_embeddings', path: 'embedding',
    queryVector: [0.12, -0.34, /* ... */],
    numCandidates: 100, limit: 10
  }
}]);
```

---

## 14. Common interview questions with model answers

**Q1. Explain ObjectId structure.** 12-byte ID: 4 bytes Unix timestamp, 5 bytes per-process random, 3 bytes incrementing counter. Time-prefix monotonic — handy for time-range queries on `_id`, but **bad as shard key for write-heavy collections** (hot shard). `ObjectId.getTimestamp()` extracts creation time.

**Q2. When NOT to use MongoDB.** Strict ACID across many entities (banking core ledger → Postgres). 5+ table joins (Postgres planner wins). Tiny data (<10 GB → SQLite/Postgres). >10% ops in transactions (schema is over-normalized — re-think).

**Q3. Chat schema for 10M users.**

```javascript
// chats — metadata + extended ref
{ _id, participants: [u1, u2], lastMessageAt, lastMessageText }
// messages — body
{ _id, chatId, senderId, text, sentAt, readBy: [...] }
```

Indexes: `messages.{ chatId: 1, sentAt: -1 }`, `chats.{ participants: 1, lastMessageAt: -1 }` (multikey). At scale: shard `chats` by `_id` hashed, `messages` by `{ chatId: 1, _id: 1 }` for locality. 4-shard cluster handles ~5 crore chats / 500 crore messages over 2 years.

**Q4. Compound vs single-field ROI.** Compound covers multi-field queries with one index (less storage than N singles). ESR rule applies. Build compound if >50% of hot queries use the combination. Single-field for one-off filters.

**Q5. Chunk migration.** Balancer detects imbalance → source briefly locks chunk → streams to dest → oplog replay during transfer → tiny metadata lock for ownership switch → source deletes orphaned chunk. Latency spike on the chunk, mitigate by scheduling balancer off-peak.

**Q6. `$lookup` vs SQL join.** `$lookup` is left-outer, nested-loop with index scan on inner. SQL hash-join faster on large×large. Mitigations: `$match` before `$lookup`; denormalize via extended reference for hot paths.

**Q7. When `$lookup` sucks.** Large × large without `foreignField` index. Cross-shard. Run-per-request hot path. If you need SQL-style multi-table joins routinely → use Postgres.

**Q8. Working set in RAM — why.** WiredTiger caches hot pages. If working set > RAM, every query disk-bound → 100x slower (RAM ~100ns, SSD ~100µs). Fix: scale RAM, archive cold, shrink docs.

**Q9. `$set` vs `$setOnInsert`.** `$set` always applied. `$setOnInsert` only when upsert inserts. Use `$setOnInsert: { createdAt: new Date() }` + `$set: { updatedAt: new Date() }`.

**Q10. When NOT to index.** Low cardinality (gender). Frequently mutated fields (write amp). Rarely queried. Audit `$indexStats` and drop unused.

**Q11. Replica set vs sharding — which first?** Replica set first (HA + read scaling). Shard only when single RS saturates RAM/write throughput/disk. Sharding adds 5x ops overhead.

**Q12. `$facet` use case.** Single-pipeline parallel sub-pipelines for dashboard-like queries (totals + top-N + breakdowns from same data). Each facet capped at 100 MB by default.

---

## 15. MongoDB vs PostgreSQL in 2026 — when to pick which

| Feature | MongoDB | PostgreSQL |
|---|---|---|
| Schema flexibility | First-class. Add field anywhere, no migration. | JSONB columns possible, but row schema rigid. ALTER TABLE on large tables painful. |
| Transactions | 4.0+ multi-doc, 4.2+ sharded, but designed for minimal use. | Mature, decades-old, every workload. |
| Joins | `$lookup` works but slow at scale. Denormalize. | Hash/merge joins, query planner optimizes 10-table joins. |
| JSON support | BSON native. | JSONB column type, GIN indexes, JSONpath queries. Surprisingly powerful. |
| Scaling story | Sharding native, horizontal scale baked in. | Read replicas easy. Sharding via Citus / partitioning — operationally heavier. |
| Indexing | B-tree, hashed, geo, text, multikey, partial, TTL. | B-tree, GIN, GiST, BRIN, hash, partial, expression. More variety, more depth. |
| Transactions on Atlas | Easy. | Supabase/Neon make this easy too now. |
| Schema validation | $jsonSchema (optional). | NOT NULL, CHECK constraints, foreign keys (always-on). |
| Reporting / BI | Aggregation pipeline strong, but ecosystem (Looker, Tableau) prefers SQL. | First-class. Every BI tool speaks SQL. |
| ML / Vector | Atlas Vector Search 5.x+. | pgvector extension. Both viable. |
| India hiring signal (2026) | MERN stack — almost every Node.js startup. Razorpay, Swiggy, Cred. | Fintech and B2B SaaS — Razorpay core ledger, FreshWorks, Zerodha. |
| Cost | Atlas free tier generous. M10 ~$60/month. | Supabase/Neon free tier OK. AWS RDS production ~$80+/month. |
| Operational maturity | Excellent on Atlas. Self-hosted moderate. | Excellent everywhere. |

### 15.1 Decision rules (honest)

**Pick MongoDB when**:
- Schema evolves rapidly (early-stage startup).
- Document model fits naturally (CMS, profile data, event logs, IoT).
- Need horizontal scale from day one.
- Team skilled in JS/TS, not SQL.
- MERN/MEAN stack baseline.

**Pick PostgreSQL when**:
- Strong relational integrity needed (banking core, accounting).
- Heavy reporting / BI workload.
- Team SQL-strong.
- Don't need to shard for foreseeable future (< 1 TB total).
- Existing tooling assumes SQL (analytics, ETL, BI).

**Use both** (common in mature systems):
- Postgres for transactional core (orders, payments, ledger).
- MongoDB for product catalog, user profile, event analytics, search index.

Razorpay does this. Swiggy does this. Most mid-large Indian B2C startups do this.

### 15.2 The 2026 reality

JSON-in-Postgres has narrowed Mongo's lead in flexibility. Atlas has narrowed Postgres's lead in operations. Both are mature, both are good. The choice is increasingly about **team skills and existing stack** more than technical superiority. Don't fall for tribal "Mongo bad" or "SQL slow" debates — both are right tools for right jobs.

---

## 16. A 4-week MongoDB mastery plan

### Week 1 — Foundations + CRUD

- **Read**: MongoDB University M001 (free, 12 hrs); sections 1-3 here.
- **Atlas lab**: spin M0 cluster, load `sample_mflix`, run 20 `find` queries on `movies`.
- **Practice queries**: rating > 8 from 2010-2020; genre array filter sorted by year desc; bulk update all "G"-rated; insert users with embedded addresses; bulk delete docs without rating.
- **Design**: schema for blog (posts/comments/tags); meal-tracking app (meals/ingredients/history).

### Week 2 — Aggregation + indexes

- **Read**: MongoDB University M201; sections 4-6 here; Aggregation Optimization docs.
- **Atlas lab**: build 6-stage pipeline (top 10 directors by movie count + avg rating); compound index before/after explain; `$facet` with 3 branches; TTL index on dummy `sessions`.
- **Practice queries**: monthly release count 2000-2020; top 5 actors using `$unwind`; ESR index for `find({ year, genre }).sort({ rating: -1 })`; multikey on tags; partial index on active products.
- **Design**: index strategy for chat `messages`; aggregation for Razorpay-style daily settlement report.

### Week 3 — Replica sets + sharding + transactions

- **Read**: sections 8-10 here; Replica Set + Sharded Cluster docs; Brewer "CAP 12 Years Later" (2012); Jepsen MongoDB analysis.
- **Atlas lab**: force primary failover; observe driver retry; read from secondary; try multi-doc transaction in mongosh.
- **Practice queries**: wallet transfer transaction; propose shard keys for 5 collections with justification; read after write with `majority`; change stream watch; compute oplog window.
- **Design**: sharding plan for `swiggy_orders` (100 crore docs/year); India+EU zone-based deployment.

### Week 4 — Performance + security + interviews

- **Read**: sections 11-14 here; Atlas Performance Advisor docs; Production Notes; 3 MongoDB Conf YouTube talks.
- **Atlas lab**: profiler with slow query generation; implement 3 Performance Advisor suggestions; PIT restore; Atlas Search; FLE on a test field.
- **Practice queries**: find all `COLLSCAN` from profiler; convert `$regex` to text index; refactor `$lookup`-heavy pipeline to denormalized; build a covered query; pool size tuning measurements.
- **Design**: full system for Cred-like rewards (schema + indexes + sharding); 3-month scale plan for startup at 80% RAM + 5k writes/sec.
- **End of week 4**: take a Razorpay/Swiggy system design Mongo question, write 60-min answer, mock-review with peer.

---

## Resources & further reading

- **Docs**: MongoDB Manual, MongoDB University M001/M201/M312 (free), Atlas Free Tier, MongoDB engineering blog.
- **Books**: *MongoDB: The Definitive Guide* (Bradshaw/Brazil/Chodorow); *Designing Data-Intensive Applications* (Kleppmann); *Database Internals* (Petrov); *MongoDB Applied Design Patterns* (Copeland).
- **Talks**: "Schema Design Patterns" — Daniel Coupal; "Aggregation Pipeline Optimization" — MongoDB World; "Sharding Best Practices" — Asya Kamsky.
- **Tools**: mongosh, Compass, Studio 3T, Mongoose / Beanie ODMs, Atlas Performance Advisor.
- **India context**: Razorpay / Swiggy / CRED engineering blogs.
- **Practice**: Zomato menu schema, Twitter feed fan-out, Uber surge geo+bucket, TTL session store, multi-tenant SaaS shared-vs-per-tenant.

---

## Final word

MongoDB depth = SDE-2 ka filter hai 2026 Indian backend interviews mein. Mongo perfect nahi hai — sahi tool sahi job ke liye, with conscious tradeoffs, yahi senior signal hai. Atlas khol, cluster spin kar, week 1 lab abhi shuru kar. Theory se context aata hai, **karne se confidence**. Wahi confidence — "Bhai, maine production mein ye dekha hai" — 35 aur 65 LPA ke gap se uthayega.
