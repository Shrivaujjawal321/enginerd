import * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-slate-200",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden className="ml-0.5 text-rose-400">
          *
        </span>
      ) : null}
    </label>
  ),
);
Label.displayName = "Label";
