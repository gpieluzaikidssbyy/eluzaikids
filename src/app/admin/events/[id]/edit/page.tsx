'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { CalendarDays, Loader2, Info, MapPin, Image } from 'lucide-react';
import { AlertError } from '@/components/ui/alert';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/events/${params.id}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          tema: form.get('tema') || null,
          description: form.get('description'),
          event_date: form.get('event_date'),
          open_gate: form.get('open_gate') || null,
          start_time: form.get('start_time') || null,
          location: form.get('location') || null,
          quota: form.get('quota') ? Number(form.get('quota')) : null,
          map_embed_url: form.get('map_embed_url') || null,
          drive_link: form.get('drive_link') || null,
          registration_deadline: form.get('registration_deadline') || null,
          email_enabled: form.get('email_enabled') === 'on',
          show_event: form.get('show_event') === 'true',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const msg = data.message || 'Gagal menyimpan.';
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success('Perubahan berhasil disimpan.');
      router.push('/admin/events');
    } catch {
      const msg = 'Terjadi kesalahan.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
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
      className="mx-auto max-w-3xl space-y-6"
    >
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Edit Event"
        description="Ubah informasi event."
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
                <Input type="text" id="title" name="title" required defaultValue={event.title} className="rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tema" className="field-label">Tema</Label>
                <Input type="text" id="tema" name="tema" defaultValue={event.tema || ''} className="rounded-lg" placeholder="Contoh: Petualangan Keluarga Bahagia" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="field-label">Deskripsi <span className="text-destructive">*</span></Label>
                <Textarea id="description" name="description" rows={4} required defaultValue={event.description || ''} className="rounded-lg" />
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
                  <input
                    type="radio"
                    name="show_event"
                    value="true"
                    defaultChecked={event.show_event !== false}
                    className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Tampilkan (show)</span>
                </Label>
                <Label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="show_event"
                    value="false"
                    defaultChecked={event.show_event === false}
                    className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Sembunyikan (hide)</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {event.show_event !== false
                    ? 'Event ini ditampilkan di website.' 
                    : 'Event ini disembunyikan dari website.'}
                </p>
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
                  <Input type="date" id="event_date" name="event_date" required defaultValue={event.event_date?.slice(0, 10)} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline" className="field-label">Batas Pendaftaran <span className="text-destructive">*</span></Label>
                  <Input type="datetime-local" id="registration_deadline" name="registration_deadline" required defaultValue={event.registration_deadline?.slice(0, 16) || ''} className="rounded-lg" />
                  <p className="text-xs text-muted-foreground">Waktu terakhir pengunjung dapat mendaftar.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="open_gate" className="field-label">Open Gate <span className="text-destructive">*</span></Label>
                  <Input type="time" id="open_gate" name="open_gate" required defaultValue={event.open_gate?.slice(0, 5) || ''} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="field-label">Jam Mulai <span className="text-destructive">*</span></Label>
                  <Input type="time" id="start_time" name="start_time" required defaultValue={event.start_time?.slice(0, 5) || ''} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="field-label">Lokasi <span className="text-destructive">*</span></Label>
                  <Input type="text" id="location" name="location" required defaultValue={event.location || ''} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota" className="field-label">Kuota</Label>
                  <div className="flex gap-2">
                    <Input type="number" id="quota" name="quota" min="1" max="500" defaultValue={event.quota || ''} disabled={event.quota === null} className="rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'shrink-0 rounded-lg',
                        event.quota === null && 'bg-primary/10 text-primary border-primary'
                      )}
                      title="Set kuota tidak terbatas"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const unlimited = input.disabled;
                        input.disabled = !unlimited;
                        if (!unlimited) input.removeAttribute('name');
                        else input.name = 'quota';
                        e.currentTarget.classList.toggle('bg-primary/10', !unlimited);
                        e.currentTarget.classList.toggle('text-primary', !unlimited);
                        e.currentTarget.classList.toggle('border-primary', !unlimited);
                      }}
                    >
                      Unlimited
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Maksimal 500 pendaftar, atau pilih Unlimited.</p>
                </div>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input type="checkbox" name="email_enabled" defaultChecked={event.email_enabled !== false} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>
                  <span className="block text-sm font-medium">Email konfirmasi</span>
                  <span className="block text-xs text-muted-foreground">Kirim email konfirmasi setelah pendaftaran berhasil.</span>
                </span>
              </label>
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
                <CardDescription>Peta dan materi pendukung event.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="map_embed_url" className="field-label">Google Maps Embed URL</Label>
                  <Input type="url" id="map_embed_url" name="map_embed_url" defaultValue={event.map_embed_url || ''} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drive_link" className="field-label">Drive Link</Label>
                  <Input type="url" id="drive_link" name="drive_link" defaultValue={event.drive_link || ''} className="rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="rounded-lg">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">Batal</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}