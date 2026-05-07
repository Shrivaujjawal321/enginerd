-- Cycle 22 — move subject markdown into the database.
--
-- Until now `readSubjectMarkdown` only knew about `content/<slug>.md` on
-- disk. Files are git-versioned (good for authoring) but they ship with the
-- deployment bundle, force a redeploy on every content edit, and pin the
-- runtime to the file system. This table is the runtime-of-record copy:
--
--   - `lib/subject-content-store.ts` reads here first, falls back to the
--     file (so dev still works without seeding).
--   - `scripts/seed-subject-content.ts` upserts every content/*.md row at
--     deploy time so prod always has fresh content.
--   - The cycle-22+ `/studio` flow (LLM-generated topics) writes directly
--     here; no file authoring step required.
--
-- Single-table, one row per subject. `updated_at` is what lets us bust the
-- per-slug `unstable_cache` tag without a full deploy.

CREATE TABLE IF NOT EXISTS subject_content (
  slug         TEXT PRIMARY KEY,
  markdown     TEXT NOT NULL,
  -- Optional source attribution: "file" (seeded from content/<slug>.md),
  -- "studio" (cycle-22 user-typed), "agent" (5-stage pipeline output).
  source       TEXT NOT NULL DEFAULT 'file',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subject_content_updated_idx
  ON subject_content (updated_at DESC);
