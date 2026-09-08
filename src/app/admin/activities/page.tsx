'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, ClipboardList, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';

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
          map_embed_url: form.get('map_embed_url') || null,
          drive_link: form.get('drive_link') || null,
          email_enabled: form.get('email_enabled') === 'on',
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
      const msg = submitError instanceof Error ? submitError.message : 'Gagal menyimpan activity.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<ClipboardList className="h-6 w-6" />}
        iconClassName="bg-amber-500/10 text-amber-500"
        title="Manage Kegiatan"
        description="Buat activity baru dan kelola informasi kegiatan untuk pengunjung."
        actions={
          <Button onClick={() => setShowForm((open) => !open)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Tutup form' : 'Tambah Kegiatan'}
          </Button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
          <Card className="rounded-xl border border-border/60 bg-card p-6 shadow-card">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Tambah Kegiatan</CardTitle>
                  <CardDescription className="mt-1">Isi informasi utama kegiatan.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(event.currentTarget); }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="title" className="field-label">Judul <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" required className="mt-1" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="description" className="field-label">Deskripsi <span className="text-destructive">*</span></Label>
                  <Textarea id="description" name="description" rows={3} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="activity_date" className="field-label">Tanggal <span className="text-destructive">*</span></Label>
                  <Input id="activity_date" name="activity_date" type="date" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="start_time" className="field-label">Jam Mulai <span className="text-destructive">*</span></Label>
                  <Input id="start_time" name="start_time" type="time" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="quota" className="field-label">Kuota <span className="text-destructive">*</span></Label>
                  <Input id="quota" name="quota" type="number" min="1" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="location" className="field-label">Lokasi <span className="text-destructive">*</span></Label>
                  <Input id="location" name="location" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="map_embed_url" className="field-label">Google Maps Embed URL <span className="text-destructive">*</span></Label>
                  <Input id="map_embed_url" name="map_embed_url" type="url" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="drive_link" className="field-label">Drive Link <span className="text-destructive">*</span></Label>
                  <Input id="drive_link" name="drive_link" type="url" required className="mt-1" />
                </div>
                <label className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 sm:col-span-2 lg:col-span-3">
                  <input type="checkbox" name="email_enabled" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span>
                    <span className="block text-sm font-medium">Email konfirmasi</span>
                    <span className="block text-xs text-muted-foreground">Kirim email konfirmasi kepada pendaftar.</span>
                  </span>
                </label>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="table-heading">Kegiatan</TableHead>
                <TableHead className="table-heading">Tanggal</TableHead>
                <TableHead className="table-heading hidden md:table-cell">Lokasi</TableHead>
                <TableHead className="table-heading">Kuota</TableHead>
                <TableHead className="table-heading">Status</TableHead>
                <TableHead className="table-heading text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((a, index) => {
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = (a.activity_date || '').slice(0, 10) >= today;
                return (
                  <TableRow key={a.id} className="hover:bg-muted/30">
                    <TableCell className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">{a.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{index + 1}. {a.registrations_count} terdaftar</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">
                      <div className="font-medium text-foreground">{a.activity_date ? formatDateIndo(a.activity_date) : '-'}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {a.start_time?.slice(0, 5) && `Mulai ${a.start_time?.slice(0, 5)}`}
                      </div>
                    </TableCell>
                    <TableCell className="table-cell hidden md:table-cell">{a.location || '-'}</TableCell>
                    <TableCell className="table-cell">
                      <span className="font-semibold tabular-nums text-foreground">{a.quota ?? '∞'}</span>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{a.registrations_count} terdaftar</p>
                    </TableCell>
                    <TableCell className="table-cell">
                      {upcoming ? (
                        <Badge variant="success" className="rounded-full bg-success/10 text-success">
                          Mendatang
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          Selesai
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="table-cell text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/admin/activities/${a.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/admin/activities/${a.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Hapus kegiatan ini?"
                          description="Tindakan ini tidak dapat dibatalkan."
                          onConfirm={() => void handleDelete(a.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!activities.length && (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada kegiatan"
              description="Mulai dengan membuat kegiatan baru."
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
