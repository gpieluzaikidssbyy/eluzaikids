import { Skeleton } from '@/components/ui/skeleton';
import { AdminTableSkeleton } from '@/components/admin/page-skeletons';

export default function AdminSchedulesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <AdminTableSkeleton rows={6} />
    </div>
  );
}