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
    { label: 'Event', value: stats.events, href: '/admin/events', color: 'from-blue-500 to-blue-600' },
    { label: 'Kegiatan', value: stats.activities, href: '/admin/activities', color: 'from-amber-500 to-orange-500' },
    { label: 'Pendaftar Event', value: stats.eventRegistrations, href: '/admin/registrants/events', color: 'from-green-500 to-green-600' },
    { label: 'Pendaftar Kegiatan', value: stats.activityRegistrations, href: '/admin/registrants/activities', color: 'from-purple-500 to-purple-600' },
    { label: 'Anggota', value: stats.members, href: '/admin/members', color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ringkasan data GPI Eluzai Kids</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white text-lg`}>
              📊
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Akses Cepat</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/admin/events/create', label: 'Tambah Event', icon: '➕' },
            { href: '/admin/activities/create', label: 'Tambah Kegiatan', icon: '➕' },
            { href: '/admin/schedules/create', label: 'Tambah Jadwal', icon: '➕' },
            { href: '/admin/members/create', label: 'Tambah Anggota', icon: '➕' },
            { href: '/admin/presensi/events', label: 'Presensi Event', icon: '✅' },
            { href: '/admin/presensi/activities', label: 'Presensi Kegiatan', icon: '✅' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
