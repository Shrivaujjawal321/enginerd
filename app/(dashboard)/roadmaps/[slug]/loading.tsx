import { Skeleton } from "@/components/shared/skeleton";

export default function RoadmapDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-3 w-28" />

      {/* Hero card */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-[85%] max-w-xl" />
            <div className="flex flex-wrap gap-3 pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:min-w-[220px]">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs row */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Subjects grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
