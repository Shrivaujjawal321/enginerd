import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full rounded-xl border bg-white/[0.03] px-4 py-2 text-sm text-slate-100",
        // text-slate-400 hits WCAG-AA (>=4.5:1) on the dark input background;
        // -500 used to fail at ~2.8:1.
        "placeholder:text-slate-400",
        // Solid violet ring (was 40% opacity) so low-vision users can see
        // focus on dark surfaces.
        "transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400/60",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "border-rose-500/40 focus:ring-rose-500/30 focus:border-rose-500/40"
          : "border-white/10",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
