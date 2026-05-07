import { Skeleton } from "@/components/shared/skeleton";

export default function PublicProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      {/* Hero */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 sm:p-10">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      {/* Footer CTA */}
      <Skeleton className="mt-10 h-24 w-full rounded-2xl" />
    </div>
  );
}
