/**
 * Script-only Drizzle client.
 *
 * `lib/db/index.ts` is marked `server-only` (Next.js / RSC boundary), so it
 * can't be imported from plain `tsx` scripts. This file is a parallel
 * client used only by the seed/validate/migrate utilities under
 * `scripts/`. Same schema, same connection string, no `server-only`.
 */

import { loadEnvConfig } from "@next/env";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

import * as schema from "../lib/db/schema";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const url = process.env.DATABASE_URL;
const isNeon = url.includes("neon.tech") || url.includes("neon.build");

export const db = isNeon
  ? drizzleNeon(neon(url), { schema })
  : (drizzlePg(postgres(url, { max: 1, prepare: false }), {
      schema,
    }) as unknown as ReturnType<typeof drizzleNeon<typeof schema>>);

export { schema };
