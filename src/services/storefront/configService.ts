import { Product, ComboPack, ExtraItem } from "@/types";

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
