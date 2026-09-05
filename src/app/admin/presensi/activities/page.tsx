'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminPresensiActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);

  useEffect(() => {
    const load = () => fetch('/api/admin/activities').then((r) => r.json()).then(setActivities);
    void load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Attendance</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Activity Attendance</h1><p className="mt-2 text-sm text-slate-500">Pilih activity untuk membuka daftar kehadiran dan akses scanner.</p></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50"><tr><th className="table-heading">No</th><th className="table-heading">Nama activity</th><th className="table-heading">Mulai pukul</th><th className="table-heading">Lokasi</th><th className="table-heading">Manage</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((a, index) => <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60"><td className="table-cell text-slate-500">{index + 1}</td><td className="table-cell"><div className="font-semibold text-slate-900 dark:text-white">{a.title}</div><div className="mt-1 text-xs text-slate-500">{a.activity_date ? formatDateIndo(a.activity_date) : '-'}</div></td><td className="table-cell">{a.start_time || '-'}</td><td className="table-cell">{a.location || '-'}</td><td className="table-cell"><Link href={`/admin/presensi/activities/${a.id}`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">Manage</Link></td></tr>)}
            {!activities.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada activity.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
