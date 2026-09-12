'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, ClipboardList, Loader2, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Activity } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { ActivityForm } from '@/components/admin/activity-form';

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [quotaUpdating, setQuotaUpdating] = useState<number | null>(null);

  const fetchData = () => {
    fetch('/api/admin/activities').then((r) => r.json()).then((d) => { setActivities(d); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const updateQuota = async (activity: Activity & { registrations_count: number }, delta: number) => {
    const currentQuota = activity.quota ?? activity.registrations_count;
    const nextQuota = currentQuota + delta;
    if (nextQuota < activity.registrations_count) {
      const msg = `Kuota ${activity.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`;
      setError(msg);
      toast.error(msg);
      return;
    }
    setQuotaUpdating(activity.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota: nextQuota }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal memperbarui kuota.');
      }
      const updated = await response.json();
      setActivities((current) => current.map((item) => item.id === activity.id ? { ...item, quota: updated.quota } : item));
    } catch (quotaError) {
      const msg = quotaError instanceof Error ? quotaError.message : 'Gagal memperbarui kuota.';
      setError(msg);
      toast.error(msg);
    } finally {
      setQuotaUpdating(null);
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
        iconClassName="bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
        title="Manage Kegiatan"
        description="Buat activity baru dan kelola informasi kegiatan untuk pengunjung."
        actions={
          <Button onClick={() => setShowForm((open) => !open)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Tutup form' : 'Tambah Kegiatan'}
          </Button>
        }
      />

      {showForm && (
        <ActivityForm
          onClose={() => setShowForm(false)}
          onSaved={fetchData}
          error={error}
          onError={setError}
        />
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
                      <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === a.id || a.quota === null || (a.quota ?? 0) <= a.registrations_count}
                          onClick={() => void updateQuota(a, -1)}
                          aria-label={`Kurangi kuota ${a.title}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold text-foreground">{a.quota ?? '∞'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === a.id}
                          onClick={() => void updateQuota(a, 1)}
                          aria-label={`Tambah kuota ${a.title}`}
                        >
                          {quotaUpdating === a.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{a.registrations_count} terdaftar</p>
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
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/40">
                          <Link href={`/admin/activities/${a.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
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
