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
      <p className="mt-1 text-sm text-slate-500">Pilih kegiatan untuk melihat daftar pendaftarnya.</p>

      {!activities.length ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Belum ada kegiatan.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.id}
              href={`/admin/registrants/activities/${a.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">{a.title}</h3>
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                  <svg className="w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{a.activity_date ? formatDateIndo(a.activity_date) : 'Tanggal belum diatur'}</p>
              {a.location && <p className="mt-1 truncate text-xs text-slate-400">{a.location}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${a.registrations_count > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  {a.registrations_count} pendaftar
                </span>
                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-500 dark:text-slate-600" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}