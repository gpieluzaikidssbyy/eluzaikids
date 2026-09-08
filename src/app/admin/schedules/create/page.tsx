'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Save, Plus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { WEEKDAYS } from '@/lib/helpers';

export default function CreateSchedulePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch('/api/admin/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: form.get('day'),
        time: form.get('time'),
        type: form.get('type'),
        description: form.get('description') || null,
        show_schedule: true,
      }),
    });
    router.push('/admin/schedules');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <PageHeader
        icon={<Plus className="h-6 w-6" />}
        title="Tambah Jadwal"
        description="Isi informasi jadwal ibadah atau latihan."
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
              <CardTitle className="text-lg">Formulir Jadwal Baru</CardTitle>
              <CardDescription>Lengkapi data jadwal di bawah ini.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="day" className="field-label">Hari <span className="text-destructive">*</span></Label>
                <Select id="day" name="day" required className="rounded-lg">
                  {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time" className="field-label">Jam <span className="text-destructive">*</span></Label>
                  <Input type="time" id="time" name="time" required className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="field-label">Tipe <span className="text-destructive">*</span></Label>
                  <Select id="type" name="type" required className="rounded-lg">
                    <option value="Ibadah">Ibadah</option>
                    <option value="Latihan">Latihan</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="field-label">Deskripsi</Label>
                <Textarea id="description" name="description" rows={2} className="rounded-lg" />
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