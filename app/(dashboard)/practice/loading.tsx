import { Skeleton } from "@/components/shared/skeleton";

export default function PracticeLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-3 h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-3 py-3"
          >
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
