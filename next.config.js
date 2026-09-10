/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// Content-Security-Policy is now emitted per-request from middleware.ts with
// a per-request nonce (production) so inline scripts are only allowed when
// stamped with that nonce. Keeping the header only in the middleware source
// prevents a duplicate header (browsers enforce the intersection of both).
const nextConfig = {
  poweredByHeader: false,
  // Keep production artifacts separate from the development cache. This
  // prevents `next build` from deleting chunks currently used by `next dev`.
  // On Vercel, builds must output to .next (default). Locally we keep
  // production artifacts separate from the development cache.
  distDir: process.env.VERCEL ? '.next' : process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  images: {
    // Only Supabase Storage is allowlisted for next/image. Poster images stored
    // in the DB (events/activities) are rendered with plain <img>, which is
    // not affected by remotePatterns.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
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
          // Enforce HTTPS (browsers ignore this header over plain HTTP, so it
          // is safe to emit in dev too). Add `preload` only after submitting
          // the domain to https://hstspreload.org/.
          ...(!isDev
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
        ],
      },
    ];
  },
  // Ensure Next.js ignores the old Laravel app/ directory at root
  // All our code lives in src/
};

export default nextConfig;