-- Cycle 2 — scale prep (10k DAU target)
-- All migrations are additive + idempotent; safe to replay.

------------------------------------------------------------------------
-- Hot-path indexes
------------------------------------------------------------------------

-- Leaderboard count(distinct problemId) WHERE status='accepted' GROUP BY userId
-- Partial index keeps it tight (only accepted submissions).
CREATE INDEX IF NOT EXISTS submissions_accepted_user_problem_idx
  ON submissions (user_id, problem_id)
  WHERE status = 'accepted';

-- User activity feed: WHERE userId=? ORDER BY submittedAt DESC LIMIT 20
CREATE INDEX IF NOT EXISTS submissions_user_recent_idx
  ON submissions (user_id, submitted_at DESC);

-- Billing page payment history: WHERE userId=? ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS payments_user_recent_idx
  ON payments (user_id, created_at DESC);

-- Webhook lookup: subscriptions.razorpaySubscriptionId — make it a partial
-- unique index to dedupe + speed up the equality lookup.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_rzp_sub_uniq
  ON subscriptions (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

-- Leaderboard subjects-completed count: WHERE userId=? AND status='completed'
CREATE INDEX IF NOT EXISTS user_progress_completed_idx
  ON user_progress (user_id)
  WHERE status = 'completed';

-- Admin / activity audit search: WHERE userId=? ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS audit_user_recent_idx
  ON audit_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

------------------------------------------------------------------------
-- Razorpay webhook event-id idempotency
------------------------------------------------------------------------
-- Guards against retries that re-run activation after a transient DB error.
-- We still gate `recordPaymentCaptured` on `status='created'`, but this gives
-- us belt + suspenders at the event-id level.

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  event_id     text PRIMARY KEY,
  event_type   text NOT NULL,
  received_at  timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS razorpay_webhook_events_received_idx
  ON razorpay_webhook_events (received_at DESC);

------------------------------------------------------------------------
-- Public profile handle (Cycle 2 feature)
------------------------------------------------------------------------
-- Nullable so existing accounts don't have to backfill; UNIQUE constraint
-- catches collisions at insert/update time.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS handle text;

CREATE UNIQUE INDEX IF NOT EXISTS users_handle_uniq
  ON "user" (lower(handle))
  WHERE handle IS NOT NULL;
