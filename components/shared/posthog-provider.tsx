"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

/**
 * PostHog client-side analytics — auto-initializes once per session.
 *
 * Page-view tracking is wired manually because Next.js App Router doesn't
 * fire route-change events automatically. Identifies the user post-login.
 *
 * No-op when NEXT_PUBLIC_POSTHOG_KEY is unset.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

function ensureInit() {
  if (initialized || typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // We capture page-views ourselves below (App Router-aware).
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false, // avoid recording every click — we explicitly track
    // Mask any element with `data-ph-no-capture` (e.g. OTP input).
    mask_all_text: false,
    mask_all_element_attributes: false,
    sanitize_properties: (props) => {
      // Strip any accidentally-passed `code`, `password`, `token` keys.
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        const lk = k.toLowerCase();
        if (lk === "code" || lk === "password" || lk === "token" || lk === "otp") {
          continue;
        }
        out[k] = v;
      }
      return out;
    },
  });
  initialized = true;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    ensureInit();
  }, []);

  if (!POSTHOG_KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      <SessionIdentifier />
      {children}
    </PHProvider>
  );
}

/** Capture pageview on every route change. */
function PageViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    const url =
      pathname + (search?.toString() ? `?${search.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, search]);

  return null;
}

/** Identify the user once we have a session. */
function SessionIdentifier() {
  const { data, status } = useSession();
  const lastIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (status === "loading") return;

    const id = data?.user?.id ?? null;
    if (id && id !== lastIdRef.current) {
      posthog.identify(id, {
        email: data?.user?.email ?? undefined,
        // Keep PII to a minimum — phone is hashed if present.
        has_phone: Boolean(data?.user?.phone),
      });
      lastIdRef.current = id;
    } else if (!id && lastIdRef.current) {
      posthog.reset();
      lastIdRef.current = null;
    }
  }, [data, status]);

  return null;
}
