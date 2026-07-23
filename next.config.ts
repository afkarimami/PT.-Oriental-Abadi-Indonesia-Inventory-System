import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : ".next-build-user-delete",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
