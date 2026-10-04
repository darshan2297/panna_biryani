import { NextResponse } from "next/server";
import { getWebsiteShopStatus } from "@/services/shopStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getWebsiteShopStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
