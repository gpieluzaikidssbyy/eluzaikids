'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertError, AlertSuccess } from '@/components/ui/alert';
import { fetchCsrfToken } from '@/lib/csrf-client';

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
    void fetchCsrfToken().then((token) => setCsrfToken(token));
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
    <main className="relative flex min-h-screen bg-background">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={56} height={56} className="object-contain" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-white">GPI Eluzai Kids</h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-300">
              Panel administrasi untuk mengelola website gereja.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-white/80" />
            <span className="text-xs font-medium text-white/80">Akses terbatas untuk admin</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
              <Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={36} height={36} className="object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {forgotOpen ? 'Reset Password' : 'Masuk ke Panel Admin'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {forgotOpen
                ? 'Masukkan email admin untuk menerima instruksi reset password.'
                : 'Masukkan kredensial Anda untuk mengakses panel admin.'}
            </p>
          </div>

          {!forgotOpen ? (
            <form onSubmit={login} className="space-y-4">
              {error && (
                <AlertError title="Login gagal">{error}</AlertError>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(event) => setUsername(event.target.value.slice(0, 64))} maxLength={64} required autoComplete="username" placeholder="Username admin" className="h-11" />
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
                  <Input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Password" className="h-11 pr-12" />
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
              <div className="flex items-center gap-2.5">
                <input type="checkbox" name="remember" id="remember" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">Ingat saya</label>
              </div>
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
              {error && (
                <AlertError title="Permintaan gagal">{error}</AlertError>
              )}
              {message && (
                <AlertSuccess title="Instruksi terkirim">{message}</AlertSuccess>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email admin</Label>
                <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" placeholder="admin@eluzai.id" className="h-11" />
              </div>
              <Button disabled={loading} className="h-11 w-full" size="lg">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Mengirim...' : 'Kirim instruksi'}
              </Button>
            </form>
          )}

          <p className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} GPI Eluzai Kids
          </p>
        </motion.div>
      </div>
    </main>
  );
}
