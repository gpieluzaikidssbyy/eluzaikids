'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Event</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola semua event</p>
        </div>
        <Link href="/admin/events/create" className="btn-primary">+ Tambah Event</Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Judul</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tanggal</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Pendaftar</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{event.title}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDateIndo(event.event_date)}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{event.registrations_count}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100">Edit</Link>
                    <Link href={`/admin/registrants/events/${event.id}`} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100">Pendaftar</Link>
                    <button onClick={() => handleDelete(event.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
