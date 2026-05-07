import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { db, getDb } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { env, hasDatabase } from "@/lib/env";
import { consumeOtp } from "@/lib/otp/store";
import { logAuditEvent } from "@/lib/audit";
import { track, identify } from "@/lib/analytics-server";

/* ============================================================================
 * Module augmentation — extend the Session/JWT shape with our user fields.
 * ============================================================================
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    phone?: string | null;
  }
}

/* ============================================================================
 * NextAuth v5 config.
 *
 * Three sign-in methods:
 *   1. Google OAuth         — `signIn("google")`
 *   2. Phone OTP credential — `signIn("phone-otp", { phone, code })`
 *   3. Email OTP credential — `signIn("email-otp", { email, code })`
 *
 * We use the "database" session strategy with the Drizzle adapter for OAuth,
 * and JWT for the OTP credential providers (NextAuth requires JWT for
 * Credentials-based sign-in). The session callback merges both worlds.
 * ============================================================================
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Adapter is only attached when DATABASE_URL is configured. Without it the
  // build / page-data collection still succeeds — auth simply degrades to
  // JWT-only sessions and OAuth account-linking is disabled until the DB is
  // wired up. This is the documented "graceful boot" pattern for serverless.
  adapter: hasDatabase
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,

  // Credentials providers force JWT strategy. JWT sessions are also faster on
  // serverless / edge since they skip a DB read on every request.
  session: { strategy: "jwt" },

  secret: env.AUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login?verify=1",
  },

  trustHost: true,

  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      // Always show account chooser — better UX, avoids silent wrong-account.
      authorization: { params: { prompt: "select_account" } },
      // Allow merging a Google login into a pre-existing user record that
      // signed up via email-OTP with the same address. Safe here because
      // BOTH providers verify the email server-side. Without this flag,
      // NextAuth blocks the second link with `OAuthAccountNotLinked`.
      allowDangerousEmailAccountLinking: true,
    }),

    /* ------------------------------------------------------------------------
     * Phone OTP credential. The OTP itself was sent + stored by
     * /api/auth/otp/phone/send. Here we verify the code and resolve to a user
     * row — creating one on first sign-in.
     * ------------------------------------------------------------------------ */
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone (E.164)", type: "tel" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(raw) {
        const phone = String(raw?.phone ?? "").trim();
        const code = String(raw?.code ?? "").trim();
        if (!phone || !code) return null;

        const ok = await consumeOtp({ identifier: phone, code, channel: "phone" });
        if (!ok) {
          await logAuditEvent({ event: "otp.verify.fail", metadata: { channel: "phone" } });
          return null;
        }

        // Find or create user by phone.
        const existing = await db.query.users.findFirst({
          where: eq(users.phone, phone),
        });

        if (existing) {
          await db
            .update(users)
            .set({ phoneVerified: new Date() })
            .where(eq(users.id, existing.id));
          await logAuditEvent({
            userId: existing.id,
            event: "otp.verify.ok",
            metadata: { channel: "phone" },
          });
          return {
            id: existing.id,
            name: existing.name ?? null,
            email: existing.email ?? null,
            image: existing.image ?? null,
            phone: existing.phone ?? null,
          };
        }

        const inserted = await db
          .insert(users)
          .values({
            phone,
            phoneVerified: new Date(),
          })
          .returning();
        const created = inserted[0];
        if (!created) return null;

        await logAuditEvent({
          userId: created.id,
          event: "auth.signup",
          metadata: { provider: "phone-otp" },
        });

        return {
          id: created.id,
          name: created.name ?? null,
          email: created.email ?? null,
          image: created.image ?? null,
          phone: created.phone ?? null,
        };
      },
    }),

    /* ------------------------------------------------------------------------
     * Email OTP credential — same shape, different channel.
     * ------------------------------------------------------------------------ */
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(raw) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        const code = String(raw?.code ?? "").trim();
        if (!email || !code) return null;

        const ok = await consumeOtp({ identifier: email, code, channel: "email" });
        if (!ok) {
          await logAuditEvent({ event: "otp.verify.fail", metadata: { channel: "email" } });
          return null;
        }

        const existing = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (existing) {
          await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.id, existing.id));
          await logAuditEvent({
            userId: existing.id,
            event: "otp.verify.ok",
            metadata: { channel: "email" },
          });
          return {
            id: existing.id,
            name: existing.name ?? null,
            email: existing.email ?? null,
            image: existing.image ?? null,
            phone: existing.phone ?? null,
          };
        }

        const inserted = await db
          .insert(users)
          .values({
            email,
            emailVerified: new Date(),
          })
          .returning();
        const created = inserted[0];
        if (!created) return null;

        await logAuditEvent({
          userId: created.id,
          event: "auth.signup",
          metadata: { provider: "email-otp" },
        });

        return {
          id: created.id,
          name: created.name ?? null,
          email: created.email ?? null,
          image: created.image ?? null,
          phone: created.phone ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.phone = (token.phone as string | null) ?? null;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      if (user.id) {
        await logAuditEvent({
          userId: user.id,
          event: "auth.signin",
          metadata: { provider: account?.provider ?? "unknown" },
        });
        // Fire-and-forget — don't block sign-in on analytics.
        void identify({
          distinctId: user.id,
          traits: {
            email: user.email ?? undefined,
            has_phone: Boolean((user as { phone?: string | null }).phone),
            provider: account?.provider,
          },
        });
        void track({
          distinctId: user.id,
          event: isNewUser ? "auth.signup" : "auth.signin",
          properties: {
            provider: account?.provider ?? "unknown",
          },
        });
      }
    },
    async signOut(message) {
      const userId =
        "token" in message && message.token
          ? (message.token.id as string | undefined)
          : "session" in message && message.session
            ? message.session.userId
            : undefined;
      if (userId) {
        await logAuditEvent({ userId, event: "auth.signout" });
        void track({ distinctId: userId, event: "auth.signout" });
      }
    },
  },
});
