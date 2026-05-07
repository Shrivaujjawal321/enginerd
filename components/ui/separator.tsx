import * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: string;
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  label,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        role="separator"
        {...props}
      >
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
    );
  }
  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-white/[0.08]"
          : "h-full w-px bg-white/[0.08]",
        className,
      )}
      {...props}
    />
  );
}
