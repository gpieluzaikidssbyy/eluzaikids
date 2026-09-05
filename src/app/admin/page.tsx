'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  events: number;
  activities: number;
  eventRegistrations: number;
  activityRegistrations: number;
  members: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Event', value: stats.events, href: '/admin/events', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300', accent: 'bg-blue-500' },
    { label: 'Kegiatan', value: stats.activities, href: '/admin/activities', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300', accent: 'bg-amber-500' },
    { label: 'Pendaftar Event', value: stats.eventRegistrations, href: '/admin/registrants/events', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', accent: 'bg-emerald-500' },
    { label: 'Pendaftar Kegiatan', value: stats.activityRegistrations, href: '/admin/registrants/activities', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300', accent: 'bg-violet-500' },
    { label: 'Anggota', value: stats.members, href: '/admin/members', tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300', accent: 'bg-rose-500' },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-brand-600 dark:text-brand-400">Selamat datang kembali</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ringkasan kegiatan</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pantau pendaftaran, kegiatan, dan kehadiran dari satu tempat.</p></div>
        <Link href="/admin/events/create" className="btn-primary self-start sm:self-auto">Tambah event <span aria-hidden="true">+</span></Link>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative min-h-[190px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
            <div className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${card.tone}`}>Total</div>
            <p className="mt-7 font-display text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <span className="absolute bottom-6 right-6 text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
