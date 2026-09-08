'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock, Loader2, Link2, Pencil, Trash2, NotepadText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CalendarGrid, fetchCalendarItems, MONTH_NAMES, colorStyles, type CalendarEventItem, type EventColor } from '@/components/admin/calendar-grid';
import { toast } from 'sonner';

function toDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatFullDate(d: { year: number; month: number; day: number }) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(d.year, d.month, d.day));
}

function typeColorOf(e: CalendarEventItem) {
  return colorStyles[e.type === 'event' ? 'blue' : e.type === 'activity' ? 'amber' : 'red'];
}

function typeLabelOf(e: CalendarEventItem) {
  return e.type === 'event' ? 'Event' : e.type === 'activity' ? 'Kegiatan' : 'Agenda';
}

export default function AdminCalendarPage() {
  const today = new Date();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewDate, setViewDate] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });

  /* Day list dialog state */
  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);

  /* Agenda dialog state */
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [agendaEditId, setAgendaEditId] = useState<number | null>(null);
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDescription, setAgendaDescription] = useState('');
  const [agendaDate, setAgendaDate] = useState(toDateInput(today));
  const [agendaTime, setAgendaTime] = useState('');
  const [agendaSaving, setAgendaSaving] = useState(false);
  const [agendaDeleting, setAgendaDeleting] = useState(false);

  const load = useCallback(() => {
    fetchCalendarItems()
      .then((items) => {
        setEvents(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goToday = () => setViewDate({ year: today.getFullYear(), month: today.getMonth() });

  const selectedEvents = useMemo(
    () =>
      events
        .filter((e) => e.date.getFullYear() === viewDate.year && e.date.getMonth() === viewDate.month)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events, viewDate]
  );

  const onDateClick = (year: number, month: number, day: number) => {
    setSelectedDay({ year, month, day });
    setDayOpen(true);
  };

  const closeDay = () => {
    setDayOpen(false);
    setSelectedDay(null);
  };

  const openCreate = (year: number, month: number, day: number) => {
    setAgendaEditId(null);
    setAgendaTitle('');
    setAgendaDescription('');
    setAgendaDate(toDateInput(new Date(year, month, day)));
    setAgendaTime('');
    setAgendaOpen(true);
  };

  const openEdit = (e: CalendarEventItem) => {
    if (e.type !== 'internal' || e.rawId == null) return;
    setAgendaEditId(e.rawId);
    setAgendaTitle(e.title);
    setAgendaDescription('');
    setAgendaDate(toDateInput(e.date));
    setAgendaTime(e.time || '');
    setAgendaOpen(true);
  };

  const openCreateFromDay = () => {
    if (!selectedDay) return;
    closeDay();
    openCreate(selectedDay.year, selectedDay.month, selectedDay.day);
  };

  const handleDayItemClick = (e: CalendarEventItem) => {
    if (e.type === 'internal') {
      closeDay();
      openEdit(e);
    } else if (e.href) {
      window.location.href = e.href;
    }
  };

  const dayItems = useMemo(() => {
    if (!selectedDay) return [];
    return events
      .filter(
        (e) =>
          e.date.getFullYear() === selectedDay.year &&
          e.date.getMonth() === selectedDay.month &&
          e.date.getDate() === selectedDay.day
      )
      .sort((a, b) => {
        const at = a.time ?? '99:99';
        const bt = b.time ?? '99:99';
        return at.localeCompare(bt);
      });
  }, [events, selectedDay]);

  const handleSave = async () => {
    const trimmed = agendaTitle.trim();
    if (!trimmed) {
      toast.error('Judul agenda wajib diisi.');
      return;
    }
    if (!agendaDate) {
      toast.error('Tanggal wajib diisi.');
      return;
    }
    setAgendaSaving(true);
    const res = await fetch(
      agendaEditId != null ? `/api/admin/calendar-events/${agendaEditId}` : '/api/admin/calendar-events',
      {
        method: agendaEditId != null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          description: agendaDescription.trim() || null,
          event_date: agendaDate,
          start_time: agendaTime || null,
        }),
      }
    );
    const data = await res.json();
    setAgendaSaving(false);
    if (!res.ok) {
      toast.error(data.message || 'Gagal menyimpan agenda.');
      return;
    }
    toast.success(agendaEditId != null ? 'Agenda berhasil diperbarui.' : 'Agenda berhasil ditambahkan.');
    setAgendaOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (agendaEditId == null) return;
    setAgendaDeleting(true);
    const res = await fetch(`/api/admin/calendar-events/${agendaEditId}`, { method: 'DELETE' });
    setAgendaDeleting(false);
    if (!res.ok) {
      toast.error('Gagal menghapus agenda.');
      return;
    }
    toast.success('Agenda berhasil dihapus.');
    setAgendaOpen(false);
    load();
  };

  const closeAgenda = () => {
    if (agendaSaving) return;
    setAgendaOpen(false);
    setAgendaEditId(null);
  };

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
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Jadwal kegiatan, event, dan agenda dalam tampilan bulanan.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday} className="rounded-lg">
            Hari ini
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Month grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="lg:col-span-2"
        >
          <CalendarGrid
            events={events}
            loading={loading}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            onSelectDay={onDateClick}
            onInternalClick={openEdit}
          />
        </motion.div>

        {/* ─── Event list sidebar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-display text-base font-bold text-foreground">Jadwal Bulan Ini</h3>
              <p className="text-xs text-muted-foreground">{MONTH_NAMES[viewDate.month]} {viewDate.year}</p>
            </div>
            <div className="max-h-[32rem] divide-y divide-border/60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Memuat...
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Belum ada jadwal bulan ini.</p>
                </div>
              ) : (
                selectedEvents.map((e) =>
                  e.type === 'internal' ? (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => openEdit(e)}
                      className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', typeColorOf(e).dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                          <Badge className="shrink-0 rounded-full bg-red-500/10 px-2 py-0 text-[10px] text-red-600 dark:text-red-400">
                            Agenda
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {e.date.getDate()} {MONTH_NAMES[e.date.getMonth()]}
                          </span>
                          {e.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {e.time}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50">
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ) : (
                    <a key={e.id} href={e.href} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/50">
                      <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', typeColorOf(e).dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                          <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0 text-[10px]">
                            {typeLabelOf(e)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {e.date.getDate()} {MONTH_NAMES[e.date.getMonth()]}
                          </span>
                          {e.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {e.time}
                            </span>
                          )}
                          {e.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {e.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors group-hover:text-primary">
                        <Link2 className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  )
                )
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Kategori</h4>
              <span className="text-xs text-muted-foreground">{selectedEvents.length} jadwal</span>
            </div>
            <div className="mt-3 space-y-2">
              {(
                [
                  { type: 'event' as const, label: 'Event', color: 'blue' },
                  { type: 'activity' as const, label: 'Kegiatan', color: 'amber' },
                  { type: 'internal' as const, label: 'Agenda', color: 'red' },
                ] as const
              ).map(({ type, label, color }) => {
                const count = selectedEvents.filter((e) => e.type === type).length;
                const style = colorStyles[color as EventColor];
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', style.dot)} />
                      {label}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', style.bg, style.text)}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Day list dialog ─── */}
      <AlertDialog open={dayOpen} onOpenChange={(open) => !open && closeDay()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedDay ? formatFullDate(selectedDay) : ''}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto">
            {dayItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Tidak ada jadwal pada tanggal ini.</p>
              </div>
            ) : (
              dayItems.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleDayItemClick(e)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-background/60 p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', typeColorOf(e).dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                      {e.type === 'internal' ? (
                        <Badge className="shrink-0 rounded-full bg-red-500/10 px-2 py-0 text-[10px] text-red-600 dark:text-red-400">
                          Agenda
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0 text-[10px]">
                          {typeLabelOf(e)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {e.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {e.time}
                        </span>
                      )}
                      {e.location && <span className="flex items-center gap-1">{e.location}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <AlertDialogFooter className="sm:justify-between">
            <span />
            <div className="flex gap-2">
              <AlertDialogCancel disabled={agendaSaving}>Tutup</AlertDialogCancel>
              <Button type="button" className="rounded-lg" onClick={openCreateFromDay}>
                <NotepadText className="h-4 w-4" />
                Tambah Agenda
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Agenda dialog ─── */}
      <AlertDialog open={agendaOpen} onOpenChange={(open) => !open && closeAgenda()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{agendaEditId != null ? 'Edit Agenda' : 'Tambah Agenda'}</AlertDialogTitle>
          </AlertDialogHeader>
          <form
            id="agenda-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="agenda-title">Judul <span className="text-destructive">*</span></Label>
              <Input
                id="agenda-title"
                value={agendaTitle}
                onChange={(e) => setAgendaTitle(e.target.value.slice(0, 255))}
                maxLength={255}
                required
                placeholder="Contoh: Rapat Panitia Natal 2026, Doa Bersama"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agenda-date">Tanggal <span className="text-destructive">*</span></Label>
              <Input
                id="agenda-date"
                type="date"
                value={agendaDate}
                onChange={(e) => setAgendaDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agenda-time">Jam <span className="text-destructive">*</span></Label>
              <Input
                id="agenda-time"
                type="time"
                value={agendaTime}
                onChange={(e) => setAgendaTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agenda-desc">Catatan (opsional)</Label>
              <Textarea
                id="agenda-desc"
                value={agendaDescription}
                onChange={(e) => setAgendaDescription(e.target.value)}
                rows={3}
                placeholder="Detail acara, agenda pembahasan, dsb."
                className="rounded-lg"
              />
            </div>
          </form>
          <AlertDialogFooter className="sm:justify-between">
            {agendaEditId != null ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => void handleDelete()}
                disabled={agendaDeleting}
              >
                {agendaDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Hapus
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <AlertDialogCancel disabled={agendaSaving}>Batal</AlertDialogCancel>
              <AlertDialogAction type="submit" form="agenda-form" disabled={agendaSaving}>
                {agendaSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}