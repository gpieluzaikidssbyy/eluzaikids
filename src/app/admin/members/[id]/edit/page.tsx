'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MEMBER_CLASSES } from '@/lib/helpers';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/members').then((r) => r.json()).then((data) => {
      setMember(data.find((m: any) => String(m.id) === String(params.id)));
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch(`/api/admin/members/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.get('name'), class: form.get('class') }),
    });
    router.push('/admin/members');
  };

  if (!member) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Edit Anggota</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama *</label>
          <input type="text" name="name" required defaultValue={member.name} className="input-field mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kelas *</label>
          <select name="class" required defaultValue={member.class} className="input-field mt-1">
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
