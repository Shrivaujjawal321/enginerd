"use client";

import * as React from "react";

/**
 * Last-resort error boundary — catches errors from the root layout itself
 * (e.g. SessionProvider blow-up). Must render its own <html> + <body> because
 * the layout failed.
 *
 * Keep this minimal: no Tailwind utilities (CSS may not be loaded), no
 * server hooks. Inline styles only.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  React.useEffect(() => {
    console.error("[global-error]", error.digest, error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#0a0a0f",
          color: "#ededee",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 28,
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            EngiNerd is having a moment.
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 24px" }}>
            The whole app failed to render. We&apos;ve been notified — try
            again in a minute.
          </p>
          {error.digest ? (
            <code
              style={{
                display: "inline-block",
                fontSize: 11,
                background: "rgba(255,255,255,0.04)",
                padding: "4px 10px",
                borderRadius: 6,
                color: "#71717a",
              }}
            >
              ref: {error.digest}
            </code>
          ) : null}
          <div style={{ marginTop: 24 }}>
            {/* global-error replaces the root layout on a render crash. A hard
                navigation (plain <a>, full reload) is the intended recovery —
                next/link client nav can't reliably remount a broken tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
