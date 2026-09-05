'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminRegistrantActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);

  useEffect(() => {
    fetch('/api/admin/activities').then((r) => r.json()).then(setActivities);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Pendaftar Kegiatan</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => (
          <Link key={a.id} href={`/admin/registrants/activities/${a.id}`} className="card hover:shadow-md transition">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">{a.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{a.activity_date ? formatDateIndo(a.activity_date) : '-'}</p>
            <p className="mt-2 text-sm font-medium text-brand-600">{a.registrations_count} pendaftar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
