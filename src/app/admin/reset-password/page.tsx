'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
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
    window.setTimeout(() => router.replace('/admin/login'), 1200);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-slate-900">
        <div className="text-center">
          <Image src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" width={64} height={64} className="mx-auto object-contain" />
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">Buat Password Baru</h1>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          <label><span className="field-label">Password baru</span><input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="input-field mt-1" autoComplete="new-password" /></label>
          <label><span className="field-label">Konfirmasi password</span><input type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="input-field mt-1" autoComplete="new-password" /></label>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan password'}</button>
        </form>
      </div>
    </main>
  );
}
