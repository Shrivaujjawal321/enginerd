import { Skeleton } from "@/components/shared/skeleton";

export default function SubjectDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-1 sm:px-0">
      {/* Breadcrumb */}
      <Skeleton className="h-3 w-40" />

      {/* Title block */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Markdown body — paragraphs + a code block + a list */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[96%]" />
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Prev / Next chips */}
      <div className="flex items-center justify-between gap-3 pt-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}
