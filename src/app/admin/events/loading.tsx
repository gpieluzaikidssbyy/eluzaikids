import { Skeleton } from '@/components/ui/skeleton';
import { AdminTableSkeleton } from '@/components/admin/page-skeletons';

export default function AdminEventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="hidden h-11 w-11 rounded-lg sm:flex" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <AdminTableSkeleton rows={5} />
    </div>
  );
}