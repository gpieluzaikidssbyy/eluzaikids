'use client';

import { useEffect, useState } from 'react';
import { MEMBER_CLASSES } from '@/lib/helpers';

interface AttendanceSummary {
  total: number;
  present: number;
  hasAttendance: boolean;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member attendance</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Attendance</h1>
        <p className="mt-2 text-sm text-slate-500">Lihat hasil presensi member berdasarkan kelas dan tanggal.</p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
        <label>
          <span className="field-label">Tanggal presensi</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input-field mt-1 max-w-xs" />
        </label>
        <button type="button" onClick={exportAll} disabled={loading} className="btn-primary disabled:opacity-50">
          Export as Excel
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="table-heading">No</th>
              <th className="table-heading">Kelas</th>
              <th className="table-heading">Tanggal</th>
              <th className="table-heading">Hadir</th>
              <th className="table-heading">Total anak</th>
              <th className="table-heading">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MEMBER_CLASSES.map((memberClass, index) => {
              const summary = summaries[memberClass];
              if (!loading && !summary?.hasAttendance) return null;
              return (
                <tr key={memberClass} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="table-cell text-slate-500">{index + 1}</td>
                  <td className="table-cell font-semibold text-slate-900 dark:text-white">{memberClass}</td>
                  <td className="table-cell">{formatDate(date)}</td>
                  <td className="table-cell">{loading ? '-' : summary?.present ?? 0}</td>
                  <td className="table-cell">{loading ? '-' : summary?.total ?? 0}</td>
                  <td className="table-cell">
                    <button
                      type="button"
                      onClick={() => exportClass(memberClass)}
                      disabled={loading}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:opacity-50"
                      aria-label={`Download rekap kehadiran ${memberClass}`}
                      title="Export as Excel"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v12" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && !MEMBER_CLASSES.some((memberClass) => summaries[memberClass]?.hasAttendance) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
