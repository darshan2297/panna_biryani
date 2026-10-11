/**
 * Single source of truth for the CRM backend URL.
 *
 * Every server-side CRM call previously re-derived this from
 * `process.env.PANNA_CRM_API_URL` independently, which meant ten places to
 * change and one of them (shopStatus.ts) forgot to strip the trailing slash
 * and could emit `//public/shop-status`.
 *
 * ### Why this is server-only
 *
 * `PANNA_CRM_API_URL` has no `NEXT_PUBLIC_` prefix, so Next.js does NOT inline
 * it into the client bundle — reading it from a `"use client"` component
 * silently yields `undefined` and falls back to `http://localhost:8000`, i.e.
 * the *visitor's own* machine. Anything the browser needs must therefore go
 * through a Next.js route handler that uses this module server-side.
 *
 * ### Behind a tunnel
 *
 * Point this at the backend's public URL (`https://<backend-tunnel>/api/v1`).
 * Because it is read at request time on the server, changing the tunnel host
 * only needs a server restart — no rebuild, unlike a `NEXT_PUBLIC_*` variable.
 */

const DEFAULT_CRM_API_URL = "http://localhost:8000/api/v1";

/** API root, no trailing slash. e.g. `https://panna-api.ngrok-free.app/api/v1` */
export const CRM_API_BASE = (process.env.PANNA_CRM_API_URL || DEFAULT_CRM_API_URL).replace(
  /\/$/,
  ""
);

/**
 * Scheme + host of the CRM, no `/api/v1` suffix. Server-side only.
 * See `NEXT_PUBLIC_CRM_MEDIA_ORIGIN` for the browser-facing counterpart.
 */
export const CRM_ORIGIN = CRM_API_BASE.replace(/\/api\/v1.*$/, "");

/**
 * Browser-visible origin for CRM media.
 *
 * Unlike the API origin, this one MUST reach the browser: `<img>` / `<Image>`
 * src attributes are resolved client-side, so a server-only value would leave
 * menu photos and banners pointing at the visitor's own localhost. CRM media
 * is public, non-secret asset data, so exposing the host is safe — unlike the
 * API base, which is why data calls go through the /api/storefront proxy.
 */
export const CRM_MEDIA_ORIGIN =
  process.env.NEXT_PUBLIC_CRM_MEDIA_ORIGIN || CRM_ORIGIN;

/**
 * Resolve a CRM-relative media path (`/media/...`) to an absolute URL.
 * Absolute inputs are returned untouched.
 */
export function resolveCrmMediaUrl(url?: string | null): string {
  if (!url) return "";
  return url.startsWith("/") ? `${CRM_MEDIA_ORIGIN}${url}` : url;
}