'use client';

import { useEffect, useState } from 'react';
import type { ChurchInfo } from '@/lib/types';

export default function LocationPage() {
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/church-info')
      .then((r) => r.json())
      .then(setChurchInfo)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Lokasi Kami</h1>
          <p className="mt-2 text-white/80">Temukan lokasi GPI Eluzai Kids</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="card overflow-hidden p-0">
              {churchInfo?.map_embed_url ? (
                <iframe
                  src={churchInfo.map_embed_url}
                  className="h-[520px] w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi GPI Eluzai Kids"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">Google Maps belum dikonfigurasi.</div>
              )}
            </div>

            <div className="card h-fit lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Visit us</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Lokasi GPI Eluzai Kids</h2>
              <div className="mt-4 h-1 w-16 rounded gradient-primary" />
              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                  <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Alamat lengkap</h3>
                  <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{churchInfo?.address || 'Alamat gereja belum tersedia.'}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-700">
                {churchInfo?.phone && <p className="text-slate-600 dark:text-slate-400">Telepon: <span className="font-medium text-slate-900 dark:text-slate-200">{churchInfo.phone}</span></p>}
                {churchInfo?.email && <p className="text-slate-600 dark:text-slate-400">Email: <span className="font-medium text-slate-900 dark:text-slate-200">{churchInfo.email}</span></p>}
                {churchInfo?.map_embed_url && <a href={churchInfo.map_embed_url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700">Buka di Google Maps <span className="ml-1">↗</span></a>}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
