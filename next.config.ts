import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "taiwan-election-api.onrender.com",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
