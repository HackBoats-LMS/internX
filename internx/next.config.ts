import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },

  experimental: {
    // Optimize large icon libraries for smaller bundles.
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
