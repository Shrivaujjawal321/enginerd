import "server-only";

/**
 * Tiny structured logger.
 *
 * Why not pino? — Pino's worker thread + transport setup isn't friendly to
 * Vercel's serverless functions, and we don't need its perf. This logger
 * emits one JSON line per call and runs through `console.{info,warn,error}`
 * so Vercel/Sentry/Logflare just pick it up.
 *
 * Critical: secrets are scrubbed BEFORE we hand the object to console. The
 * redaction list is tightened over time; never log a request body verbatim.
 */

type Level = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

const REDACT_KEYS = new Set([
  "password",
  "token",
  "code",
  "otp",
  "apikey",
  "api_key",
  "auth_key",
  "authkey",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "session",
  "csrf",
  "x-internal-token",
  "anthropic_api_key",
  "auth_secret",
  "auth_google_secret",
  "msg91_auth_key",
  "resend_api_key",
  "upstash_redis_rest_token",
  "database_url",
]);

/** Walks an object and replaces any value at a redacted key with "[redacted]". */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[depth-cap]";
  if (value == null) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = typeof v === "string" && v.length > 0 ? "[redacted]" : v;
    } else {
      out[k] = redact(v, depth + 1);
    }
  }
  return out;
}

function emit(level: Level, msg: string, payload?: LogPayload) {
  const line = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...(payload ? (redact(payload) as LogPayload) : {}),
  };
  // Use the matching console method so Sentry / Vercel tag the level.
  const out =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.info;
  out(JSON.stringify(line));
}

export const logger = {
  debug: (msg: string, payload?: LogPayload) => emit("debug", msg, payload),
  info: (msg: string, payload?: LogPayload) => emit("info", msg, payload),
  warn: (msg: string, payload?: LogPayload) => emit("warn", msg, payload),
  error: (msg: string, payload?: LogPayload) => emit("error", msg, payload),
};
