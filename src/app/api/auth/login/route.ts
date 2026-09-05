import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSession, setSessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password, remember } = await request.json();
  if (!username || !password) return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 422 });

  const { data: user } = await createServiceClient().from('users').select('id, name, email, username, password, is_admin').eq('username', String(username).slice(0, 64)).eq('is_admin', true).single();
  if (!user || !(await verifyPassword(String(password), user.password))) {
    return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
  }

  setSessionCookie(createSession(user.id, Boolean(remember)), Boolean(remember));
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } });
}
