'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarDays, ClipboardList, Users, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/admin/loading';
import { EmptyState } from '@/components/admin/empty-state';
import { CalendarGrid, fetchCalendarItems, type CalendarEventItem } from '@/components/admin/calendar-grid';
import { DAY_NAMES, MONTH_NAMES } from '@/lib/helpers';

interface DashboardStats {
  events: number;
  activities: number;
  eventRegistrations: number;
  activityRegistrations: number;
  members: number;
}

interface EventItem {
  id: string;
  title: string;
  tema?: string | null;
  event_date: string;
  location?: string | null;
  image?: string | null;
  registrations_count?: number | null;
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => setUsername(d.user?.username || d.user?.name || 'Admin'));
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats);
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((list: EventItem[]) => {
        const sorted = [...list].sort((a, b) => (a.event_date < b.event_date ? 1 : -1));
        setEvents(sorted.slice(0, 5));
      });
    fetchCalendarItems()
      .then((items) => {
        setCalendarEvents(items);
        setCalendarLoading(false);
      })
      .catch(() => setCalendarLoading(false));
  }, []);

  if (!stats) return <Loading label="Memuat dashboard..." />;

  const kpis = [
    {
      label: 'Event',
      value: stats.events,
      icon: CalendarDays,
      tone: 'bg-[#ECF3FF] text-[#465FFF]',
      href: '/admin/events',
    },
    {
      label: 'Kegiatan',
      value: stats.activities,
      icon: ClipboardList,
      tone: 'bg-amber-500/10 text-amber-500',
      href: '/admin/activities',
    },
    {
      label: 'Anggota',
      value: stats.members,
      icon: Users,
      tone: 'bg-pink-50 text-pink-600',
      href: '/admin/members',
    },
  ];

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ─── Page header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {formatDate(today)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Selamat datang, {username} 👋
          </h1>
        </div>
      </motion.div>

      {/* ─── KPI cards ─── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon, tone, href }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
          >
            <Link
              href={href}
              className={`group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                href === '/admin/members' ? 'hover:border-pink-500/30' : 'hover:border-[#465FFF]/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-[#465FFF] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-bold tabular-nums text-foreground">{value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* ─── Calendar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <CalendarGrid
          events={calendarEvents}
          loading={calendarLoading}
          toolbarAction={
            <Button asChild variant="ghost" className="text-xs">
              <Link href="/admin/calendar">
                Lihat semua
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
      </motion.div>

      {/* ─── Recent events table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="rounded-lg border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">Event Terdekat</h2>
            <p className="text-xs text-muted-foreground">5 event dengan jadwal terdekat</p>
          </div>
          <Button asChild variant="ghost" className="text-xs">
            <Link href="/admin/events">
              Lihat semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CalendarDays}
              title="Belum ada event"
              description="Buat event pertama dan mulai kelola pendaftaran."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="table-heading">Event</th>
                  <th className="table-heading">Tanggal</th>
                  <th className="table-heading hidden md:table-cell">Lokasi</th>
                  <th className="table-heading">Pendaftar</th>
                  <th className="table-heading">Status</th>
                  <th className="table-heading text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const upcoming = event.event_date.slice(0, 10) >= today;
                  return (
                    <tr key={event.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md bg-[#ECF3FF]">
                            {event.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#465FFF]">
                                <CalendarDays className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[16rem] truncate font-medium text-foreground">{event.title}</p>
                            {event.tema && (
                              <p className="truncate text-xs text-muted-foreground">{event.tema}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{formatDate(event.event_date)}</td>
                      <td className="table-cell hidden md:table-cell">{event.location || '—'}</td>
                      <td className="table-cell">
                        <span className="font-semibold tabular-nums text-foreground">
                          {event.registrations_count || 0}
                        </span>
                      </td>
                      <td className="table-cell">
                        {upcoming ? (
                          <Badge variant="success" className="rounded-full bg-success/10 text-success">
                            Mendatang
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-full">
                            Selesai
                          </Badge>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5">
                          <Link href={`/admin/events/${event.id}`}>
                            Detail
                            <MoreHorizontal className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}