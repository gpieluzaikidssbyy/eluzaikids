import { cookies } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const CSRF_COOKIE_NAME = 'eluzai_csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Set CSRF token cookie.
 * Cookie di-set sebagai HTTP-only sehingga client-side JavaScript tidak bisa
 * membacanya langsung. Client mendapat token yang sama melalui GET /api/csrf-token
 * dan mengirimnya kembali lewat header x-csrf-token.
 */
async function setCsrfTokenCookie(): Promise<string> {
  const token = generateCsrfToken();
  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(): string | undefined {
  return cookies().get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Ensure a CSRF cookie exists and return its value (creating one if missing).
 * Digunakan oleh GET /api/csrf-token agar token yang dikembalikan ke client
 * selalu VALID dan cocok dengan cookie yang diverifikasi server.
 */
export async function ensureCsrfToken(): Promise<string> {
  const existing = getCsrfTokenFromCookie();
  if (existing) return existing;
  return setCsrfTokenCookie();
}

/**
 * Validate CSRF token from request header against cookie (server-side verification)
 */
async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieToken = getCsrfTokenFromCookie();
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Require CSRF protection - returns false if validation fails
 */
export async function checkCsrf(request: Request): Promise<boolean> {
  return validateCsrfToken(request);
}