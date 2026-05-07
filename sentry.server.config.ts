/**
 * Sentry — server-side init (API routes, Server Components).
 *
 * Server events get redaction matching `lib/logger.ts` — same key set so
 * nothing slips through.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

const REDACT_KEYS = new Set([
  "password",
  "token",
  "code",
  "otp",
  "apikey",
  "api_key",
  "auth_key",
  "authorization",
  "cookie",
  "set-cookie",
  "session",
  "csrf",
  "x-internal-token",
]);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[depth-cap]";
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase())
      ? "[redacted]"
      : redact(v, depth + 1);
  }
  return out;
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.extra) event.extra = redact(event.extra) as typeof event.extra;
      if (event.contexts) {
        event.contexts = redact(event.contexts) as typeof event.contexts;
      }
      return event;
    },
  });
}
