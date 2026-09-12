'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Info, MapPin, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertError } from '@/components/ui/alert';

interface ActivityFormProps {
  onClose: () => void;
  onSaved: () => void;
  error: string;
  onError: (message: string) => void;
}

export function ActivityForm({ onClose, onSaved, error, onError }: ActivityFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSaving(true);
    onError('');
    try {
      const response = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          tema: form.get('tema') || null,
          description: form.get('description'),
          activity_date: form.get('activity_date') || null,
          start_time: form.get('start_time') || null,
          location: form.get('location') || null,
          quota: form.get('quota') ? Number(form.get('quota')) : null,
          map_embed_url: form.get('map_embed_url') || null,
          drive_link: form.get('drive_link') || null,
          email_enabled: form.get('email_enabled') === 'on',
          show_activity: form.get('show_activity') === 'true',
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan activity.');
      }
      formElement.reset();
      onClose();
      onSaved();
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Gagal menyimpan activity.';
      onError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
      {error && (
        <AlertError title="Gagal menyimpan">{error}</AlertError>
      )}
      <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(event.currentTarget); }} className="space-y-6">
        {/* ─── Informasi dasar ─── */}
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Informasi Kegiatan</CardTitle>
              <CardDescription>Identitas utama dan deskripsi kegiatan.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="field-label">Judul Kegiatan <span className="text-destructive">*</span></Label>
              <Input type="text" id="title" name="title" required className="rounded-lg" placeholder="Contoh: Latihan Paduan Suara" />
              <p className="text-xs text-muted-foreground">Nama kegiatan yang ditampilkan ke pengunjung website.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tema" className="field-label">Tema</Label>
              <Input type="text" id="tema" name="tema" className="rounded-lg" placeholder="Contoh: Tema Kegiatan" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="field-label">Deskripsi <span className="text-destructive">*</span></Label>
              <Textarea id="description" name="description" rows={4} required className="rounded-lg" placeholder="Tuliskan informasi lengkap tentang kegiatan ini." />
            </div>
          </CardContent>
        </Card>

        {/* ─── Tampilkan di Website ─── */}
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Visibilitas</CardTitle>
              <CardDescription>Tampilkan atau sembunyikan kegiatan di website.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="show_activity" value="true" defaultChecked className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Tampilkan (show)</span>
              </Label>
              <Label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="show_activity" value="false" className="h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Sembunyikan (hide)</span>
              </Label>
              <p className="text-xs text-muted-foreground">Kegiatan akan ditampilkan di website kecuali disembunyikan.</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Jadwal & lokasi ─── */}
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Jadwal & Lokasi</CardTitle>
              <CardDescription>Tanggal, waktu, kuota, dan tempat pelaksanaan.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activity_date" className="field-label">Tanggal Kegiatan <span className="text-destructive">*</span></Label>
                <Input type="date" id="activity_date" name="activity_date" required className="rounded-lg" />
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Jadwal & Lokasi</CardTitle>
              <CardDescription>Tanggal, waktu, kuota, dan tempat pelaksanaan.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activity_date" className="field-label">Tanggal Kegiatan <span className="text-destructive">*</span></Label>
                <Input type="date" id="activity_date" name="activity_date" required className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time" className="field-label">Jam Mulai <span className="text-destructive">*</span></Label>
                <Input type="time" id="start_time" name="start_time" required className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota" className="field-label">Kuota <span className="text-destructive">*</span></Label>
                <Input type="number" id="quota" name="quota" min="1" max="500" required className="rounded-lg" placeholder="Contoh: 100" />
                <p className="text-xs text-muted-foreground">Maksimal 500 pendaftar.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="field-label">Lokasi <span className="text-destructive">*</span></Label>
                <Input type="text" id="location" name="location" required className="rounded-lg" placeholder="Nama gedung / alamat" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Media & tautan ─── */}
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Media & Tautan</CardTitle>
              <CardDescription>Peta dan materi pendukung kegiatan.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="map_embed_url" className="field-label">Google Maps Embed URL <span className="text-destructive">*</span></Label>
                <Input type="url" id="map_embed_url" name="map_embed_url" required className="rounded-lg" placeholder="https://www.google.com/maps/embed?pb=..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drive_link" className="field-label">Drive Link <span className="text-destructive">*</span></Label>
                <Input type="url" id="drive_link" name="drive_link" required className="rounded-lg" placeholder="https://drive.google.com/..." />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <input type="checkbox" name="email_enabled" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
              <span>
                <span className="block text-sm font-medium">Email konfirmasi</span>
                <span className="block text-xs text-muted-foreground">Kirim email konfirmasi kepada pendaftar.</span>
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-lg">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Menyimpan...' : 'Simpan Kegiatan'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Batal</Button>
        </div>
        <input type="hidden" name="show_activity" value="true" />
      </form>
    </motion.div>
  );
}
