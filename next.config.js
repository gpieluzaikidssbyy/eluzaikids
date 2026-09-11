// `phase` is guaranteed to be set when this file is evaluated, unlike
// process.env.NODE_ENV (a known Next.js gotcha). Relying on NODE_ENV
// previously made production `next build` / `next start` fall through to .next
// and collide with the running `next dev` server over the same build dir.
// PHASE_PRODUCTION_BUILD === 'phase-production-build',
// PHASE_PRODUCTION_SERVER === 'phase-production-server' (stable in Next.js).
export default (phase, { defaultConfig }) => {
  const isDev =
    phase !== 'phase-production-build' && phase !== 'phase-production-server';

  // On Vercel's platform the build MUST output to .next (the default), so the
  // custom distDir only applies locally. Previously this branch keyed off
  // `process.env.VERCEL`, but our .env.local (pulled via `vercel env pull`)
  // also contained VERCEL=1, which Next loads into process.env before this
  // file runs — making local `next build`/`next start` fall through to .next
  // and collide with the running `next dev`. The extra CI check keeps this
  // robust even if a future `vercel env pull` re-adds VERCEL vars locally
  // (Vercel sets CI=true only on its own platform, not in .env.local).
  const onVercel = process.env.VERCEL === '1' && process.env.CI === 'true';

  // Content-Security-Policy is now emitted per-request from middleware.ts with
  // a per-request nonce (production) so inline scripts are only allowed when
  // stamped with that nonce. Keeping the header only in the middleware source
  // prevents a duplicate header (browsers enforce the intersection of both).
  const nextConfig = {
    poweredByHeader: false,
    // Keep production artifacts separate from the development cache. This
    // prevents `next build` from deleting chunks currently used by `next dev`.
    // On Vercel, builds must output to .next (default). Locally development
    // uses .next and production build/start use .next-build.
    distDir: onVercel ? '.next' : isDev ? '.next' : '.next-build',
    images: {
      // Only Supabase Storage is allowlisted for next/image. Poster images
      // stored in the DB (events/activities) are rendered with plain <img>,
      // which is not affected by remotePatterns.
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
            // Enforce HTTPS (browsers ignore this header over plain HTTP, so
            // it is safe to emit in dev too). Add `preload` only after
            // submitting the domain to https://hstspreload.org/.
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

  return nextConfig;
};