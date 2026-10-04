import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhone } from "@/services/orders/orderService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const orders = await getOrdersByPhone(phone);
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user orders." },
      { status: 500 }
    );
  }
}
