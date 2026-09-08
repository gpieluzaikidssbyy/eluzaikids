'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertError, AlertSuccess } from '@/components/ui/alert';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.get('token'), password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Reset password gagal.');
      return;
    }
    setMessage(data.message);
    window.setTimeout(() => router.replace('/admin/login'), 1500);
  };

  return (
    <main className="font-admin-scope relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={48} height={48} className="object-contain" />
          </div>
          <p className="mt-4 font-display text-xl font-bold text-foreground">Eluzai Kids</p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <LockKeyhole className="h-3.5 w-3.5" />
              Reset password
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">Buat password baru</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Masukkan password baru untuk akun admin Anda.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <AlertError title="Reset gagal">{error}</AlertError>
            )}
            {message && (
              <AlertSuccess title="Password berhasil diubah">{message}</AlertSuccess>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password baru</Label>
              <Input id="password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Minimal 8 karakter" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Konfirmasi password</Label>
              <Input id="confirmation" type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Ulangi password baru" />
            </div>
            <Button disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : 'Simpan password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}