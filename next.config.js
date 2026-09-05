/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure Next.js ignores the old Laravel app/ directory at root
  // All our code lives in src/
};

export default nextConfig;
