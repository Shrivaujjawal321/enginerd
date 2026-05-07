import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Load .env.local + .env automatically — same precedence as Next.js dev.
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required to run drizzle-kit. Set it in .env.local first.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
