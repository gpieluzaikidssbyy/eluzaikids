'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
        show_schedule: schedule?.show_schedule ?? true,
      }),
    });
    router.push('/admin/schedules');
  };

  if (!schedule) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Edit Jadwal</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Hari *</label>
          <select name="day" required defaultValue={schedule.day} className="input-field mt-1">
            {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Jam *</label>
            <input type="time" name="time" required defaultValue={schedule.time?.slice(0, 5)} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipe *</label>
            <select name="type" required defaultValue={schedule.type} className="input-field mt-1">
              <option value="Ibadah">Ibadah</option>
              <option value="Latihan">Latihan</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
          <textarea name="description" rows={2} defaultValue={schedule.description || ''} className="input-field mt-1" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
