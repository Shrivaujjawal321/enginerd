import { Skeleton } from "@/components/shared/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div>
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
