'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/events/${params.id}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          tema: form.get('tema') || null,
          description: form.get('description'),
          event_date: form.get('event_date'),
          open_gate: form.get('open_gate') || null,
          start_time: form.get('start_time') || null,
          location: form.get('location') || null,
          quota: form.get('quota') ? Number(form.get('quota')) : null,
          map_embed_url: form.get('map_embed_url') || null,
          drive_link: form.get('drive_link') || null,
          registration_deadline: form.get('registration_deadline') || null,
        }),
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

  if (!event) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Edit Event</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Judul Event <span className="text-red-500">*</span></label>
          <input type="text" name="title" required defaultValue={event.title} className="input-field mt-1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tema</label>
          <input type="text" name="tema" defaultValue={event.tema || ''} className="input-field mt-1" placeholder="Contoh: Petualangan Keluarga Bahagia" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi <span className="text-red-500">*</span></label>
          <textarea name="description" rows={4} required defaultValue={event.description || ''} className="input-field mt-1" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Event <span className="text-red-500">*</span></label>
            <input type="date" name="event_date" required defaultValue={event.event_date?.slice(0, 10)} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Batas Pendaftaran <span className="text-red-500">*</span></label>
            <input type="datetime-local" name="registration_deadline" required defaultValue={event.registration_deadline?.slice(0, 16) || ''} className="input-field mt-1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Open Gate <span className="text-red-500">*</span></label>
            <input type="time" name="open_gate" required defaultValue={event.open_gate?.slice(0, 5) || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jam Mulai <span className="text-red-500">*</span></label>
            <input type="time" name="start_time" required defaultValue={event.start_time?.slice(0, 5) || ''} className="input-field mt-1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kuota</label>
            <div className="mt-1 flex gap-2">
              <input type="number" name="quota" min="1" max="500" defaultValue={event.quota || ''} disabled={event.quota === null} className="input-field w-full" />
              <button type="button" className={`shrink-0 rounded-xl border px-3 text-sm font-medium ${event.quota === null ? 'bg-brand-50 text-brand-600 border-brand-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`} title="Set kuota tidak terbatas" onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const unlimited = input.disabled;
                input.disabled = !unlimited;
                if (!unlimited) input.removeAttribute('name');
                else input.name = 'quota';
                e.currentTarget.classList.toggle('bg-brand-50', !unlimited);
                e.currentTarget.classList.toggle('text-brand-600', !unlimited);
                e.currentTarget.classList.toggle('border-brand-300', !unlimited);
                e.currentTarget.classList.toggle('border-slate-200', unlimited);
                e.currentTarget.classList.toggle('text-slate-500', unlimited);
              }}>
                Unlimited
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Maksimal 500 pendaftar, atau pilih Unlimited.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi <span className="text-red-500">*</span></label>
            <input type="text" name="location" required defaultValue={event.location || ''} className="input-field mt-1" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Google Maps Embed URL</label>
            <input type="url" name="map_embed_url" defaultValue={event.map_embed_url || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Drive Link</label>
            <input type="url" name="drive_link" defaultValue={event.drive_link || ''} className="input-field mt-1" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
