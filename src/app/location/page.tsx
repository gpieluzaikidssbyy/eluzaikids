'use client';

import { useEffect, useState } from 'react';
import type { ChurchInfo } from '@/lib/types';

export default function LocationPage() {
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);

  useEffect(() => {
    fetch('/api/church-info')
      .then((r) => r.json())
      .then(setChurchInfo);
  }, []);

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Lokasi Kami</h1>
          <p className="mt-2 text-white/80">Temukan lokasi GPI Eluzai Kids</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {churchInfo?.map_embed_url ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
            <iframe
              src={churchInfo.map_embed_url}
              className="h-[60vh] w-full min-h-[420px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Lokasi GPI Eluzai Kids"
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            Peta lokasi belum tersedia.
          </div>
        )}

        {churchInfo?.address && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                  <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Alamat</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{churchInfo.address}</p>
                {churchInfo.phone && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    📞 {churchInfo.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
