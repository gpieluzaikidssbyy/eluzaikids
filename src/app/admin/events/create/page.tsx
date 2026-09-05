'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Gagal menyimpan.');
        return;
      }

      router.push('/admin/events');
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tambah Event</h1>
      <p className="mt-1 text-sm text-slate-500">Lengkapi seluruh informasi event di bawah ini.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Event *</label>
          <input type="text" name="title" required className="input-field mt-1" placeholder="Contoh: Family Fun Day 2026" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi *</label>
          <textarea name="description" rows={4} required className="input-field mt-1" placeholder="Tuliskan informasi lengkap tentang event ini." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Event *</label>
            <input type="date" name="event_date" required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Batas Pendaftaran *</label>
            <input type="datetime-local" name="registration_deadline" required className="input-field mt-1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Open Gate *</label>
            <input type="time" name="open_gate" required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jam Mulai *</label>
            <input type="time" name="start_time" required className="input-field mt-1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kuota *</label>
            <input type="number" name="quota" min="1" max="500" required className="input-field mt-1" />
            <p className="mt-1 text-xs text-slate-500">Maksimal 500 pendaftar.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi *</label>
            <input type="text" name="location" required className="input-field mt-1" placeholder="Nama gedung / alamat" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Google Maps Embed URL *</label>
            <input type="url" name="map_embed_url" required className="input-field mt-1" placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Drive Link *</label>
            <input type="url" name="drive_link" required className="input-field mt-1" placeholder="https://drive.google.com/..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Poster Event *</label>
          <input type="file" name="poster" required accept=".jpg,.png,.webp,image/jpeg,image/png,image/webp" className="input-field mt-1" />
          <p className="mt-1 text-xs text-slate-500">Rasio 4:5, maksimal 2 MB. Format JPG, PNG, atau WEBP.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Event'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}