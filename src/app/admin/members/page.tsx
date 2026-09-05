'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Member } from '@/lib/types';
import { MEMBER_CLASSES } from '@/lib/helpers';

const CLASS_STYLES: Record<string, { active: string; badge: string; bar: string }> = {
  Baby: { active: 'border-pink-400 bg-pink-50 dark:bg-pink-950/30', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300', bar: 'from-pink-400 to-rose-500' },
  Samuel: { active: 'border-sky-400 bg-sky-50 dark:bg-sky-950/30', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', bar: 'from-sky-400 to-blue-500' },
  Yosua: { active: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', bar: 'from-emerald-400 to-teal-500' },
  Musa: { active: 'border-violet-400 bg-violet-50 dark:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', bar: 'from-violet-400 to-purple-500' },
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member management</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Members</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Kelola anak-anak yang terdaftar per kelas.</p>
        </div>
        <p className="text-sm font-semibold text-slate-500"><span className="font-display text-2xl font-bold text-brand-600">{members.length}</span> total members</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBER_CLASSES.map((memberClass) => {
          const count = members.filter((member) => member.class === memberClass).length;
          const style = CLASS_STYLES[memberClass];
          const isActive = selectedClass === memberClass;
          return (
            <button
              key={memberClass}
              type="button"
              onClick={() => setSelectedClass(memberClass)}
              className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 ${isActive ? style.active + ' shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.bar}`} />
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{memberClass}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>{count} members</span>
                {isActive && <span className="text-xs font-medium text-brand-600">Terpilih</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Members kelas {selectedClass}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{classMembers.length}</span>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {classMembers.map((member, index) => (
              <li key={member.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <span className="w-6 shrink-0 text-center text-sm text-slate-400">{index + 1}</span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${CLASS_STYLES[member.class].bar.split(' ')[1] ? 'bg-gradient-to-br ' + CLASS_STYLES[member.class].bar : ''}`}>
                  {initials(member.name)}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{member.name}</span>
                <span className="flex shrink-0 gap-2">
                  <Link href={`/admin/members/${member.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100">Edit</Link>
                  <button onClick={() => handleDelete(member.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Hapus</button>
                </span>
              </li>
            ))}
            {!classMembers.length && <li className="px-5 py-10 text-center text-sm text-slate-500">Belum ada member di kelas ini.</li>}
          </ul>
        </div>

        <form onSubmit={addMember} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Add member</h2>
          <p className="mt-1 text-sm text-slate-500">Tambahkan member ke kelas {selectedClass}.</p>
          <label className="mt-5 block"><span className="field-label">Nama lengkap <span className="text-red-500">*</span></span><input value={name} onChange={(event) => setName(event.target.value)} required className="input-field mt-1" placeholder="Nama anak" /></label>
          <button type="submit" disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-50">{saving ? 'Saving...' : 'Save member'}</button>
        </form>
      </div>
    </div>
  );
}