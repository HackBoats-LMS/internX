import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inject NEXTAUTH_URL to client side so next-auth/react knows the basePath
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Vercel handles compression at the edge — disabling it here avoids double-compression.
  compress: false,

  // Remove the X-Powered-By header for security.
  poweredByHeader: false,

  // Strict TypeScript checking during builds — fail on type errors.
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization configuration for Vercel.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.hackboats.com',
        pathname: '/images/**',
      },
    ],
  },

  // Merged security headers from hb-exam
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  experimental: {
    // Optimize large icon libraries for smaller bundles.
    optimizePackageImports: ["react-icons", "lucide-react", "framer-motion"],
  },
};

export default nextConfig;
