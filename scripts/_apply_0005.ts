import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: "/home/ujjwal/Downloads/amoha-master/enginerd/.env.local" });

const client = neon(process.env.DATABASE_URL as string);

async function main() {
  const sql = readFileSync(
    "/home/ujjwal/Downloads/amoha-master/enginerd/lib/db/migrations/0005_scale_indexes.sql",
    "utf8",
  );
  // Split on `;` at end-of-statement (rough but works for additive DDL).
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let ok = 0;
  for (const stmt of statements) {
    if (!stmt) continue;
    if (stmt.startsWith("--")) {
      // pure-comment block
      const cleaned = stmt
        .split("\n")
        .filter((l) => !l.trim().startsWith("--"))
        .join("\n")
        .trim();
      if (!cleaned) continue;
      await client.query(cleaned);
    } else {
      await client.query(stmt);
    }
    ok += 1;
  }
  console.log(`Applied ${ok} statements from 0005_scale_indexes.sql`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
