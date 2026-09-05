'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo, remainingQuota } from '@/lib/helpers';
import { RegistrationForm } from '@/components/RegistrationForm';

export default function ActivityDetailPage() {
  const params = useParams();
  const [activity, setActivity] = useState<(Activity & { registrations_count: number }) | null>(null);

  useEffect(() => {
    fetch(`/api/activities/${params.id}`)
      .then((r) => r.json())
      .then(setActivity);
  }, [params.id]);

  if (!activity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const remaining = remainingQuota(activity.quota, activity.registrations_count);
  const isFull = remaining !== null && remaining <= 0;

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link href="/activities" className="inline-flex items-center gap-1 text-sm text-white/80 transition hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Kegiatan
          </Link>
          <div className="mt-4">
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{activity.title}</h1>
            {activity.activity_date && (
              <p className="mt-2 text-lg text-white/85">{formatDateIndo(activity.activity_date)}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card">
              {activity.map_embed_url ? (
                <>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">Lokasi Kegiatan</h2>
                    <div className="mt-3 h-1 w-16 rounded gradient-primary" />
                  </div>
                  <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                    <iframe
                      src={activity.map_embed_url}
                      className="h-[420px] w-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title={`${activity.title} — lokasi kegiatan`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                    <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  <p className="text-sm">Lokasi kegiatan belum tersedia.</p>
                </div>
              )}

              {activity.image && (
                <div className="mt-6 max-w-xs overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <img src={activity.image} alt={`Poster ${activity.title}`} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Informasi</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                {activity.activity_date && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Tanggal</p>
                      <p>{formatDateIndo(activity.activity_date)}</p>
                    </div>
                  </div>
                )}

                {activity.start_time && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6v6l4 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Pukul</p>
                      <p>{activity.start_time} WIB</p>
                    </div>
                  </div>
                )}

                {activity.location && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Lokasi</p>
                      <p>{activity.location}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {!isFull && (
                  <RegistrationForm
                    registrableType="activity"
                    registrableId={activity.id}
                    registrableTitle={activity.title}
                    buttonClass="w-full"
                  />
                )}
                <Link
                  href="/activities"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 px-4 py-3 font-semibold text-brand-600 transition hover:bg-brand-100"
                >
                  Lihat Semua Kegiatan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
