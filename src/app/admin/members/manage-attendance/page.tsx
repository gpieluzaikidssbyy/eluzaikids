'use client';

import { useEffect, useState } from 'react';
import { MEMBER_CLASSES } from '@/lib/helpers';

interface AttendanceSummary {
  total: number;
  present: number;
  hasAttendance: boolean;
}

const CLASS_STYLES: Record<string, { badge: string; bar: string }> = {
  Baby: { badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300', bar: 'from-pink-400 to-rose-500' },
  Samuel: { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', bar: 'from-sky-400 to-blue-500' },
  Yosua: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', bar: 'from-emerald-400 to-teal-500' },
  Musa: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', bar: 'from-violet-400 to-purple-500' },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export default function ManageAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summaries, setSummaries] = useState<Record<string, AttendanceSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const results = await Promise.all(
        MEMBER_CLASSES.map(async (memberClass) => {
          const response = await fetch(`/api/admin/member-attendance?class=${encodeURIComponent(memberClass)}&date=${date}`);
          const data = await response.json();
          const members = data.members || [];
          return [
            memberClass,
            {
              total: members.length,
              present: members.filter((member: { is_present: boolean }) => member.is_present).length,
              hasAttendance: data.hasAttendance === true,
            },
          ] as const;
        }),
      );
      setSummaries(Object.fromEntries(results));
      setLoading(false);
    };

    void load();
  }, [date]);

  const exportClass = (memberClass: string) => {
    window.location.href = `/api/admin/member-attendance/export?class=${encodeURIComponent(memberClass)}&date=${date}`;
  };

  const exportAll = () => {
    window.location.href = `/api/admin/member-attendance/export?date=${date}`;
  };

  const classesWithAttendance = MEMBER_CLASSES.filter((memberClass) => summaries[memberClass]?.hasAttendance);
  const totalPresent = classesWithAttendance.reduce((sum, memberClass) => sum + (summaries[memberClass]?.present || 0), 0);
  const totalMembers = classesWithAttendance.reduce((sum, memberClass) => sum + (summaries[memberClass]?.total || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member attendance</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Attendance</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Rekap kehadiran member per kelas dan tanggal.</p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <label>
            <span className="field-label">Tanggal presensi</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input-field mt-1 max-w-xs" />
          </label>
          {!loading && classesWithAttendance.length > 0 && (
            <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-950/30 dark:text-brand-200">
              <span className="font-bold">{totalPresent}</span> dari <span className="font-bold">{totalMembers}</span> anak hadir pada {formatDate(date)}
            </div>
          )}
        </div>
        <button type="button" onClick={exportAll} disabled={loading} className="btn-primary disabled:opacity-50">
          Export as Excel
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
      ) : classesWithAttendance.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">Belum ada data presensi</p>
          <p className="mt-1 text-sm text-slate-500">Isi presensi lewat menu <span className="font-medium text-slate-700 dark:text-slate-300">Members Attendance</span> untuk tanggal ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {classesWithAttendance.map((memberClass) => {
            const summary = summaries[memberClass];
            const style = CLASS_STYLES[memberClass];
            const percent = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
            return (
              <div key={memberClass} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.bar}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{memberClass}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportClass(memberClass)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 transition hover:bg-green-100 hover:text-green-700 dark:bg-green-950/40 dark:text-green-300"
                    aria-label={`Download rekap kehadiran ${memberClass}`}
                    title="Export as Excel"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </button>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{summary.present}<span className="text-base font-semibold text-slate-400">/{summary.total}</span></p>
                    <p className="mt-1 text-xs text-slate-500">anak hadir</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>{percent}%</span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full bg-gradient-to-r ${style.bar}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}