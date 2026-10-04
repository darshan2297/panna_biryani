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
  },
};

export default nextConfig;
