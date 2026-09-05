'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    fetch('/api/admin/activities').then((r) => r.json()).then((d) => { setActivities(d); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return;
    await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSaving(true);
    setError('');
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
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan activity.');
      }
      formElement.reset();
      setShowForm(false);
      fetchData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan activity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Activity management</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Activity</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Buat activity baru dan kelola informasi kegiatan untuk pengunjung.</p>
        </div>
        <button type="button" onClick={() => setShowForm((open) => !open)} className="btn-primary">
          {showForm ? 'Tutup form' : 'Add activity'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(event.currentTarget); }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add activity</h2><p className="mt-1 text-sm text-slate-500">Isi informasi utama activity.</p></div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">New</span>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><span className="field-label">Nama activity</span><input name="title" required className="input-field mt-1" /></label>
            <label><span className="field-label">Tanggal</span><input name="activity_date" type="datetime-local" className="input-field mt-1" /></label>
            <label><span className="field-label">Mulai pukul</span><input name="start_time" type="time" className="input-field mt-1" /></label>
            <label><span className="field-label">Kuota</span><input name="quota" type="number" min="1" className="input-field mt-1" /></label>
            <label><span className="field-label">Lokasi</span><input name="location" className="input-field mt-1" /></label>
            <label className="md:col-span-2"><span className="field-label">Deskripsi</span><textarea name="description" rows={3} className="input-field mt-1" /></label>
          </div>
          <div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save activity'}</button></div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="table-heading">No</th>
              <th className="table-heading">Nama activity</th>
              <th className="table-heading">Mulai pukul</th>
              <th className="table-heading">Lokasi</th>
              <th className="table-heading">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((a, index) => (
              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="table-cell text-slate-500">{index + 1}</td>
                <td className="table-cell"><div className="font-semibold text-slate-900 dark:text-white">{a.title}</div><div className="mt-1 text-xs text-slate-500">{a.activity_date ? formatDateIndo(a.activity_date) : '-'}</div></td>
                <td className="table-cell">{a.start_time || '-'}</td>
                <td className="table-cell">{a.location || '-'}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <Link href={`/admin/activities/${a.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100">Edit</Link>
                    <Link href={`/activities/${a.id}`} target="_blank" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">Details</Link>
                    <button onClick={() => handleDelete(a.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {!activities.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada activity.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
