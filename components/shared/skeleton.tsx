import { cn } from "@/lib/utils";

/**
 * Skeleton — shimmering placeholder block. Tailwind's `animate-pulse` plus a
 * surface-1 fill matches the rest of the dashboard's surface ramp.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.05]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

/** Card-sized skeleton group — title + 2 lines + meta strip. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5",
        className,
      )}
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-5/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
