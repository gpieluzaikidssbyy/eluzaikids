'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { CalendarDays, MapPin, ChevronRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/empty-state';

export default function AdminPresensiEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);

  useEffect(() => {
    const load = () => fetch('/api/admin/events').then((r) => r.json()).then(setEvents);
    void load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<QrCode className="h-6 w-6" />}
        title="Event Attendance"
        description="Pilih event untuk membuka daftar kehadiran dan akses scanner."
      />

      {!events.length ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada event"
          description="Event yang tersedia akan muncul di sini."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (i % 6) }}
            >
              <div className="group block rounded-xl border border-border/60 bg-card p-6 shadow-card transition duration-200 hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold leading-snug text-foreground">{event.title}</p>
                    {event.tema && <p className="mt-1 text-sm text-muted-foreground">Tema: {event.tema}</p>}
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateIndo(event.event_date)}
                    </p>
                    {event.location && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground/70">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end">
                  <Button asChild>
                    <Link href={`/admin/presensi/events/${event.id}`}>
                      Manage
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
