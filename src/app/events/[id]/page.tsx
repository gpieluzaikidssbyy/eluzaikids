'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Event } from '@/lib/types';
import { formatDateIndo, remainingQuota } from '@/lib/helpers';
import { RegistrationForm } from '@/components/RegistrationForm';
import { BackToHome } from '@/components/BackToHome';
import { EventDetailSkeleton } from '@/components/skeletons';

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<(Event & { registrations_count: number }) | null>(null);

  useEffect(() => {
    const load = () => fetch(`/api/events/${params.id}`).then((r) => r.json()).then(setEvent);
    void load();
    // Poll less aggressively and only while the tab is visible to reduce overhead.
    const POLL_MS = 15000;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    }, POLL_MS);
    return () => window.clearInterval(interval);
  }, [params.id]);

  if (!event) {
    return <EventDetailSkeleton />;
  }

  const remaining = remainingQuota(event.quota, event.registrations_count);
  const isFull = remaining !== null && remaining <= 0;

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BackToHome />
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {formatDateIndo(event.event_date)}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{event.title}</h1>
            {event.tema && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
                Tema: {event.tema}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card">
              {event.map_embed_url ? (
                <>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                      Lokasi Acara
                    </h2>
                    <div className="mt-3 h-1 w-16 rounded gradient-primary" />
                  </div>
                  <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                    <iframe
                      src={event.map_embed_url}
                      className="h-[420px] w-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${event.title} — lokasi acara`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <svg className="h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                    <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  <p className="text-sm">Lokasi acara belum tersedia.</p>
                </div>
              )}

              {event.image && (
                <div className="mt-6 max-w-xs overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <img src={event.image} alt={`Poster ${event.title}`} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Informasi</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                {event.tema && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <path d="M7 7h.01" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Tema</p>
                      <p>{event.tema}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Tanggal</p>
                    <p>{formatDateIndo(event.event_date)}</p>
                  </div>
                </div>

                {event.open_gate && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Open Gate</p>
                      <p>{event.open_gate.slice(0, 5)} WIB</p>
                    </div>
                  </div>
                )}

                {event.start_time && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6v6l4 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Mulai Pukul</p>
                      <p>{event.start_time.slice(0, 5)} WIB</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Lokasi</p>
                      <p>{event.location}</p>
                    </div>
                  </div>
                )}

                {event.quota && isFull && (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Kuota</p>
                      <p className="font-medium text-red-600 dark:text-red-400">Kuota penuh</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {!isFull ? (
                  <RegistrationForm
                    registrableType="event"
                    registrableId={event.id}
                    registrableTitle={event.title}
                    emailEnabled={event.email_enabled !== false}
                    buttonClass="w-full"
                  />
                ) : event.drive_link ? (
                  <a
                    href={event.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Foto
                  </a>
                ) : (
                  <button type="button" disabled className="w-full cursor-not-allowed rounded-lg bg-slate-400 px-4 py-3 text-sm font-semibold text-white">
                    Foto
                  </button>
                )}
                <BackToHome variant="secondary" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
