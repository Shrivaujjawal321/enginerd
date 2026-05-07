import * as React from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
  strong?: boolean;
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable = false, strong = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-2xl",
          hoverable &&
            "transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]",
          className,
        )}
        {...props}
      />
    );
  },
);
GlassCard.displayName = "GlassCard";
