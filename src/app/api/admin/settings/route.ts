import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase';
import { getSessionUser, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ username: user.username || '', email: user.email, name: user.name });
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const currentPassword = String(body.current_password || '');
  if (!currentPassword) {
    return NextResponse.json({ message: 'Password saat ini wajib diisi.' }, { status: 422 });
  }

  const supabase = createServiceClient();
  const { data: dbUser } = await supabase
    .from('users')
    .select('username, email, password')
    .eq('id', user.id)
    .eq('is_admin', true)
    .single();

  if (!dbUser || !(await verifyPassword(currentPassword, dbUser.password))) {
    return NextResponse.json({ message: 'Password saat ini salah.' }, { status: 401 });
  }

  const update: Record<string, string> = {};
  const messages: string[] = [];

  if (body.username !== undefined && String(body.username).trim() !== dbUser.username) {
    const username = String(body.username).trim().slice(0, 64);
    if (username.length < 3) {
      return NextResponse.json({ message: 'Username minimal 3 karakter.' }, { status: 422 });
    }
    const { data: clash } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (clash && clash.id !== user.id) {
      return NextResponse.json({ message: 'Username sudah digunakan akun lain.' }, { status: 409 });
    }
    update.username = username;
    messages.push('Username berhasil diperbarui');
  }

  if (body.email !== undefined && String(body.email).trim().toLowerCase() !== dbUser.email) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Format email tidak valid.' }, { status: 422 });
    }
    const { data: clash } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (clash && clash.id !== user.id) {
      return NextResponse.json({ message: 'Email sudah digunakan akun lain.' }, { status: 409 });
    }
    update.email = email;
    messages.push('Email pemulihan berhasil diperbarui');
  }

  if (body.new_password) {
    const newPassword = String(body.new_password);
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password baru minimal 8 karakter.' }, { status: 422 });
    }
    update.password = await bcrypt.hash(newPassword, 12);
    messages.push('Password berhasil diperbarui');
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: 'Tidak ada perubahan yang disimpan.' }, { status: 422 });
  }

  const { error } = await supabase
    .from('users')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ message: messages.join(', '), username: update.username ?? dbUser.username });
}