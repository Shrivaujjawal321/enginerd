"use client";

import * as React from "react";

/* ============================================================================
 *  ReadingProgressBar — thin gradient bar pinned to the top of the viewport,
 *  width tracks scroll position from 0% to 100% as the reader moves down a
 *  long subject page.
 *
 *  Pure client island. No server data. Cycle 14 engagement polish — subtle
 *  signal that long-form content has weight + a finish line.
 *
 *  Performance: passive scroll listener; rAF throttle so we don't update
 *  state on every micro-event. Detaches on unmount.
 * ============================================================================
 */

export function ReadingProgressBar() {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;

    const compute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      if (max <= 0) {
        setPct(0);
        return;
      }
      const next = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      setPct(next);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        compute();
        raf = 0;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Hide entirely when the reader is at the top (no progress to show) or
  // already at the bottom (nothing left to indicate). Soft fade-in once
  // they're 1%+ through and 99%- — avoids a "permanent thin bar" feel on
  // pages they've barely engaged with or already finished.
  const visible = pct > 0.5 && pct < 99;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left gradient-primary transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
