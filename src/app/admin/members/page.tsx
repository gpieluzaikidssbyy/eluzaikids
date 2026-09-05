'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Member } from '@/lib/types';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/admin/members').then((r) => r.json()).then((d) => { setMembers(d); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Anggota</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola anggota sekolah minggu</p>
        </div>
        <Link href="/admin/members/create" className="btn-primary">+ Tambah Anggota</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Nama</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Kelas</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.name}</td>
                <td className="px-4 py-3 text-slate-600">{m.class}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/members/${m.id}/edit`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100">Edit</Link>
                    <button onClick={() => handleDelete(m.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
