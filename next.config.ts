import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Old flow pages redirecting to new calculator / start flow
      // Per engineering-design §13, design-system §4, product-decisions §3
      {
        source: "/quote",
        destination: "/start",
        permanent: true,  // 301
      },
      {
        source: "/services/sell-vehicle",
        destination: "/start?intent=sell",
        permanent: true,
      },
      {
        source: "/services/buy-vehicle",
        destination: "/start?intent=buy",
        permanent: true,
      },
      {
        source: "/services/exchange-vehicle",
        destination: "/start?intent=both",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
