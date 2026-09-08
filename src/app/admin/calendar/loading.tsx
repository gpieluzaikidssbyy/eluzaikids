import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCalendarLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-80 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}