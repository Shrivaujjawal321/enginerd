import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: "/home/ujjwal/Downloads/amoha-master/enginerd/.env.local" });

const client = neon(process.env.DATABASE_URL as string);

async function main() {
  const r1 = await client`
    SELECT indexname FROM pg_indexes
    WHERE indexname IN (
      'submissions_accepted_user_problem_idx',
      'submissions_user_recent_idx',
      'payments_user_recent_idx',
      'subscriptions_rzp_sub_uniq',
      'users_handle_uniq'
    ) ORDER BY indexname;
  `;
  console.log("Indexes:", (r1 as { indexname: string }[]).map((r) => r.indexname));

  const r2 = await client`SELECT to_regclass('razorpay_webhook_events') AS t`;
  console.log("razorpay_webhook_events:", r2[0].t);

  const r3 = await client`SELECT column_name FROM information_schema.columns WHERE table_name='user' AND column_name='handle'`;
  console.log("users.handle column:", r3.length > 0 ? "yes" : "no");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
