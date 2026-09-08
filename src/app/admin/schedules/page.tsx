'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import type { Schedule } from '@/lib/types';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchData = () => {
    fetch('/api/admin/schedules').then((r) => r.json()).then((d) => { setSchedules(d); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/admin/schedules/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchData();
  };

  if (loading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        icon={<CalendarDays className="h-6 w-6" />}
        title="Jadwal"
        description="Kelola jadwal ibadah dan latihan"
        actions={
          <Link href="/admin/schedules/create">
            <Button className="rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jadwal
            </Button>
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-card"
      >
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="border-b border-border/40">
              <TableHead className="table-heading w-12">No</TableHead>
              <TableHead className="table-heading">Tanggal</TableHead>
              <TableHead className="table-heading">Kategori</TableHead>
              <TableHead className="table-heading">Pukul</TableHead>
              <TableHead className="table-heading text-center">Status</TableHead>
              <TableHead className="table-heading w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((s, index) => (
              <TableRow key={s.id} className="border-b border-border/30 transition-colors hover:bg-muted/40">
                <TableCell className="table-cell text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="table-cell font-medium text-foreground">{s.day}</TableCell>
                <TableCell className="table-cell">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {s.type}
                  </span>
                </TableCell>
                <TableCell className="table-cell">{s.time?.slice(0, 5)} WIB</TableCell>
                <TableCell className="table-cell text-center">
                  {s.show_schedule !== false ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      <CheckCircle className="h-3 w-3" />
                      Ada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                      <XCircle className="h-3 w-3" />
                      Tidak
                    </span>
                  )}
                </TableCell>
                <TableCell className="table-cell">
                  <div className="flex gap-1">
                    <Link href={`/admin/schedules/${s.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Hapus jadwal?"
                      description="Jadwal ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                      confirmLabel="Hapus"
                      pending={deleting === s.id}
                      variant="destructive"
                      onConfirm={() => handleDelete(s.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
