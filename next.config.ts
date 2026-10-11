import type { NextConfig } from "next";

/**
 * Hosts allowed to serve `<Image>` sources.
 *
 * CRM-hosted media (menu photos, banners) is fetched from the CRM origin. When
 * the backend runs behind an ngrok tunnel that origin is the tunnel host, so
 * the tunnel domains are matched by pattern instead of being listed one by one
 * — the hostname changes whenever a random tunnel is issued.
 */
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "http", hostname: "localhost", port: "8000" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000" },
  { protocol: "https", hostname: "api.pannabiryani.in" },
  { protocol: "https", hostname: "pannabiryani.in" },
  { protocol: "https", hostname: "www.pannabiryani.in" },
  { protocol: "https", hostname: "*.ngrok-free.app" },
  { protocol: "https", hostname: "*.ngrok.io" },
  { protocol: "https", hostname: "*.ngrok.app" },
];

// A tunnel host supplied through the environment (e.g. a reserved domain),
// added on top of the patterns above.
const crmOrigin = process.env.PANNA_CRM_ORIGIN;
if (crmOrigin) {
  try {
    remotePatterns.push(new URL(crmOrigin));
  } catch {
    console.warn(`[next.config] Ignoring invalid PANNA_CRM_ORIGIN: ${crmOrigin}`);
  }
}

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
    remotePatterns,
  },
};

export default nextConfig;
