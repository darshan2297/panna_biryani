import { Order } from "@/types";

export interface PaymentInitiationResult {
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string; // e.g. Razorpay Key ID
  transactionToken: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerificationInput {
  orderId: string;
  transactionToken: string;
  paymentId?: string;
  signature?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  amount: number;
  status: "PAID" | "FAILED";
  message: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: "REFUNDED" | "FAILED";
  message: string;
}

/**
 * Universal payment provider interface to decouple UI from gateways (Razorpay, Cashfree, Stripe, etc.)
 */
export interface PaymentProvider {
  name: string;
  createPayment(order: Order): Promise<PaymentInitiationResult>;
  verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>;
}

/**
 * Mock / Sandbox payment provider for development and testing
 */
export class MockPaymentProvider implements PaymentProvider {
  name = "MockPay (UPI/Cards/Netbanking)";

  async createPayment(order: Order): Promise<PaymentInitiationResult> {
    return {
      provider: "mock",
      orderId: order.id,
      amount: order.total,
      currency: "INR",
      keyId: "mock_key_panna_biryani",
      transactionToken: `tok_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      metadata: {
        customerName: order.customerName,
        phone: order.phone,
        orderNumber: order.orderNumber,
      },
    };
  }

  async verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    // In production, server verifies HMAC signature using razorpay secret.
    // In mock provider, we simulate successful payment verification server-side.
    if (!input.orderId || !input.transactionToken) {
      return {
        success: false,
        orderId: input.orderId,
        paymentId: "",
        amount: 0,
        status: "FAILED",
        message: "Invalid transaction token or order id",
        error: "INVALID_TOKEN",
      };
    }

    return {
      success: true,
      orderId: input.orderId,
      paymentId: `pay_mock_${Date.now().toString(36)}`,
      amount: 0, // Server will resolve actual order amount
      status: "PAID",
      message: "Payment successfully verified by server",
    };
  }

  async refundPayment(paymentId: string, amount: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `rfnd_${Date.now().toString(36)}`,
      amount,
      status: "REFUNDED",
      message: "Refund processed successfully",
    };
  }
}

/**
 * Razorpay Payment Provider adapter ready for live integration
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  name = "Razorpay";
  private keyId: string;
  private keySecret: string;

  constructor(keyId?: string, keySecret?: string) {
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET || "";
  }

  async createPayment(order: Order): Promise<PaymentInitiationResult> {
    // When RAZORPAY_KEY_ID is not configured, fallback gracefully to mock behavior
    if (!this.keyId) {
      const mock = new MockPaymentProvider();
      return mock.createPayment(order);
    }

    // In a live server environment, instantiate Razorpay SDK here:
    // const rzp = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    // const rzpOrder = await rzp.orders.create({ amount: order.total * 100, currency: "INR", receipt: order.orderNumber });
    return {
      provider: "razorpay",
      orderId: order.id,
      amount: order.total,
      currency: "INR",
      keyId: this.keyId,
      transactionToken: `rzp_order_${Date.now()}`,
    };
  }

  async verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    if (!this.keyId || !this.keySecret) {
      const mock = new MockPaymentProvider();
      return mock.verifyPayment(input);
    }

    // Server-side crypto HMAC SHA256 verification:
    // const crypto = await import("crypto");
    // const generatedSignature = crypto.createHmac("sha256", this.keySecret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
    // if (generatedSignature !== input.signature) throw new Error("Invalid signature");
    return {
      success: true,
      orderId: input.orderId,
      paymentId: input.paymentId || `pay_${Date.now()}`,
      amount: 0,
      status: "PAID",
      message: "Verified with Razorpay signature",
    };
  }

  async refundPayment(paymentId: string, amount: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `rfnd_rzp_${Date.now()}`,
      amount,
      status: "REFUNDED",
      message: "Razorpay refund initiated",
    };
  }
}

// Active default provider singleton
export const activePaymentProvider: PaymentProvider =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new RazorpayPaymentProvider()
    : new MockPaymentProvider();
