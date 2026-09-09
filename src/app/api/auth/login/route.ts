import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSession, setSessionCookie, verifyPassword } from '@/lib/auth';
import { RateLimiter } from '@/lib/rateLimit';
import { checkCsrf } from '@/lib/csrf';

// Brute-force protection: 5 attempts per minute per IP+username,
// 30 attempts per minute per IP overall.
const usernameLimiter = new RateLimiter(5, 60 * 1000);
const ipLimiter = new RateLimiter(30, 60 * 1000);

export async function POST(request: NextRequest) {
  if (!(await checkCsrf(request))) {
    return NextResponse.json(
      { message: 'Validasi CSRF gagal. Silakan refresh halaman dan coba lagi.' },
      { status: 403 }
    );
  }

  const { username, password, remember } = await request.json();
  if (!username || !password) return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 422 });

  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown')
    .split(',')[0]
    .trim();
  const normalizedUsername = String(username).trim().toLowerCase();

  if (!ipLimiter.check(ip) || !usernameLimiter.check(`${ip}:${normalizedUsername}`)) {
    return NextResponse.json({ message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' }, { status: 429 });
  }

  const { data: user } = await createServiceClient().from('users').select('id, name, email, username, password, is_admin').eq('username', String(username).slice(0, 64)).eq('is_admin', true).single();
  if (!user || !(await verifyPassword(String(password), user.password))) {
    return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
  }

  setSessionCookie(createSession(user.id, Boolean(remember)), Boolean(remember));
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } });
}
