import { NextResponse } from "next/server";
import { CRM_API_BASE } from "@/lib/crmConfig";

export const dynamic = "force-dynamic";

/**
 * Same-origin proxy for the CRM's public storefront endpoints.
 *
 * The browser used to call the CRM directly, but `PANNA_CRM_API_URL` has no
 * `NEXT_PUBLIC_` prefix, so Next.js does not inline it into the client bundle.
 * Every client-side read therefore fell back to `http://localhost:8000` — the
 * *visitor's own* machine — so menu, combos, extras, reviews, FAQs, promos and
 * delivery areas all silently resolved to empty for anyone not already sitting
 * on the developer's machine. The fallback string is baked into the shipped
 * bundle, which is what made it so easy to miss.
 *
 * Proxying keeps the CRM origin server-side, needs no CORS, and keeps working
 * when the tunnel host changes (the value is read per request, not baked in).
 *
 * Only the read-only `/public/*` endpoints are forwarded; nothing here mutates.
 */
const ALLOWED_PREFIX = "/public/";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const suffix = (path ?? []).map(encodeURIComponent).join("/");

  // Defensive: the segment is restricted to a known read-only prefix so this
  // route cannot be turned into an arbitrary open proxy onto the CRM.
  if (!suffix.startsWith(ALLOWED_PREFIX.replace(/^\//, ""))) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  try {
    const res = await fetch(`${CRM_API_BASE}/${suffix}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Upstream request failed" },
        { status: 502 }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // The storefront is fail-soft by design: a dead CRM should degrade to an
    // empty menu rather than a server error page.
    return NextResponse.json({ success: false, error: "CRM unreachable" }, { status: 502 });
  }
}