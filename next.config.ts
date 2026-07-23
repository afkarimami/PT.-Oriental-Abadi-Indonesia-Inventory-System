import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build-user-delete",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
