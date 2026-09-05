'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.username === undefined) {
          router.replace('/admin/login');
          return;
        }
        setUsername(d.username);
        setEmail(d.email);
        setLoading(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (newPassword && newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      setSaving(false);
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          username: username.trim(),
          email: email.trim(),
          new_password: newPassword || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Gagal menyimpan perubahan.');
        return;
      }
      setMessage(data.message || 'Perubahan berhasil disimpan.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Kelola username, email pemulihan, dan password akun admin Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400">{error}</div>}
        {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-950 dark:bg-green-950/30 dark:text-green-300">{message}</div>}

        {/* Password verifikasi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Verifikasi</h2>
          <p className="mt-1 text-sm text-slate-500">Masukkan password saat ini untuk menyimpan perubahan akun.</p>
          <div className="mt-4 max-w-md">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password saat ini <span className="text-red-500">*</span></label>
            <span className="relative block mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field pr-12"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-brand-600">
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6a12.8 12.8 0 0 1-3.1 3.8M6.2 6.2C3.9 7.7 2.5 10 2.5 10s3.5 6 9.5 6c1 0 1.9-.1 2.7-.4" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                )}
              </button>
            </span>
          </div>
        </div>

        {/* Identitas akun */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Identitas akun</h2>
          <p className="mt-1 text-sm text-slate-500">Username dipakai untuk login dan tampil di dashboard. Email untuk pemulihan password.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username <span className="text-red-500">*</span></label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={64} required autoComplete="username" className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email pemulihan <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="input-field mt-1" />
            </div>
          </div>
        </div>

        {/* Password baru */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Ubah password</h2>
          <p className="mt-1 text-sm text-slate-500">Kosongkan jika tidak ingin mengganti password.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} autoComplete="new-password" placeholder="Minimal 8 karakter" className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Konfirmasi password baru</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Ulangi password baru" className="input-field mt-1" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <p className="text-xs text-slate-400">Perubahan langsung tersimpan ke database.</p>
        </div>
      </form>
    </div>
  );
}