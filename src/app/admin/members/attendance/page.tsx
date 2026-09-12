'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, ChevronRight } from 'lucide-react';
import { MEMBER_CLASSES, CLASS_STYLES } from '@/lib/helpers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { ClassAvatar } from '@/components/ClassAvatar';

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
                    <ClassAvatar memberClass={memberClass} className="h-11 w-11" />
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-display text-lg font-bold text-foreground">{memberClass}</p>
                  <span className={cn('mt-2 block text-xs font-semibold', style.badgeText)}>Buka form presensi</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
