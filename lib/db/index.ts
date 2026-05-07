import "server-only";

import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

import { env, hasDatabase } from "@/lib/env";
import * as schema from "@/lib/db/schema";

/**
 * Drizzle client.
 *
 * - On Vercel / Neon → `@neondatabase/serverless` HTTP driver (no pooling
 *   issues in serverless, fast cold starts).
 * - Local dev / tests → `postgres-js` (works against any Postgres, also fine
 *   for self-hosted production behind a connection pool like PgBouncer).
 *
 * Selected automatically based on whether DATABASE_URL points at neon.tech.
 *
 * If DATABASE_URL is unset, every query throws a clear error with setup
 * instructions — we never silently fall back to a fake DB.
 */

type DbClient = ReturnType<typeof drizzleNeon<typeof schema>>;

let cached: DbClient | null = null;

function buildDb(): DbClient {
  if (!hasDatabase || !env.DATABASE_URL) {
    throw new Error(
      [
        "DATABASE_URL is not set.",
        "1. Create a Neon Postgres project at https://neon.tech (free tier, Mumbai region).",
        "2. Copy the connection string into .env.local as DATABASE_URL.",
        "3. Run `npm run db:push` to create the schema.",
      ].join("\n"),
    );
  }

  const url = env.DATABASE_URL;
  const isNeon = url.includes("neon.tech") || url.includes("neon.build");

  if (isNeon) {
    const sql = neon(url);
    return drizzleNeon(sql, { schema });
  }

  // Plain Postgres (Docker, RDS, Supabase, self-hosted).
  const client = postgres(url, {
    max: env.NODE_ENV === "production" ? 10 : 1,
    prepare: false,
  });
  return drizzlePg(client, { schema }) as unknown as DbClient;
}

/**
 * Lazy singleton — created on first access so importing this module is cheap
 * and doesn't crash builds when DATABASE_URL is missing.
 */
export function getDb(): DbClient {
  if (!cached) cached = buildDb();
  return cached;
}

// Convenient default export for ergonomic call sites.
// Use `import { db } from "@/lib/db"` then `db.select()...`.
export const db = new Proxy({} as DbClient, {
  get(_, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
