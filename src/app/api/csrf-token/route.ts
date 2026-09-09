import { NextResponse } from 'next/server';
import { ensureCsrfToken, getCsrfTokenFromCookie } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 * Returns the CSRF token that matches the eluzai_csrf_token cookie.
 * The client must send it back in the x-csrf-token header for state-changing
 * requests, where the server compares it against the cookie (httpOnly).
 */
export async function GET() {
  // Pastikan cookie ada (di-set jika belum) dan kembalikan nilainya ke client.
  const token = await ensureCsrfToken();

  const response = NextResponse.json({ token });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

/**
 * POST /api/csrf-token/verify
 * Verify that the provided CSRF token matches the active cookie.
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'Token wajib diisi.' }, { status: 422 });
    }

    const cookieToken = getCsrfTokenFromCookie();
    const valid = Boolean(cookieToken) && token.length === cookieToken!.length && token === cookieToken;
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false, error: 'Gagal memverifikasi token.' }, { status: 500 });
  }
}