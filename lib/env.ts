import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Type-safe environment variables.
 *
 * Server-only secrets live in `server`, client-exposed values (must be prefixed
 * with NEXT_PUBLIC_) live in `client`. Anything missing or malformed throws at
 * boot in production; in dev/test we degrade gracefully to keep DX smooth.
 */
export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z
      .string()
      .url()
      .optional()
      .describe("Neon Postgres connection string (Phase 1 — required)"),

    // NextAuth core
    AUTH_SECRET: z
      .string()
      .min(32)
      .optional()
      .describe("Generate with: openssl rand -base64 32"),
    AUTH_URL: z.string().url().optional(),

    // Google OAuth
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),

    // SMS / Email providers
    MSG91_AUTH_KEY: z.string().optional(),
    MSG91_TEMPLATE_ID: z.string().optional(),
    MSG91_SENDER_ID: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z
      .string()
      .email()
      .optional()
      .default("EngiNerd <hello@enginerd.in>"),

    // Rate limit (Upstash Redis)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Existing Anthropic agent stack — preserved
    ANTHROPIC_API_KEY: z.string().optional(),
    ENGINERD_MODEL_SMART: z.string().default("claude-sonnet-4-6"),
    ENGINERD_MODEL_FAST: z.string().default("claude-haiku-4-5"),

    // Server-side analytics + admin
    POSTHOG_API_KEY: z.string().optional(),
    INTERNAL_ADMIN_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),

    // Code execution sandbox — Piston public API by default. Self-hosted
    // Piston: set to your URL (e.g. http://piston.internal:2000/api/v2)
    PISTON_URL: z
      .string()
      .url()
      .default("https://emkc.org/api/v2/piston"),
    PISTON_TIMEOUT_MS: z
      .string()
      .default("8000")
      .transform((v) => Number.parseInt(v, 10)),

    // Razorpay (Phase 9 — payments)
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

    // Misc
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:3000"),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z
      .string()
      .url()
      .optional()
      .default("https://us.i.posthog.com"),
    // Razorpay client-side (must match server's RAZORPAY_KEY_ID).
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
    MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID,
    MSG91_SENDER_ID: process.env.MSG91_SENDER_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ENGINERD_MODEL_SMART: process.env.ENGINERD_MODEL_SMART,
    ENGINERD_MODEL_FAST: process.env.ENGINERD_MODEL_FAST,
    NODE_ENV: process.env.NODE_ENV,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    INTERNAL_ADMIN_TOKEN: process.env.INTERNAL_ADMIN_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    PISTON_URL: process.env.PISTON_URL,
    PISTON_TIMEOUT_MS: process.env.PISTON_TIMEOUT_MS,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },

  emptyStringAsUndefined: true,
  // Skip validation when running drizzle-kit / non-build scripts.
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.NODE_ENV === "test",
});

/** Convenience: are we running with a real DB connection? */
export const hasDatabase = Boolean(env.DATABASE_URL);

/** Convenience: are SMS sends real or dev-console? */
export const hasMsg91 = Boolean(env.MSG91_AUTH_KEY && env.MSG91_TEMPLATE_ID);

/** Convenience: are emails real or dev-console? */
export const hasResend = Boolean(env.RESEND_API_KEY);

/** Convenience: rate limiter active? */
export const hasUpstash = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);

/** Convenience: PostHog wired? */
export const hasPosthog = Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);

/** Convenience: Razorpay credentials present? Server-side check. */
export const hasRazorpay = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET,
);
