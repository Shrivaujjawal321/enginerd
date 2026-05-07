import { SkeletonCard } from "@/components/shared/skeleton";

export default function RoadmapsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-48 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="min-h-[180px]" />
        ))}
      </div>
    </div>
  );
}
