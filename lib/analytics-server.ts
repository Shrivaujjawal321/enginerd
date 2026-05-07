import "server-only";

import { PostHog } from "posthog-node";

import { env, hasPosthog } from "@/lib/env";
import { logger } from "@/lib/logger";

/* ============================================================================
 *  Server-side analytics — PostHog Node client.
 *
 *  Used for: signup, signin, mark_complete, problem_solve, payment events.
 *  Frontend page-views go through `lib/analytics-client.ts`.
 *
 *  Falls through to a noop implementation when NEXT_PUBLIC_POSTHOG_KEY is
 *  unset (dev / CI). Keeps every call site safe to invoke unconditionally.
 * ============================================================================
 */

let cached: PostHog | null = null;

function getClient(): PostHog | null {
  if (!hasPosthog) return null;
  if (cached) return cached;
  cached = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1, // serverless = short-lived; flush each event
    flushInterval: 0,
  });
  return cached;
}

export type AnalyticsEvent =
  | "auth.signup"
  | "auth.signin"
  | "auth.signout"
  | "subject.viewed"
  | "subject.completed"
  | "problem.viewed"
  | "problem.run"
  | "problem.solved"
  | "feedback.submitted"
  | "agent.run.started"
  | "agent.run.completed"
  // Cycle 21 — polymorphic learning surface. One event per format-tab click.
  // Used to learn each user's preferred format (slides / mindmap / flashcards
  // / read) so /home can adapt and so we can ship "your learning style" later.
  | "format.selected";

/**
 * Track a server-side event. `distinctId` should be the user id when
 * available, else a stable anonymous id. Properties are auto-redacted by
 * NOT being passed through `lib/logger` — caller is responsible for not
 * including secrets.
 */
export async function track(args: {
  distinctId: string;
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const client = getClient();
  if (!client) return; // PostHog not configured — silent noop
  try {
    client.capture({
      distinctId: args.distinctId,
      event: args.event,
      properties: args.properties,
    });
    // serverless: flush so the request actually goes out before lambda dies
    await client.flush();
  } catch (err) {
    logger.warn("posthog.capture.failed", {
      event: args.event,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Identify — call after sign-in to attach traits to the distinctId. */
export async function identify(args: {
  distinctId: string;
  traits?: Record<string, unknown>;
}): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    client.identify({
      distinctId: args.distinctId,
      properties: args.traits,
    });
    await client.flush();
  } catch (err) {
    logger.warn("posthog.identify.failed", {
      err: err instanceof Error ? err.message : String(err),
    });
  }
}
