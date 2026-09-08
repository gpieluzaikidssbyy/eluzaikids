import { Skeleton } from '@/components/ui/skeleton';

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>

      {/* Body */}
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="ml-auto h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}