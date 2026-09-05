'use client';

import { useEffect, useState } from 'react';
import type { ChurchInfo } from '@/lib/types';

export default function ContactPage() {
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);

  useEffect(() => {
    fetch('/api/church-info')
      .then((r) => r.json())
      .then(setChurchInfo);
  }, []);

  const contacts = churchInfo
    ? [
        {
          key: 'whatsapp',
          label: 'WhatsApp',
          url: churchInfo.whatsapp
            ? `https://wa.me/${churchInfo.whatsapp.replace(/\D/g, '')}`
            : null,
          color: 'from-green-500 to-green-600',
          icon: (
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          ),
        },
        {
          key: 'instagram',
          label: 'Instagram',
          url: churchInfo.instagram_url,
          color: 'from-pink-500 to-purple-600',
          icon: (
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          ),
        },
        {
          key: 'youtube',
          label: 'YouTube',
          url: churchInfo.youtube_url,
          color: 'from-red-500 to-red-600',
          icon: (
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          ),
        },
        {
          key: 'email',
          label: 'Email',
          url: churchInfo.email ? `mailto:${churchInfo.email}` : null,
          color: 'from-blue-500 to-blue-600',
          icon: (
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Kontak Kami</h1>
          <p className="mt-2 text-white/80">Hubungi kami melalui media sosial</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((contact) => (
            <a
              key={contact.key}
              href={contact.url || '#'}
              target={contact.url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 ${!contact.url ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${contact.color} text-white shadow-md`}>
                {contact.icon}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {contact.label}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {contact.url ? 'Klik untuk terhubung' : 'Segera hadir'}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2 dark:text-brand-400">
                Kunjungi
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        {churchInfo?.address && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
