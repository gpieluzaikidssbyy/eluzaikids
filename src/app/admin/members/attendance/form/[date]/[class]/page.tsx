'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { Member } from '@/lib/types';

interface AttendanceRow extends Member {
  is_present: boolean;
}

export default function MembersAttendanceFormPage() {
  const params = useParams<{ date: string; class: string }>();
  const router = useRouter();
  const date = params.date;
  const selectedClass = decodeURIComponent(params.class);
  const [members, setMembers] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const classMembers = useMemo(() => members.filter((member) => member.class === selectedClass), [members, selectedClass]);
  const presentCount = classMembers.filter((member) => member.is_present).length;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/member-attendance?class=${encodeURIComponent(selectedClass)}&date=${date}`);
      const data = await response.json();
      setMembers(data.members || []);
      setLoading(false);
    };
    void load();
  }, [date, selectedClass]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const response = await fetch('/api/admin/member-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attendance_date: date,
        attendances: classMembers.map((member) => ({
          member_id: member.id,
          is_present: member.is_present,
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || 'Gagal menyimpan presensi.');
      setSaving(false);
      return;
    }

    router.push('/admin/members/attendance');
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/members/attendance" className="text-sm text-brand-600 hover:underline">&larr; Kembali</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member attendance</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Form Presensi Members</h1>
        <p className="mt-2 text-sm text-slate-500">Kelas {selectedClass} · {date}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-xl bg-brand-50 px-5 py-3 text-sm text-brand-800">
          <span className="font-semibold">{presentCount}</span> dari <span className="font-semibold">{classMembers.length}</span> orang hadir
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[520px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr><th className="table-heading">No</th><th className="table-heading">Nama anak</th><th className="table-heading">Hadir</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">Memuat data...</td></tr> : classMembers.map((member, index) => (
              <tr key={member.id}>
                <td className="table-cell text-slate-500">{index + 1}</td>
                <td className="table-cell font-medium text-slate-900 dark:text-white">{member.name}</td>
                <td className="table-cell"><label className="inline-flex items-center"><input type="checkbox" checked={member.is_present} onChange={() => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, is_present: !item.is_present } : item))} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" aria-label={`Tandai kehadiran ${member.name}`} /></label></td>
              </tr>
            ))}
            {!loading && !classMembers.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada member di kelas ini.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={() => void handleSave()} disabled={loading || saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan Presensi'}
        </button>
      </div>
    </div>
  );
}
