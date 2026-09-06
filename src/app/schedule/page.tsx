'use client';

import { useEffect, useState } from 'react';

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  type: string;
  description: string | null;
}

interface WeekDay {
  day: string;
  schedules: ScheduleItem[];
}

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function SchedulePage() {
  const [weekSchedule, setWeekSchedule] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then((r) => r.json())
      .then((data) => {
        setWeekSchedule(data.schedule || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Jadwal Ibadah</h1>
          <p className="mt-2 text-white/80">Jadwal kegiatan mingguan GPI Eluzai Kids</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weekSchedule.map((day) => (
            <div
              key={day.day}
              className="rounded-2xl border-2 border-green-500 bg-green-50 p-6 dark:bg-green-950/30"
            >
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {day.day}
              </h3>

              <div className="mt-4 space-y-3">
                {day.schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {schedule.type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {schedule.time.slice(0, 5)} WIB
                      </p>
                      {schedule.description && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
