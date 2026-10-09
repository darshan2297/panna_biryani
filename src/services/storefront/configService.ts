import { Product, ComboPack, ExtraItem, ReviewItem, FAQItem, DeliveryAreaConfig } from "@/types";

const BASE = (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const CRM_ORIGIN = BASE.replace(/\/api\/v1.*$/, "");

export interface StorefrontConfig {
  logo_url: string | null;
  banner_url: string | null;
  banner_mobile_url: string | null;
  gift_section_enabled: boolean;
  gift_bg_url: string | null;
  bulk_bg_url: string | null;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  delivery_fee: number;
  free_delivery_enabled: boolean;
  free_delivery_threshold: number;
  brand_name: string | null;
  brand_tagline: string | null;
  address_line: string | null;
  area: string | null;
  city: string | null;
  pincode: string | null;
  google_maps_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  operating_hours: string | null;
}

export interface PaymentMethodInfo {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
}

export interface PromoEventInfo {
  id: number;
  event_title: string;
  start_date: string;
  end_date: string;
}

export interface PromoCodeInfo {
  id: number;
  code: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  discount_type: "fixed" | "percentage" | "free_item" | "free_delivery";
  discount_value: number;
  free_item_name: string | null;
  min_order_value: number;
  badge: string | null;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  per_user_limit: number;
  applicable_items: string[] | null;
  minimum_order_items: number | null;
  first_order_only: boolean;
  category: "general" | "single_event" | "multiple_event";
  is_private: boolean;
  terms_conditions: string | null;
  discount_on: "amount" | "quantity";
  min_quantity: number | null;
  max_quantity: number | null;
  max_order_value: number | null;
  customer_type: "all" | "new" | "returning";
  max_discount_amount: number | null;
  events: PromoEventInfo[];
}

/**
 * Resolve the rupee discount a promo grants on a given subtotal.
 *
 * Percentage discounts are capped by `max_discount_amount` so a large cart
 * cannot produce an outsized discount. Shared by the cart preview and the
 * server-side order calculation so both always agree.
 */
export function resolveDiscountAmount(params: {
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  subtotal: number;
}): number {
  const { discountType, discountValue, maxDiscountAmount, subtotal } = params;

  if (discountType === "fixed") {
    return Math.max(0, Math.min(Number(discountValue) || 0, subtotal));
  }
  if (discountType === "percentage") {
    const raw = (subtotal * (Number(discountValue) || 0)) / 100;
    if (maxDiscountAmount != null && maxDiscountAmount > 0) {
      return Math.min(raw, maxDiscountAmount);
    }
    return raw;
  }
  // free_item / free_delivery are handled elsewhere, not as a cart reduction.
  return 0;
}

export interface MenuData {
  products: Product[];
  combos: ComboPack[];
  extras: ExtraItem[];
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/media/")) return `${CRM_ORIGIN}${url}`;
  return url;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function fetchStorefrontConfig(): Promise<StorefrontConfig | null> {
  return get<StorefrontConfig>("/public/config");
}

export async function fetchPaymentMethods(): Promise<PaymentMethodInfo[] | null> {
  return get<PaymentMethodInfo[]>("/public/payment-methods");
}

export async function fetchPromoCodes(): Promise<PromoCodeInfo[] | null> {
  return get<PromoCodeInfo[]>("/public/promocodes");
}

export async function fetchMenuData(): Promise<MenuData | null> {
  return get<MenuData>("/public/menu-data");
}

export async function fetchReviews(): Promise<ReviewItem[] | null> {
  return get<ReviewItem[]>("/public/reviews");
}

export async function fetchFAQs(): Promise<FAQItem[] | null> {
  return get<FAQItem[]>("/public/faqs");
}

export async function fetchDeliveryAreas(): Promise<DeliveryAreaConfig[] | null> {
  return get<DeliveryAreaConfig[]>("/public/delivery-areas");
}

export interface PromoValidationResult {
  valid: boolean;
  reason: string | null;
  code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  free_item_name: string | null;
  min_order_value: number | null;
  // Set when the promo is gated on customer identity (first_order_only /
  // customer_type) and no phone was supplied yet.
  requires_phone?: boolean;
}

export const PHONE_REQUIRED = "PHONE_REQUIRED";

export function isPhoneRequired(result: PromoValidationResult | null): boolean {
  return !!result && result.reason === PHONE_REQUIRED;
}

/**
 * Server-side promo validation (mirrors CRM rules incl. first-order-only).
 * Called when a customer applies a coupon so eligibility is enforced up-front
 * instead of silently failing at order creation.
 */
export async function validatePromoCode(params: {
  code: string;
  orderValue: number;
  itemCount: number;
  cartItemSlugs: string[];
  customerPhone?: string;
}): Promise<PromoValidationResult | null> {
  try {
    const res = await fetch(`${BASE}/public/promocodes/${encodeURIComponent(params.code.trim().toUpperCase())}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        order_value: params.orderValue,
        item_count: params.itemCount,
        cart_item_slugs: params.cartItemSlugs,
        user_uses: 0,
        customer_phone: params.customerPhone || null,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as PromoValidationResult | null;
  } catch {
    return null;
  }
}

/**
 * Record a redemption so `per_user_limit` is enforced from real history.
 * A unique (promo, phone) index means repeat use is rejected server-side.
 */
export async function redeemPromoCode(params: {
  code: string;
  customerPhone: string;
  orderId?: number;
}): Promise<boolean> {
  try {
    const res = await fetch(
      `${BASE}/public/promocodes/${encodeURIComponent(params.code.trim().toUpperCase())}/redeem`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          customer_phone: params.customerPhone,
          order_id: params.orderId ?? null,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
