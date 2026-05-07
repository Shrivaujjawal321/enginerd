/**
 * Sentry — browser-side init.
 *
 * No-op when SENTRY_DSN is unset (dev / CI). Captures unhandled errors,
 * unhandled promise rejections, and any explicit `Sentry.captureException`
 * call. Replays disabled — they're expensive, can revisit later.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // 10% transaction sampling — enough signal without burning quota.
    tracesSampleRate: 0.1,
    // Ignore noisy patterns
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Network request failed",
      "AbortError",
    ],
    // Block leaking PII into Sentry events.
    beforeSend(event) {
      // Strip query strings that might contain OTP codes / tokens.
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch {
          // ignore malformed url
        }
      }
      // Drop any cookie/auth headers — they should never reach Sentry.
      if (event.request?.headers) {
        const h = event.request.headers as Record<string, string>;
        delete h["cookie"];
        delete h["authorization"];
      }
      return event;
    },
  });
}
