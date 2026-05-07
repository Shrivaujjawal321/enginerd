import { Skeleton } from "@/components/shared/skeleton";

export default function ProblemDetailLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Problem statement */}
      <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Editor + actions */}
      <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-28 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
