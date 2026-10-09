import { NextResponse } from "next/server";

const BASE = (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export const dynamic = "force-dynamic";

/**
 * Proxies the phone -> identity lookup used when a guest submits a number to
 * unlock an identity-gated promo. Proxied (rather than called from the browser)
 * so the backend origin stays server-side and CORS isn't required.
 *
 * Returns `{ exists, name }`. The name is the customer's real display name so
 * checkout is never pre-filled with a placeholder; the backend deliberately
 * exposes nothing else (no address, orders or spend).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone || "").replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/public/customers/phone-exists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, exists: false }, { status: 502 });
    }

    const json = await res.json();
    return NextResponse.json(
      {
        success: true,
        exists: Boolean(json?.data?.exists),
        name: typeof json?.data?.name === "string" ? json.data.name : null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not verify the number right now." },
      { status: 500 }
    );
  }
}