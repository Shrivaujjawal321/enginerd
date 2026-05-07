import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        glass: "glass text-slate-200",
        gradient:
          "gradient-primary text-white shadow-sm shadow-violet-500/30",
        outline:
          "border border-white/10 bg-transparent text-slate-300",
        success:
          "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300",
        warning:
          "bg-amber-500/10 border border-amber-500/20 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
