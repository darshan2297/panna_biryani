/**
 * Razorpay Checkout helper.
 *
 * Loads the Razorpay checkout script on demand and opens the
 * payment modal. Returns a promise that resolves with the
 * payment response (payment_id / order_id / signature) or rejects
 * when the customer cancels.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay checkout is browser-only"));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  orderId: string; // razorpay_order_id from our backend
  prefillName?: string;
  prefillContact?: string;
  prefillEmail?: string;
}): Promise<RazorpayPaymentResult> {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout unavailable"));
      return;
    }

    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: {
        name: options.prefillName || "",
        contact: options.prefillContact || "",
        email: options.prefillEmail || "",
      },
      theme: { color: "#0c281e" },
      handler: (response: Record<string, string>) => {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by customer"));
        },
      },
    });

    rzp.open();
  });
}
