'use client';

import { useEffect, useState } from 'react';
import type { Member } from '@/lib/types';
import { MEMBER_CLASSES } from '@/lib/helpers';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(MEMBER_CLASSES[0]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch('/api/admin/members').then((r) => r.json()).then((d) => { setMembers(d); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), class: selectedClass }),
    });
    setName('');
    setSaving(false);
    fetchData();
  };

  const classMembers = members.filter((member) => member.class === selectedClass);

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member management</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Members</h1>
        <p className="mt-2 text-sm text-slate-500">Pilih kelas untuk melihat dan menambahkan members.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBER_CLASSES.map((memberClass) => (
          <button key={memberClass} type="button" onClick={() => setSelectedClass(memberClass)} className={`rounded-2xl border p-4 text-left transition ${selectedClass === memberClass ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900'}`}>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{memberClass}</p>
            <p className="mt-1 text-xs text-slate-500">{members.filter((member) => member.class === memberClass).length} members</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Members kelas {selectedClass}</h2></div>
          <table className="min-w-[560px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50"><tr><th className="table-heading">No</th><th className="table-heading">Nama lengkap</th><th className="table-heading">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classMembers.map((member, index) => <tr key={member.id}><td className="table-cell text-slate-500">{index + 1}</td><td className="table-cell font-medium text-slate-900 dark:text-white">{member.name}</td><td className="table-cell"><div className="flex gap-2"><a href={`/admin/members/${member.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600">Edit</a><button onClick={() => handleDelete(member.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">Hapus</button></div></td></tr>)}
              {!classMembers.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada member di kelas ini.</td></tr>}
            </tbody>
          </table>
        </div>

        <form onSubmit={addMember} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add member</h2>
          <p className="mt-1 text-sm text-slate-500">Tambahkan member ke kelas {selectedClass}.</p>
          <label className="mt-5 block"><span className="field-label">Nama lengkap</span><input value={name} onChange={(event) => setName(event.target.value)} required className="input-field mt-1" /></label>
          <button type="submit" disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-50">{saving ? 'Saving...' : 'Save member'}</button>
        </form>
      </div>
    </div>
  );
}
