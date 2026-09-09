'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertError, AlertSuccess } from '@/components/ui/alert';

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
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/csrf-token')
      .then((response) => response.json())
      .then((data) => setCsrfToken(typeof data.token === 'string' ? data.token : null))
      .catch(() => setCsrfToken(null));
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}) }, body: JSON.stringify({ username: username.slice(0, 64), password, remember: formData.get('remember') === 'on' }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.message || 'Login gagal.'); return; }
    router.replace('/admin');
  };

  const forgotPassword = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}) }, body: JSON.stringify({ email }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.message || 'Permintaan gagal.'); return; }
    setMessage(data.message);
  };

  return (
    <main className="font-admin-scope relative flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
            <Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={36} height={36} className="object-contain" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
            Sign in to admin
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Masuk untuk mengelola website GPI Eluzai Kids.
          </p>
        </div>

        {!forgotOpen ? (
          <form onSubmit={login} className="space-y-4">
            {error && (
              <AlertError title="Login gagal">{error}</AlertError>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(event) => setUsername(event.target.value.slice(0, 64))} maxLength={64} required autoComplete="username" placeholder="Masukkan username admin" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setError(''); setMessage(''); }}
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Masukkan password" className="h-11 pr-12" />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
              <input type="checkbox" name="remember" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              Ingat saya
            </label>
            <Button disabled={loading} className="h-11 w-full" size="lg">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Memasuki panel...' : 'Masuk'}
            </Button>
          </form>
        ) : (
          <form onSubmit={forgotPassword} className="space-y-4">
            <button
              type="button"
              onClick={() => { setForgotOpen(false); setError(''); setMessage(''); }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke login
            </button>
            <p className="text-sm text-muted-foreground">
              Masukkan email user admin untuk menerima instruksi reset password.
            </p>
            {error && (
              <AlertError title="Permintaan gagal">{error}</AlertError>
            )}
            {message && (
              <AlertSuccess title="Instruksi terkirim">{message}</AlertSuccess>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email user</Label>
              <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" placeholder="admin@example.com" className="h-11" />
            </div>
            <Button disabled={loading} className="h-11 w-full" size="lg">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Mengirim...' : 'Kirim instruksi'}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GPI Eluzai Kids · Panel admin internal
        </p>
      </motion.div>
    </main>
  );
}
