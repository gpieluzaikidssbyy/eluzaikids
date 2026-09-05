'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Event, EventRegistration } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

type AdminEvent = Event & { registrations_count: number };

export default function AdminEventDetailsPage() {
  const params = useParams();
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [eventResponse, registrationsResponse] = await Promise.all([
      fetch(`/api/admin/events/${params.id}`),
      fetch(`/api/admin/registrants?type=event&id=${params.id}`),
    ]);
    const eventData = await eventResponse.json();
    const registrationData = await registrationsResponse.json();
    setEvent(eventData);
    setRegistrations(registrationData.registrations || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => void loadData(), 5000);
    return () => window.clearInterval(interval);
  }, [params.id]);

  if (loading || !event) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/admin/events" className="text-sm font-medium text-brand-600 hover:underline">&larr; Back to Manage Event</Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Event details</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{event.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{formatDateIndo(event.event_date)} · {event.location || 'Lokasi belum diisi'}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/events/${event.id}/edit`} className="btn-secondary">Edit event</Link>
          <Link href={`/admin/registrants/events/${event.id}`} className="btn-primary">Manage registrants</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card"><p className="text-xs uppercase tracking-wider text-slate-400">Open gate</p><p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{event.open_gate || '-'}</p></div>
        <div className="card"><p className="text-xs uppercase tracking-wider text-slate-400">Mulai pukul</p><p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{event.start_time || '-'}</p></div>
        <div className="card"><p className="text-xs uppercase tracking-wider text-slate-400">Kuota</p><p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{event.quota ?? 'Tanpa batas'}</p></div>
        <div className="card"><p className="text-xs uppercase tracking-wider text-slate-400">Total pendaftar</p><p className="mt-2 text-lg font-bold text-brand-600">{registrations.length}</p></div>
      </div>

      <div className="card">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Informasi event</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">{event.description || 'Deskripsi event belum diisi.'}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Hasil form pendaftaran</h2>
          <p className="mt-1 text-sm text-slate-500">Data diperbarui otomatis setiap 5 detik.</p>
        </div>
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="table-heading">No</th>
              <th className="table-heading">No. registrasi</th>
              <th className="table-heading">Nama lengkap</th>
              <th className="table-heading">No. HP</th>
              <th className="table-heading">Email</th>
              <th className="table-heading">Jumlah yang hadir</th>
              <th className="table-heading">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {registrations.map((registration, index) => (
              <tr key={registration.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="table-cell text-slate-500">{index + 1}</td>
                <td className="table-cell font-mono text-xs">{registration.nomor_registrasi}</td>
                <td className="table-cell font-medium text-slate-900 dark:text-white">{registration.name}</td>
                <td className="table-cell">{registration.phone}</td>
                <td className="table-cell">{registration.email || '-'}</td>
                <td className="table-cell font-semibold">{registration.jumlah_hadir}</td>
                <td className="table-cell">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${registration.hadir ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {registration.hadir ? 'Telah hadir' : 'Belum hadir'}
                  </span>
                </td>
              </tr>
            ))}
            {!registrations.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada hasil form pendaftaran.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
