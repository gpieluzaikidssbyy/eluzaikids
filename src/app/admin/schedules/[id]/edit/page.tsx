'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Save, Pencil, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { WEEKDAYS } from '@/lib/helpers';

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const [schedule, setSchedule] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/schedules').then((r) => r.json()).then((data) => {
      setSchedule(data.find((s: any) => String(s.id) === String(params.id)));
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch(`/api/admin/schedules/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: form.get('day'),
        time: form.get('time'),
        type: form.get('type'),
        description: form.get('description') || null,
        show_schedule: form.get('show_schedule') === 'true',
      }),
    });
    router.push('/admin/schedules');
  };

  if (!schedule) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <PageHeader
        icon={<Pencil className="h-6 w-6" />}
        title="Edit Jadwal"
        description="Ubah informasi jadwal ibadah atau latihan."
        backHref="/admin/schedules"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Ubah Data Jadwal</CardTitle>
              <CardDescription>Perbarui informasi jadwal sesuai kebutuhan.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="day" className="field-label">Hari <span className="text-destructive">*</span></Label>
                <Select id="day" name="day" required defaultValue={schedule.day} className="rounded-lg">
                  {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="field-label">Ada / Tidak ada</Label>
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="show_schedule"
                      value="true"
                      defaultChecked={schedule.show_schedule !== false}
                      className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                      onChange={() => {}}
                    />
                    <span className="text-sm font-medium">Ada</span>
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="show_schedule"
                      value="false"
                      defaultChecked={schedule.show_schedule === false}
                      className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                      onChange={() => {}}
                    />
                    <span className="text-sm font-medium">Tidak ada</span>
                  </Label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time" className="field-label">Jam <span className="text-destructive">*</span></Label>
                  <Input type="time" id="time" name="time" required defaultValue={schedule.time?.slice(0, 5)} className="rounded-lg" disabled={schedule.show_schedule === false} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="field-label">Tipe <span className="text-destructive">*</span></Label>
                  <Select id="type" name="type" required defaultValue={schedule.type} className="rounded-lg">
                    <option value="Ibadah">Ibadah</option>
                    <option value="Latihan">Latihan</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show_schedule" className="field-label">Tampilkan di Website</Label>
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="show_schedule" value="true" defaultChecked={schedule.show_schedule !== false} className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                    <span>Ada</span>
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="show_schedule" value="false" defaultChecked={schedule.show_schedule === false} className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                    <span>Tidak ada</span>
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {schedule.show_schedule !== false ? 'Jadwal ini ditampilkan di website.' : 'Jadwal ini disembunyikan dari website.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="field-label">Deskripsi</Label>
                <Textarea id="description" name="description" rows={2} defaultValue={schedule.description || ''} className="rounded-lg" />
                <p className="text-xs text-muted-foreground">Informasi tambahan untuk pengunjung website.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="rounded-lg">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}