import { NextRequest, NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = 'eluzai_csrf_token';

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Per-request nonce for Content-Security-Policy. Generated in the Edge
 * runtime, so it avoids Node-only APIs such as `Buffer` or `crypto.randomUUID`.
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(Array.from(array, (byte) => String.fromCharCode(byte)).join(''));
}

/**
 * Next.js 14 only reads the nonce for stamping its own inline scripts
 * (`self.__next_f` hydration chunks) from the *request's*
 * `Content-Security-Policy` header — the `x-nonce` header is never consulted
 * by this version. So the CSP must be forwarded as a request header too;
 * otherwise every inline script is rendered without a nonce while the response
 * CSP demands `'nonce-...'`, and the browser blocks them all (blank client
 * pages, e.g. the admin panel).
 */
const CSP_HEADER_NAME = 'Content-Security-Policy';

/**
 * Strict CSP in production: script-src allows 'self' plus reCAPTCHA hosts and
 * relies on nonces for every inline script. Next.js stamps its own inline
 * scripts with the nonce from the `x-nonce` request header. Dev mode keeps
 * the permissive values Next requires for HMR.
 */
function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com"
    : `'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com`;
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://www.google.com https://www.gstatic.com",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.gstatic.com",
    "worker-src 'self' blob:",
    ...(!isDev ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

/**
 * Sessions are revocable server-side rows (see src/lib/auth.ts), so the
 * source of truth is the session API. Middleware delegates to it instead of
 * doing its own cookie verification.
 */
async function getAdminSession(request: NextRequest): Promise<{ authenticated: boolean; isAdmin: boolean }> {
  const sessionUrl = new URL('/api/auth/session', request.url);
  try {
    const response = await fetch(sessionUrl, {
      headers: { cookie: request.headers.get('cookie') || '' },
      cache: 'no-store',
    });
    if (!response.ok) return { authenticated: false, isAdmin: false };
    const session = (await response.json()) as { authenticated?: boolean; user?: { is_admin?: boolean } | null };
    return { authenticated: Boolean(session.authenticated), isAdmin: session.user?.is_admin === true };
  } catch {
    return { authenticated: false, isAdmin: false };
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy(nonce);

  // Propagate the nonce AND the CSP so Next.js stamps its own inline scripts
  // with the same nonce (Next 14 reads the nonce out of the request CSP).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(CSP_HEADER_NAME, csp);
  const passThrough = () => NextResponse.next({ request: { headers: requestHeaders } });

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isRegistrationPage = pathname.startsWith('/register') ||
    pathname.includes('/activities/') ||
    pathname.includes('/events/');

  let response: NextResponse;

  if (isAdminPage) {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/reset-password')) {
      response = passThrough();
    } else {
      const session = await getAdminSession(request);
      if (!session.authenticated) {
        response = NextResponse.redirect(new URL('/admin/login', request.url));
      } else {
        response = passThrough();
      }
    }
  } else if (pathname.startsWith('/api/admin/')) {
    const session = await getAdminSession(request);
    if (!session.authenticated) {
      response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    } else if (!session.isAdmin) {
      response = NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    } else {
      response = passThrough();
    }
  } else if (isRegistrationPage) {
    // Set CSRF token for public registration pages
    // Kita set cookie untuk server-side validation, tapi juga perlu endpoint khusus
    // untuk client-side JavaScript bisa mendapatkan token
    response = passThrough();
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
  } else {
    response = passThrough();
  }

  response.headers.set(CSP_HEADER_NAME, csp);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif|avif|woff2?)$).*)',
  ],
};