import "server-only";

import { db } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";

/**
 * Append-only audit log for security-relevant events.
 *
 * Best-effort: failures are logged but never thrown — audit must not break
 * the user request path.
 */
export async function logAuditEvent(args: {
  userId?: string | null;
  event: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditEvents).values({
      userId: args.userId ?? null,
      event: args.event,
      ip: args.ip ?? null,
      userAgent: args.userAgent ?? null,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
    });
  } catch (err) {
    console.error("[audit] log failed", { event: args.event, err });
  }
}
