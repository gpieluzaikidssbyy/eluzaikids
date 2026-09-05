import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (typeof token !== 'string' || token.length !== 64 || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ message: 'Token atau password tidak valid.' }, { status: 422 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = createServiceClient();
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, updated_at')
    .eq('remember_token', tokenHash)
    .eq('is_admin', true)
    .maybeSingle();

  if (findError) throw findError;
  if (!user || Date.now() - new Date(user.updated_at).getTime() > 60 * 60 * 1000) {
    return NextResponse.json({ message: 'Token reset sudah tidak berlaku.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { error } = await supabase
    .from('users')
    .update({ password: passwordHash, remember_token: null, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) throw error;

  return NextResponse.json({ message: 'Password berhasil diperbarui.' });
}
