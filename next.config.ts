import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "**.ngrok-free.app",
    "*.ngrok.io",
    "**.ngrok.io",
    "*.ngrok.app",
    "**.ngrok.app",
    "192.168.*.*",
    "192.168.1.*",
    "192.168.1.6",
    "10.*.*.*",
    "172.*.*.*",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    qualities: [75, 90],
    // CRM-hosted media uploads (resolveImageUrl points /media/* at the CRM origin)
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "https", hostname: "api.pannabiryani.in" },
      { protocol: "https", hostname: "pannabiryani.in" },
      { protocol: "https", hostname: "www.pannabiryani.in" },
    ],
  },
};

export default nextConfig;
