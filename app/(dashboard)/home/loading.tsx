import { Skeleton, SkeletonCard } from "@/components/shared/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Continue-learning hero */}
      <Skeleton className="h-44 w-full rounded-2xl" />

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Roadmaps grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
