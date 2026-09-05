'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { EventRegistration } from '@/lib/types';

export default function AdminRegistrantEventDetailPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/registrants?type=event&id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setRegistrations(data.registrations || []);
      });
    fetch(`/api/admin/events/${params.id}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [params.id]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/registrants/events" className="text-sm text-brand-600 hover:underline">&larr; Kembali</Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Registrants: {event?.title || '...'}</h1>
          <p className="mt-1 text-sm text-slate-500">{registrations.length} pendaftar</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[850px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700">
            <tr>
              <th className="table-heading">No</th>
              <th className="table-heading">No. registrasi</th>
              <th className="table-heading">Nama lengkap</th>
              <th className="table-heading">No. HP</th>
              <th className="table-heading">Email</th>
              <th className="table-heading">Jumlah yang hadir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {registrations.map((r, index) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="table-cell text-slate-500">{index + 1}</td>
                <td className="table-cell font-mono text-xs">{r.nomor_registrasi}</td>
                <td className="table-cell font-medium text-slate-900 dark:text-white">{r.name}</td>
                <td className="table-cell">{r.phone}</td>
                <td className="table-cell">{r.email || '-'}</td>
                <td className="table-cell font-semibold">{r.jumlah_hadir}</td>
              </tr>
            ))}
            {!registrations.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada pendaftar.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
