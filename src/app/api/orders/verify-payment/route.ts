import { NextRequest, NextResponse } from "next/server";
import { verifyBackendPayment } from "@/services/payments/backendPaymentService";
import { updateOrderStatus } from "@/services/orders/orderService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    // Legacy/mock path: only a local orderId + token was supplied.
    // Confirm the local order without a real gateway.
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "Missing required order verification parameters." },
          { status: 400 }
        );
      }
      await updateOrderStatus(orderId, "CONFIRMED");
      return NextResponse.json({
        success: true,
        message: "Order confirmed.",
        orderId,
      });
    }

    // Real path: verify the Razorpay signature via the CRM backend.
    const result = await verifyBackendPayment({
      orderNumber: orderNumber || "",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (result.success) {
      // Keep the local in-memory order in sync too.
      if (orderId) {
        await updateOrderStatus(orderId, "CONFIRMED");
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        orderId,
        paymentId: result.paymentId,
        paymentStatus: result.paymentStatus,
        orderStatus: result.orderStatus,
      });
    }

    return NextResponse.json(
      { success: false, error: result.message || "Payment verification failed." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment verification exception";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
