/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// Content-Security-Policy covering: Next.js inline scripts/styles, the inline
// theme script, Google Fonts, Google Maps embeds, and reCAPTCHA v2.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://www.google.com https://www.gstatic.com",
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.gstatic.com",
  "worker-src 'self' blob:",
  // Only upgrade http -> https in production; keep localhost dev working.
  ...(!isDev ? ['upgrade-insecure-requests'] : []),
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  // Keep production artifacts separate from the development cache. This
  // prevents `next build` from deleting chunks currently used by `next dev`.
  // On Vercel, builds must output to .next (default). Locally we keep
  // production artifacts separate from the development cache.
  distDir: process.env.VERCEL ? '.next' : process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
      },
    ];
  },
  // Ensure Next.js ignores the old Laravel app/ directory at root
  // All our code lives in src/
};

export default nextConfig;
