"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

// Re-export for backwards compatibility — callers used to import these
// from this file before the helper was lifted into `lib/toc.ts`.
export { extractToc, type TocItem } from "@/lib/toc";

type Props = {
  items: TocItem[];
  className?: string;
};

/**
 * On-page Table of Contents — generated from the rendered markdown's H2/H3
 * headings (slugified to stable ids by `markdown-renderer`).
 *
 * Tracks the active heading via IntersectionObserver — the heading nearest
 * the top of the viewport gets a violet active-rail. Smooth-scrolls on click
 * and updates the URL hash without a navigation reload.
 *
 * Hidden on viewports below `lg` to prioritise reading width.
 */
export function OnPageToc({ items, className }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(
    items[0]?.id ?? null,
  );

  React.useEffect(() => {
    if (items.length === 0) return;

    // Resolve only headings that actually mounted (defensive — rare race
    // when content has duplicate headings or the scroll target is removed).
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the heading with the smallest non-negative `top`. That maps
        // to "nearest heading at or above the top of the viewport".
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Activate when heading enters the top 35% of the viewport.
        rootMargin: "-80px 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    for (const t of targets) observer.observe(t);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className={cn("hidden xl:block", className)}>
      <div className="sticky top-24">
        <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          On this page
        </p>
        <nav>
          <ul className="space-y-0.5 border-l border-white/[0.06]">
            {items.map((item) => {
              const isActive = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      // Smooth-scroll without a hard navigation; update hash.
                      e.preventDefault();
                      const target = document.getElementById(item.id);
                      if (target) {
                        target.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                        history.replaceState(null, "", `#${item.id}`);
                        setActiveId(item.id);
                      }
                    }}
                    className={cn(
                      "relative -ml-px block border-l-2 py-1 pl-3 pr-2 text-[13px] leading-snug transition-colors",
                      item.level === 3 && "pl-6",
                      isActive
                        ? "border-violet-400 text-white"
                        : "border-transparent text-slate-400 hover:border-white/[0.15] hover:text-slate-200",
                    )}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// `extractToc` lives in `@/lib/toc` (re-exported above).
