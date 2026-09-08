import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'eluzai_admin_session';
const CSRF_COOKIE_NAME = 'eluzai_csrf_token';

function decodeBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return false;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return false;

  const payload = new TextEncoder().encode(new TextDecoder().decode(decodeBase64Url(encoded)));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify('HMAC', key, decodeBase64Url(signature) as unknown as BufferSource, payload);
  if (!valid) return false;

  const [, expiresAt] = new TextDecoder().decode(payload).split('.');
  return Number(expiresAt) >= Math.floor(Date.now() / 1000);
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  // Set CSRF token for public registration pages
  // Kita set cookie untuk server-side validation, tapi juga perlu endpoint khusus
  // untuk client-side JavaScript bisa mendapatkan token
  const isRegistrationPage = request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.includes('/activities/') ||
    request.nextUrl.pathname.includes('/events/');

  if (isRegistrationPage) {
    const response = NextResponse.next();
    const existingCookie = request.cookies.get(CSRF_COOKIE_NAME);
    if (!existingCookie) {
      const token = generateCsrfToken();
      // Set cookie untuk server-side validation (HTTP-only untuk keamanan)
      response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  }

  // Admin API protection
  if (!request.nextUrl.pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  if (!(await isValidSession(request.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const sessionCheckUrl = new URL('/api/auth/session', request.url);
  const sessionResponse = await fetch(sessionCheckUrl, {
    headers: { cookie: request.headers.get('cookie') || '' },
    cache: 'no-store',
  });
  if (!sessionResponse.ok) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const session = await sessionResponse.json() as { authenticated?: boolean; user?: { is_admin?: boolean } | null };
  if (!session.authenticated || session.user?.is_admin !== true) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/register/:path*',
    '/activities/:path*',
    '/events/:path*',
  ],
};
