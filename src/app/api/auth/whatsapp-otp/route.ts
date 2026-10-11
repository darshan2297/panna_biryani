import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhone } from "@/services/orders/orderService";
import { CRM_API_BASE } from "@/lib/crmConfig";

// Temporary WhatsApp OTP code as requested by the user
const TEMP_WHATSAPP_CODE = "123456";

/**
 * Resolve the real customer name from the CRM customer record.
 *
 * This is the authoritative source. Resolving from order history instead was
 * unreliable: `getOrdersByPhone` reads an in-memory store populated only by
 * orders placed since the server last started, so a returning customer with no
 * *recent* order looked unknown and was given a fabricated "Panna Foodie 1205"
 * name instead of their real one.
 */
async function lookupCrmCustomerName(phone: string): Promise<string | null> {
  try {
    const res = await fetch(`${CRM_API_BASE}/public/customers/phone-exists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const name = json?.data?.name;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, code, name } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // ACTION: Send WhatsApp OTP
    if (action === "send") {
      // In production this would trigger the WhatsApp Business Cloud API / Gupshup / Twilio
      return NextResponse.json({
        success: true,
        message: `Verification code sent to WhatsApp on +91 ${cleanPhone}`,
        phone: cleanPhone,
        demoCode: TEMP_WHATSAPP_CODE,
      });
    }

    // ACTION: Verify WhatsApp OTP
    if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Please enter the 6-digit verification code." },
          { status: 400 }
        );
      }

      if (code.trim() !== TEMP_WHATSAPP_CODE) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid verification code. Please enter the WhatsApp code: 123456",
          },
          { status: 400 }
        );
      }

      // Code is valid! Fetch user's existing orders by their unique phone number
      const existingOrders = await getOrdersByPhone(cleanPhone);
      const latestOrder = existingOrders[0];

      // Preference order: what the customer typed at login, then the CRM
      // customer record, then any name on a recent order. Never a fabricated
      // name — an unknown customer simply gets an empty name and is asked.
      const crmName = await lookupCrmCustomerName(cleanPhone);
      const customerName =
        (name && name.trim()) || crmName || latestOrder?.customerName || "";

      const customerEmail = latestOrder?.email;

      return NextResponse.json({
        success: true,
        message: "WhatsApp verification successful! Session started.",
        user: {
          name: customerName,
          phone: cleanPhone,
          email: customerEmail,
        },
        orders: existingOrders,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'send', 'verify'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("WhatsApp OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process WhatsApp verification." },
      { status: 500 }
    );
  }
}
