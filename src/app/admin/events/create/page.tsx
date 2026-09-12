'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { CalendarDays, Loader2, ImageIcon, Info, MapPin, Image } from 'lucide-react';
import { AlertError } from '@/components/ui/alert';

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        const msg = data.message || 'Gagal menyimpan.';
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success('Event berhasil disimpan.');
      router.push('/admin/events');
    } catch {
      const msg = 'Terjadi kesalahan.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Tambah Event"
        description="Lengkapi seluruh informasi event di bawah ini."
        backHref="/admin/events"
      />

      {error && (
        <AlertError title="Gagal menyimpan">{error}</AlertError>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* ─── Tampilkan di Website ─── */}
          <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Visibilitas</CardTitle>
                <CardDescription>Tampilkan atau sembunyikan event di website.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="show_event" value="true" defaultChecked className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Tampilkan (show)</span>
                </Label>
                <Label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="show_event" value="false" className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Sembunyikan (hide)</span>
                </Label>
                <p className="text-xs text-muted-foreground">Event akan ditampilkan di website kecuali disembunyikan.</p>
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
              </div>
              <label className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input type="checkbox" name="email_enabled" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>
                  <span className="block text-sm font-medium">Email konfirmasi</span>
                  <span className="block text-xs text-muted-foreground">Kirim email konfirmasi setelah pendaftaran berhasil.</span>
                </span>
              </label>

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
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">Batal</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}