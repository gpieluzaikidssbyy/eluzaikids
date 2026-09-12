'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock, Loader2, Link2, Pencil, NotepadText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CalendarGrid, fetchCalendarItems, MONTH_NAMES, colorStyles, type CalendarEventItem, type EventColor } from '@/components/admin/calendar-grid';
import { CalendarAgendaDialog } from '@/components/admin/calendar-agenda-dialog';

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
  const [agendaInitial, setAgendaInitial] = useState({ title: '', date: toDateInput(today), time: '' });

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
    setAgendaInitial({ title: '', date: toDateInput(new Date(year, month, day)), time: '' });
    setAgendaOpen(true);
  };

  const openEdit = (e: CalendarEventItem) => {
    if (e.type !== 'internal' || e.rawId == null) return;
    setAgendaEditId(e.rawId);
    setAgendaInitial({ title: e.title, date: toDateInput(e.date), time: e.time || '' });
    setAgendaOpen(true);
  };

  const openCreateFromDay = () => {
    if (!selectedDay) return;
    closeDay();
    openCreate(selectedDay.year, selectedDay.month, selectedDay.day);
  };

  const handleDayItemClick = (e: CalendarEventItem) => {
    // Event/activity items are display-only inside the day popup (no direct
    // navigation); only internal agendas open the edit dialog.
    if (e.type === 'internal') {
      closeDay();
      openEdit(e);
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

  const closeAgenda = () => {
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

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
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
                e.type === 'internal' ? (
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
                        <Badge className="shrink-0 rounded-full bg-red-500/10 px-2 py-0 text-[10px] text-red-600 dark:text-red-400">
                          Agenda
                        </Badge>
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
                    <Pencil className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </button>
                ) : (
                  <div
                    key={e.id}
                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-background/60 p-3 text-left"
                  >
                    <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', typeColorOf(e).dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                        <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0 text-[10px]">
                          {typeLabelOf(e)}
                        </Badge>
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
                  </div>
                )
              ))
            )}
          </div>
          <AlertDialogFooter className="mt-2 flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end sm:gap-2 sm:space-x-2">
            <span />
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <AlertDialogCancel className="mt-0 h-11 w-full sm:h-10 sm:w-auto">Tutup</AlertDialogCancel>
              <Button type="button" className="h-11 w-full justify-center rounded-lg sm:h-10 sm:w-auto" onClick={openCreateFromDay}>
                <NotepadText className="mr-2 h-4 w-4 shrink-0" />
                Tambah Agenda
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Agenda dialog ─── */}
      <CalendarAgendaDialog
        open={agendaOpen}
        editId={agendaEditId}
        initial={agendaInitial}
        onClose={closeAgenda}
        onSaved={load}
      />
    </div>
  );
}