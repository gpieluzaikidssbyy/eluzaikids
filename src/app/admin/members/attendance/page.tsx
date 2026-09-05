'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MEMBER_CLASSES } from '@/lib/helpers';

export default function MembersAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member attendance</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Members Attendance</h1>
        <p className="mt-2 text-sm text-slate-500">Pilih tanggal terlebih dahulu, lalu pilih kelas untuk membuka form presensi.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label><span className="field-label">Tanggal presensi</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input-field mt-1 max-w-xs" /></label>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Pilih Kelas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_CLASSES.map((memberClass) => (
            <Link key={memberClass} href={`/admin/members/attendance/form/${date}/${encodeURIComponent(memberClass)}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-500 hover:bg-brand-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{memberClass}</p>
              <p className="mt-1 text-xs text-slate-500">Buka form presensi</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
