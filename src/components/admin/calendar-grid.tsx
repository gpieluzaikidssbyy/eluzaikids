'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

export type EventColor = 'blue' | 'amber' | 'red';

export interface CalendarEventItem {
  id: string;
  type: 'event' | 'activity' | 'internal';
  title: string;
  date: Date;
  time?: string;
  location?: string;
  href: string;
  rawId?: number;
}

interface ApiEvent {
  id: number;
  title: string;
  tema?: string | null;
  event_date: string;
  start_time?: string | null;
  location?: string | null;
}

interface ApiActivity {
  id: number;
  title: string;
  activity_date: string;
  start_time?: string | null;
  location?: string | null;
}

interface ApiInternalEvent {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  start_time?: string | null;
}

const TYPE_TO_COLOR: Record<string, EventColor> = {
  event: 'blue',
  activity: 'amber',
  internal: 'red',
};

export const colorStyles: Record<EventColor, { bg: string; text: string; dot: string }> = {
  blue: { bg: 'bg-[#ECF3FF] text-[#465FFF]', text: 'text-[#465FFF]', dot: 'bg-[#465FFF]' },
  amber: { bg: 'bg-amber-500/10 text-amber-500', text: 'text-amber-500', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
};

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/* ─── Helpers ─── */

function parseLocalDate(value: string) {
  // Values look like "2026-09-07T00:00:00+07:00" or "2026-09-07"
  const datePart = value.slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export async function fetchCalendarItems(): Promise<CalendarEventItem[]> {
  const [eventList, activityList, internalList] = await Promise.all([
    fetch('/api/admin/events').then((r) => r.json()),
    fetch('/api/admin/activities').then((r) => r.json()),
    fetch('/api/admin/calendar-events').then((r) => r.json()).catch(() => []),
  ]);

  return [
    ...(Array.isArray(eventList) ? eventList : []).map((e: ApiEvent) => ({
      id: `event-${e.id}`,
      type: 'event' as const,
      title: e.title,
      date: parseLocalDate(e.event_date || ''),
      time: e.start_time?.slice(0, 5) || undefined,
      location: e.location || undefined,
      href: `/admin/events/${e.id}`,
    })),
    ...(Array.isArray(activityList) ? activityList : []).map((a: ApiActivity) => ({
      id: `activity-${a.id}`,
      type: 'activity' as const,
      title: a.title,
      date: parseLocalDate(a.activity_date || ''),
      time: a.start_time?.slice(0, 5) || undefined,
      location: a.location || undefined,
      href: `/admin/activities/${a.id}`,
    })),
    ...(Array.isArray(internalList) ? internalList : []).map((a: ApiInternalEvent) => ({
      id: `internal-${a.id}`,
      type: 'internal' as const,
      title: a.title,
      date: parseLocalDate(a.event_date || ''),
      time: a.start_time?.slice(0, 5) || undefined,
      href: '',
      rawId: a.id,
    })),
  ];
}

/* ─── Component ─── */

interface CalendarGridProps {
  events: CalendarEventItem[];
  loading?: boolean;
  viewDate?: { year: number; month: number };
  onViewDateChange?: (viewDate: { year: number; month: number }) => void;
  onSelectDay?: (year: number, month: number, day: number) => void;
  onInternalClick?: (event: CalendarEventItem) => void;
  toolbarAction?: React.ReactNode;
}

export function CalendarGrid({ events, loading, viewDate, onViewDateChange, onSelectDay, onInternalClick, toolbarAction }: CalendarGridProps) {
  const today = new Date();

  const [internalViewDate, setInternalViewDate] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const current = viewDate ?? internalViewDate;

  const setViewDate = (next: { year: number; month: number }) => {
    if (onViewDateChange) onViewDateChange(next);
    setInternalViewDate(next);
  };

  const navigate = (delta: number) => {
    setViewDate((() => {
      const d = new Date(current.year, current.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    })());
  };

  /* Build the month grid */
  const cells = useMemo(() => {
    const first = new Date(current.year, current.month, 1);
    const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday-first
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const cellsList: Array<{ day: number; month: number; year: number; inMonth: boolean }> = [];
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(current.year, current.month, -startOffset + i + 1);
      cellsList.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cellsList.push({ day, month: current.month, year: current.year, inMonth: true });
    }
    while (cellsList.length % 7 !== 0) {
      const last = cellsList[cellsList.length - 1];
      const d = new Date(last.year, last.month, last.day + 1);
      cellsList.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), inMonth: false });
    }
    return cellsList;
  }, [current]);

  const dayEvents = (year: number, month: number, day: number) =>
    events.filter((e) => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === day);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Bulan sebelumnya"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Bulan berikutnya"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <h2 className="text-sm font-bold text-foreground sm:text-base md:font-display">
            {MONTH_NAMES[current.month]} {current.year}
          </h2>
        </div>
        {toolbarAction}
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-0.5 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:py-2 sm:text-[10px] md:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground sm:h-96">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Memuat jadwal...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const evts = dayEvents(cell.year, cell.month, cell.day);
            const isToday =
              cell.day === today.getDate() &&
              cell.month === today.getMonth() &&
              cell.year === today.getFullYear();
            const clickable = onSelectDay && cell.inMonth;
            return (
              <div
                key={i}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() => clickable && onSelectDay!(cell.year, cell.month, cell.day)}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectDay!(cell.year, cell.month, cell.day);
                  }
                }}
                className={cn(
                  'min-h-[3rem] border-b border-r border-border/60 p-0.5 last:border-r-0 sm:min-h-[5.5rem] sm:p-1.5 md:min-h-[6.5rem] md:p-2',
                  (i + 1) % 7 === 0 && 'border-r-0',
                  !cell.inMonth && 'bg-muted/30',
                  clickable && 'cursor-pointer transition-colors hover:bg-muted/40'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium sm:h-6 sm:w-6 sm:text-xs',
                    isToday
                      ? 'bg-[#465FFF] text-white'
                      : cell.inMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                  )}
                >
                  {cell.day}
                </span>
                <div className="mt-0.5 space-y-0.5 sm:mt-1 sm:space-y-1">
                  {evts.slice(0, 2).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      title={e.type === 'internal' ? `${e.title} (Agenda)` : e.title}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        // Do not navigate directly from the grid: pressing a date
                        // (or its chip) opens the day-list popup instead. Direct
                        // links stay only where no day popup exists (dashboard).
                        if (onSelectDay) {
                          onSelectDay(cell.year, cell.month, cell.day);
                        } else if (e.type === 'internal') {
                          onInternalClick?.(e);
                        } else {
                          window.location.href = e.href;
                        }
                      }}
                      className={cn(
                        'block w-full truncate rounded px-1 py-px text-[8px] font-medium transition-opacity hover:opacity-80 sm:px-1.5 sm:py-0.5 sm:text-[10px] md:text-[11px]',
                        colorStyles[TYPE_TO_COLOR[e.type]].bg,
                        colorStyles[TYPE_TO_COLOR[e.type]].text
                      )}
                    >
                      {e.time ? `${e.time} · ` : ''}{e.title}
                    </button>
                  ))}
                  {evts.length > 2 && (
                    <p className="px-0.5 text-[8px] font-semibold text-muted-foreground sm:px-1 sm:text-[10px]">
                      +{evts.length - 2} lainnya
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}