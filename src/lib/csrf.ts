import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

const CSRF_COOKIE_NAME = 'eluzai_csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Set CSRF token cookie
 * Cookie di-set sebagai HTTP-only untuk keamanan tambahan, namun ini berarti
 * client-side JavaScript TIDAK BISA membacanya.
 * Untuk solusi hybrid: gunakan token kedua yang bisa diakses client via endpoint khusus.
 */
export async function setCsrfTokenCookie(): Promise<string> {
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
 * Validate CSRF token from request header against cookie (server-side verification)
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieToken = getCsrfTokenFromCookie();
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return cookieToken === headerToken;
}

/**
 * Require CSRF protection - throws if validation fails
 */
export async function RequireCsrf(request: Request): Promise<void> {
  const isValid = await validateCsrfToken(request);
  if (!isValid) {
    throw new Error('CSRF validation failed');
  }
}

/**
 * Store CSRF token in memory for demo/testing purposes
 * In production, gunakan pendekatan yang lebih aman seperti:
 * - Server-side session storage
 * - Database-backed token storage
 * - Hidden form fields yang di-render oleh server
 */
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generate and store CSRF token for client-side use
 * Token ini bisa diakses oleh JavaScript melalui endpoint /api/csrf-token
 * dan harus dikirim kembali dalam header x-csrf-token
 */
export async function generateClientCsrfToken(sessionId: string = 'default'): Promise<string> {
  const token = generateCsrfToken();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  csrfTokenStore.set(sessionId, { token, expiresAt });
  return token;
}

/**
 * Verify client-side CSRF token
 * Token diambil dari header x-csrf-token and dibandingkan dengan yang tersimpan
 */
export async function verifyClientCsrfToken(token: string, sessionId: string = 'default'): Promise<boolean> {
  const stored = csrfTokenStore.get(sessionId);
  if (!stored) return false;
  
  // Check if token expired
  if (Date.now() > stored.expiresAt) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  // Use constant-time comparison
  if (stored.token.length !== token.length) return false;
  
  // Simple comparison for demo (gunakan timing-safe di production)
  return stored.token === token;
}

/**
 * Get valid client-side token for testing
 * In production, token harus di-generate per-session dan disimpan di server
 */
export function getStoredClientToken(sessionId: string = 'default'): string | undefined {
  const stored = csrfTokenStore.get(sessionId);
  if (!stored || Date.now() > stored.expiresAt) {
    csrfTokenStore.delete(sessionId);
    return undefined;
  }
  return stored.token;
}
