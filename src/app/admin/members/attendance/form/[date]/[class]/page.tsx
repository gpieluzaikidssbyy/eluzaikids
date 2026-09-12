'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { ClassAvatar } from '@/components/ClassAvatar';

interface AttendanceRow extends Member {
  is_present: boolean;
}

export default function ChildsAttendanceFormPage() {
  const params = useParams<{ date: string; class: string }>();
  const router = useRouter();
  const date = params.date;
  const selectedClass = decodeURIComponent(params.class);
  const [members, setMembers] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const classMembers = useMemo(() => members.filter((member) => member.class === selectedClass), [members, selectedClass]);
  const presentCount = classMembers.filter((member) => member.is_present).length;
  const totalCount = classMembers.length;
  const progressValue = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/member-attendance?class=${encodeURIComponent(selectedClass)}&date=${date}`);
      const data = await response.json();
      setMembers(data.members || []);
      setLoading(false);
    };
    void load();
  }, [date, selectedClass]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const response = await fetch('/api/admin/member-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attendance_date: date,
        attendances: classMembers.map((member) => ({
          member_id: member.id,
          is_present: member.is_present,
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      const msg = data.message || 'Gagal menyimpan presensi.';
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }

    toast.success('Presensi berhasil disimpan!');
    router.push('/admin/members/attendance');
  };

  const prevDate = (() => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const nextDate = (() => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<CheckCircle2 className="h-6 w-6" />}
        title="Form Presensi Childs"
        description={`Kelas ${selectedClass} · ${new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        backHref="/admin/members/attendance"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-3 shadow-card sm:px-6"
      >
        <Link
          href={`/admin/members/attendance/form/${prevDate}/${encodeURIComponent(selectedClass)}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">Prev</span>
        </Link>
        <span className="min-w-0 truncate text-center text-sm font-semibold text-foreground">
          {new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <Link
          href={`/admin/members/attendance/form/${nextDate}/${encodeURIComponent(selectedClass)}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
      >
        <Card className="rounded-xl border border-border/60 shadow-card">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">{presentCount}</span> dari <span className="font-semibold">{totalCount}</span> orang hadir
                </span>
              </div>
              <Badge variant="secondary">{progressValue}%</Badge>
            </div>
            <Progress value={progressValue} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="rounded-xl border border-border/60 bg-card shadow-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data...
          </div>
        ) : classMembers.length === 0 ? (
          <div className="py-24 text-center text-sm text-muted-foreground">
            Belum ada member di kelas ini.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {classMembers.map((member, index) => (
              <li
                key={member.id}
                className={cn(
                  'flex items-center gap-4 px-6 py-3.5 transition-colors',
                  member.is_present ? 'bg-success/10 hover:bg-success/15' : 'bg-destructive/10 hover:bg-destructive/15'
                )}
              >
                <span className="w-6 shrink-0 text-center text-sm text-muted-foreground">{index + 1}</span>
                <ClassAvatar memberClass={member.class} className="h-9 w-9 shrink-0" />
                <span
                  className={cn(
                    'min-w-0 flex-1 rounded-lg px-2 py-1 font-medium text-foreground',
                    member.is_present ? 'bg-success/15' : 'bg-destructive/15'
                  )}
                >
                  {member.name}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={member.is_present ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 px-3 text-xs font-medium transition-all',
                      member.is_present && 'bg-success/10 text-success hover:bg-success/20 border-success/30'
                    )}
                    onClick={() => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, is_present: true } : item))}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Hadir
                  </Button>
                  <Button
                    type="button"
                    variant={!member.is_present ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 px-3 text-xs font-medium transition-all',
                      !member.is_present && 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30'
                    )}
                    onClick={() => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, is_present: false } : item))}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Absen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.32 }}
        className="flex justify-center"
      >
        <Button type="button" onClick={() => void handleSave()} disabled={loading || saving} size="lg" className="px-8">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Simpan Presensi
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
