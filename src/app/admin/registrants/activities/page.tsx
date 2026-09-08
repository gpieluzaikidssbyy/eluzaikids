'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/empty-state';

export default function AdminRegistrantActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);

  useEffect(() => {
    fetch('/api/admin/activities').then((r) => r.json()).then(setActivities);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader
        icon={<ClipboardList className="h-6 w-6" />}
        iconClassName="bg-amber-500/10 text-amber-500"
        title="Pendaftar Kegiatan"
        description="Pilih kegiatan untuk melihat daftar pendaftarnya."
      />

      {!activities.length ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada kegiatan"
          description="Kegiatan yang tersedia akan muncul di sini."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (i % 6) }}
            >
              <Link
                href={`/admin/registrants/activities/${a.id}`}
                className="group block rounded-xl border border-border/60 bg-card p-6 shadow-card transition duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground">{a.title}</h3>
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <ClipboardList className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.activity_date ? formatDateIndo(a.activity_date) : 'Tanggal belum diatur'}</p>
                {a.location && <p className="mt-1 truncate text-xs text-muted-foreground/70">{a.location}</p>}
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-amber-500" aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
