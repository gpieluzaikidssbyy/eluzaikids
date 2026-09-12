'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { EventForm } from '@/components/admin/event-form';
import { CalendarDays, Plus, Pencil, Trash2, Eye, Minus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [quotaUpdating, setQuotaUpdating] = useState<number | null>(null);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const updateQuota = async (event: Event & { registrations_count: number }, delta: number) => {
    const currentQuota = event.quota ?? event.registrations_count;
    const nextQuota = currentQuota + delta;
    if (nextQuota < event.registrations_count) {
      setError(`Kuota ${event.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`);
      toast.error(`Kuota ${event.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`);
      return;
    }
    setQuotaUpdating(event.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota: nextQuota }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal memperbarui kuota.');
      }
      const updated = await response.json();
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, quota: updated.quota } : item));
    } catch (quotaError) {
      const msg = quotaError instanceof Error ? quotaError.message : 'Gagal memperbarui kuota.';
      setError(msg);
      toast.error(msg);
    } finally {
      setQuotaUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        iconClassName="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        title="Manage Event"
        description="Buat event baru dan kelola jadwal yang siap ditampilkan kepada pengunjung."
        actions={
          <Button onClick={() => setShowForm((open) => !open)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Tutup form' : 'Tambah Event'}
          </Button>
        }
      />

      {showForm && (
        <EventForm
          onClose={() => setShowForm(false)}
          onSaved={fetchEvents}
          error={error}
          onError={setError}
        />
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="table-heading">Event</TableHead>
                <TableHead className="table-heading">Tanggal</TableHead>
                <TableHead className="table-heading hidden md:table-cell">Lokasi</TableHead>
                <TableHead className="table-heading">Kuota</TableHead>
                <TableHead className="table-heading">Status</TableHead>
                <TableHead className="table-heading text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => {
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = (event.event_date || '').slice(0, 10) >= today;
                return (
                  <TableRow key={event.id} className="hover:bg-muted/30">
                    <TableCell className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[#ECF3FF]">
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
                          <div className="truncate font-semibold text-foreground">{event.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{index + 1}. {event.tema || 'Tanpa tema'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">
                      <div className="font-medium text-foreground">{formatDateIndo(event.event_date)}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {event.open_gate?.slice(0, 5) && `Buka ${event.open_gate?.slice(0, 5)}`}
                        {event.start_time?.slice(0, 5) && ` · Mulai ${event.start_time?.slice(0, 5)}`}
                      </div>
                    </TableCell>
                    <TableCell className="table-cell hidden md:table-cell">{event.location || '-'}</TableCell>
                    <TableCell className="table-cell">
                      <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === event.id || event.quota === null || (event.quota ?? 0) <= event.registrations_count}
                          onClick={() => void updateQuota(event, -1)}
                          aria-label={`Kurangi kuota ${event.title}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold text-foreground">{event.quota ?? '∞'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === event.id}
                          onClick={() => void updateQuota(event, 1)}
                          aria-label={`Tambah kuota ${event.title}`}
                        >
                          {quotaUpdating === event.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{event.registrations_count} terdaftar</p>
                    </TableCell>
                    <TableCell className="table-cell">
                      {upcoming ? (
                        <Badge variant="success" className="rounded-full bg-success/10 text-success">
                          Mendatang
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          Selesai
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="table-cell text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/admin/events/${event.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/40">
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Hapus event ini?"
                          description="Tindakan ini tidak dapat dibatalkan."
                          onConfirm={() => void handleDelete(event.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!events.length && (
            <EmptyState
              icon={CalendarDays}
              title="Belum ada event"
              description="Mulai dengan membuat event baru."
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
