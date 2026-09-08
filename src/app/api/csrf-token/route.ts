import { NextResponse } from 'next/server';
import { generateClientCsrfToken, verifyClientCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 * Returns a CSRF token that can be used by client-side JavaScript.
 * The token must be sent back in the x-csrf-token header for state-changing requests.
 */
export async function GET() {
  // In production, gunakan session-based approach
  // Untuk demo, kita generate token per-request yang valid selama 1 jam
  const token = await generateClientCsrfToken();

  const response = NextResponse.json({ token });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

/**
 * POST /api/csrf-token/verify
 * Verify that the provided CSRF token is valid.
 * This is useful for validating tokens before making state-changing requests.
 */
export async function POST(request: Request) {
  try {
    const { token, sessionId } = await request.json();
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'Token wajib diisi.' }, { status: 422 });
    }

    const isValid = await verifyClientCsrfToken(token, sessionId || 'default');
    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json({ valid: false, error: 'Gagal memverifikasi token.' }, { status: 500 });
  }
}
