'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface CalendarAgendaDialogProps {
  open: boolean;
  editId: number | null;
  initial: { title: string; date: string; time: string };
  onClose: () => void;
  onSaved: () => void;
}

export function CalendarAgendaDialog({
  open,
  editId,
  initial,
  onClose,
  onSaved,
}: CalendarAgendaDialogProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle(initial.title);
    setDescription('');
    setDate(initial.date);
    setTime(initial.time);
    setSaving(false);
    setDeleting(false);
  }, [initial]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('Judul agenda wajib diisi.');
      return;
    }
    if (!date) {
      toast.error('Tanggal wajib diisi.');
      return;
    }
    setSaving(true);
    const res = await fetch(
      editId != null ? `/api/admin/calendar-events/${editId}` : '/api/admin/calendar-events',
      {
        method: editId != null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          description: description.trim() || null,
          event_date: date,
          start_time: time || null,
        }),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(data.message || 'Gagal menyimpan agenda.');
      return;
    }
    toast.success(editId != null ? 'Agenda berhasil diperbarui.' : 'Agenda berhasil ditambahkan.');
    onClose();
    onSaved();
  };

  const handleDelete = async () => {
    if (editId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/calendar-events/${editId}`, { method: 'DELETE' });
    setDeleting(false);
    if (!res.ok) {
      toast.error('Gagal menghapus agenda.');
      return;
    }
    toast.success('Agenda berhasil dihapus.');
    onClose();
    onSaved();
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next && !saving && !deleting) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{editId != null ? 'Edit Agenda' : 'Tambah Agenda'}</AlertDialogTitle>
        </AlertDialogHeader>
        <form
          id="agenda-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="agenda-title">Judul <span className="text-destructive">*</span></Label>
            <Input
              id="agenda-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 255))}
              maxLength={255}
              required
              placeholder="Contoh: Rapat Panitia Natal 2026, Doa Bersama"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agenda-date">Tanggal <span className="text-destructive">*</span></Label>
            <Input
              id="agenda-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agenda-time">Jam <span className="text-destructive">*</span></Label>
            <Input
              id="agenda-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agenda-desc">Catatan (opsional)</Label>
            <Textarea
              id="agenda-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detail acara, agenda pembahasan, dsb."
              className="rounded-lg"
            />
          </div>
        </form>
        <AlertDialogFooter className="sm:justify-between">
          {editId != null ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Hapus
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
            <AlertDialogAction type="submit" form="agenda-form" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}