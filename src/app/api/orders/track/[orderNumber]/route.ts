import { NextResponse } from "next/server";
import { CRM_API_BASE } from "@/lib/crmConfig";

export const dynamic = "force-dynamic";

/**
 * Proxies public order tracking for the browser.
 *
 * The tracker used to call the CRM directly, but `PANNA_CRM_API_URL` has no
 * `NEXT_PUBLIC_` prefix, so Next.js never inlines it into the client bundle —
 * the component silently fell back to `http://localhost:8000/api/v1` and
 * polled the *visitor's own* machine. Proxied (like /api/customers/phone-exists)
 * so the CRM origin stays server-side, no CORS is needed, and the tracking view
 * works from any host, including an ngrok tunnel.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  // Only an order number is expected here. Anything else is a path-traversal
  // or query-injection attempt against the upstream API, so reject up front.
  const safeNumber = decodeURIComponent(orderNumber).replace(/[^A-Za-z0-9-]/g, "");
  if (!safeNumber) {
    return NextResponse.json(
      { success: false, error: "Invalid order number." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${CRM_API_BASE}/public/orders/track/${safeNumber}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Could not fetch order status." },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not fetch order status." },
      { status: 502 }
    );
  }
}