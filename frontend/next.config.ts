import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration optimisée pour Docker
  output: 'standalone',
  
  // Configuration CORS pour Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/:path*`,
      },
    ];
  },

  // Configuration des images pour Docker
  images: {
    unoptimized: true
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: []
  }
};

export default nextConfig;
