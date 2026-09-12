'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, Info } from 'lucide-react';
import { MEMBER_CLASSES } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';

export default function CreateMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.get('name'), class: form.get('class') }),
    });
    router.push('/admin/members');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <PageHeader
        icon={<UserPlus className="h-6 w-6" />}
        title="Tambahkan Nama Anak"
        description="Daftarkan anak baru ke dalam sistem."
        backHref="/admin/members"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Card className="rounded-lg border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF3FF] text-[#465FFF]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Data Anak</CardTitle>
              <CardDescription>Isi identitas anak baru di bawah ini.</CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="field-label">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input type="text" id="name" name="name" required placeholder="Masukkan nama anak" className="rounded-lg" />
                <p className="text-xs text-muted-foreground">Nama lengkap anak yang akan tampil di sistem.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class" className="field-label">
                  Kelas <span className="text-destructive">*</span>
                </Label>
                <Select name="class" id="class" required className="rounded-lg">
                  {MEMBER_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  Kelas menentukan kelompok presensi anak.
                </p>
              </div>
            </CardContent>
            <div className="flex gap-3 border-t border-border/40 px-6 py-5">
              <Button type="submit" disabled={saving} className="rounded-lg">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg">Batal</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}