import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  allowedDevOrigins: ["100.93.24.20"],
};

export default nextConfig;