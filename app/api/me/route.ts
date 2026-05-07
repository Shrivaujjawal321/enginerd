import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { users } from "@/lib/db/schema";
import { getUserStats } from "@/lib/progress";
import { logger } from "@/lib/logger";
import { apiReadLimiter, tooManyRequests } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight "who am I" endpoint — used by topbar/profile UI to render the
 * authenticated user's name, email/phone, avatar, and gamification stats.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  // 120/min/user via the read-tier limiter — high QPS endpoint (topbar +
  // dashboard polling). Read tier so a refreshing user can't trip mutation
  // ceilings.
  const rl = await apiReadLimiter.limit(`me:${userId}`);
  if (!rl.success) return tooManyRequests(rl.reset);
  let user = {
    id: userId,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    phone: session.user.phone ?? null,
    image: session.user.image ?? null,
    emailVerified: null as Date | null,
    phoneVerified: null as Date | null,
    collegeName: null as string | null,
    graduationYear: null as number | null,
  };

  if (hasDatabase) {
    try {
      const row = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (row) {
        user = {
          id: row.id,
          name: row.name ?? null,
          email: row.email ?? null,
          phone: row.phone ?? null,
          image: row.image ?? null,
          emailVerified: row.emailVerified,
          phoneVerified: row.phoneVerified,
          collegeName: row.collegeName,
          graduationYear: row.graduationYear,
        };
      }
    } catch (err) {
      logger.error("me.user_fetch.failed", {
        userId,
        err: String(err),
      });
    }
  }

  const stats = await getUserStats(userId);

  return NextResponse.json({ user, stats });
}
