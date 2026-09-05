'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import Link from 'next/link';

interface EventsResponse {
  events: (Event & { registrations_count: number })[];
  total: number;
  page: number;
  totalPages: number;
}

export default function EventsPage() {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = () => fetch(`/api/events?page=${page}`).then((r) => r.json()).then(setData);
    void load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, [page]);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Event Mendatang</h1>
          <p className="mt-2 text-white/80">Daftar event yang akan datang di GPI Eluzai Kids</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {data.events.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            Belum ada event yang akan datang.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.events.map((event) => (
              <EventCard key={event.id} event={event} registrationsCount={event.registrations_count} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sebelumnya
            </button>
            <span className="px-4 text-sm text-slate-600 dark:text-slate-400">
              Halaman {page} dari {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Berikutnya
            </button>
          </div>
        )}
      </section>
    </>
  );
}
