'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.slice(0, 64), password, remember: formData.get('remember') === 'on' }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.message || 'Login gagal.'); return; }
    router.replace('/admin');
  };

  const forgotPassword = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.message || 'Permintaan gagal.'); return; }
    setMessage(data.message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-slate-900">
        <div className="text-center"><Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={64} height={64} className="mx-auto object-contain" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Admin access</p><h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Masuk untuk mengelola website GPI Eluzai Kids.</p></div>
        {!forgotOpen ? <form onSubmit={login} className="mt-7 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <label><span className="field-label">Username</span><input value={username} onChange={(event) => setUsername(event.target.value.slice(0, 64))} maxLength={64} required autoComplete="username" className="input-field mt-1" /></label>
          <label><span className="field-label">Password</span><span className="relative block mt-1"><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="input-field pr-12" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-brand-600">
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6a12.8 12.8 0 0 1-3.1 3.8M6.2 6.2C3.9 7.7 2.5 10 2.5 10s3.5 6 9.5 6c1 0 1.9-.1 2.7-.4" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
            )}
          </button></span></label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><input type="checkbox" name="remember" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /> Remember me</label>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Signing in...' : 'Login'}</button>
          <button type="button" onClick={() => { setForgotOpen(true); setError(''); }} className="w-full text-center text-sm font-medium text-brand-600 hover:underline">Forget password?</button>
        </form> : <form onSubmit={forgotPassword} className="mt-7 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          <label><span className="field-label">Email user</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" className="input-field mt-1" placeholder="admin@example.com" /></label>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Mengirim...' : 'Kirim instruksi'}</button>
          <button type="button" onClick={() => setForgotOpen(false)} className="w-full text-center text-sm font-medium text-slate-500 hover:text-brand-600">Kembali ke login</button>
        </form>}
      </div>
    </main>
  );
}
