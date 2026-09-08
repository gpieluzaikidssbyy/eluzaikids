'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ShieldCheck, UserCog, KeyRound, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (newPassword && newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter.');
      setSaving(false);
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok.');
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
        toast.error(data.message || 'Gagal menyimpan perubahan.');
        return;
      }
      toast.success(data.message || 'Perubahan berhasil disimpan.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const passwordField = (
    value: string,
    onChange: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void,
    id: string,
    label: string,
    placeholder: string,
    autoComplete: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  if (loading) return <Loading label="Memuat pengaturan..." />;

  return (
    <div>
      <PageHeader
        icon={<Settings className="h-6 w-6" />}
        title="Settings"
        description="Kelola username, email pemulihan, dan password akun admin Anda."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Verifikasi</CardTitle>
              <CardDescription>Masukkan password saat ini untuk menyimpan perubahan akun.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              {passwordField(currentPassword, setCurrentPassword, showPassword, setShowPassword, 'current-password', 'Password saat ini', 'Masukkan password saat ini', 'current-password')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Identitas akun</CardTitle>
              <CardDescription>Username dipakai untuk login dan tampil di dashboard. Email untuk pemulihan password.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={64} required autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email pemulihan <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Ubah password</CardTitle>
              <CardDescription>Kosongkan jika tidak ingin mengganti password.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {passwordField(newPassword, setNewPassword, showNewPassword, setShowNewPassword, 'new-password', 'Password baru', 'Minimal 8 karakter', 'new-password')}
              {passwordField(confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, 'confirm-password', 'Konfirmasi password baru', 'Ulangi password baru', 'new-password')}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="px-6">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}