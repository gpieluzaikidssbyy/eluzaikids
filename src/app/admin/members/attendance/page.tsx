'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MEMBER_CLASSES } from '@/lib/helpers';

const CLASS_STYLES: Record<string, { hover: string; badge: string; icon: string }> = {
  Baby: { hover: 'hover:border-pink-400 hover:bg-pink-50', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300', icon: 'bg-pink-100 text-pink-600 dark:bg-pink-950/40' },
  Samuel: { hover: 'hover:border-sky-400 hover:bg-sky-50', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40' },
  Yosua: { hover: 'hover:border-emerald-400 hover:bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' },
  Musa: { hover: 'hover:border-violet-400 hover:bg-violet-50', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40' },
};

export default function MembersAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member attendance</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Members Attendance</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Pilih tanggal, lalu pilih kelas untuk membuka form presensi.</p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
        <label>
          <span className="field-label">Tanggal presensi</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input-field mt-1 max-w-xs" />
        </label>
        <p className="text-sm text-slate-500">
          Presensi untuk <span className="font-semibold text-slate-900 dark:text-white">{new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Pilih Kelas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_CLASSES.map((memberClass) => {
            const style = CLASS_STYLES[memberClass];
            return (
              <Link
                key={memberClass}
                href={`/admin/members/attendance/form/${date}/${encodeURIComponent(memberClass)}`}
                className={`group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${style.hover}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500" aria-hidden="true">→</span>
                </div>
                <p className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{memberClass}</p>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>Buka form presensi</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}