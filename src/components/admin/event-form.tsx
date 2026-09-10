'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Info, MapPin, Image, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertError } from '@/components/ui/alert';

interface EventFormProps {
  onClose: () => void;
  onSaved: () => void;
  error: string;
  onError: (message: string) => void;
}

export function EventForm({ onClose, onSaved, error, onError }: EventFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSaving(true);
    onError('');
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
      onClose();
      onSaved();
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Gagal menyimpan event.';
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
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Batal</Button>
        </div>
      </form>
    </motion.div>
  );
}