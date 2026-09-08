'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/empty-state';

export default function AdminRegistrantEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);

  useEffect(() => {
    fetch('/api/admin/events').then((r) => r.json()).then(setEvents);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Pendaftar Event"
        description="Pilih event untuk melihat daftar pendaftarnya."
      />

      {!events.length ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada event"
          description="Event yang tersedia akan muncul di sini."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (i % 6) }}
            >
              <Link
                href={`/admin/registrants/events/${event.id}`}
                className="group block rounded-xl border border-border/60 bg-card p-6 shadow-card transition duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground">{event.title}</h3>
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{formatDateIndo(event.event_date)}</p>
                {event.location && <p className="mt-1 truncate text-xs text-muted-foreground/70">{event.location}</p>}
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
