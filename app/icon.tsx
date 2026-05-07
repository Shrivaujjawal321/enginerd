import { ImageResponse } from "next/og";

/**
 * Dynamic favicon — rendered at build time + cached. Renders the bracket
 * mark on the dark surface. Replaces the inherited Next.js default
 * favicon.ico that's still in /app.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 96 96" width="28" height="28">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
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
            fill="url(#g)"
          />
          <rect x="42" y="40" width="18" height="18" rx="3" fill="url(#g)" />
          <rect
            x="44"
            y="56"
            width="14"
            height="32"
            rx="3"
            transform="rotate(20 51 72)"
            fill="url(#g)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
