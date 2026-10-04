import { NextRequest, NextResponse } from "next/server";
import { activePaymentProvider } from "@/services/payments/paymentProvider";
import { updateOrderStatus } from "@/services/orders/orderService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionToken, paymentId, signature } = body;

    if (!orderId || !transactionToken) {
      return NextResponse.json(
        { success: false, error: "Missing required order verification parameters." },
        { status: 400 }
      );
    }

    // Verify through the payment provider
    const verification = await activePaymentProvider.verifyPayment({
      orderId,
      transactionToken,
      paymentId,
      signature,
    });

    if (verification.success) {
      await updateOrderStatus(orderId, "CONFIRMED");
      return NextResponse.json({
        success: true,
        message: "Payment successfully verified.",
        orderId,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: verification.message || "Payment verification failed.",
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment verification exception";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
