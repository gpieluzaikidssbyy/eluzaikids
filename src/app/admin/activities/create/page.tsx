'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateActivityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/admin/activities', {
        method: 'POST',
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

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Gagal menyimpan.');
        return;
      }
      router.push('/admin/activities');
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tambah Kegiatan</h1>
      <p className="mt-1 text-sm text-slate-500">Lengkapi seluruh informasi kegiatan di bawah ini.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Kegiatan <span className="text-red-500">*</span></label>
          <input type="text" name="title" required className="input-field mt-1" placeholder="Contoh: Latihan Paduan Suara" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi <span className="text-red-500">*</span></label>
          <textarea name="description" rows={4} required className="input-field mt-1" placeholder="Tuliskan informasi lengkap tentang kegiatan ini." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal <span className="text-red-500">*</span></label>
            <input type="date" name="activity_date" required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jam Mulai <span className="text-red-500">*</span></label>
            <input type="time" name="start_time" required className="input-field mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi <span className="text-red-500">*</span></label>
            <input type="text" name="location" required className="input-field mt-1" placeholder="Nama gedung / alamat" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kuota <span className="text-red-500">*</span></label>
            <input type="number" name="quota" min="1" required className="input-field mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Google Maps Embed URL <span className="text-red-500">*</span></label>
            <input type="url" name="map_embed_url" required className="input-field mt-1" placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Drive Link <span className="text-red-500">*</span></label>
            <input type="url" name="drive_link" required className="input-field mt-1" placeholder="https://drive.google.com/..." />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Kegiatan'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}