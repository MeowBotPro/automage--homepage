import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // Allow development access through any IPv4 address (LAN, Tailscale, public IP).
  allowedDevOrigins: ['*.*.*.*'],
};

export default nextConfig;
