'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, Loader2, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Member } from '@/lib/types';
import { MEMBER_CLASSES, CLASS_STYLES } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { ClassAvatar } from '@/components/ClassAvatar';

export default function AdminChildsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(MEMBER_CLASSES[0]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), class: selectedClass }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menambahkan anak.');
      }
      setName('');
      fetchData();
    } catch (addError) {
      const msg = addError instanceof Error ? addError.message : 'Gagal menambahkan nama anak.';
      setError(msg);
    } finally {
      setSaving(false);
    }
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
        iconClassName="bg-gradient-to-br from-blue-500 to-pink-500 text-white"
        title="Manage Childs"
        description="Kelola anak-anak yang terdaftar per kelas."
        actions={
          <Button onClick={() => document.getElementById('quick-add-name')?.focus()} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
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
                'relative overflow-hidden rounded-xl border-2 p-3 text-left shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-md sm:p-4',
                isActive ? cn(style.active, 'shadow-md') : 'border-border bg-card hover:border-border/80'
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', style.bar)} />
              <div className="flex items-center gap-2.5">
                <ClassAvatar memberClass={memberClass} className="h-10 w-10 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-foreground sm:text-base">{memberClass}</p>
                  <span className={cn('mt-0.5 block text-[11px] font-semibold sm:text-xs', style.badgeText)}>{count} anak</span>
                </div>
              </div>
              {isActive && <span className="absolute right-2 top-2 text-[10px] font-medium text-primary">Terpilih</span>}
            </button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="grid gap-6 lg:grid-cols-[1fr_20rem]"
      >
        {/* ─── Members table (horizontally scrollable like manage event/activity) ─── */}
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
            <h2 className="font-display text-base font-bold text-foreground sm:text-lg">Kelas {selectedClass}</h2>
            <Badge variant="secondary">{classMembers.length}</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="table-heading w-12">No</TableHead>
                <TableHead className="table-heading">Nama</TableHead>
                <TableHead className="table-heading">Kelas</TableHead>
                <TableHead className="table-heading text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classMembers.map((member, index) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="table-cell text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="table-cell">
                    <div className="flex items-center gap-3">
                      <ClassAvatar memberClass={member.class} className="h-9 w-9 rounded-full" />
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="table-cell">
                    <Badge variant="secondary" className={cn('rounded-full', CLASS_STYLES[member.class].badge)}>{member.class}</Badge>
                  </TableCell>
                  <TableCell className="table-cell text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/40">
                        <Link href={`/admin/members/${member.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        title="Hapus Anggota?"
                        description={`Yakin ingin menghapus ${member.name}?`}
                        confirmLabel="Hapus"
                        onConfirm={() => handleDelete(member.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!classMembers.length && (
            <EmptyState
              icon={Users}
              title="Belum ada anak di kelas ini"
              description="Tambahkan anak lewat form di samping atau tombol Tambah Anggota."
              className="border-t"
            />
          )}
        </div>

        <form onSubmit={addMember} className="h-fit rounded-xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Add Child</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tambahkan anak ke kelas {selectedClass}.</p>
          <div className="mt-5 space-y-2">
            <Label htmlFor="quick-add-name">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input
              id="quick-add-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Nama anak"
            />
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Save Child
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
