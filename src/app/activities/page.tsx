'use client';

import { useEffect, useState } from 'react';
import type { Activity } from '@/lib/types';
import { ActivityCard } from '@/components/ActivityCard';

interface ActivitiesResponse {
  activities: (Activity & { registrations_count: number })[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ActivitiesPage() {
  const [data, setData] = useState<ActivitiesResponse | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/activities?page=${page}`)
      .then((r) => r.json())
      .then(setData);
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
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Kegiatan</h1>
          <p className="mt-2 text-white/80">Daftar kegiatan di GPI Eluzai Kids</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {data.activities.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            Belum ada kegiatan yang tersedia.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} registrationsCount={activity.registrations_count} />
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Sebelumnya
            </button>
            <span className="px-4 text-sm text-slate-600 dark:text-slate-400">
              Halaman {page} dari {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Berikutnya
            </button>
          </div>
        )}
      </section>
    </>
  );
}
