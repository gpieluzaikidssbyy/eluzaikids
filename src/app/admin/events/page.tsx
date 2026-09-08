'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Event } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { CalendarDays, Plus, Pencil, Trash2, Eye, Minus, Loader2, ImageIcon, Info, MapPin, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertError } from '@/components/ui/alert';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<(Event & { registrations_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quotaUpdating, setQuotaUpdating] = useState<number | null>(null);

  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const updateQuota = async (event: Event & { registrations_count: number }, delta: number) => {
    const currentQuota = event.quota ?? event.registrations_count;
    const nextQuota = currentQuota + delta;
    if (nextQuota < event.registrations_count) {
      setError(`Kuota ${event.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`);
      toast.error(`Kuota ${event.title} tidak dapat lebih kecil dari jumlah pendaftar saat ini.`);
      return;
    }
    setQuotaUpdating(event.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quota: nextQuota }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal memperbarui kuota.');
      }
      const updated = await response.json();
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, quota: updated.quota } : item));
    } catch (quotaError) {
      const msg = quotaError instanceof Error ? quotaError.message : 'Gagal memperbarui kuota.';
      setError(msg);
      toast.error(msg);
    } finally {
      setQuotaUpdating(null);
    }
  };

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSaving(true);
    setError('');
    try {
      const poster = form.get('poster');
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: (() => {
          const payload = new FormData();
          ['title', 'tema', 'description', 'event_date', 'open_gate', 'start_time', 'location', 'quota', 'map_embed_url', 'drive_link', 'registration_deadline', 'email_enabled'].forEach((name) => payload.append(name, String(form.get(name) || '')));
          if (poster instanceof File) payload.append('poster', poster);
          return payload;
        })(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan event.');
      }
      formElement.reset();
      setShowForm(false);
      fetchEvents();
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Gagal menyimpan event.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Manage Event"
        description="Buat event baru dan kelola jadwal yang siap ditampilkan kepada pengunjung."
        actions={
          <Button onClick={() => setShowForm((open) => !open)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Tutup form' : 'Tambah Event'}
          </Button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
          {error && (
            <AlertError title="Gagal menyimpan">{error}</AlertError>
          )}
          <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(event.currentTarget); }} className="space-y-6">
            {/* ─── Informasi dasar ─── */}
            <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informasi Event</CardTitle>
                  <CardDescription>Identitas utama dan deskripsi event.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="field-label">Judul Event <span className="text-destructive">*</span></Label>
                  <Input type="text" id="title" name="title" required className="rounded-lg" placeholder="Contoh: Family Fun Day 2026" />
                  <p className="text-xs text-muted-foreground">Nama event yang ditampilkan ke pengunjung website.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tema" className="field-label">Tema</Label>
                  <Input type="text" id="tema" name="tema" className="rounded-lg" placeholder="Contoh: Petualangan Keluarga Bahagia" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="field-label">Deskripsi <span className="text-destructive">*</span></Label>
                  <Textarea id="description" name="description" rows={4} required className="rounded-lg" placeholder="Tuliskan informasi lengkap tentang event ini." />
                </div>
              </CardContent>
            </Card>

            {/* ─── Jadwal & lokasi ─── */}
            <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Jadwal & Lokasi</CardTitle>
                  <CardDescription>Tanggal, waktu, dan tempat pelaksanaan.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event_date" className="field-label">Tanggal Event <span className="text-destructive">*</span></Label>
                    <Input type="date" id="event_date" name="event_date" required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_deadline" className="field-label">Batas Pendaftaran <span className="text-destructive">*</span></Label>
                    <Input type="datetime-local" id="registration_deadline" name="registration_deadline" required className="rounded-lg" />
                    <p className="text-xs text-muted-foreground">Waktu terakhir pengunjung dapat mendaftar.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="open_gate" className="field-label">Open Gate <span className="text-destructive">*</span></Label>
                    <Input type="time" id="open_gate" name="open_gate" required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="field-label">Jam Mulai <span className="text-destructive">*</span></Label>
                    <Input type="time" id="start_time" name="start_time" required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="field-label">Lokasi <span className="text-destructive">*</span></Label>
                    <Input type="text" id="location" name="location" required className="rounded-lg" placeholder="Nama gedung / alamat" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quota" className="field-label">Kuota</Label>
                    <div className="flex gap-2">
                      <Input type="number" id="quota" name="quota" min="1" max="500" className="rounded-lg" placeholder="Contoh: 100" />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-lg"
                        title="Set kuota tidak terbatas"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const wasUnlimited = input.disabled;
                          input.disabled = !wasUnlimited;
                          if (wasUnlimited) input.name = 'quota';
                          else input.removeAttribute('name');
                          e.currentTarget.classList.toggle('bg-primary/10', wasUnlimited);
                          e.currentTarget.classList.toggle('text-primary', wasUnlimited);
                          e.currentTarget.classList.toggle('border-primary', wasUnlimited);
                        }}
                      >
                        Unlimited
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Maksimal 500 pendaftar, atau pilih Unlimited.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Media & tautan ─── */}
            <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
                  <Image className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Media & Tautan</CardTitle>
                  <CardDescription>Poster event, peta, dan materi pendukung.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="map_embed_url" className="field-label">Google Maps Embed URL</Label>
                    <Input type="url" id="map_embed_url" name="map_embed_url" className="rounded-lg" placeholder="https://www.google.com/maps/embed?pb=..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drive_link" className="field-label">Drive Link</Label>
                    <Input type="url" id="drive_link" name="drive_link" className="rounded-lg" placeholder="https://drive.google.com/..." />
                  </div>
                  <label className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 sm:col-span-2 lg:col-span-3">
                    <input type="checkbox" name="email_enabled" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span>
                      <span className="block text-sm font-medium">Email konfirmasi</span>
                      <span className="block text-xs text-muted-foreground">Kirim email konfirmasi kepada pendaftar.</span>
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poster" className="field-label">Poster Event <span className="text-destructive">*</span></Label>
                  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
                    <p className="mt-2 text-sm text-muted-foreground">Klik untuk memilih poster atau seret ke sini</p>
                    <Input type="file" id="poster" name="poster" required accept=".jpg,.png,.webp,image/jpeg,image/png,image/webp" className="mx-auto mt-3 max-w-xs rounded-lg" />
                  </div>
                  <p className="text-xs text-muted-foreground">Rasio 4:5, maksimal 2 MB. Format JPG, PNG, atau WEBP.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="rounded-lg">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Menyimpan...' : 'Simpan Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-lg">Batal</Button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="table-heading">Event</TableHead>
                <TableHead className="table-heading">Tanggal</TableHead>
                <TableHead className="table-heading hidden md:table-cell">Lokasi</TableHead>
                <TableHead className="table-heading">Kuota</TableHead>
                <TableHead className="table-heading">Status</TableHead>
                <TableHead className="table-heading text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => {
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = (event.event_date || '').slice(0, 10) >= today;
                return (
                  <TableRow key={event.id} className="hover:bg-muted/30">
                    <TableCell className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[#ECF3FF]">
                          {event.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#465FFF]">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">{event.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{index + 1}. {event.tema || 'Tanpa tema'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="table-cell">
                      <div className="font-medium text-foreground">{formatDateIndo(event.event_date)}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {event.open_gate?.slice(0, 5) && `Buka ${event.open_gate?.slice(0, 5)}`}
                        {event.start_time?.slice(0, 5) && ` · Mulai ${event.start_time?.slice(0, 5)}`}
                      </div>
                    </TableCell>
                    <TableCell className="table-cell hidden md:table-cell">{event.location || '-'}</TableCell>
                    <TableCell className="table-cell">
                      <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === event.id || event.quota === null || (event.quota ?? 0) <= event.registrations_count}
                          onClick={() => void updateQuota(event, -1)}
                          aria-label={`Kurangi kuota ${event.title}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold text-foreground">{event.quota ?? '∞'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={quotaUpdating === event.id}
                          onClick={() => void updateQuota(event, 1)}
                          aria-label={`Tambah kuota ${event.title}`}
                        >
                          {quotaUpdating === event.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{event.registrations_count} terdaftar</p>
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
                          <Link href={`/admin/events/${event.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Hapus event ini?"
                          description="Tindakan ini tidak dapat dibatalkan."
                          onConfirm={() => void handleDelete(event.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!events.length && (
            <EmptyState
              icon={CalendarDays}
              title="Belum ada event"
              description="Mulai dengan membuat event baru."
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
