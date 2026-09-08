'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, UserPlus, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Member } from '@/lib/types';
import { MEMBER_CLASSES } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

const CLASS_STYLES: Record<string, { active: string; badge: string; bar: string; gradient: string }> = {
  Baby: { active: 'border-pink-400 bg-pink-50 dark:bg-pink-950/30', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300', bar: 'from-pink-400 to-rose-500', gradient: 'from-pink-500 to-rose-600' },
  Samuel: { active: 'border-sky-400 bg-sky-50 dark:bg-sky-950/30', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', bar: 'from-sky-400 to-blue-500', gradient: 'from-sky-500 to-blue-600' },
  Yosua: { active: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', bar: 'from-emerald-400 to-teal-500', gradient: 'from-emerald-500 to-teal-600' },
  Musa: { active: 'border-violet-400 bg-violet-50 dark:bg-violet-950/30', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', bar: 'from-violet-400 to-purple-500', gradient: 'from-violet-500 to-purple-600' },
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

export default function AdminChildsPage() {
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

  if (loading) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<Users className="h-6 w-6" />}
        title="Manage Childs"
        description="Kelola anak-anak yang terdaftar per kelas."
        actions={
          <Button size="sm" onClick={() => document.getElementById('quick-add-name')?.focus()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {MEMBER_CLASSES.map((memberClass) => {
          const count = members.filter((member) => member.class === memberClass).length;
          const style = CLASS_STYLES[memberClass];
          const isActive = selectedClass === memberClass;
          return (
            <button
              key={memberClass}
              type="button"
              onClick={() => setSelectedClass(memberClass)}
              className={cn(
                'relative overflow-hidden rounded-xl border-2 p-4 text-left shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-md',
                isActive ? cn(style.active, 'shadow-md') : 'border-border bg-card hover:border-border/80'
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', style.bar)} />
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-base font-bold text-foreground">{memberClass}</p>
                {isActive && <span className="text-[10px] font-medium text-primary">Terpilih</span>}
              </div>
              <span className={cn('mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', style.badge)}>{count} anak</span>
            </button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-primary-foreground shadow-lg shadow-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
            <p className="text-xs font-medium text-muted-foreground">Total Anak</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', CLASS_STYLES[selectedClass]?.gradient ?? 'from-primary to-blue-700')}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{classMembers.length}</p>
            <p className="text-xs font-medium text-muted-foreground">Anak di kelas {selectedClass}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="grid gap-6 lg:grid-cols-[1fr_20rem]"
      >
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h2 className="font-display text-lg font-bold text-foreground">Childs kelas {selectedClass}</h2>
            <Badge variant="secondary">{classMembers.length}</Badge>
          </div>
          <ul className="divide-y divide-border/60">
            {classMembers.map((member, index) => (
              <li key={member.id} className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-accent/50">
                <span className="w-6 shrink-0 text-center text-sm text-muted-foreground">{index + 1}</span>
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br', CLASS_STYLES[member.class].bar)}>
                  {initials(member.name)}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{member.name}</span>
                <span className="flex shrink-0 gap-2">
                  <Link href={`/admin/members/${member.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <ConfirmDialog
                    title="Hapus Anggota?"
                    description={`Yakin ingin menghapus ${member.name}?`}
                    confirmLabel="Hapus"
                    onConfirm={() => handleDelete(member.id)}
                    trigger={
                      <button className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20">
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    }
                  />
                </span>
              </li>
            ))}
            {!classMembers.length && (
              <li className="px-6 py-12 text-center text-sm text-muted-foreground">
                Belum ada anak di kelas ini.
              </li>
            )}
          </ul>
        </div>

        <form onSubmit={addMember} className="h-fit rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Add Child</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tambahkan anak ke kelas {selectedClass}.</p>
          <div className="mt-5 space-y-2">
            <Label htmlFor="quick-add-name">Nama lengkap <span className="text-destructive">*</span></Label>
            <Input
              id="quick-add-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Nama anak"
            />
          </div>
          <Button type="submit" disabled={saving} className="mt-4 w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Save Child
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
