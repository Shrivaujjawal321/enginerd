"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, invalid, ...props }, ref) => {
  const [shown, setShown] = React.useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={shown ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-white/[0.03] px-4 pr-11 py-2 text-sm text-slate-100",
          "placeholder:text-slate-500",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-rose-500/40 focus:ring-rose-500/30 focus:border-rose-500/40"
            : "border-white/10",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown((s) => !s)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:text-slate-200 focus-visible:text-slate-100"
        tabIndex={-1}
      >
        {shown ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
