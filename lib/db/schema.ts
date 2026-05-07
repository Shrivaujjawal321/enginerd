import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  jsonb,
  doublePrecision,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ============================================================================
 * Auth core (NextAuth-compatible — DO NOT rename columns).
 * Reference: https://authjs.dev/getting-started/adapters/drizzle
 * ============================================================================
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),

  // EngiNerd-specific (extensions to NextAuth's base schema)
  phone: text("phone").unique(),
  phoneVerified: timestamp("phoneVerified", { mode: "date" }),
  collegeName: text("college_name"),
  graduationYear: integer("graduation_year"),
  preferredRoadmap: text("preferred_roadmap"),
  // Public profile slug, unique (case-insensitive). Surfaces at /u/<handle>.
  // Nullable so existing users don't need a backfill; user picks one in /profile.
  handle: text("handle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* ============================================================================
 * EngiNerd OTP table (separate from NextAuth verificationTokens).
 *
 * Why separate? verificationTokens is single-use & used by NextAuth's email
 * provider. We want our own controlled table for SMS + email OTP that we can
 * (a) bcrypt-hash, (b) attempt-count, (c) rate-limit per identifier.
 * ============================================================================
 */

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: text("identifier").notNull(), // E.164 phone OR email lowercased
    channel: text("channel", { enum: ["phone", "email"] }).notNull(),
    codeHash: text("code_hash").notNull(), // bcrypt of the 6-digit OTP
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    consumedAt: timestamp("consumed_at"),
    ip: text("ip"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("otp_identifier_idx").on(t.identifier, t.channel),
    index("otp_expires_idx").on(t.expiresAt),
  ],
);

/* ============================================================================
 * Audit log — every meaningful auth/security event lands here.
 * ============================================================================
 */

export const auditEvents = pgTable(
  "audit_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    event: text("event").notNull(), // e.g. "otp.send", "otp.verify.fail"
    ip: text("ip"),
    userAgent: text("user_agent"),
    metadata: text("metadata"), // JSON-stringified extras
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_user_idx").on(t.userId, t.createdAt),
    index("audit_event_idx").on(t.event, t.createdAt),
  ],
);

/* ============================================================================
 * User progress — Phase 2 will populate; created here so subjects page can
 * write completion the moment auth is real.
 * ============================================================================
 */

export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subtopicSlug: text("subtopic_slug").notNull(),
    status: text("status", {
      enum: ["not_started", "in_progress", "completed"],
    })
      .default("not_started")
      .notNull(),
    masteredAt: timestamp("mastered_at"),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.subtopicSlug] }),
    index("progress_user_idx").on(t.userId),
  ],
);

/* ============================================================================
 * Per-user gamification state (streaks, totals).
 * ============================================================================
 */

export const userStats = pgTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD (timezone-agnostic)
  totalMinutes: integer("total_minutes").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ============================================================================
 * Agent runs — durable record of every pipeline execution.
 * ============================================================================
 */

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Owner — null only for legacy/cron-triggered admin runs.
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status", {
      enum: ["queued", "running", "succeeded", "failed"],
    })
      .default("queued")
      .notNull(),
    mode: text("mode", { enum: ["live", "stub"] }).notNull(),
    input: jsonb("input").notNull(), // { industry, count, ... }
    summary: jsonb("summary"), // RunSummary shape — totals + perAgent
    generated: jsonb("generated"), // Array<GeneratedRoadmap>
    error: text("error"),
    costUsd: doublePrecision("cost_usd").default(0).notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
  },
  (t) => [
    index("agent_runs_user_idx").on(t.userId, t.startedAt),
    index("agent_runs_status_idx").on(t.status, t.startedAt),
  ],
);

export const agentEvents = pgTable(
  "agent_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    runId: text("run_id")
      .notNull()
      .references(() => agentRuns.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull(), // monotonic per-run sequence
    type: text("type").notNull(), // run.started | agent.started | ...
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("agent_events_run_seq_uniq").on(t.runId, t.seq),
    index("agent_events_run_idx").on(t.runId, t.createdAt),
  ],
);

/* ============================================================================
 * Library — agent-published roadmaps + their subject trees.
 *
 * Stored as a single JSON blob per roadmap because the existing
 * `LibraryRoadmap` shape (Roadmap + Subject[]) is consumed atomically by the
 * UI. Splitting into 4 tables (roadmaps/subjects/topics/subtopics) is
 * Phase 3 work — premature here.
 * ============================================================================
 */

export const libraryRoadmaps = pgTable(
  "library_roadmaps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    runId: text("run_id"),
    roadmap: jsonb("roadmap").notNull(), // Roadmap shape
    subjects: jsonb("subjects").notNull(), // Subject[] shape
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    publishedBy: text("published_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [index("library_roadmaps_published_idx").on(t.publishedAt)],
);

/* ============================================================================
 * DSA Problems — original content, NOT scraped.
 *
 * Each problem stores everything the workspace needs: description (markdown),
 * worked examples, constraints, hints, starter code per language, hidden test
 * cases, editorial solution. Code execution still happens client-side in the
 * sandboxed iframe (lib/code-runner.ts) — DB just holds the data.
 * ============================================================================
 */

export const problems = pgTable(
  "problems",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    // Stable display number — Phase 3 keeps mock numbers; new problems get
    // auto-incremented from 1000+ to avoid collisions.
    number: integer("number").notNull(),
    title: text("title").notNull(),
    difficulty: text("difficulty", {
      enum: ["Easy", "Medium", "Hard"],
    }).notNull(),
    topic: text("topic").notNull(), // "Arrays & Hashing", "Two Pointers", ...
    companies: jsonb("companies").$type<string[]>().notNull(), // ["razorpay", "swiggy"]
    description: text("description").notNull(), // markdown
    examples: jsonb("examples")
      .$type<Array<{ input: string; output: string; explanation?: string }>>()
      .notNull(),
    constraints: jsonb("constraints").$type<string[]>().notNull(),
    hints: jsonb("hints").$type<string[]>().notNull(),
    starterCode: jsonb("starter_code")
      .$type<Array<{ language: string; code: string }>>()
      .notNull(),
    fnName: text("fn_name"),
    tests: jsonb("tests")
      .$type<Array<{ args: unknown[]; expected: unknown; label?: string }>>()
      .notNull(),
    editorial: text("editorial"), // markdown editorial — solution + analysis
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("problems_topic_idx").on(t.topic),
    index("problems_difficulty_idx").on(t.difficulty),
    index("problems_number_idx").on(t.number),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    language: text("language").notNull(), // "javascript" | "python"
    code: text("code").notNull(),
    status: text("status", {
      enum: ["accepted", "wrong_answer", "runtime_error", "time_limit"],
    }).notNull(),
    runtimeMs: integer("runtime_ms"),
    casesPassed: integer("cases_passed").default(0).notNull(),
    casesTotal: integer("cases_total").default(0).notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (t) => [
    index("submissions_user_idx").on(t.userId, t.submittedAt),
    index("submissions_problem_idx").on(t.problemId, t.submittedAt),
    index("submissions_user_problem_idx").on(t.userId, t.problemId),
  ],
);

/* ============================================================================
 * Per-page feedback — anonymous "Was this helpful?" thumbs.
 *
 * Composite key (userId | sessionId, slug) — one vote per visitor per page.
 * Users can flip their vote; we just upsert.
 * ============================================================================
 */

export const subjectFeedback = pgTable(
  "subject_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    // For anonymous votes: a stable client-side cookie / random id.
    anonymousId: text("anonymous_id"),
    subjectSlug: text("subject_slug").notNull(),
    rating: text("rating", { enum: ["up", "down"] }).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("feedback_user_subject_uniq").on(t.userId, t.subjectSlug),
    uniqueIndex("feedback_anon_subject_uniq").on(
      t.anonymousId,
      t.subjectSlug,
    ),
    index("feedback_subject_idx").on(t.subjectSlug),
  ],
);

/* ============================================================================
 *  Subject content (Cycle 22 — markdown-out-of-frontend pivot)
 *
 *  One row per subject. `lib/subject-content-store.ts` reads here first and
 *  falls back to the on-disk `content/<slug>.md` when the row is missing
 *  (dev workflow stays intact without seeding). The seed script runs on
 *  deploy to keep prod current.
 * ============================================================================
 */

export const subjectContent = pgTable("subject_content", {
  slug: text("slug").primaryKey(),
  markdown: text("markdown").notNull(),
  // "file" (seeded), "studio" (cycle-22 user-typed), "agent" (pipeline output)
  source: text("source").notNull().default("file"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SubjectContentRow = typeof subjectContent.$inferSelect;

/* ============================================================================
 *  Cohorts + Leaderboards (Phase 8)
 *
 *  Cohort = (roadmap_slug, ISO-week-of-join). Auto-derived per user when
 *  they first interact with a roadmap; stored as a row in `cohort_members`.
 *  The `cohorts` table is purely a denormalized counter for "how many people
 *  in this cohort" — kept for fast leaderboard pages without aggregation.
 *
 *  Leaderboard is computed from `user_progress` + `submissions` joined on
 *  `cohort_members`. We materialize a weekly snapshot to a `leaderboard_snapshots`
 *  table so the page renders fast (single SELECT, no joins).
 * ============================================================================
 */

export const cohorts = pgTable(
  "cohorts",
  {
    // Stable id like `java-full-stack-2026-W18`
    id: text("id").primaryKey(),
    roadmapSlug: text("roadmap_slug").notNull(),
    // ISO week format: "2026-W18"
    week: text("week").notNull(),
    memberCount: integer("member_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("cohorts_roadmap_idx").on(t.roadmapSlug, t.week),
  ],
);

export const cohortMembers = pgTable(
  "cohort_members",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.cohortId, t.userId] }),
    index("cohort_members_user_idx").on(t.userId),
  ],
);

export const leaderboardSnapshots = pgTable(
  "leaderboard_snapshots",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohorts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    score: integer("score").notNull(), // composite: subjects*10 + solved*3 + streak
    subjectsCompleted: integer("subjects_completed").default(0).notNull(),
    problemsSolved: integer("problems_solved").default(0).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    snapshotWeek: text("snapshot_week").notNull(),
    computedAt: timestamp("computed_at").defaultNow().notNull(),
  },
  (t) => [
    index("leaderboard_cohort_rank_idx").on(t.cohortId, t.rank),
    index("leaderboard_user_idx").on(t.userId, t.snapshotWeek),
    uniqueIndex("leaderboard_uniq").on(
      t.cohortId,
      t.userId,
      t.snapshotWeek,
    ),
  ],
);

/* ============================================================================
 *  Phase 9 — Payments (Razorpay).
 *
 *  `subscriptions` is the source of truth for "is this user paid". One row
 *  per user (current active subscription). Historical states live in
 *  `payments`.
 *
 *  We never store card details — only Razorpay-issued IDs. Razorpay's
 *  vault is PCI-compliant; ours doesn't have to be.
 * ============================================================================
 */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan", { enum: ["free", "pro", "career"] })
      .default("free")
      .notNull(),
    status: text("status", {
      enum: [
        "active",
        "trialing",
        "past_due",
        "cancelled",
        "incomplete",
      ],
    })
      .default("active")
      .notNull(),
    razorpaySubscriptionId: text("razorpay_subscription_id"),
    razorpayCustomerId: text("razorpay_customer_id"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: text("cancel_at_period_end")
      .default("false")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("subscriptions_status_idx").on(t.status),
    index("subscriptions_rzp_idx").on(t.razorpaySubscriptionId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),
    plan: text("plan", { enum: ["pro", "career"] }).notNull(),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").default("INR").notNull(),
    status: text("status", {
      enum: ["created", "captured", "failed", "refunded"],
    })
      .default("created")
      .notNull(),
    method: text("method"), // upi, card, netbanking, wallet
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    capturedAt: timestamp("captured_at"),
  },
  (t) => [
    index("payments_user_idx").on(t.userId, t.createdAt),
    index("payments_status_idx").on(t.status, t.createdAt),
  ],
);

/* ============================================================================
 * Razorpay webhook event-id idempotency.
 *
 * Razorpay retries on 5xx and occasionally double-fires. We dedupe at the
 * event-id level (delivery-id from the `x-razorpay-event-id` header, or a
 * deterministic hash of the raw body when the header is absent).
 * ============================================================================
 */
export const razorpayWebhookEvents = pgTable(
  "razorpay_webhook_events",
  {
    eventId: text("event_id").primaryKey(),
    eventType: text("event_type").notNull(),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
  },
  (t) => [index("razorpay_webhook_events_received_idx").on(t.receivedAt)],
);

/* ============================================================================
 * Type exports (used by the rest of the app).
 * ============================================================================
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type AgentRunRow = typeof agentRuns.$inferSelect;
export type NewAgentRunRow = typeof agentRuns.$inferInsert;
export type AgentEventRow = typeof agentEvents.$inferSelect;
export type LibraryRoadmapRow = typeof libraryRoadmaps.$inferSelect;
export type ProblemRow = typeof problems.$inferSelect;
export type NewProblemRow = typeof problems.$inferInsert;
export type SubmissionRow = typeof submissions.$inferSelect;
export type NewSubmissionRow = typeof submissions.$inferInsert;
export type SubjectFeedbackRow = typeof subjectFeedback.$inferSelect;
export type CohortRow = typeof cohorts.$inferSelect;
export type CohortMemberRow = typeof cohortMembers.$inferSelect;
export type LeaderboardSnapshotRow =
  typeof leaderboardSnapshots.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type NewSubscriptionRow = typeof subscriptions.$inferInsert;
export type PaymentRow = typeof payments.$inferSelect;
export type NewPaymentRow = typeof payments.$inferInsert;
