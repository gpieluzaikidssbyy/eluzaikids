'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminPresensiEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);

  useEffect(() => {
    fetch('/api/admin/events').then((r) => r.json()).then(setEvents);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Presensi Event</h1>
      <p className="mt-1 text-sm text-slate-500">Kelola presensi kehadiran event</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} href={`/admin/presensi/events/${event.id}`} className="card hover:shadow-md transition">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">{event.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{formatDateIndo(event.event_date)}</p>
            <p className="mt-2 text-sm font-medium text-brand-600">{event.registrations_count} pendaftar</p>
            {event.scan_active && (
              <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Scan Aktif</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
