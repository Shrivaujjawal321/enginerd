import { Skeleton, SkeletonCard } from "@/components/shared/skeleton";

export default function CareersLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
