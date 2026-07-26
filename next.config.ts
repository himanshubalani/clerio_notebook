import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost"],
      bodySizeLimit: '2mb',
    }
  }
};

export default nextConfig;
