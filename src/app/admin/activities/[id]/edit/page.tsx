'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const [activity, setActivity] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/activities/${params.id}`).then((r) => r.json()).then(setActivity);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch(`/api/admin/activities/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          description: form.get('description'),
          activity_date: form.get('activity_date') || null,
          start_time: form.get('start_time') || null,
          location: form.get('location') || null,
          quota: form.get('quota') ? Number(form.get('quota')) : null,
          map_embed_url: form.get('map_embed_url') || null,
          drive_link: form.get('drive_link') || null,
        }),
      });
      if (!response.ok) { const d = await response.json(); setError(d.message); return; }
      router.push('/admin/activities');
    } catch { setError('Terjadi kesalahan.'); } finally { setSaving(false); }
  };

  if (!activity) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Edit Kegiatan</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul *</label>
          <input type="text" name="title" required defaultValue={activity.title} className="input-field mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi</label>
          <textarea name="description" rows={3} defaultValue={activity.description || ''} className="input-field mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
            <input type="date" name="activity_date" defaultValue={activity.activity_date || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jam Mulai</label>
            <input type="time" name="start_time" defaultValue={activity.start_time || ''} className="input-field mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi</label>
            <input type="text" name="location" defaultValue={activity.location || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kuota</label>
            <input type="number" name="quota" min="1" defaultValue={activity.quota || ''} className="input-field mt-1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Google Maps Embed URL</label>
          <input type="url" name="map_embed_url" defaultValue={activity.map_embed_url || ''} className="input-field mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Drive Link</label>
          <input type="url" name="drive_link" defaultValue={activity.drive_link || ''} className="input-field mt-1" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
