import { Skeleton } from "@/components/shared/skeleton";

export default function CareerDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-3 w-28" />

      {/* Header card */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Body — description + sidebar */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
