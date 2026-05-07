/**
 * Next.js 16 Proxy (formerly middleware.ts).
 *
 * Two jobs:
 *   1. Gate authenticated routes — if no session, bounce to /login with
 *      the original URL preserved as ?callbackUrl=…
 *   2. Bounce signed-in users away from /login or /register straight to /home.
 *
 * Reads the session cookie using NextAuth's edge-friendly `auth()` helper.
 * No DB calls happen here — JWT decoding only.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

// Pages that REQUIRE a signed-in user.
//
// /subjects and /roadmaps were authed earlier but moved to public previews
// from cycle 8 onward — discovery + signup-conversion benefit outweighs
// the (small) cost of letting unauthed visitors browse the catalog.
//
// /practice (the listing page) and /practice/[slug] (per-problem) are also
// public from cycle 11 — visitors see problem statements + examples; the
// code editor + submission gate behind sign-in inside the page.
//
// Per-user state (progress, mark-complete, code submission) is gated inside
// those pages at the component level, not here.
const PROTECTED_PREFIXES = [
  "/home",
  "/careers",
  "/profile",
  "/cohorts",
  "/billing",
];

const AUTH_PAGES = ["/login", "/register"];

const PROTECTED_API_PREFIXES = [
  "/api/agents",
  "/api/jobs/match",
  "/api/resume/extract",
  "/api/progress",
  "/api/me",
  "/api/submissions",
  "/api/execute",
  "/api/checkout",
  "/api/subscription",
];

// Intentionally PUBLIC — anyone can hit these without a session.
//   /api/health             — uptime probe
//   /api/auth/*             — NextAuth's own endpoints
//   /api/feedback           — anonymous "Was this helpful" votes
//   /api/jobs/search        — public job aggregator
//   /api/webhooks/razorpay  — Razorpay calls us (HMAC-signed, not authed)
//   /api/search-index       — palette index (public for unauthed landing)

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;
  const isAuthed = Boolean(session?.user);

  // Already signed in — keep them out of /login.
  if (isAuthed && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Page route guard.
  if (!isAuthed && isProtectedPath(pathname)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // API route guard — return 401 JSON instead of redirect.
  if (!isAuthed && isProtectedApi(pathname)) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets, image optimisation, and Next
  // internals. NextAuth's own /api/auth/* routes are unconditionally allowed
  // because we never put them in the protected lists above.
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
