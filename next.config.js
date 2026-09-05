/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Keep production artifacts separate from the development cache. This
  // prevents `next build` from deleting chunks currently used by `next dev`.
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
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
        ],
      },
    ];
  },
  // Ensure Next.js ignores the old Laravel app/ directory at root
  // All our code lives in src/
};

export default nextConfig;
