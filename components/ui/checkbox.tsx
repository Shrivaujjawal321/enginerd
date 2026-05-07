"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  invalid?: boolean;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, invalid, checked, onChange, ...props }, ref) => {
    const isChecked = !!checked;
    return (
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          aria-invalid={invalid || undefined}
          className={cn(
            "peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none rounded-md border bg-white/[0.03] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]",
            invalid ? "border-rose-500/40" : "border-white/15",
            isChecked &&
              "border-transparent gradient-primary",
            className,
          )}
          {...props}
        />
        {isChecked ? (
          <Check
            aria-hidden
            className="pointer-events-none relative z-10 h-3.5 w-3.5 text-white"
            strokeWidth={3}
          />
        ) : null}
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
