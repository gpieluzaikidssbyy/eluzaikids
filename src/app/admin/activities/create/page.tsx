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
import { ClipboardList, Loader2, Info, MapPin, Image } from 'lucide-react';
import { AlertError } from '@/components/ui/alert';

export default function CreateActivityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);
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
        const msg = data.message || 'Gagal menyimpan.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success('Kegiatan berhasil disimpan.');
      router.push('/admin/activities');
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
        icon={<ClipboardList className="h-6 w-6" />}
        iconClassName="bg-amber-500/10 text-amber-500"
        title="Tambah Kegiatan"
        description="Lengkapi seluruh informasi kegiatan di bawah ini."
        backHref="/admin/activities"
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
                <CardTitle className="text-lg">Informasi Kegiatan</CardTitle>
                <CardDescription>Identitas utama dan deskripsi kegiatan.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="field-label">Judul Kegiatan <span className="text-destructive">*</span></Label>
                <Input type="text" id="title" name="title" required className="rounded-lg" placeholder="Contoh: Latihan Paduan Suara" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="field-label">Deskripsi <span className="text-destructive">*</span></Label>
                <Textarea id="description" name="description" rows={4} required className="rounded-lg" placeholder="Tuliskan informasi lengkap tentang kegiatan ini." />
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
                  <Label htmlFor="activity_date" className="field-label">Tanggal <span className="text-destructive">*</span></Label>
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
                  <Label htmlFor="quota" className="field-label">Kuota <span className="text-destructive">*</span></Label>
                  <Input type="number" id="quota" name="quota" min="1" required className="rounded-lg" />
                </div>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <input type="checkbox" name="email_enabled" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
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
                <CardDescription>Peta dan materi pendukung kegiatan.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
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
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="rounded-lg">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Menyimpan...' : 'Simpan Kegiatan'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">
              Batal
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}