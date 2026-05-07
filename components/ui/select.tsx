import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border bg-white/[0.03] px-4 pr-10 py-2 text-sm text-slate-100",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-rose-500/40 focus:ring-rose-500/30 focus:border-rose-500/40"
            : "border-white/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  ),
);
Select.displayName = "Select";
