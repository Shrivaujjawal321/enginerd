import { ImageResponse } from "next/og";

/**
 * Default OG image — returned when an EngiNerd link is shared on Twitter,
 * LinkedIn, WhatsApp, Slack. Per-page overrides can land in route-segment
 * `opengraph-image.tsx` files later.
 */

export const alt =
  "EngiNerd — Engineering, explained like a friend would.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at top left, #1a1530 0%, #0a0a0f 55%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Bracket logo */}
        <svg viewBox="0 0 96 96" width="120" height="120">
          <defs>
            <linearGradient id="og-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <rect
            x="44"
            y="10"
            width="14"
            height="32"
            rx="3"
            transform="rotate(-20 51 26)"
            fill="url(#og-g)"
          />
          <rect
            x="42"
            y="40"
            width="18"
            height="18"
            rx="3"
            fill="url(#og-g)"
          />
          <rect
            x="44"
            y="56"
            width="14"
            height="32"
            rx="3"
            transform="rotate(20 51 72)"
            fill="url(#og-g)"
          />
          <circle cx="78" cy="48" r="6" fill="#fff" opacity="0.9" />
        </svg>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            color: "#94a3b8",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Engi
          <span
            style={{
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Nerd
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            color: "#f8fafc",
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            maxWidth: 1000,
          }}
        >
          Engineering, explained like a friend would.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            color: "#a1a1aa",
            fontSize: 26,
            fontWeight: 500,
          }}
        >
          Hinglish lessons · IIT-level depth · Job-ready in 90 days
        </div>
      </div>
    ),
    { ...size },
  );
}
