'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MEMBER_CLASSES } from '@/lib/helpers';

export default function CreateMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.get('name'), class: form.get('class') }),
    });
    router.push('/admin/members');
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tambah Anggota</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama *</label>
          <input type="text" name="name" required className="input-field mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kelas *</label>
          <select name="class" required className="input-field mt-1">
            {MEMBER_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
