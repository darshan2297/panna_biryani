import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE = (
  process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");
const PROBE_TIMEOUT_MS = 5_000;

/**
 * Genuine backend health probe.
 *
 * `/api/shop-status` cannot be used for this: it deliberately fails *closed*
 * (returns a fallback "closed" payload with HTTP 200) when the CRM is
 * unreachable, so probing it reports the backend as online even when it is
 * down. This route propagates the real outcome instead — 503 when the CRM
 * cannot be reached — so the storefront can show its offline page.
 */
export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${BACKEND_BASE}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { status: "offline", backend: BACKEND_BASE },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = await res.json().catch(() => null);
    return NextResponse.json(
      { status: "online", backend: BACKEND_BASE, detail: payload },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(
      { status: "offline", backend: BACKEND_BASE },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}