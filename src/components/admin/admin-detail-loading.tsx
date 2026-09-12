import { Skeleton } from '@/components/ui/skeleton';
import { AdminTableSkeleton } from '@/components/admin/page-skeletons';

export function AdminDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-xl sm:h-48" />
      <AdminTableSkeleton rows={4} />
    </div>
  );
}
