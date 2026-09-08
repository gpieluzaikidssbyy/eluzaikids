'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, ChevronRight } from 'lucide-react';
import { MEMBER_CLASSES } from '@/lib/helpers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';

const CLASS_STYLES: Record<string, { hover: string; badge: string; icon: string }> = {
  Baby: { hover: 'hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300', icon: 'bg-pink-100 text-pink-600 dark:bg-pink-950/40' },
  Samuel: { hover: 'hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40' },
  Yosua: { hover: 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' },
  Musa: { hover: 'hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40' },
};

export default function ChildsAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<CalendarCheck className="h-6 w-6" />}
        title="Childs Attendance"
        description="Pilih tanggal, lalu pilih kelas untuk membuka form presensi."
        backHref="/admin/members"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <Card className="rounded-xl border border-border/60 shadow-card">
          <CardContent className="flex flex-col justify-between gap-4 pt-6 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="attendance-date">Tanggal presensi</Label>
              <Input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="max-w-xs"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Presensi untuk <span className="font-semibold text-foreground">{new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Pilih Kelas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_CLASSES.map((memberClass, i) => {
            const style = CLASS_STYLES[memberClass];
            return (
              <motion.div
                key={memberClass}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 + i * 0.06 }}
              >
                <Link
                  href={`/admin/members/attendance/form/${date}/${encodeURIComponent(memberClass)}`}
                  className={cn(
                    'group relative block overflow-hidden rounded-xl border-2 border-border bg-card p-5 text-left shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-md',
                    style.hover
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', style.icon)}>
                      <Users className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-display text-lg font-bold text-foreground">{memberClass}</p>
                  <span className={cn('mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', style.badge)}>Buka form presensi</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
