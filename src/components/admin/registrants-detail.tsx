'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Pencil, Trash2, Loader2, Users, ClipboardList } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/admin/stat-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DELETE_CONFIRM_TEXT = 'HAPUS PENDAFTAR';

interface RegistrationRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  jumlah_hadir: number;
  nomor_registrasi: string;
}

export function RegistrantsDetail({ type }: { type: 'event' | 'activity' }) {
  const params = useParams();
  const isEvent = type === 'event';
  const plural = isEvent ? 'events' : 'activities';
  const label = isEvent ? 'event' : 'kegiatan';

  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [item, setItem] = useState<any>(null);

  const [editTarget, setEditTarget] = useState<RegistrationRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editHadir, setEditHadir] = useState('');
  const [editing, setEditing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RegistrationRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    fetch(`/api/admin/registrants?type=${type}&id=${params.id}`)
      .then((r) => r.json())
      .then((data) => setRegistrations(data.registrations || []));
    fetch(`/api/admin/${plural}/${params.id}`).then((r) => r.json()).then(setItem);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const openEdit = (r: RegistrationRow) => {
    setEditTarget(r);
    setEditName(r.name);
    setEditHadir(String(r.jumlah_hadir));
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    const response = await fetch(`/api/admin/registrants?type=${type}&id=${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, jumlah_hadir: editHadir }),
    });
    const data = await response.json();
    setEditing(false);
    if (!response.ok) {
      toast.error(data.message || 'Gagal memperbarui pendaftar.');
      return;
    }
    toast.success('Pendaftar berhasil diperbarui.');
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await fetch(`/api/admin/registrants?type=${type}&id=${deleteTarget.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    setDeleting(false);
    if (!response.ok) {
      toast.error(data.message || 'Gagal menghapus pendaftar.');
      return;
    }
    toast.success('Pendaftar berhasil dihapus.');
    setDeleteTarget(null);
    setDeleteConfirm('');
    load();
  };

  if (!item) return <Loading label="Memuat data pendaftar..." />;

  const totalPeserta = registrations.reduce((sum, r) => sum + (r.jumlah_hadir || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader
        icon={isEvent ? <Download className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
        title={`Manage Registrants: ${item?.title || '...'}`}
        description={isEvent && item?.tema ? `Tema: ${item.tema}` : undefined}
        backHref={`/admin/registrants/${plural}`}
        actions={
          isEvent ? (
            <a
              href={`/api/admin/registrants/events/${item.id}/export`}
              className="inline-flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2 text-sm font-semibold text-success transition hover:bg-success/20"
            >
              <Download className="h-4 w-4" />
              Export as Excel
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Pendaftar" value={registrations.length} icon={ClipboardList} gradient={isEvent ? 'from-primary to-blue-700' : 'from-amber-500 to-yellow-600'} index={0} />
        <StatCard label="Total Peserta" value={totalPeserta} icon={Users} gradient="from-emerald-500 to-teal-700" index={1} />
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="table-heading">No</TableHead>
                <TableHead className="table-heading">No. registrasi</TableHead>
                <TableHead className="table-heading">Nama lengkap</TableHead>
                <TableHead className="table-heading">No. HP</TableHead>
                <TableHead className="table-heading hidden lg:table-cell">Email</TableHead>
                <TableHead className="table-heading">Hadir</TableHead>
                <TableHead className="table-heading text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((r, index) => (
                <TableRow key={r.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="table-cell text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="table-cell font-mono text-xs">{r.nomor_registrasi}</TableCell>
                  <TableCell className="table-cell">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{r.jumlah_hadir} orang</div>
                  </TableCell>
                  <TableCell className="table-cell">{r.phone}</TableCell>
                  <TableCell className="table-cell hidden lg:table-cell">{r.email || '-'}</TableCell>
                  <TableCell className="table-cell font-semibold tabular-nums text-foreground">{r.jumlah_hadir}</TableCell>
                  <TableCell className="table-cell">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(r)}
                        aria-label={`Edit ${r.name}`}
                        title="Edit pendaftar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(r)}
                        aria-label={`Hapus ${r.name}`}
                        title="Hapus pendaftar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!registrations.length && (
            <EmptyState icon={ArrowLeft} title="Belum ada pendaftar" description={`Belum ada pendaftar untuk ${label} ini.`} className="border-t" />
          )}
        </div>
      </motion.div>

      <AlertDialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Pendaftar</AlertDialogTitle>
            <AlertDialogDescription>
              Perbarui nama atau jumlah hadir pendaftar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form id="edit-registrant-form" onSubmit={(e) => { e.preventDefault(); void handleEdit(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nama lengkap</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value.slice(0, 255))}
                maxLength={255}
                required
                placeholder="Nama lengkap pendaftar"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-hadir">Jumlah hadir</Label>
              <Input
                id="edit-hadir"
                type="number"
                min={1}
                max={500}
                value={editHadir}
                onChange={(e) => setEditHadir(e.target.value)}
                required
                placeholder="1"
              />
            </div>
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={editing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              form="edit-registrant-form"
              disabled={editing}
            >
              {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirm(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pendaftar ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pendaftar <span className="font-semibold text-foreground">{deleteTarget?.name}</span> akan dihapus dari daftar pendaftaran {label} ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm">Ketik <span className="font-mono font-semibold text-destructive">{DELETE_CONFIRM_TEXT}</span> untuk konfirmasi</Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_CONFIRM_TEXT}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); void handleDelete(); }}
              disabled={deleteConfirm !== DELETE_CONFIRM_TEXT || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus pendaftar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}