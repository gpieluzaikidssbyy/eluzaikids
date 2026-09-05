'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quotaUpdating, setQuotaUpdating] = useState<number | null>(null);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const updateQuota = async (event: Event & { registrations_count: number }, delta: number) => {
    const currentQuota = event.quota ?? event.registrations_count;
    const nextQuota = currentQuota + delta;
    if (nextQuota < event.registrations_count) {
      setError(`Kuota ${event.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`);
      return;
    }
    setQuotaUpdating(event.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota: nextQuota }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal memperbarui kuota.');
      }
      const updated = await response.json();
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, quota: updated.quota } : item));
    } catch (quotaError) {
      setError(quotaError instanceof Error ? quotaError.message : 'Gagal memperbarui kuota.');
    } finally {
      setQuotaUpdating(null);
    }
  };

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSaving(true);
    setError('');
    try {
      const poster = form.get('poster');
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: (() => {
          const payload = new FormData();
          ['title', 'description', 'event_date', 'open_gate', 'start_time', 'location', 'quota', 'map_embed_url', 'drive_link', 'registration_deadline'].forEach((name) => payload.append(name, String(form.get(name) || '')));
          if (poster instanceof File) payload.append('poster', poster);
          return payload;
        })(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan event.');
      }
      formElement.reset();
      setShowForm(false);
      fetchEvents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Event management</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Event</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Buat event baru dan kelola jadwal yang siap ditampilkan kepada pengunjung.</p>
        </div>
        <button type="button" onClick={() => setShowForm((open) => !open)} className="btn-primary">
          {showForm ? 'Tutup form' : 'Add event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(event.currentTarget); }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add event</h2><p className="mt-1 text-sm text-slate-500">Isi informasi utama event.</p></div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">New</span>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><span className="field-label">Judul <span className="text-red-500">*</span></span><input name="title" required className="input-field mt-1" /></label>
            <label className="md:col-span-2"><span className="field-label">Deskripsi <span className="text-red-500">*</span></span><textarea name="description" rows={3} required className="input-field mt-1" /></label>
            <label><span className="field-label">Tanggal Event <span className="text-red-500">*</span></span><input name="event_date" type="date" required className="input-field mt-1" /></label>
            <label><span className="field-label">Batas Pendaftaran <span className="text-red-500">*</span></span><input name="registration_deadline" type="datetime-local" required className="input-field mt-1" /></label>
            <label><span className="field-label">Open Gate <span className="text-red-500">*</span></span><input name="open_gate" type="time" required className="input-field mt-1" /></label>
            <label><span className="field-label">Jam Mulai <span className="text-red-500">*</span></span><input name="start_time" type="time" required className="input-field mt-1" /></label>
            <label><span className="field-label">Kuota <span className="text-red-500">*</span></span><input name="quota" type="number" min="1" max="500" required className="input-field mt-1" /><span className="mt-1 block text-xs text-slate-500">Maksimal 500 pendaftar.</span></label>
            <label><span className="field-label">Lokasi <span className="text-red-500">*</span></span><input name="location" required className="input-field mt-1" /></label>
            <label><span className="field-label">Google Maps Embed URL <span className="text-red-500">*</span></span><input name="map_embed_url" type="url" required className="input-field mt-1" /></label>
            <label><span className="field-label">Drive Link <span className="text-red-500">*</span></span><input name="drive_link" type="url" required className="input-field mt-1" /></label>
            <label className="md:col-span-2"><span className="field-label">Poster Event <span className="text-red-500">*</span></span><input name="poster" type="file" required accept=".jpg,.png,.webp,image/jpeg,image/png,image/webp" className="input-field mt-1" /><span className="mt-1 block text-xs text-slate-500">Rasio 4:5, maksimal 2 MB. Format JPG, PNG, atau WEBP.</span></label>
          </div>
          <div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save event'}</button></div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="table-heading">No</th>
              <th className="table-heading">Nama event</th>
              <th className="table-heading">Open gate</th>
              <th className="table-heading">Mulai pukul</th>
              <th className="table-heading">Lokasi</th>
              <th className="table-heading">Kuota</th>
              <th className="table-heading">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {events.map((event, index) => (
              <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="table-cell text-slate-500">{index + 1}</td>
                <td className="table-cell"><div className="font-semibold text-slate-900 dark:text-white">{event.title}</div><div className="mt-1 text-xs text-slate-500">{formatDateIndo(event.event_date)}</div></td>
                <td className="table-cell">{event.open_gate?.slice(0, 5) || '-'}</td>
                <td className="table-cell">{event.start_time?.slice(0, 5) || '-'}</td>
                <td className="table-cell">{event.location || '-'}</td>
                <td className="table-cell">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                    <button type="button" disabled={quotaUpdating === event.id || event.quota === null || (event.quota ?? 0) <= event.registrations_count} onClick={() => void updateQuota(event, -1)} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Kurangi kuota ${event.title}`}>−</button>
                    <span className="min-w-10 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">{event.quota ?? '∞'}</span>
                    <button type="button" disabled={quotaUpdating === event.id} onClick={() => void updateQuota(event, 1)} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Tambah kuota ${event.title}`}>+</button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{event.registrations_count} terdaftar</p>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100">Edit</Link>
                    <Link href={`/admin/events/${event.id}`} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">Details</Link>
                    <button onClick={() => handleDelete(event.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {!events.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada event.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
