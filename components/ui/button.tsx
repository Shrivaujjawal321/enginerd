import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "gradient-primary text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:saturate-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:shadow-none",
        glass:
          "glass text-slate-50 hover:bg-white/[0.08] hover:border-white/15 disabled:opacity-50",
        ghost:
          "text-slate-200 hover:bg-white/[0.05] hover:text-white disabled:opacity-50",
        outline:
          "border border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.04] hover:border-white/20 disabled:opacity-50",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
