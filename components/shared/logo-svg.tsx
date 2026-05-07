/**
 *  Static SVG mark for the EngiNerd brand.
 *
 *  Lives in its own zero-dep module so the navbar / sidebar / wordmark can
 *  import the fallback without dragging Three.js + @react-three/drei into
 *  every marketing/dashboard route's bundle. The animated WebGL version
 *  lives in `components/marketing/logo-3d.tsx` and is loaded via
 *  `next/dynamic` only by the hero.
 *
 *  Used by:
 *    - components/shared/wordmark.tsx     (every brand surface)
 *    - components/marketing/hero-form.tsx (SSR + reduced-motion fallback)
 */
export function LogoSvg({
  className,
  size = 96,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label="EngiNerd logo"
    >
      <defs>
        <linearGradient id="enginerd-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Top arm */}
      <rect
        x="44"
        y="10"
        width="14"
        height="32"
        rx="3"
        transform="rotate(-20 51 26)"
        fill="url(#enginerd-grad)"
      />
      {/* Pivot */}
      <rect
        x="42"
        y="40"
        width="18"
        height="18"
        rx="3"
        fill="url(#enginerd-grad)"
      />
      {/* Bottom arm */}
      <rect
        x="44"
        y="56"
        width="14"
        height="32"
        rx="3"
        transform="rotate(20 51 72)"
        fill="url(#enginerd-grad)"
      />
      {/* Spark */}
      <circle cx="78" cy="48" r="5" fill="#fff" opacity="0.9" />
      <circle cx="78" cy="48" r="9" fill="#06b6d4" opacity="0.25" />
    </svg>
  );
}
