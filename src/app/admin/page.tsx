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

const iconClass = 'h-5 w-5';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => setUsername(d.user?.username || d.user?.name || 'Admin'));
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
    {
      label: 'Event',
      value: stats.events,
      href: '/admin/events',
      icon: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: 'Kegiatan',
      value: stats.activities,
      href: '/admin/activities',
      icon: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Pendaftar Event',
      value: stats.eventRegistrations,
      href: '/admin/registrants/events',
      icon: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="8" r="4" />
          <path d="M2 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      ),
    },
    {
      label: 'Pendaftar Kegiatan',
      value: stats.activityRegistrations,
      href: '/admin/registrants/activities',
      icon: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="4" width="14" height="18" rx="2" />
          <path d="M9 2h6v4H9z" />
          <path d="M9 11h6M9 15h6" />
        </svg>
      ),
    },
    {
      label: 'Anggota',
      value: stats.members,
      href: '/admin/members',
      icon: (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Selamat datang kembali, {username}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ringkasan kegiatan</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pantau pendaftaran, kegiatan, dan kehadiran dari satu tempat.</p>
        </div>
        <Link href="/admin/events/create" className="btn-primary self-start sm:self-auto">Tambah event <span aria-hidden="true">+</span></Link>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex min-h-[170px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
              {card.icon}
            </div>
            <p className="mt-auto pt-6 font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}