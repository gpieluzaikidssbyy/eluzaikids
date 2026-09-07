'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminPresensiEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);

  useEffect(() => {
    const load = () => fetch('/api/admin/events').then((r) => r.json()).then(setEvents);
    void load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Attendance</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Event Attendance</h1><p className="mt-2 text-sm text-slate-500">Pilih event untuk membuka daftar kehadiran dan akses scanner.</p></div>

      {!events.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Belum ada event.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/presensi/events/${event.id}`}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">{event.title}</p>
                  {event.tema && <p className="mt-1 text-sm text-slate-500">Tema: {event.tema}</p>}
                  <p className="mt-1 text-sm text-slate-500">{formatDateIndo(event.event_date)}</p>
                  {event.location && <p className="mt-1 truncate text-xs text-slate-400">{event.location}</p>}
                </div>
                <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${event.registrations_count > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {event.registrations_count} pendaftar
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-3 text-xs text-slate-500">
                  <span>Open gate: {event.open_gate?.slice(0, 5) || '-'} WIB</span>
                  <span>Mulai: {event.start_time?.slice(0, 5) || '-'} WIB</span>
                </div>
                <span className="text-sm font-semibold text-brand-600">Manage</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
