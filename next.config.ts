import path from "node:path";
import type { NextConfig } from "next";

/* ============================================================================
 *  Security headers — applied to every response.
 *
 *  Why CSP is permissive on script-src: Next.js needs `unsafe-inline` for the
 *  hydration boot script + `unsafe-eval` for Three.js / WebAssembly grammars
 *  used by Shiki. We tighten this once we move to nonce-based CSP in Phase 7.
 * ============================================================================
 */

const isProd = process.env.NODE_ENV === "production";

const csp = [
  // Default deny — fall through to specific directives.
  "default-src 'self'",
  // Scripts: self + inline (Next.js hydration) + eval (WASM) + Vercel preview iframes
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us-assets.i.posthog.com https://us.i.posthog.com https://checkout.razorpay.com",
  // Styles: self + inline (Tailwind generated styles + Shiki theme styles)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: Google Fonts (Geist + Hind) + self
  "font-src 'self' data: https://fonts.gstatic.com",
  // Images: self + data: (favicons, OG images) + https: (user avatars from Google OAuth)
  "img-src 'self' data: blob: https:",
  // Outbound calls: same-origin APIs + auth providers + analytics + Anthropic + OpenAI
  "connect-src 'self' https://accounts.google.com https://api.anthropic.com https://api.openai.com https://us.i.posthog.com https://us-assets.i.posthog.com https://*.neon.tech https://*.upstash.io https://api.razorpay.com https://lumberjack.razorpay.com",
  // Iframes: code-runner sandbox (srcdoc) + Razorpay Checkout popup
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  // Block plugins (Flash, etc.)
  "object-src 'none'",
  // Block being framed by other sites (clickjacking)
  "frame-ancestors 'none'",
  // Form posts only to self (NextAuth callbacks etc.)
  "form-action 'self' https://accounts.google.com",
  // Force HTTPS on subresources in prod
  isProd ? "upgrade-insecure-requests" : "",
].filter(Boolean).join("; ");

const securityHeaders = [
  // Prevent XSS via injected MIME types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block clickjacking — duplicate of CSP frame-ancestors for older browsers
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak referrer to third-party sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down browser APIs we don't use
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()", // FLoC opt-out
      'payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")',
      "usb=()",
    ].join(", "),
  },
  // Cross-origin isolation — mostly safe; relax if we later embed YouTube
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Force HTTPS for 1 year (only meaningful in prod)
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Production builds drop console.{log,debug} but keep .error / .warn so
  // Sentry's auto-capture still works.
  compiler: isProd
    ? {
        removeConsole: { exclude: ["error", "warn"] },
      }
    : undefined,

  // Don't ship the source map URL header to browsers in prod.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
