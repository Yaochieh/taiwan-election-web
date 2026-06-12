import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web-production-f7c522.up.railway.app",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
