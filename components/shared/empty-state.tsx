import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  EmptyState — the single canonical "nothing here yet" surface.
 *
 *  Variants used across the app: billing (no payments), cohorts (not in any),
 *  careers (no matches), search palette (no results), profile (no activity).
 *
 *  Always:
 *    - gradient chip with the icon (consistent brand)
 *    - title (one line)
 *    - body (one short paragraph)
 *    - optional CTA (primary action)
 *    - centered, generous padding
 * ============================================================================
 */

type Props = {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?:
    | { label: string; href: string }
    | { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({ icon, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white shadow-lg shadow-violet-500/25">
        {icon}
      </div>
      <p className="text-base font-medium text-slate-100">{title}</p>
      {body ? (
        <p className="max-w-sm text-sm text-slate-400">{body}</p>
      ) : null}
      {action ? (
        "href" in action ? (
          <Link href={action.href} className="mt-1">
            <Button>{action.label}</Button>
          </Link>
        ) : (
          <Button className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
