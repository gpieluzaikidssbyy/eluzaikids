'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ListChecks, Download, Loader2, Users } from 'lucide-react';
import { MEMBER_CLASSES, CLASS_STYLES, formatDateIndo } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';
import { EmptyState } from '@/components/admin/empty-state';

interface AttendanceSummary {
  total: number;
  present: number;
  hasAttendance: boolean;
}

export default function ManageAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summaries, setSummaries] = useState<Record<string, AttendanceSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const results = await Promise.all(
        MEMBER_CLASSES.map(async (memberClass) => {
          const response = await fetch(`/api/admin/member-attendance?class=${encodeURIComponent(memberClass)}&date=${date}`);
          const data = await response.json();
          const members = data.members || [];
          return [
            memberClass,
            {
              total: members.length,
              present: members.filter((member: { is_present: boolean }) => member.is_present).length,
              hasAttendance: data.hasAttendance === true,
            },
          ] as const;
        }),
      );
      setSummaries(Object.fromEntries(results));
      setLoading(false);
    };

    void load();
  }, [date]);

  const exportClass = (memberClass: string) => {
    window.location.href = `/api/admin/member-attendance/export?class=${encodeURIComponent(memberClass)}&date=${date}`;
  };

  const exportAll = () => {
    window.location.href = `/api/admin/member-attendance/export?date=${date}`;
  };

  const classesWithAttendance = MEMBER_CLASSES.filter((memberClass) => summaries[memberClass]?.hasAttendance);
  const totalPresent = classesWithAttendance.reduce((sum, memberClass) => sum + (summaries[memberClass]?.present || 0), 0);
  const totalMembers = classesWithAttendance.reduce((sum, memberClass) => sum + (summaries[memberClass]?.total || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<ListChecks className="h-6 w-6" />}
        title="Manage Attendance"
        description="Rekap kehadiran anak per kelas dan tanggal."
        backHref="/admin/members"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <Card className="rounded-xl border border-border/60 shadow-card">
          <CardContent className="flex flex-col justify-between gap-4 pt-6 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="manage-date">Tanggal presensi</Label>
                <Input
                  id="manage-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="max-w-xs"
                />
              </div>
              {!loading && classesWithAttendance.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-bold">{totalPresent}</span> dari <span className="font-bold">{totalMembers}</span> anak hadir pada {formatDateIndo(date)}
                  </span>
                </div>
              )}
            </div>
            <Button type="button" onClick={exportAll} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <Loading />
      ) : classesWithAttendance.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Belum ada data presensi"
          description="Tidak ada kelas yang memiliki data presensi pada tanggal ini."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classesWithAttendance.map((memberClass, i) => {
            const summary = summaries[memberClass];
            const style = CLASS_STYLES[memberClass];
            const percent = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
            return (
              <motion.div
                key={memberClass}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 + i * 0.06 }}
                className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-md"
              >
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', style.bar)} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">{memberClass}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateIndo(date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportClass(memberClass)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success transition-colors hover:bg-success/20"
                    aria-label={`Download rekap kehadiran ${memberClass}`}
                    title="Export as Excel"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-3xl font-bold tracking-tight text-foreground">{summary.present}<span className="text-base font-semibold text-muted-foreground">/{summary.total}</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">anak hadir</p>
                  </div>
                  <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', style.badge)}>{percent}%</span>
                </div>
                <div className="mt-4">
                  <Progress value={percent} className="h-2" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
