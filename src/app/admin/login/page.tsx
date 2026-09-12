'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
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
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}) },
      body: JSON.stringify({ username: username.slice(0, 64), password, remember: formData.get('remember') === 'on' }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Login gagal.');
      return;
    }
    router.replace('/admin');
  };

  const forgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}) },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Permintaan gagal.');
      return;
    }
    setMessage(data.message);
  };

  return (
    <main className="font-admin-scope flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
      {/* ─── Login card ─── */}
      <div className="w-full max-w-[400px]">
        <div className="rounded-xl border border-border bg-card px-7 py-8 shadow-sm sm:px-8">
          <div className="mb-7 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
              <Image src="/images/logo.webp" alt="GPI Eluzai Kids" width={32} height={32} className="object-contain" />
            </div>
            <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
              {forgotOpen ? 'Reset Password' : 'Eluzai Kids Admin'}
            </h1>
          </div>

          {!forgotOpen ? (
            <form onSubmit={login} className="space-y-5">
              {error && <AlertError title="Login gagal">{error}</AlertError>}

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.slice(0, 64))}
                  maxLength={64}
                  required
                  autoComplete="username"
                  autoFocus
                  placeholder="username"
                  className="h-10 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setError('');
                      setMessage('');
                    }}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-10 bg-background pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <Button disabled={loading} className="h-10 w-full" size="lg">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          ) : (
            <form onSubmit={forgotPassword} className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(false);
                  setError('');
                  setMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke login
              </button>

              {error && <AlertError title="Permintaan gagal">{error}</AlertError>}
              {message && <AlertSuccess title="Instruksi terkirim">{message}</AlertSuccess>}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email admin</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@example.com"
                  className="h-10 bg-background"
                />
              </div>

              <Button disabled={loading} className="h-10 w-full" size="lg">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Mengirim...' : 'Kirim instruksi'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GPI Eluzai Kids
        </p>
      </div>
    </main>
  );
}