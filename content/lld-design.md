# Low-Level Design (LLD) for Interviews

Low-Level Design ya LLD ek alag ladai hai — High-Level Design (HLD) jaha "kaise scale karein" ka jawab dhundta hai, LLD pucchta hai "kaise design karein **ek class diagram** jo extend ho, test ho, aur 5 saal baad bhi readable rahe." Product company interviews — Amazon, Uber, Razorpay, Swiggy, Flipkart — sab LLD round rakhte hain alag se. SDE-1 mein 30-45 min, SDE-2 mein 60+. Tu agar HLD ratta maar ke aaya hai aur LLD prep skip kiya, to 50% chances hain ki yahin reject ho jayega.

Iss subject ka goal: ek systematic framework dena jisko tu kisi bhi LLD problem pe apply kar sakta hai. Hum 4-step framework dekhenge, SOLID + design principles ka practical use, aur teen end-to-end worked examples — Parking Lot, Splitwise, BookMyShow — jo top-5 most-asked LLD questions mein aate hain. Ekdum chai-pani saath rakh.

Ek important baat: LLD interview mein interviewer dekhta hai *kaise tu sochta hai*, woh perfect code expect nahi karta. Aram se requirements clarify kar, classes ka diagram board pe banaa, methods sketch kar, ek-do edge case discuss kar — done. Speed matter karta hai, lekin clarity zyada important hai.

---

## 1. LLD vs HLD — clearly distinguish kar

Pehli galti most candidates karte hain: HLD aur LLD ko mix kar dete hain. Interviewer "Design Splitwise" bole, candidate seedha "Postgres + Redis + Kafka" se shuru kar dega. Galat — woh **HLD** hai. LLD chahta hai class diagram, relationships, methods, design patterns.

| Aspect | HLD (High-Level Design) | LLD (Low-Level Design) |
|--------|-------------------------|------------------------|
| **Question form** | "Design Twitter at 100M scale" | "Design a class diagram for Twitter's tweet feed" |
| **Output** | Boxes + arrows on a whiteboard, throughput numbers | Class diagram with attributes + methods |
| **Concerns** | Scaling, sharding, caching, queues, CDN | OOP, SOLID, design patterns, DRY, testability |
| **Storage** | "Postgres for users, Cassandra for tweets" | "User class has List<Tweet> tweets" |
| **Time-frame** | 45-60 min | 30-60 min |
| **Skills tested** | Distributed systems, CAP, replication | OOP, abstraction, encapsulation, code smell |
| **Primary language** | English + diagrams | UML + code (Java/C++/Python typical) |

Quick decoder when interviewer says:
- "Design Uber" → HLD (default for vague prompts)
- "Design the data model + classes for Uber's ride-matching" → LLD
- "Design Snake & Ladder game" → LLD (small scope, no scale)
- "Design a parking lot" → LLD always (it's the OG LLD problem)

Agar interviewer khud clear nahi hai, **clarify kar pehla minute mein**: "Are we talking class-level design or system-level scale?" Confidence dikhata hai aur tujhe disambiguate karta hai.

---

## 2. The 4-step LLD framework

Yahi tera north star hai. Har LLD problem mein ye 4 steps follow kar — same order, same rigor.

### Step 1: Requirements (5-7 min)

Interview mein vague prompt aata hai: "Design Splitwise." Tu seedha class banane mat shuru kar. Pehle clarify kar:

**Functional requirements (FR)** — kya feature hone chahiye?
- Split bills equally
- Split bills unequally (percentage / exact amount)
- Track who owes whom
- Settle up
- Group expenses

**Non-functional requirements (NFR)** — system kaisa behave kare?
- Concurrent users (kitne logon ka bill ek saath update?)
- Persistence vs in-memory (interview mein typically in-memory assume)
- Internationalisation (multi-currency?)

**Out of scope** — explicitly bol jo tu nahi karega:
- Authentication
- Mobile / web frontend
- Notifications
- Payment processing

Out-of-scope batana **important hai**. Bina iske tu 30 minutes mein UserAuth + NotificationService + PaymentGateway sab design karne lagega aur main problem touch nahi hogi. Interviewer ye sun ke khush hota hai — show hai ki tu scope manage kar sakta hai.

> **Pro tip:** Pehla 5-7 min hamesha requirements pe spend kar. Apna list interviewer ko padh ke confirm kar — "Is that the right scope?" Ye ek small handshake interviewer ko engaged karta hai aur aage galti hone ke chances kam kar deta hai.

### Step 2: Identify entities (5-10 min)

Requirements se nouns nikal — wahi tere classes hain.

For Splitwise:
- **User** — has name, email, balances
- **Group** — set of users sharing expenses
- **Expense** — amount, paid by whom, split among whom
- **Split** — strategy: EQUAL / EXACT / PERCENTAGE
- **Transaction** — represents one debt: A owes B amount X

Methods identify karne ke liye **verbs** dekh:
- User.addExpense()
- Group.settleUp()
- ExpenseManager.calculateBalances()
- SplitStrategy.calculate()

Yeh entities aur methods ka draft list interviewer ko bata. Argue kyun ek entity zaroori hai.

### Step 3: Class diagram + relationships (10-15 min)

Whiteboard / Excalidraw pe boxes banaa. Har box = ek class. Lines:

- **Composition (filled diamond)**: A *owns* B, B can't exist without A. Group composes Member rows.
- **Aggregation (hollow diamond)**: A *has* B, B independent. Group aggregates Users (User exists outside Group).
- **Inheritance (hollow triangle)**: B *is-a* A. EqualSplit extends Split.
- **Dependency (dashed arrow)**: A *uses* B in a method. ExpenseManager uses NotificationService.

```
+---------+      +-----------+
|  User   |<>----|  Group    |
+---------+      +-----------+
                       |
                       | composes
                       v
                 +-----------+      +---------+
                 |  Expense  |----->|  Split  |
                 +-----------+      +---------+
                                         ^
                                         |
                          +-------+-------+-------+
                          |       |       |       |
                       Equal   Exact   Percent  ...
```

Code likhne se pehle **diagram interviewer ko explain kar** — "This is User, owns multiple Group memberships. Each Group has Expenses. Each Expense has a Split which is one of these subclasses." Verbal walkthrough = 60% of LLD scoring.

### Step 4: Code skeleton + key methods (15-25 min)

Ab classes likh — Java / C++ / Python jisme tu fluent hai. Don't try to compile in your head. Goal: *reasonable* code that shows you understand the design.

```java
public abstract class Split {
    protected User user;
    protected double amount;
    public abstract double getAmount();
}

public class EqualSplit extends Split { ... }
public class ExactSplit extends Split { ... }
public class PercentSplit extends Split {
    private double percent;
    public double getAmount() { return totalAmount * percent / 100; }
}
```

Constructors, getters/setters skip kar (or just `// boilerplate`). Focus on:
- The strategy pattern in Split
- The factory method that picks split type
- Edge cases: zero-amount expense, single-user group, currency mismatch

End mein, **3 minutes for trade-offs / extensions:**
- "If we wanted to add tax, we'd extend Expense with a TaxStrategy."
- "Currently we re-compute balances on every request — at scale we'd cache or use event-sourcing."

That last 3 minutes pe interviewer "senior engineer signal" detect karta hai.

---

## 3. Design principles you MUST apply

### SOLID — refresh + LLD application

| Principle | Definition | LLD application |
|-----------|------------|-----------------|
| **S** — Single Responsibility | Ek class, ek reason to change | `User` class shouldn't compute split; `SplitCalculator` does that |
| **O** — Open/Closed | Open for extension, closed for modification | New `Split` types (`PercentSplit`) extend, don't modify base `Split` |
| **L** — Liskov Substitution | Subclass should be drop-in replacement | If `f(Split s)` works for `EqualSplit`, must work for `ExactSplit` |
| **I** — Interface Segregation | Don't force class to implement methods it doesn't use | `Vehicle` interface has `move()`; don't add `fly()` if `Car` doesn't fly |
| **D** — Dependency Inversion | Depend on abstractions, not concrete | `ExpenseManager` depends on `SplitStrategy` interface, not `EqualSplit` directly |

### Composition over inheritance

90% of the time, composition wins:

```java
// BAD — deep inheritance
class Animal {}
class Bird extends Animal {}
class Penguin extends Bird {}  // can't fly, but Bird has fly()?

// GOOD — composition
class Animal {
    private final FlyBehavior fly;
    private final SwimBehavior swim;
    private final EatBehavior eat;
}
```

Strategy pattern (next section) is the codified version of this.

### DRY, KISS, YAGNI

- **DRY** (Don't Repeat Yourself): Two methods doing same thing? Extract to one.
- **KISS** (Keep It Simple, Stupid): Don't add abstraction "in case we need it later."
- **YAGNI** (You Aren't Gonna Need It): If interviewer asked for split equally, don't pre-build percentage split unprompted. Wait for the requirement.

LLD interviews reward **minimum viable design** that solves the stated problem cleanly, not a god-class with 47 features.

---

## 4. Top 6 design patterns you'll use 80% of the time

| Pattern | One-line summary | Where in LLD |
|---------|-------------------|---------------|
| **Strategy** | Encapsulate algorithm; swap at runtime | Splitwise's `Split` (equal/percent/exact); payment methods |
| **Factory** | Create objects without exposing creation logic | `VehicleFactory.create("Car")`; `SplitFactory.create("PERCENT", ...)` |
| **Singleton** | Exactly one instance | `ParkingLot.getInstance()`; logger; config |
| **Observer** | When X changes, notify Y, Z | Notifications in BookMyShow when seat booked |
| **State** | Object behaviour changes with state | `Order` transitions: PENDING → PAID → SHIPPED |
| **Decorator** | Wrap object to add behaviour | Coffee + milk + sugar; HTTP middleware chain |

If you can spot which pattern fits the problem, **name it** during the interview — interviewers love when candidates say "this is the Strategy pattern; we externalise the algorithm."

---

## 5. Worked Example A — Parking Lot

The OG LLD question. Asked at Amazon, Microsoft, Uber, Flipkart for the past decade. If you can't crack this in 30 minutes, you'll struggle with everything else.

### Requirements (Step 1)

**Functional:**
- Multiple floors, each floor has spots
- Spots are typed: Compact, Large, Bike
- Vehicles enter, get a ticket, park in a spot of correct type
- On exit, calculate fee by duration, free the spot

**Non-functional:**
- Concurrent vehicles entering (ticket generation must be thread-safe)
- In-memory only

**Out of scope:**
- Payment gateway integration
- Reservation system
- Multi-lot management

### Entities (Step 2)

- **ParkingLot** (singleton) — has floors
- **ParkingFloor** — has spots
- **ParkingSpot** (abstract) — Compact/Large/Bike subclasses
- **Vehicle** (abstract) — Car/Truck/Bike subclasses
- **Ticket** — issued at entry
- **EntryGate** / **ExitGate**
- **FeeCalculator** (strategy)

### Class diagram (Step 3)

```
+----------------+
|  ParkingLot    | <-- Singleton
|  (floors)      |
+----------------+
        |
        | has-many
        v
+----------------+
|  ParkingFloor  |
|  (spots)       |
+----------------+
        |
        | has-many
        v
+----------------+        +----------------+
|  ParkingSpot   |<------>|    Vehicle     |
|  (abstract)    |        |  (abstract)    |
+----------------+        +----------------+
   ^      ^      ^           ^      ^      ^
   |      |      |           |      |      |
Compact Large  Bike         Car  Truck   Bike
```

### Code skeleton (Step 4)

```java
// Singleton parking lot
public class ParkingLot {
    private static volatile ParkingLot instance;
    private final List<ParkingFloor> floors;

    private ParkingLot() { this.floors = new ArrayList<>(); }

    public static ParkingLot getInstance() {
        if (instance == null) {
            synchronized (ParkingLot.class) {
                if (instance == null) instance = new ParkingLot();
            }
        }
        return instance;
    }

    public Ticket issueTicket(Vehicle v) {
        for (ParkingFloor f : floors) {
            ParkingSpot spot = f.findFreeSpot(v.getType());
            if (spot != null) {
                spot.assign(v);
                return new Ticket(v, spot, Instant.now());
            }
        }
        throw new ParkingFullException();
    }

    public double exitVehicle(Ticket t) {
        long minutes = Duration.between(t.entryTime(), Instant.now()).toMinutes();
        double fee = FeeCalculator.calculate(t.spot().getType(), minutes);
        t.spot().release();
        return fee;
    }
}

// Strategy for fee calculation
public class FeeCalculator {
    private static final Map<SpotType, Double> RATES = Map.of(
        SpotType.COMPACT, 20.0,   // ₹20/hr
        SpotType.LARGE,   40.0,
        SpotType.BIKE,    10.0
    );
    public static double calculate(SpotType type, long minutes) {
        double hours = Math.ceil(minutes / 60.0);
        return RATES.get(type) * hours;
    }
}
```

### Trade-offs to mention

- **Concurrency**: `findFreeSpot` + `assign` should be atomic. Either use `synchronized` blocks or a `ConcurrentHashMap` keyed by spotId. In a real system, DB row-level locks or Redis distributed locks.
- **Extension**: Adding "EV charging spots" = new `ParkingSpot` subclass. No changes to `ParkingLot`. Open/Closed principle in action.
- **Persistence**: Currently in-memory; in production each `assign`/`release` would write to DB.

---

## 6. Worked Example B — Splitwise

Tests strategy pattern + balance bookkeeping.

### Requirements (Step 1)

**Functional:**
- Users join groups
- Add expenses to a group with a split type: EQUAL / EXACT / PERCENT
- Show balances: who owes whom how much
- Settle up an individual debt

**Out of scope:** auth, payment gateway, notifications, currency conversion.

### Entities (Step 2)

- **User**
- **Group**
- **Expense**
- **Split** (abstract) → EqualSplit / ExactSplit / PercentSplit
- **ExpenseManager** (orchestrates updates to balances)

### Class diagram + key methods (Steps 3 + 4)

```java
public class User {
    private final String id;
    private final String name;
    // balances[otherUserId] = positive means otherUser owes us
    private final Map<String, Double> balances = new HashMap<>();
}

public abstract class Split {
    protected User user;
    protected double amount;
    public abstract void validate(double total);
    public double getAmount() { return amount; }
}

public class EqualSplit extends Split {
    public void validate(double total) { /* nothing */ }
}

public class ExactSplit extends Split {
    public void validate(double total) {
        // Caller must ensure sum(splits.amount) == total
    }
}

public class PercentSplit extends Split {
    private final double percent;
    public PercentSplit(User u, double percent) {
        this.user = u; this.percent = percent;
    }
    public void validate(double total) {
        if (percent < 0 || percent > 100) throw new IllegalArgumentException();
        this.amount = total * percent / 100.0;
    }
}

public class ExpenseManager {
    private final Map<String, User> users = new HashMap<>();

    public void addExpense(User paidBy, double amount, List<Split> splits) {
        // Validate
        double sum = splits.stream().mapToDouble(s -> {
            s.validate(amount);
            return s.getAmount();
        }).sum();
        if (Math.abs(sum - amount) > 0.01) {
            throw new IllegalStateException("Splits don't sum to total");
        }
        // Update balances
        for (Split s : splits) {
            User u = s.user;
            if (u.equals(paidBy)) continue;
            double share = s.getAmount();
            // u owes paidBy `share`
            paidBy.addBalance(u.getId(), share);
            u.addBalance(paidBy.getId(), -share);
        }
    }
}
```

### Trade-offs

- **Floating-point money**: Always use `BigDecimal` in production, never `double`. ₹100.00 split among 3 = ₹33.33 + ₹33.33 + ₹33.34. Mention rounding strategy explicitly.
- **Concurrency**: Multiple users updating balances simultaneously needs locking or eventual consistency.
- **Audit trail**: Add an `Expense` log so balances can be recomputed if there's a dispute.
- **Simplification of debt graph**: A→B owes ₹100, B→C owes ₹100 should simplify to A→C ₹100. Greedy algorithm or graph reduction — mention it as an extension.

---

## 7. Worked Example C — BookMyShow

Tests state pattern + observer + concurrent seat booking.

### Requirements (Step 1)

**Functional:**
- Movies have multiple shows across cinemas
- Show has a seat layout
- User selects seats, holds them for 5 minutes (state: HELD), then either pays (BOOKED) or holds expire (back to AVAILABLE)
- Two users can't book the same seat

**Out of scope:** payment, food orders, recommendations.

### Entities (Step 2)

- **Movie**, **Cinema**, **Hall**, **Show**, **Seat**, **Booking**, **User**
- **Seat** has state: AVAILABLE / HELD / BOOKED
- **BookingManager** orchestrates the hold+pay flow
- **NotificationObserver** for "seats are about to expire" warnings

### Critical bit — seat state machine

```java
public enum SeatStatus { AVAILABLE, HELD, BOOKED }

public class Seat {
    private final String id;
    private SeatStatus status = SeatStatus.AVAILABLE;
    private Instant heldUntil;
    private User holder;

    public synchronized boolean tryHold(User u, Duration ttl) {
        if (status == SeatStatus.AVAILABLE) {
            status = SeatStatus.HELD;
            holder = u;
            heldUntil = Instant.now().plus(ttl);
            return true;
        }
        // Expired hold? Reclaim.
        if (status == SeatStatus.HELD && Instant.now().isAfter(heldUntil)) {
            status = SeatStatus.HELD;
            holder = u;
            heldUntil = Instant.now().plus(ttl);
            return true;
        }
        return false;
    }

    public synchronized boolean confirm(User u) {
        if (status == SeatStatus.HELD && holder.equals(u)
            && Instant.now().isBefore(heldUntil)) {
            status = SeatStatus.BOOKED;
            return true;
        }
        return false;  // hold expired or someone else's
    }
}
```

### Trade-offs

- **Concurrency**: `synchronized` is fine in-process but useless distributed. Production uses Redis with `SETNX seat:{id} <userId> EX 300`. Atomic compare-and-set.
- **Hold expiry**: Either a background sweeper polls every minute, or each `tryHold` re-checks the timestamp. Latter is simpler and has no daemon dependency.
- **Observer**: When seat is held, fire `SeatHeldEvent`. Other listeners (analytics, fraud detection) subscribe.
- **Optimistic vs pessimistic**: Pessimistic locks (the above) are fine at low scale. At BookMyShow scale (1M+ concurrent during a Star Wars release), use queue-per-show + serial worker.

---

## 8. Worked Example D — ATM machine

ATM ek classic **state pattern** problem hai. Interviewer specifically dekhta hai ki tu state machine clean banata hai ya nested if-else ka jungle bana deta hai. Asked at HSBC, Goldman Sachs, Paytm, PhonePe — basically har fintech ne kabhi na kabhi pucha hai.

### Requirements (Step 1)

**Functional:**
- User card insert kare, PIN daale, authenticate ho
- Withdraw / Deposit / Balance check / Mini-statement
- Cash dispense, receipt print
- Cancel kabhi bhi possible (any state se IDLE pe wapas)
- Multiple denominations (₹100, ₹200, ₹500, ₹2000) — greedy dispense

**Non-functional:**
- Single-user at a time (physical ATM constraint)
- Thread-safe vault inventory (multiple ATMs share backend account state)
- Audit log har transaction ka

**Out of scope:**
- Card network (VISA/Mastercard) integration
- Biometric auth
- Cardless withdrawal via UPI
- ATM hardware drivers

### Entities (Step 2)

- **ATM** — context class, holds current `ATMState`
- **ATMState** (interface) — has `insertCard`, `enterPin`, `selectOperation`, `dispenseCash`, `cancel` methods
- **Concrete states**: `IdleState`, `CardInsertedState`, `AuthenticatedState`, `TransactionState`, `DispensingState`
- **Card**, **Account**, **Bank** (account lookup)
- **CashDispenser** — vault with denomination buckets
- **TransactionLog** — audit

State transitions: `IDLE → CARD_INSERTED → AUTHENTICATED → TRANSACTION → DISPENSING → IDLE`

Cancel se kahin se bhi `IDLE` pe wapas. Ye edge case interviewer pucchta hai — handle karna mat bhul.

### Class diagram (Step 3)

```
              +---------+
              |   ATM   | <-- context
              | (state) |
              +----+----+
                   |
                   | delegates to
                   v
            +-------------+
            |  ATMState   | <-- interface
            +-------------+
              ^   ^   ^   ^   ^
              |   |   |   |   |
   +----------+   |   |   |   +----------+
   |              |   |   |              |
Idle    CardInserted  |   |       Dispensing
                  Authenticated  Transaction

   ATM ---> CashDispenser ---> Map<Denomination, Integer>
   ATM ---> Bank ---> Map<CardId, Account>
   ATM ---> TransactionLog
```

### Code skeleton (Step 4)

```java
public enum Denomination {
    HUNDRED(100), TWO_HUNDRED(200), FIVE_HUNDRED(500), TWO_THOUSAND(2000);
    public final int value;
    Denomination(int v) { this.value = v; }
}

public interface ATMState {
    void insertCard(ATM atm, Card card);
    void enterPin(ATM atm, String pin);
    void selectOperation(ATM atm, Operation op, double amount);
    void dispenseCash(ATM atm);
    void cancel(ATM atm);
}

public class ATM {
    private ATMState state;
    private Card currentCard;
    private Account currentAccount;
    private double pendingAmount;
    private final CashDispenser dispenser;
    private final Bank bank;
    private final TransactionLog log;

    public ATM(CashDispenser d, Bank b, TransactionLog l) {
        this.dispenser = d; this.bank = b; this.log = l;
        this.state = new IdleState();
    }

    public void setState(ATMState s) { this.state = s; }
    public CashDispenser dispenser() { return dispenser; }
    public Bank bank() { return bank; }
    public TransactionLog log() { return log; }

    // Public API just delegates to current state
    public void insertCard(Card c) { state.insertCard(this, c); }
    public void enterPin(String p) { state.enterPin(this, p); }
    public void selectOperation(Operation o, double a) { state.selectOperation(this, o, a); }
    public void dispenseCash() { state.dispenseCash(this); }
    public void cancel() { state.cancel(this); }
}

public class IdleState implements ATMState {
    public void insertCard(ATM atm, Card card) {
        atm.currentCard = card;
        atm.setState(new CardInsertedState());
        System.out.println("Card accepted. Please enter PIN.");
    }
    public void enterPin(ATM atm, String pin) { throw new IllegalStateException("Insert card first"); }
    public void selectOperation(ATM atm, Operation op, double amt) { throw new IllegalStateException(); }
    public void dispenseCash(ATM atm) { throw new IllegalStateException(); }
    public void cancel(ATM atm) { /* already idle */ }
}

public class AuthenticatedState implements ATMState {
    public void insertCard(ATM atm, Card c) { throw new IllegalStateException("Already authenticated"); }
    public void enterPin(ATM atm, String pin) { throw new IllegalStateException("Already authenticated"); }
    public void selectOperation(ATM atm, Operation op, double amount) {
        atm.pendingAmount = amount;
        atm.setState(new TransactionState(op));
    }
    public void dispenseCash(ATM atm) { throw new IllegalStateException(); }
    public void cancel(ATM atm) {
        atm.setState(new IdleState());
        atm.currentCard = null;
        System.out.println("Cancelled. Take your card.");
    }
}

public class CashDispenser {
    private final Map<Denomination, Integer> notes = new ConcurrentHashMap<>();
    public synchronized List<Denomination> dispense(double amount) {
        // Greedy: largest denomination first
        List<Denomination> out = new ArrayList<>();
        int remaining = (int) amount;
        Denomination[] sorted = { Denomination.TWO_THOUSAND, Denomination.FIVE_HUNDRED,
                                   Denomination.TWO_HUNDRED, Denomination.HUNDRED };
        for (Denomination d : sorted) {
            int needed = remaining / d.value;
            int avail = notes.getOrDefault(d, 0);
            int give = Math.min(needed, avail);
            for (int i = 0; i < give; i++) out.add(d);
            remaining -= give * d.value;
            notes.merge(d, -give, Integer::sum);
        }
        if (remaining > 0) throw new InsufficientCashException();
        return out;
    }
}
```

### Trade-offs to mention

- **Concurrency**: Single physical ATM = single user, but vault inventory updated atomically across ATMs in same branch. Use DB row lock or Redis `DECRBY` per denomination key.
- **Persistence**: Every state transition log mein likhna chahiye taaki crash ke baad recovery ho. State machine + write-ahead log = idempotency milti hai.
- **Extension**: New transaction type (UPI withdrawal, card-less) = new `Operation` enum + handler. State graph nahi badalna chahiye.
- **Edge cases interviewer puchhega**: PIN 3 baar galat → card block + IDLE; transaction mid-way mein power cut → on reboot, log replay; insufficient cash mid-dispense → rollback account debit.

---

## 9. Worked Example E — Online Chess game

Chess game tests **factory pattern** (piece creation), **command pattern** (move history + undo), aur **strategy** (move validation per piece). Asked at Microsoft, Adobe, Atlassian, Zerodha. Tu agar Snake & Ladder se Chess pe jump karega to scope ka feel aayega.

### Requirements (Step 1)

**Functional:**
- 8x8 board, 6 piece types (King, Queen, Rook, Bishop, Knight, Pawn) per side
- Two players (White, Black) alternate turns
- Move validation per piece (Knight L-shape, Bishop diagonal, etc.)
- Capture mechanic
- Check, checkmate, stalemate detection
- Undo last move
- Move history (PGN-like)

**Non-functional:**
- 2-player local (no network)
- In-memory game state

**Out of scope:**
- Multiplayer matchmaking
- Engine/AI opponent
- Chess clock (timed games)
- Special moves (castling, en passant, promotion) — *mention as extension*

### Entities (Step 2)

- **Board** — 8x8 grid of `Cell`
- **Cell** — has optional `Piece`
- **Piece** (abstract) → King, Queen, Rook, Bishop, Knight, Pawn
- **Player** — White / Black
- **Move** — from-cell, to-cell, piece, capturedPiece (for undo)
- **Game** — orchestrates turns, holds history (Stack of Move)
- **PieceFactory** — creates pieces by type
- **MoveCommand** — encapsulates execute + undo

### Class diagram (Step 3)

```
+-------+        +-------+
| Game  |<>----->| Board |
+-------+        +-------+
   |                |
   | history        | grid[8][8]
   v                v
+--------+       +-------+      +---------+
| Move   |       | Cell  |<>--->|  Piece  | <-- abstract
+--------+       +-------+      +---------+
   |                              ^   ^   ^   ^   ^   ^
   | implements                   |   |   |   |   |   |
   v                            King Queen Rook Bishop Knight Pawn
+-----------------+
| MoveCommand     | <-- command pattern (execute / undo)
+-----------------+
```

### Code skeleton (Step 4)

```java
public abstract class Piece {
    protected final Color color;
    public Piece(Color c) { this.color = c; }
    public abstract boolean canMove(Board b, Cell from, Cell to);
    public Color color() { return color; }
}

public class Knight extends Piece {
    public Knight(Color c) { super(c); }
    public boolean canMove(Board b, Cell from, Cell to) {
        int dx = Math.abs(from.x - to.x);
        int dy = Math.abs(from.y - to.y);
        // L-shape: (2,1) or (1,2)
        boolean shape = (dx == 2 && dy == 1) || (dx == 1 && dy == 2);
        // Can't capture own piece
        return shape && (to.piece() == null || to.piece().color() != this.color);
    }
}

public class Bishop extends Piece {
    public Bishop(Color c) { super(c); }
    public boolean canMove(Board b, Cell from, Cell to) {
        int dx = Math.abs(from.x - to.x);
        int dy = Math.abs(from.y - to.y);
        if (dx != dy || dx == 0) return false;
        // Path must be clear
        int sx = Integer.signum(to.x - from.x), sy = Integer.signum(to.y - from.y);
        for (int i = 1; i < dx; i++) {
            if (b.cellAt(from.x + i*sx, from.y + i*sy).piece() != null) return false;
        }
        return to.piece() == null || to.piece().color() != this.color;
    }
}

public class PieceFactory {
    public static Piece create(PieceType type, Color color) {
        switch (type) {
            case KING:   return new King(color);
            case QUEEN:  return new Queen(color);
            case ROOK:   return new Rook(color);
            case BISHOP: return new Bishop(color);
            case KNIGHT: return new Knight(color);
            case PAWN:   return new Pawn(color);
            default: throw new IllegalArgumentException();
        }
    }
}

// Command pattern for move + undo
public class MoveCommand {
    private final Cell from, to;
    private final Piece moved;
    private Piece captured;  // null if no capture

    public MoveCommand(Cell from, Cell to) {
        this.from = from; this.to = to; this.moved = from.piece();
    }

    public void execute() {
        this.captured = to.piece();
        to.setPiece(moved);
        from.setPiece(null);
    }

    public void undo() {
        from.setPiece(moved);
        to.setPiece(captured);
    }
}

public class Game {
    private final Board board = new Board();
    private final Deque<MoveCommand> history = new ArrayDeque<>();
    private Color turn = Color.WHITE;

    public boolean play(Cell from, Cell to) {
        Piece p = from.piece();
        if (p == null || p.color() != turn) return false;
        if (!p.canMove(board, from, to)) return false;
        MoveCommand cmd = new MoveCommand(from, to);
        cmd.execute();
        // After execute, check if own king is in check — if yes, undo
        if (board.isInCheck(turn)) { cmd.undo(); return false; }
        history.push(cmd);
        turn = (turn == Color.WHITE) ? Color.BLACK : Color.WHITE;
        return true;
    }

    public boolean undo() {
        if (history.isEmpty()) return false;
        history.pop().undo();
        turn = (turn == Color.WHITE) ? Color.BLACK : Color.WHITE;
        return true;
    }
}
```

### Trade-offs to mention

- **Concurrency**: Local game = single thread. Online chess = both players send moves to server; server has authoritative `Game` per match. Use actor model or per-match lock.
- **Extension**: Castling, en passant, promotion — har special move ek alag `MoveCommand` subclass. `CastleCommand`, `EnPassantCommand`, `PromotionCommand`. Open/Closed satisfied.
- **Persistence**: Move history serialise karna easy hai (PGN format = standard). Game state replay possible from move list.
- **Move generation for AI**: `Piece.legalMoves(board)` add karna ho to har piece pe ek `List<Cell>` returning method. Currently sirf validation hai — generation alag concern hai.
- **Check detection**: `Board.isInCheck(color)` requires scanning if any opponent piece can move to king's cell. O(64 * piece_count). Acceptable. Mention.

---

## 10. Worked Example F — Cab-booking (Uber LLD)

Sabse popular product-company LLD question — Uber, Ola, Rapido sab puchte hain. Tests **strategy** (fare calculation), **state machine** (Driver + Rider), **observer** (driver location updates), aur ek matching algorithm. Yahan tu shine kar sakta hai agar matching algo ka rationale theek se explain kare.

### Requirements (Step 1)

**Functional:**
- Rider request a ride: source, destination, ride type (Mini / Sedan / SUV)
- System matches a nearby available driver
- Driver accepts/rejects
- Trip starts, driver navigates, trip ends
- Fare calculated based on distance + time + ride type + surge
- Rating after trip (rider rates driver, driver rates rider)

**Non-functional:**
- 10k concurrent ride requests in a city
- Match latency < 5 sec
- Driver location updates every 4 sec
- Eventual consistency for ratings, strong consistency for trip state

**Out of scope:**
- Payment gateway
- Map/routing service (assume `DistanceService` interface)
- Notifications
- Fraud detection
- Driver onboarding

### Entities (Step 2)

- **Rider** — id, name, currentTrip, rating
- **Driver** — id, name, vehicle, location, status (OFFLINE / AVAILABLE / EN_ROUTE / ON_TRIP), rating
- **Vehicle** — type (Mini/Sedan/SUV), plate, capacity
- **Trip** — rider, driver, source, destination, status, fare, startedAt, endedAt
- **Location** — lat, lng
- **MatchingService** — finds best driver for a ride request
- **FareCalculator** (strategy interface) → `MiniFare`, `SedanFare`, `SUVFare`, `SurgeFare`
- **TripManager** — orchestrates state transitions
- **DriverLocationIndex** — geohash / quadtree for fast spatial lookup

### Class diagram (Step 3)

```
+--------+    requests    +------------------+
| Rider  |--------------->| MatchingService  |
+--------+                +------------------+
                                 |
                                 | queries
                                 v
                          +--------------------+
                          | DriverLocationIdx  | <-- geohash / quadtree
                          +--------------------+
                                 |
                                 v
+--------+    assigned    +--------+
| Driver |<---------------|  Trip  |
+--------+                +--------+
   |                          |
   | observes                 | uses
   v                          v
+----------------+      +-----------------+
| LocationStream |      | FareCalculator  | <-- strategy
+----------------+      +-----------------+
                          ^   ^   ^   ^
                          |   |   |   |
                       Mini Sedan SUV Surge(decorator)
```

### Code skeleton (Step 4)

```java
public enum DriverStatus { OFFLINE, AVAILABLE, EN_ROUTE, ON_TRIP }
public enum TripStatus { REQUESTED, ACCEPTED, STARTED, COMPLETED, CANCELLED }

public class Driver {
    private final String id;
    private Location location;
    private DriverStatus status = DriverStatus.OFFLINE;
    private final Vehicle vehicle;
    private double rating = 5.0;

    public synchronized boolean tryAssign(Trip t) {
        if (status != DriverStatus.AVAILABLE) return false;
        status = DriverStatus.EN_ROUTE;
        return true;
    }
    public synchronized void release() { status = DriverStatus.AVAILABLE; }
    public Location location() { return location; }
    public Vehicle vehicle() { return vehicle; }
}

public interface FareCalculator {
    double calculate(double distanceKm, long durationMin);
}

public class MiniFare implements FareCalculator {
    public double calculate(double km, long min) {
        return 30 + km * 12 + min * 1.5;  // base ₹30, ₹12/km, ₹1.5/min
    }
}

public class SurgeFare implements FareCalculator {
    private final FareCalculator base;
    private final double multiplier;
    public SurgeFare(FareCalculator b, double m) { this.base = b; this.multiplier = m; }
    public double calculate(double km, long min) {
        return base.calculate(km, min) * multiplier;
    }
}

public class MatchingService {
    private final DriverLocationIndex index;
    private static final double SEARCH_RADIUS_KM = 3.0;

    public Optional<Driver> findDriver(Location source, VehicleType type) {
        List<Driver> candidates = index.nearby(source, SEARCH_RADIUS_KM)
            .stream()
            .filter(d -> d.status() == DriverStatus.AVAILABLE)
            .filter(d -> d.vehicle().type() == type)
            .sorted(Comparator
                .comparingDouble((Driver d) -> distance(d.location(), source))
                .thenComparingDouble(d -> -d.rating()))  // closer + higher-rated first
            .collect(Collectors.toList());

        // Try assigning to candidates in order; first one to atomically claim wins
        for (Driver d : candidates) {
            Trip placeholder = new Trip(/* ... */);
            if (d.tryAssign(placeholder)) return Optional.of(d);
        }
        return Optional.empty();
    }
}

public class TripManager {
    public Trip requestRide(Rider r, Location src, Location dst, VehicleType type) {
        Optional<Driver> match = matchingService.findDriver(src, type);
        if (match.isEmpty()) throw new NoDriversAvailableException();
        Driver d = match.get();
        Trip t = new Trip(r, d, src, dst);
        t.setStatus(TripStatus.ACCEPTED);
        return t;
    }

    public void startTrip(Trip t) {
        t.setStatus(TripStatus.STARTED);
        t.driver().setStatus(DriverStatus.ON_TRIP);
        t.setStartedAt(Instant.now());
    }

    public double endTrip(Trip t) {
        t.setStatus(TripStatus.COMPLETED);
        t.setEndedAt(Instant.now());
        long min = Duration.between(t.startedAt(), t.endedAt()).toMinutes();
        double km = distanceService.distance(t.source(), t.destination());
        FareCalculator calc = fareFor(t.vehicleType());
        if (surgeService.isSurging(t.source())) {
            calc = new SurgeFare(calc, surgeService.multiplier(t.source()));
        }
        double fare = calc.calculate(km, min);
        t.setFare(fare);
        t.driver().release();
        return fare;
    }
}
```

### Trade-offs to mention

- **Concurrency at matching**: Sabse painful. 100 drivers, 100 ride requests at same instant — naive code mein same driver multiple riders ko assign ho jaayega. Solution: `Driver.tryAssign` ka CAS (compare-and-set on `status` field) — only one thread wins. At scale: per-driver Redis lock with short TTL.
- **DriverLocationIndex**: In-memory geohash bucket map. Driver moves 100m? Update bucket. Search = 9-cell scan around source's bucket. Production mein use Uber's open-source H3 hex grid.
- **Surge as decorator**: Beautiful pattern — base fare unchanged, surge wraps it. `new SurgeFare(new SedanFare(), 1.8)`. Composable: airport-tolls + surge = double-decorator.
- **Driver state machine**: Strict transitions only. OFFLINE → AVAILABLE → EN_ROUTE → ON_TRIP → AVAILABLE. Skip-state attempts throw. Saves 50% of bugs.
- **Eventual consistency for ratings**: After trip ends, rating event fired async. Driver's avg rating recomputed in background. Trip flow doesn't block on rating write.
- **Cancellation cascade**: Rider cancels mid-trip → driver released, fare = base + min cancellation fee, trip status CANCELLED. Mention this.

---

## 11. Deep dive — Concurrency patterns in LLD

LLD interview ke andar concurrency wala 5-10 minute conversation often **promotion-deciding** hota hai. SDE-1 candidates yahan handwave karte hain — "use synchronized" — aur SDE-2/3 candidates clearly differentiate karte hain. Iss section mein tujhe woh differentiation milega.

### `synchronized` vs `ReentrantLock` vs `ReadWriteLock`

| Tool | When to use | Cost |
|------|-------------|------|
| `synchronized` | Simple critical section; <10 lines; no need for tryLock/timeout | Cheapest, JVM-optimised |
| `ReentrantLock` | Need `tryLock(timeout)`, fairness, or interruptible wait | ~2x synchronized; more flexible |
| `ReadWriteLock` | Many readers, few writers (e.g., config cache) | Reader path is fast; writer starves if reads dominate |
| `StampedLock` (Java 8+) | Very read-heavy; can do optimistic reads | Best read throughput; tricky API |

**Decision recipe:**

1. Default to `synchronized`. 80% cases mein bas yeh sufficient hai.
2. Need timeout? `ReentrantLock.tryLock(500, MILLISECONDS)`.
3. Read:write ratio > 10:1? `ReadWriteLock`.
4. Read:write > 100:1 + ultra-low-latency reads? `StampedLock` with optimistic read.

```java
// ReadWriteLock example — config cache
public class ConfigCache {
    private final Map<String, String> map = new HashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public String get(String key) {
        lock.readLock().lock();
        try { return map.get(key); }
        finally { lock.readLock().unlock(); }
    }

    public void put(String key, String value) {
        lock.writeLock().lock();
        try { map.put(key, value); }
        finally { lock.writeLock().unlock(); }
    }
}
```

### Atomic primitives

Locks ki zaroorat tab nahi jab tu sirf ek single variable update kar raha hai. Atomic classes use kar:

- `AtomicInteger` — counters (request count, active sessions)
- `AtomicLong` — timestamps, big ids
- `AtomicReference<T>` — pointer swaps (current config, latest leader)
- `AtomicBoolean` — flags (shutdown signal, feature toggle)
- `LongAdder` — high-contention counter; better than `AtomicLong` under heavy writes

```java
public class RequestCounter {
    private final AtomicLong count = new AtomicLong(0);
    public void increment() { count.incrementAndGet(); }
    public long get() { return count.get(); }
}
```

Kab use kare? Single-variable update + no compound invariant. Agar tu `if (x > 0) x--;` jaisa kuch likh raha hai, atomic insufficient — that's two ops, race exists. CAS use kar.

### Optimistic locking via CAS

Compare-And-Set is the heart of lock-free programming. Idea: read value, compute new value, atomically swap *only if* current value still matches read value. If not, retry.

```java
// Optimistic increment (this is what AtomicInteger.incrementAndGet does internally)
AtomicInteger counter = new AtomicInteger(0);

public int safeIncrement() {
    while (true) {
        int current = counter.get();
        int next = current + 1;
        if (counter.compareAndSet(current, next)) return next;
        // Else: somebody else updated; retry
    }
}
```

LLD interview mein CAS ka classic use case: **seat booking**. Pessimistic lock se serial throughput milti hai; CAS se concurrent attempts ho sakte hain, sirf collision pe retry.

```java
public class Seat {
    private final AtomicReference<SeatStatus> status =
        new AtomicReference<>(SeatStatus.AVAILABLE);

    public boolean reserve() {
        return status.compareAndSet(SeatStatus.AVAILABLE, SeatStatus.HELD);
    }
}
```

Trade-off: CAS great for low contention; jab 1000 threads ek seat ke peeche bhaag rahe ho, retry storm aata hai. Tab queue better.

### When to use a queue instead of a lock

`BlockingQueue` se tu sharing ko *eliminate* kar deta hai — single consumer thread, multiple producers. No locks needed in consumer.

```java
public class OrderProcessor {
    private final BlockingQueue<Order> queue = new LinkedBlockingQueue<>(10_000);
    private final Thread worker;

    public OrderProcessor() {
        this.worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Order o = queue.take();  // blocks
                    process(o);              // single-threaded; no lock
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        worker.start();
    }

    public void submit(Order o) { queue.offer(o); }
    private void process(Order o) { /* ... */ }
}
```

Use queue when:
- Per-resource serialisation is acceptable (1 worker per show in BookMyShow)
- Burstiness expected (Big Billion Day flash sale)
- Backpressure needed (queue full = reject upstream)

### Distributed extension — Redis SETNX vs Redlock

In-process locks useless across servers. Distributed lock zaroori hai:

**Redis `SETNX` (or `SET NX`)** — single-node, simple:

```python
# Acquire
if redis.set(f"lock:seat:{seat_id}", user_id, nx=True, ex=300):
    # got the lock; book seat
    book_seat(seat_id)
    redis.delete(f"lock:seat:{seat_id}")
else:
    # somebody else has it
    raise SeatTakenError()
```

Problem: agar Redis master crash ho jaaye before replication, lock lost. Two clients can hold same lock.

**Redlock** — quorum across N (typically 5) Redis nodes. Acquire on majority. More fault-tolerant but slower (multiple round-trips). Martin Kleppmann ne critique ki hai — be aware ki Redlock isn't bulletproof for absolute correctness, only for performance optimisation.

For most interview answers: "We'd use Redis SETNX with a TTL; for stronger guarantees use Redlock or move to ZooKeeper/etcd." That sentence alone separates SDE-2 from SDE-1.

### Interview classic — "Two users hit BookMyShow at the same time"

Concrete answer expected:

1. **In-process** (single server): seat object's `synchronized tryHold` ensures atomic check-and-set. Only one thread wins.
2. **Distributed** (multi-server): can't rely on JVM lock. Use Redis `SET seat:{id} {userId} NX EX 300`. Returns OK to winner, nil to loser.
3. **Database row lock**: alternative — `SELECT ... FOR UPDATE` on seat row inside a transaction. Postgres serialises. Works at moderate scale (1k qps); breaks beyond.
4. **Queue**: at extreme scale (Star Wars opening night, 1M users), accept all requests into a Kafka topic per show, single worker drains in order, first request to claim seat wins, rest get "seat unavailable." This decouples user request rate from booking rate.
5. **Mention idempotency**: Each user request has a `requestId`; if user retries (network blip), same `requestId` doesn't double-book.

Real systems combine 2 + 4: Redis lock for fast path, queue for surge.

### Deadlock avoidance — the 4 conditions

Coffman conditions — deadlock tab hota hai jab chaaron present ho:

1. **Mutual exclusion** — resource non-sharable
2. **Hold and wait** — thread holds one lock, requests another
3. **No preemption** — locks released only voluntarily
4. **Circular wait** — A waits for B, B waits for A

LLD interview mein deadlock avoidance ka standard recipe:

- **Lock ordering**: hamesha locks ek fixed order mein acquire kar (e.g., by resource id ascending). Money transfer mein A → B, lock `min(A.id, B.id)` first, then `max`. Circular wait impossible.
- **Try-lock with timeout**: `tryLock(500, MS)` — fail fast, retry with backoff. No infinite hang.
- **Lock-free where possible**: CAS / atomic primitives don't deadlock.

```java
// Money transfer with lock ordering
public void transfer(Wallet from, Wallet to, double amount) {
    Wallet first  = from.id().compareTo(to.id()) < 0 ? from : to;
    Wallet second = (first == from) ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

Iss code mein 100 threads parallel chalein bhi, sab same order mein lock lenge — deadlock impossible.

---

## 12. Deep dive — When to use which pattern

Patterns memorise karna easy, but pehchanna mushkil — interview mein interviewer signal phrases bolta hai aur tujhe pattern instantly fit karna hai. Yeh decision-tree style cheat-sheet hai.

### Strategy

**Signal phrases interviewer says:**
1. "Multiple algorithms, swap at runtime"
2. "Different ways to calculate / process / handle X"
3. "Make it pluggable" / "extensible without changing existing code"

**Examples:** Splitwise's `Split`, fare calculation in Uber, payment methods (UPI/Card/Wallet), sorting algorithms in collections, image compression formats.

**Anti-patterns:**
- *Strategy with 1 implementation*: tu interface bana ke ek hi class implement kar raha hai — useless abstraction. Add interface only when ≥2 implementations exist or are imminent.
- *Strategy that's actually State*: agar algorithm "switches based on object's internal state" instead of caller's choice, that's State pattern.

### Factory

**Signal phrases:**
1. "Hide creation logic" / "client shouldn't know which subclass"
2. "Create object based on config / type string"
3. "Different concrete types with same interface"

**Examples:** `PieceFactory.create(KING, WHITE)`, `NotificationFactory.create("EMAIL")`, vehicle creation in parking lot.

**Anti-patterns:**
- *God-factory*: single factory creating 30 different unrelated types. Split into focused factories.
- *Factory wrapping `new`*: agar logic sirf `return new Foo()` hai, factory ki need nahi — direct instantiation theek hai.
- *Factory exposing concrete types in return*: factory must return interface/abstract; if it returns `Car`, client is coupled.

### Singleton

**Signal phrases:**
1. "Exactly one instance" / "globally accessible"
2. "Shared resource" — DB pool, cache, config, logger
3. "Stateful service that should not be duplicated"

**Examples:** `ParkingLot.getInstance()`, `Logger`, `ConfigManager`, `ConnectionPool`.

**Anti-patterns:**
- *Singleton overuse*: every service made singleton — tightly couples code, breaks testability (can't substitute mocks). Use DI instead.
- *Mutable singleton without sync*: classic race condition source. Either make state immutable or sync access.
- *Singleton for stateless utility*: `MathUtils` ka instance kyu? Make it static methods.

### Observer

**Signal phrases:**
1. "When X changes, notify Y, Z, W"
2. "Multiple subscribers" / "broadcast"
3. "Decouple producer from consumer"

**Examples:** BookMyShow seat held → notify analytics + fraud + UI; stock price update → multiple traders' UIs; YouTube subscribe-and-notify.

**Anti-patterns:**
- *Observer with leaks*: subscribers register, never unsubscribe — memory leak, especially in Android/iOS UI. Always provide `unsubscribe`.
- *Synchronous notification chain*: 50 listeners, all called sync — main thread freeze. Use async event bus or queue.
- *Observer when 1-1*: only one listener forever? Direct callback simpler.

### State

**Signal phrases:**
1. "Object behaves differently based on its current state"
2. "Transitions: A → B → C"
3. "If-else chain on `status` field is getting messy"

**Examples:** ATM, Vending Machine, Order lifecycle (PENDING → PAID → SHIPPED → DELIVERED), Trip in Uber, TCP connection state.

**Anti-patterns:**
- *State enum with switch in every method*: that's State pattern half-implemented. Either fully extract states to classes or accept the switch as KISS.
- *Strategy disguised as State*: caller chooses behaviour? That's Strategy. State chooses itself based on context.
- *Cyclic state transitions without guard*: A → B → A → B infinite loop. Document allowed transitions explicitly.

### Decorator

**Signal phrases:**
1. "Add feature without modifying existing class"
2. "Stack capabilities" — middleware, filter chain
3. "Optional behaviours composable in any order"

**Examples:** Coffee + milk + sugar, HTTP middleware (auth → logging → rate-limit), Java I/O streams, Uber's `SurgeFare(MiniFare(...))`, gift-wrapping in e-commerce.

**Anti-patterns:**
- *Decorator chain too deep*: 8 wrappers — debugging stack trace ka jhamela. Keep ≤4 typically.
- *Decorator changing core contract*: decorator should *enhance*, not replace. If decorator changes return type or throws different exceptions, you're abusing it.
- *Decorator for static features*: jo features always-on hain, woh base class mein hone chahiye. Decorator is for *optional, composable* additions.

### Quick reference table

| Interviewer says | Pattern |
|------------------|---------|
| "swap algorithm" | Strategy |
| "based on type, create" | Factory |
| "only one instance" | Singleton |
| "notify many on change" | Observer |
| "lifecycle / transitions" | State |
| "stack optional features" | Decorator |
| "tree of similar things" | Composite |
| "compatibility with old API" | Adapter |
| "expensive object, share" | Flyweight |
| "delay creation / access control" | Proxy |
| "undo / replay" | Command |
| "step-by-step build" | Builder |

---

## 13. India-specific LLD twists

Indian product companies ne apne unique problems ke variants build kiye hain. Yeh sketches ratta-marne ke liye nahi — interview mein follow-up jaisa puch sakte hain. Har problem ka 12-20 line synopsis.

### Razorpay — Webhook delivery system

**Problem**: Merchant ko payment events (`payment.captured`, `refund.processed`) HTTPS webhook se deliver kar. Merchant down ho to retry; merchant slow ho to timeout; same event do baar mat bhej.

**Entities**: `Event`, `Webhook` (URL, secret, retryPolicy), `DeliveryAttempt`, `DeliveryQueue`, `RetryScheduler`.

**Patterns to use**:
- **Strategy** for retry policy (linear / exponential / custom)
- **Command** for delivery attempt (encapsulates HTTP call + outcome handling)
- **Observer** for "event happened" — multiple webhooks subscribe to same event type

**Tricky bits**:
- *Idempotency key*: each event has unique `eventId`; merchant dedupes on their end using it.
- *HMAC signature*: payload signed with shared secret; merchant verifies authenticity.
- *Exponential backoff with jitter*: 1m, 2m, 4m, 8m, 16m... + random ±20% to avoid thundering herd.
- *Dead-letter queue*: after 7 retries, move to DLQ + alert merchant via dashboard.

### Swiggy — Surge pricing

**Problem**: Demand high (rainy evening), supply low (fewer riders) → surcharge to balance, communicate transparently to user.

**Entities**: `Zone` (geohash bucket), `DemandSnapshot`, `SupplyState`, `SurgeRule`, `PriceCalculator`.

**Patterns**:
- **Strategy** for surge formula (linear / step / capped)
- **Decorator** wraps base fare with `SurgeFare` (just like Uber)
- **Observer**: rider price-quote subscribes to zone surge changes during checkout

**Tricky bits**:
- *Stale snapshots*: surge data refreshed every 30s per zone. Don't recompute per request.
- *Cap*: surge multiplier ≤ 2.5x always (regulatory + UX). Hard ceiling in `SurgeRule.maxMultiplier`.
- *Communication*: UI must show "1.4x surge" before user confirms. Never silent.

### Flipkart — Flash-sale queue (Big Billion Day)

**Problem**: 50k Realme phones at ₹9,999. 5M users hit "Buy" at 12:00:00. Don't melt servers; allocate fairly; prevent overselling.

**Entities**: `FlashSale`, `Inventory` (atomic counter), `RequestQueue`, `Worker`, `Slot`.

**Patterns**:
- **Singleton** per flash-sale (single source of truth for inventory)
- **Queue** (Kafka / RabbitMQ) buffers all requests
- **Strategy** for allocation (FIFO / lottery / weighted-by-tier)

**Tricky bits**:
- *Atomic decrement*: Redis `DECR inventory:{saleId}` returns new value; if `<0`, oversold — abort + increment back.
- *Bot detection upstream*: CAPTCHA + device fingerprint at edge before request enters queue.
- *Graceful sold-out*: when queue depth > inventory*1.2, return "sold out" to incoming requests immediately. Saves backend.
- *Cart hold*: 5-min cart hold like BookMyShow, then release.

### Paytm — Peer-to-peer money transfer

**Problem**: User A → User B, ₹500. Both balances must update *atomically* (both succeed or both rollback). Prevent double-spend.

**Entities**: `Wallet`, `Transaction` (txnId, from, to, amount, status), `Ledger`, `LockManager`.

**Patterns**:
- **Command** for the transfer (execute + compensate)
- **State** machine for transaction (INITIATED → DEBITED → CREDITED → COMPLETED, or FAILED → REVERSED)

**Tricky bits**:
- *Atomic across two rows*: DB transaction with `SELECT FOR UPDATE` on both wallets, ordered by id (prevents deadlock).
- *Idempotency key*: client sends `requestId` (UUID); duplicate request returns same `txnId`.
- *Two-phase*: debit first, then credit. If credit fails, compensating debit reversal kicks in. Mention saga pattern.
- *Audit log*: every state transition append-only ledger. Reconciliation job runs nightly.

### Zomato — Reservation system

**Problem**: User books table at restaurant for specific time + party size. Restaurant has limited tables of varying sizes. Avoid double-booking.

**Entities**: `Restaurant`, `Table` (capacity), `TimeSlot`, `Reservation`, `AvailabilityCalendar`.

**Patterns**:
- **Strategy** for table-allocation (best-fit / first-fit / pack-tight)
- **Observer** on reservation cancel → notify waitlist
- **Composite** for calendar (restaurant has tables, each table has slots)

**Tricky bits**:
- *Holdback for walk-ins*: not all tables open to online booking — restaurant retains 30% for walk-ins.
- *Buffer time*: 90 min slot for 4-person table; party-size > 4 = need bigger or combine tables.
- *No-show*: if party doesn't arrive within 15 min, slot released, table available.
- *Concurrency*: two users grab same slot → DB-level unique constraint on `(tableId, slotStart)` prevents oversell.

---

## 14. How to actually practice — 6-week plan

Theory padh ke pass nahi hota — *muscle memory* chahiye. Yeh 6-week plan tested hai with juniors who cracked Amazon, Razorpay, Walmart, Atlassian. Daily 1-2 hours; weekend mein mock.

### Week 1 — Foundation

**Goal**: 4-step framework + SOLID + 6 patterns *internalise* karna.

- Day 1-2: Re-read sections 1-4 of this doc. Pen-paper pe SOLID examples likh from your own code.
- Day 3-4: Implement Singleton, Strategy, Factory in your preferred language *from scratch, no IDE*. 3 times each.
- Day 5: Watch 2 LLD interview videos on YouTube (Gaurav Sen / Tech Dummies / Concept && Coding). Note framework.
- Day 6-7: Re-implement Parking Lot end-to-end. Time yourself: 45 min limit. Compare to section 5.

### Week 2 — Worked examples deep dive

**Goal**: 3 examples (Parking Lot / Splitwise / BookMyShow) blindfold solve.

- Day 8-9: Splitwise from scratch. Add unequal split + simplify-debt extension.
- Day 10-11: BookMyShow from scratch. Add concurrency (Redis lock pseudo-code).
- Day 12: Code Review session — open someone else's GitHub Splitwise/Parking solution, critique.
- Day 13-14: Add Snake & Ladder (easy) + Tic-Tac-Toe (easy). Both in 30 min each.

### Week 3 — State + Command + Composite

**Goal**: Master 3 patterns most candidates fumble.

- Day 15-16: Implement ATM (this doc, section 8). Then Vending Machine same day (similar). Then Elevator.
- Day 17-18: Online Chess (section 9). Pay attention to Command pattern + undo.
- Day 19: File System with Composite pattern. `File` + `Folder` both implement `FSNode`.
- Day 20-21: LRU Cache. HashMap + DoublyLinkedList from scratch. Time yourself: 25 min.

### Week 4 — Real product clones

**Goal**: Glamour LLD problems — Uber, Swiggy, Razorpay clones.

- Day 22-23: Uber LLD (section 10). Spend 90 min. Then iterate: add carpooling, then add scheduled rides.
- Day 24-25: Notification Service (multi-channel: email, SMS, push) — strategy + factory + retry.
- Day 26: Rate Limiter (token bucket + leaky bucket). 30 min.
- Day 27-28: Razorpay webhook delivery (section 13.1) end-to-end with retry queue.

### Week 5 — Mock interviews

**Goal**: Live pressure simulation. Solo nahi chalega, partner zaroor lo.

- Day 29: Find a peer (DM batchmate / r/cscareerquestions / Pramp / Interviewing.io). Schedule 3 mocks.
- Day 30-31: Mock 1 — give a problem you've never seen (your peer picks). 45 min. Record yourself if possible.
- Day 32-33: Mock 2 — you give problem to peer; observe their flow. *Teaching = learning.*
- Day 34-35: Mock 3 — pick a real Indian company past question (Glassdoor / LeetCode discuss). Strict timing.

### Week 6 — Polish + breadth

**Goal**: Plug holes from mocks; cover patterns you haven't touched.

- Day 36: Re-read section 11 (concurrency) + section 12 (decision tree). Memorise the 6 signal-phrase tables.
- Day 37: Implement 2 patterns you haven't yet — Decorator (HTTP middleware) + Observer (pub-sub from scratch).
- Day 38-39: Pick 2 problems from top-30 list (section 16) you haven't done. Solo, timed.
- Day 40: Re-do Parking Lot one more time — should take ≤30 min now. If yes, you're ready.
- Day 41-42: Rest day + review notes. Mock light if possible. Sleep 8 hours before D-day.

### Self-review checklist after each problem

- [ ] Did I clarify requirements *before* coding?
- [ ] Did I name out-of-scope items?
- [ ] Did I draw a diagram in ≤10 minutes?
- [ ] Did I name the patterns I used?
- [ ] Did I discuss concurrency at the end?
- [ ] Did I discuss extension at the end?
- [ ] Code: encapsulated? interfaces over concretes? no god class?
- [ ] Could I explain the design to a junior in 2 min?

Agar 6/8 yes hai, problem solid kiya. <6 → re-do same problem after 3 days.

### Mock partner protocol

- 45 min total: 5 min intro + 40 min problem.
- Interviewee: *must talk continuously* even when stuck.
- Interviewer: *don't help in first 15 min*; only nudge after.
- Last 5 min: feedback both ways. Specific. "Your diagram took 18 min — too slow" beats "good job."

---

## 15. Common LLD pitfalls — avoid these

1. **Skipping requirements clarification** — straight to code. Always do Step 1.
2. **God class** — `MovieBookingSystem` doing everything. Split: `MovieCatalog`, `Show`, `BookingManager`, `SeatManager`.
3. **Public fields everywhere** — encapsulation gone. All state private; controlled access via methods.
4. **Inheritance for code reuse** — wrong reason. Use composition unless there's a real `is-a` relationship.
5. **Premature optimisation** — adding caching/threading before the basic flow works. Walk before run.
6. **Forgetting the abstract class** — for things like `Split`, `ParkingSpot`, `Vehicle`. Always extract a base.
7. **No concurrency conversation** — even for simple problems, mention it. "What if two users park at the same time?"
8. **Ignoring extension** — interviewer often follow-up: "Can you add EV spots / monthly passes / corporate accounts?" Your design should accommodate without rewriting.

---

## 16. Top-30 LLD problems to practice

Practice these in order. First 10 are *must-do*; rest in priority order.

| # | Problem | Skills tested |
|---|---------|---------------|
| 1 | Parking Lot | Singleton, factory, strategy |
| 2 | Splitwise | Strategy, composition |
| 3 | BookMyShow | State, observer, concurrency |
| 4 | Snake & Ladder | OOP basics, state |
| 5 | Tic-Tac-Toe | Game state, factory for player |
| 6 | LRU Cache | Design + DSA combo (HashMap + DLL) |
| 7 | Logger (multi-level, multi-sink) | Decorator, chain of responsibility |
| 8 | Rate Limiter | Token bucket, strategy |
| 9 | Vending Machine | State machine |
| 10 | Elevator System | State, request scheduling |
| 11 | Library Management | CRUD heavy, observer for due dates |
| 12 | Stack Overflow | Voting + reputation, observer |
| 13 | Pub/Sub System | Observer at the core |
| 14 | Online Chess | State + command (move history) |
| 15 | Cricket Score Board | Composition (innings → over → ball) |
| 16 | File System | Composite pattern (file/folder) |
| 17 | Notification Service | Strategy + factory |
| 18 | URL Shortener (LLD scope) | Encoding, persistence interface |
| 19 | Cache (with eviction policies) | Strategy for LRU/LFU |
| 20 | ATM | State (idle/auth/transaction) |
| 21 | Restaurant Reservation | Resource booking |
| 22 | Splitwise extension: simplify debts | Graph algorithm |
| 23 | Online Auction | State + observer |
| 24 | Ride Sharing (Uber LLD) | Matching + state machine |
| 25 | Food Delivery (Swiggy LLD) | Order state + multi-restaurant |
| 26 | Music Streaming (Spotify LLD) | Composite (album→track), observer |
| 27 | Hotel Booking | Resource calendar |
| 28 | Linkedin Connections | Graph design |
| 29 | Flight Search | Multi-leg pathfinding |
| 30 | Code Editor (Vim LLD) | Command pattern + undo/redo |

Realistically, if you do 1-10 well and 5 from 11-30, you'll handle 85% of LLD prompts.

---

## 17. Final interview checklist

Last 60 seconds before you walk into the room:

- [ ] Have I memorised the 4-step framework? (Requirements → Entities → Diagram → Code)
- [ ] Can I name 6 patterns + give examples? (Strategy, Factory, Singleton, Observer, State, Decorator)
- [ ] Can I draw a UML class diagram in 5 minutes?
- [ ] Do I know SOLID + when to apply each letter?
- [ ] Can I write a Singleton in my preferred language without thinking?
- [ ] Can I write a Strategy pattern in 5 minutes?
- [ ] Will I clarify scope first, before any code?
- [ ] Will I mention concurrency + extension trade-offs at the end?
- [ ] Will I keep talking — narrate my thinking — even when stuck?

If all checks pass, walk in confident. LLD rewards prepared candidates more than any other interview round. Good luck.
