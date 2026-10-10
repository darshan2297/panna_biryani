/**
 * Storefront payment client.
 *
 * The storefront NEVER holds the Razorpay secret. It proxies payment
 * create/verify calls to the CRM backend, which is the only place the
 * secret lives. This keeps credentials out of the browser bundle.
 */

const CRM_BASE = (
  process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export interface BackendPaymentSession {
  provider: string;
  orderId: string;
  orderNumber: string;
  amount: number; // paise
  currency: string;
  keyId?: string;
  razorpayOrderId?: string;
  gateway: string;
  transactionToken: string;
  message: string;
}

export interface BackendPaymentVerifyResult {
  success: boolean;
  message: string;
  paymentStatus?: string;
  orderStatus?: string;
  paymentId?: string;
}

/**
 * Ask the CRM backend to create a Razorpay order for a website order.
 * The order must already exist in the CRM (forwarded by createOrder).
 */
export async function createBackendPaymentSession(order: {
  id: string;
  crmOrderNumber?: string | null;
  total: number;
  customerName: string;
  phone: string;
}): Promise<BackendPaymentSession> {
  const orderNumber = order.crmOrderNumber || order.id;

  const res = await fetch(`${CRM_BASE}/public/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_number: orderNumber,
      amount: order.total,
      customer_name: order.customerName,
      customer_phone: order.phone,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Payment gateway error (${res.status})`);
  }

  const json = await res.json();
  const data = json?.data || {};

  return {
    provider: data.gateway || "MOCK",
    orderId: order.id,
    orderNumber,
    amount: data.amount ?? Math.round(order.total * 100),
    currency: data.currency || "INR",
    keyId: data.key_id || undefined,
    razorpayOrderId: data.razorpay_order_id || undefined,
    gateway: data.gateway || "MOCK",
    transactionToken: data.razorpay_order_id || `tok_${Date.now()}`,
    message: data.message || "",
  };
}

/**
 * Verify a completed Razorpay checkout with the CRM backend.
 * The backend verifies the HMAC signature and confirms the order.
 */
export async function verifyBackendPayment(input: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<BackendPaymentVerifyResult> {
  const res = await fetch(`${CRM_BASE}/public/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_number: input.orderNumber,
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    return {
      success: false,
      message: json?.detail || json?.error || "Payment verification failed",
    };
  }

  return {
    success: true,
    message: json?.data?.message || "Payment verified",
    paymentStatus: json?.data?.payment_status,
    orderStatus: json?.data?.order_status,
    paymentId: json?.data?.payment_id,
  };
}
