import { SkeletonCard } from "@/components/shared/skeleton";

export default function SubjectsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-40 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
