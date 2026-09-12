'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, MapPin, Phone, Mail, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

export default function AdminChurchInfoPage() {
  const [info, setInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/church-info').then((r) => r.json()).then(setInfo);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/church-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: form.get('address'),
        map_embed_url: form.get('map_embed_url') || null,
        whatsapp: form.get('whatsapp') || null,
        email: form.get('email') || null,
        instagram_url: form.get('instagram_url') || null,
        youtube_url: form.get('youtube_url') || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Berhasil disimpan!');
    } else {
      toast.error('Gagal menyimpan data.');
    }
  };

  if (!info) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <PageHeader
        icon={<Church className="h-6 w-6" />}
        title="Info Gereja"
        description="Kelola informasi kontak dan lokasi gereja"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
              <Church className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Detail Gereja</CardTitle>
              <CardDescription>Perbarui informasi kontak dan lokasi gereja Anda.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="field-label">
                  Alamat <span className="text-destructive">*</span>
                </Label>
                <Textarea id="address" name="address" required rows={2} defaultValue={info.address || ''} className="rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_embed_url" className="field-label">
                  Google Maps Embed URL
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="url" id="map_embed_url" name="map_embed_url" defaultValue={info.map_embed_url || ''} className="rounded-lg pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="field-label">WhatsApp</Label>
                <Input type="text" id="whatsapp" name="whatsapp" defaultValue={info.whatsapp || ''} placeholder="628xxxxxxxxxx" className="rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-email" className="field-label">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" id="church-email" name="email" defaultValue={info.email || ''} className="rounded-lg pl-9" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="field-label">Instagram URL</Label>
                  <Input type="url" id="instagram_url" name="instagram_url" defaultValue={info.instagram_url || ''} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="field-label">YouTube URL</Label>
                  <Input type="url" id="youtube_url" name="youtube_url" defaultValue={info.youtube_url || ''} className="rounded-lg" />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={saving} className="rounded-lg">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
