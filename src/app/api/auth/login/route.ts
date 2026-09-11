import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSession, setSessionCookie, verifyPassword } from '@/lib/auth';
import { RateLimiter } from '@/lib/rateLimit';
import { checkCsrf } from '@/lib/csrf';
import { getClientIp } from '@/lib/ip';

// Brute-force protection: 5 attempts per minute per IP+username,
// 30 attempts per minute per IP overall (in-memory, per-instance).
// A persistent per-account lockout is enforced in Postgres below.
const usernameLimiter = new RateLimiter(5, 60 * 1000);
const ipLimiter = new RateLimiter(30, 60 * 1000);

const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000;

// Set once a PostgREST 42703 ("column does not exist") is observed while
// selecting login_attempts / locked_until, so the fallback select in POST
// runs instead without repeating the failing query on every request.
let lockoutColumnsMissing = false;

export async function POST(request: NextRequest) {
  if (!(await checkCsrf(request))) {
    return NextResponse.json(
      { message: 'Validasi CSRF gagal. Silakan refresh halaman dan coba lagi.' },
      { status: 403 }
    );
  }

  const { username, password, remember } = await request.json();
  if (!username || !password) return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 422 });

  const ip = getClientIp(request);
  const normalizedUsername = String(username).trim().toLowerCase();

  if (!ipLimiter.check(ip) || !usernameLimiter.check(`${ip}:${normalizedUsername}`)) {
    return NextResponse.json({ message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' }, { status: 429 });
  }

  const supabase = createServiceClient();

  // The persistent lockout columns were added to schema.sql but can be missing
  // on databases created before that migration. Detect a missing column and
  // fall back to the base columns so login keeps working; the run-time lockout
  // below simply degrades until ALTER TABLE ... ADD COLUMN is applied.
  const baseSelect = 'id, name, email, username, password, is_admin';
  const fullSelect = `${baseSelect}, login_attempts, locked_until`;

  interface LoginUser {
    id: string;
    name: string;
    email: string | null;
    username: string;
    password: string;
    is_admin: boolean;
    login_attempts?: number | null;
    locked_until?: string | null;
  }

  const match = (select: string) =>
    supabase
      .from('users')
      .select(select)
      .eq('username', String(username).slice(0, 64))
      .eq('is_admin', true);

  let user: LoginUser | null = null;
  let columnsMissing = lockoutColumnsMissing;

  if (!columnsMissing) {
    const { data, error } = await match(fullSelect).single();
    if (error && (error.code === '42703' || /does not exist/.test(error.message))) {
      lockoutColumnsMissing = true;
      columnsMissing = true;
    } else {
      user = (data as unknown as LoginUser) || null;
    }
  }

  if (columnsMissing && !user) {
    const { data } = await match(baseSelect).single();
    user = (data as unknown as LoginUser) || null;
  }

  if (user?.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return NextResponse.json({ message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' }, { status: 423 });
  }

  if (!user || !(await verifyPassword(String(password), user.password))) {
    // Record the failed attempt (persistent across instances).
    if (user) {
      const attempts = (user.login_attempts ?? 0) + 1;
      const lock = attempts >= MAX_LOGIN_ATTEMPTS;
      await supabase
        .from('users')
        .update({
          login_attempts: lock ? 0 : attempts,
          locked_until: lock ? new Date(Date.now() + LOCKOUT_MS).toISOString() : user.locked_until,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
    return NextResponse.json({ message: 'Username atau password salah.' }, { status: 401 });
  }

  // Success: reset the failure counter and issue a session.
  await supabase
    .from('users')
    .update({ login_attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  setSessionCookie(await createSession(user.id, Boolean(remember)), Boolean(remember));
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } });
}
