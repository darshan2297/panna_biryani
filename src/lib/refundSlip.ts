/**
 * Refund slip: the customer-facing summary of a refund, plus a WhatsApp share
 * link.
 *
 * Shared by the storefront (customer's own order page) and, via the same
 * wording, by the CRM admin when they hand a slip to a customer. Keeping the
 * text in one place is what stops the two from drifting apart.
 *
 * The wording is driven by the *gateway's* status. A refund Razorpay reports as
 * `pending` or `failed` is never described as money returned — telling a
 * customer their refund is done when it isn't is the fastest way to lose a
 * dispute.
 */

import type { RefundDetails } from "@/types";

const INR = (n: number): string =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DISPLAY_DATE = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Pretty gateway label for display; falls back to the raw identifier. */
export function gatewayLabel(gateway: string): string {
  const key = (gateway || "").toLowerCase();
  if (key.includes("razorpay")) return "Razorpay";
  if (key.includes("stripe")) return "Stripe";
  if (key.includes("paytm")) return "Paytm";
  return gateway || "Payment gateway";
}

export interface RefundSlipCopy {
  headline: string;
  tone: "success" | "warning" | "danger";
  lines: { label: string; value: string }[];
}

/** Build the slip copy for a refund, honouring the gateway's real status. */
export function buildRefundSlip(refund: RefundDetails): RefundSlipCopy {
  const lines: { label: string; value: string }[] = [
    { label: "Refund amount", value: INR(refund.amount) },
    { label: "Refunded via", value: gatewayLabel(refund.gateway) },
    { label: "Date", value: DISPLAY_DATE(refund.refunded_at) },
  ];

  if (refund.reference) {
    lines.push({ label: "Refund ID", value: refund.reference });
  }
  if (refund.receipt) {
    lines.push({ label: "Receipt", value: refund.receipt });
  }
  if (refund.reason) {
    lines.push({ label: "Reason", value: refund.reason });
  }

  if (refund.status === "processed") {
    return {
      headline: "Refund processed",
      tone: "success",
      lines,
    };
  }
  if (refund.status === "pending") {
    return {
      headline: "Refund initiated — processing",
      tone: "warning",
      lines,
    };
  }
  return {
    headline: "Refund could not be processed",
    tone: "danger",
    lines,
  };
}

/**
 * Plain-text refund slip for WhatsApp.
 *
 * Deliberately text rather than an image or PDF: it is readable in the chat
 * thread, searchable, and needs no attachment handling.
 */
export function buildRefundSlipMessage(
  orderNumber: string,
  refund: RefundDetails,
  brandName = "Panna Biryani"
): string {
  const { headline, lines } = buildRefundSlip(refund);

  const body = lines.map((l) => `${l.label}: ${l.value}`).join("\n");

  const closing =
    refund.status === "processed"
      ? `This amount has been returned to your original payment method. ` +
        `It may take 5-7 working days to reflect in your bank statement.`
      : refund.status === "pending"
        ? `Your bank is still processing the refund. It usually reflects within ` +
          `5-7 working days. Please contact us if it does not.`
        : `We could not process this refund automatically. Our team will ` +
          `resolve it and get back to you shortly.`;

  return [
    `${brandName} — Refund Slip`,
    ``,
    `Order: ${orderNumber}`,
    `Status: ${headline}`,
    ``,
    body,
    ``,
    closing,
    ``,
    `Thank you for your order.`,
  ].join("\n");
}

/**
 * wa.me deep link carrying the slip as a pre-filled message.
 *
 * Uses wa.me rather than api.whatsapp.com so it works as a plain click without
 * the WhatsApp Business API approval that sendMessage requires.
 */
export function buildWhatsAppShareUrl(
  supportWhatsappNumber: string,
  message: string
): string {
  const digits = (supportWhatsappNumber || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}