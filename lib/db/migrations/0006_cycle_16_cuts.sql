-- Cycle 16 — drop dead denormalised column.
--
-- `user_stats.subjects_completed` was set to 0 on first INSERT and never
-- updated. All consumers compute `subjectsCompleted` live from
-- `user_progress.groupBy(status)` (see `_getUserStatsUncached` in
-- `lib/progress.ts`), so the column was a sync-bug landmine.

ALTER TABLE user_stats DROP COLUMN IF EXISTS subjects_completed;
