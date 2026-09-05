'use client';

import { useEffect, useState } from 'react';

export default function AdminChurchInfoPage() {
  const [info, setInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/church-info').then((r) => r.json()).then(setInfo);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const form = new FormData(e.currentTarget);
    await fetch('/api/admin/church-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: form.get('address'),
        map_embed_url: form.get('map_embed_url') || null,
        phone: form.get('phone') || null,
        whatsapp: form.get('whatsapp') || null,
        email: form.get('email') || null,
        instagram_url: form.get('instagram_url') || null,
        youtube_url: form.get('youtube_url') || null,
      }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!info) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Info Gereja</h1>
      <p className="mt-1 text-sm text-slate-500">Kelola informasi kontak dan lokasi gereja</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">Berhasil disimpan!</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700">Alamat *</label>
          <textarea name="address" required rows={2} defaultValue={info.address || ''} className="input-field mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Google Maps Embed URL</label>
          <input type="url" name="map_embed_url" defaultValue={info.map_embed_url || ''} className="input-field mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Telepon</label>
            <input type="text" name="phone" defaultValue={info.phone || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
            <input type="text" name="whatsapp" defaultValue={info.whatsapp || ''} className="input-field mt-1" placeholder="628xxxxxxxxxx" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input type="email" name="email" defaultValue={info.email || ''} className="input-field mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Instagram URL</label>
            <input type="url" name="instagram_url" defaultValue={info.instagram_url || ''} className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">YouTube URL</label>
            <input type="url" name="youtube_url" defaultValue={info.youtube_url || ''} className="input-field mt-1" />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
