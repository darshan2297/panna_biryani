import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("[DEBUG] StorefrontLoader effect triggered from client");
  return NextResponse.json({ ok: true, message: "client effect triggered" });
}
