/**
 * Analytics abstraction layer for Panna Biryani
 * Dispatches to window.gtag, window.fbq, and console in development
 */

type AnalyticsEvent =
  | "view_menu"
  | "view_product"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "select_pickup"
  | "select_delivery"
  | "add_payment_info"
  | "purchase"
  | "bulk_order_submit"
  | "whatsapp_click";

interface AnalyticsData {
  productId?: string;
  productName?: string;
  size?: string;
  price?: number;
  value?: number;
  currency?: string;
  orderId?: string;
  orderNumber?: string;
  orderType?: string;
  itemCount?: number;
  source?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function trackEvent(eventName: AnalyticsEvent, data?: AnalyticsData): void {
  if (typeof window === "undefined") return;

  const eventPayload = {
    ...data,
    currency: data?.currency || "INR",
    timestamp: new Date().toISOString(),
  };

  // Google Analytics 4 integration
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, eventPayload);
    } catch {
      // ignore
    }
  }

  // Meta / Facebook Pixel integration
  if (typeof window.fbq === "function") {
    try {
      if (eventName === "purchase") {
        window.fbq("track", "Purchase", {
          value: data?.value,
          currency: "INR",
        });
      } else if (eventName === "add_to_cart") {
        window.fbq("track", "AddToCart", {
          content_name: data?.productName,
          value: data?.price,
          currency: "INR",
        });
      } else {
        window.fbq("trackCustom", eventName, eventPayload);
      }
    } catch {
      // ignore
    }
  }
}
