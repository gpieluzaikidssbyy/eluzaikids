'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminRegistrantActivityDetailPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/registrants?type=activity&id=${params.id}`).then((r) => r.json()).then((d) => setRegistrations(d.registrations || []));
    fetch(`/api/admin/activities/${params.id}`).then((r) => r.json()).then(setActivity);
  }, [params.id]);

  return (
    <div>
      <Link href="/admin/registrants/activities" className="text-sm text-brand-600 hover:underline">&larr; Kembali</Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Pendaftar: {activity?.title || '...'}</h1>
      <p className="mt-1 text-sm text-slate-500">{registrations.length} pendaftar</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">No. Registrasi</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Nama</th>
              <th className="px-4 py-3 font-semibold text-slate-600">HP</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Hadir</th>
              <th className="px-4 py-3 font-semibold text-slate-600">QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {registrations.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3 font-mono text-xs">{r.nomor_registrasi}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.hadir ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.hadir ? 'Hadir' : 'Belum'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a href={`/api/scan-qr/activity/${params.id}/qr/${r.id}`} target="_blank" className="text-xs text-brand-600 hover:underline">Lihat QR</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
