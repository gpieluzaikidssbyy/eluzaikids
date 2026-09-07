'use client';

import { useEffect, useState } from 'react';
import { BackToHome } from '@/components/BackToHome';
import { ScheduleSkeleton } from '@/components/skeletons';

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
    return <ScheduleSkeleton />;
  }

  return (
    <>
      <section className="gradient-hero py-12 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <BackToHome />
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Jadwal Ibadah</h1>
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {schedule.type}
                        </p>
                        <p className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {schedule.time.slice(0, 5)} WIB
                        </p>
                      </div>
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
