'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { ClipboardList, MapPin, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/empty-state';

export default function AdminPresensiActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);

  useEffect(() => {
    const load = () => fetch('/api/admin/activities').then((r) => r.json()).then(setActivities);
    void load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<ClipboardList className="h-6 w-6" />}
        iconClassName="bg-amber-500/10 text-amber-500"
        title="Activity Attendance"
        description="Pilih activity untuk membuka daftar kehadiran dan akses scanner."
      />

      {!activities.length ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Belum ada activity</h3>
          <p className="mt-1 text-sm text-muted-foreground">Activity yang tersedia akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (i % 6) }}
            >
              <div className="group block rounded-xl border border-border/60 bg-card p-6 shadow-card transition duration-200 hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold leading-snug text-foreground">{activity.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {activity.activity_date ? formatDateIndo(activity.activity_date) : 'Tanggal belum diatur'}
                    </p>
                    {activity.location && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground/70">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {activity.location}
                      </p>
                    )}
                  </div>
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <ClipboardList className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-end">
                  <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
                    <Link href={`/admin/presensi/activities/${activity.id}`}>
                      Manage
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}