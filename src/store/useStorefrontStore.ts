"use client";

import { create } from "zustand";
import { Product, ComboPack, ExtraItem, ReviewItem, FAQItem, DeliveryAreaConfig } from "@/types";
import { siteConfig } from "@/data/siteConfig";
import {
  StorefrontConfig,
  PaymentMethodInfo,
  PromoCodeInfo,
  fetchStorefrontConfig,
  fetchPaymentMethods,
  fetchPromoCodes,
  fetchMenuData,
  fetchReviews,
  fetchFAQs,
  fetchDeliveryAreas,
  resolveImageUrl,
} from "@/services/storefront/configService";

interface StorefrontState {
  loaded: boolean;
  config: StorefrontConfig | null;
  paymentMethods: PaymentMethodInfo[];
  promoCodes: PromoCodeInfo[];
  products: Product[];
  combos: ComboPack[];
  extras: ExtraItem[];
  reviews: ReviewItem[];
  faqs: FAQItem[];
  deliveryAreas: DeliveryAreaConfig[];
  load: () => Promise<void>;
}

export const useStorefrontStore = create<StorefrontState>()((set, get) => ({
  loaded: false,
  config: null,
  paymentMethods: [],
  promoCodes: [],
  products: [],
  combos: [],
  extras: [],
  reviews: [],
  faqs: [],
  deliveryAreas: [],

  load: async () => {
    if (get().loaded) return;
    const [config, paymentMethods, promoCodes, menu, reviews, faqs, deliveryAreas] = await Promise.all([
      fetchStorefrontConfig(),
      fetchPaymentMethods(),
      fetchPromoCodes(),
      fetchMenuData(),
      fetchReviews(),
      fetchFAQs(),
      fetchDeliveryAreas(),
    ]);
    set({
      loaded: true,
      config: config,
      paymentMethods: paymentMethods && paymentMethods.length > 0 ? paymentMethods : [],
      promoCodes: promoCodes && promoCodes.length > 0 ? promoCodes : [],
      products: menu && menu.products ? menu.products.map((p) => ({ ...p, image: resolveImageUrl(p.image) })) : [],
      combos: menu && menu.combos ? menu.combos.map((c) => ({ ...c, image: resolveImageUrl(c.image) })) : [],
      extras: menu && menu.extras ? menu.extras.map((e) => ({ ...e, image: resolveImageUrl(e.image) })) : [],
      reviews: reviews ?? [],
      faqs: faqs ?? [],
      deliveryAreas: deliveryAreas ?? [],
    });

    // Reflect CRM config into the legacy siteConfig object so existing
    // components reading it directly pick up the new values on re-render.
    if (config) {
      try {
        (siteConfig as any).name = config.brand_name || siteConfig.name;
        (siteConfig as any).tagline = config.brand_tagline || siteConfig.tagline;
        if (config.address_line) (siteConfig as any).pickupLocation.address = config.address_line;
        if (config.area) (siteConfig as any).pickupLocation.area = config.area;
        if (config.city) (siteConfig as any).pickupLocation.city = config.city;
        if (config.pincode) (siteConfig as any).pickupLocation.pincode = config.pincode;
        if (config.google_maps_url) (siteConfig as any).pickupLocation.googleMapsUrl = config.google_maps_url;
        if (config.phone) {
          (siteConfig as any).contact.phone = config.phone;
          (siteConfig as any).contact.phoneDisplay = config.phone;
        }
        if (config.whatsapp) {
          (siteConfig as any).contact.whatsapp = config.whatsapp;
          (siteConfig as any).contact.whatsappDisplay = config.whatsapp;
        }
        if (config.email) (siteConfig as any).contact.email = config.email;
        (siteConfig as any).pricingRules.defaultDeliveryFee = Number(config.delivery_fee);
        (siteConfig as any).pricingRules.freeDeliveryThreshold = Number(config.free_delivery_threshold);
        (siteConfig as any).deliveryAreas = deliveryAreas && deliveryAreas.length > 0
          ? deliveryAreas
          : config.delivery_enabled !== false
          ? [{ name: config.area || "Surat", pincode: config.pincode || "395007", deliveryFee: Number(config.delivery_fee), estimatedMinutes: 40, minOrder: 0 }]
          : [];
      } catch {
        /* ignore mutation errors */
      }
    }
  },
}));

// Sync helpers — values come from the CRM API (loaded storefront store) only
export function getStorefront() {
  return useStorefrontStore.getState();
}

export function getDeliverySettings() {
  const { config } = getStorefront();
  return {
    deliveryEnabled: config ? config.delivery_enabled : false,
    pickupEnabled: config ? config.pickup_enabled : false,
    deliveryFee: config ? Number(config.delivery_fee) : 0,
    freeDeliveryEnabled: config ? config.free_delivery_enabled : false,
    freeDeliveryThreshold: config ? Number(config.free_delivery_threshold) : 0,
  };
}

/** Online-payment fee configuration sourced from the CRM. */
export function getOnlineFeeConfig() {
  const { config } = getStorefront();
  return {
    transactionFeePercent: config ? Number(config.transaction_fee_percent) || 0 : 0,
    gstPercent: config ? Number(config.gst_percent) || 0 : 0,
    vasFee: config ? Number(config.vas_fee) || 0 : 0,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Grand total under the tax-inclusive (reverse-calculation) model.
 *
 * Menu prices are the FINAL all-inclusive price — GST, gateway fee and VAS are
 * all already inside the dish price, so nothing is added on top. The customer
 * pays the menu price + delivery only. This helper therefore returns the base
 * cart total unchanged; fees are purely internal (CRM margin reporting).
 */
export function computeGrandTotal(baseTotal: number) {
  return {
    transactionFee: 0,
    vasFee: 0,
    charges: 0,
    grandTotal: round2(baseTotal),
  };
}

export function getBrandInfo() {
  const { config } = getStorefront();
  return {
    name: config?.brand_name || siteConfig.name,
    tagline: config?.brand_tagline || siteConfig.tagline,
    addressLine: config?.address_line || siteConfig.pickupLocation.address,
    area: config?.area || siteConfig.pickupLocation.area,
    city: config?.city || siteConfig.pickupLocation.city,
    pincode: config?.pincode || siteConfig.pickupLocation.pincode,
    googleMapsUrl: config?.google_maps_url || siteConfig.pickupLocation.googleMapsUrl,
    phone: config?.phone || siteConfig.contact.phone,
    phoneDisplay: config?.phone || siteConfig.contact.phoneDisplay,
    whatsapp: config?.whatsapp || siteConfig.contact.whatsapp,
    email: config?.email || siteConfig.contact.email,
    operatingHours: config?.operating_hours || `${siteConfig.operatingHours.displayHours}, ${siteConfig.operatingHours.days}`,
  };
}

export function getStorefrontImage(kind: "logo" | "banner" | "bannerMobile" | "gift" | "bulk"): string {
  const { config } = getStorefront();
  const fallback: Record<string, string> = {
    logo: "/brand/panna-logo.png",
    banner: "/hero/panna-hero-banner.jpg",
    bannerMobile: "/hero/panna-hero-mobile.jpg",
    gift: "/offers/first-order-gift-banner.jpg",
    bulk: "/bulk/bulk-banner-bg.webp",
  };
  if (!config) return fallback[kind];
  const map: Record<string, string | null | undefined> = {
    logo: config.logo_url,
    banner: config.banner_url,
    bannerMobile: config.banner_mobile_url,
    gift: config.gift_bg_url,
    bulk: config.bulk_bg_url,
  };
  return resolveImageUrl(map[kind]) || fallback[kind];
}

/** Match a CRM promo code (case-insensitive). Only CRM promos are used. */
export function findPromoCode(code: string, cartItemSlugs?: string[]): PromoCodeInfo | undefined {
  const { promoCodes } = getStorefront();
  if (promoCodes.length > 0) {
    return promoCodes.find((p) => {
      if (p.code.toUpperCase() !== code.trim().toUpperCase() || !p.active) return false;

      const now = Date.now();
      if (p.valid_from && new Date(p.valid_from).getTime() > now) return false;
      if (p.valid_until && new Date(p.valid_until).getTime() < now) return false;
      if (p.max_uses != null && (p.used_count ?? 0) >= p.max_uses) return false;

      // Event-gated promos are only live inside one of their campaign windows.
      if (p.category === "single_event" || p.category === "multiple_event") {
        const live = (p.events || []).some((e) => {
          const start = new Date(e.start_date).getTime();
          const end = new Date(e.end_date).getTime();
          return now >= start && now <= end;
        });
        if (!live) return false;
      }

      if (Array.isArray(p.applicable_items) && p.applicable_items.length > 0 && cartItemSlugs) {
        const applicable = p.applicable_items.map((s) => String(s).toLowerCase());
        const matches = cartItemSlugs.some((s) => applicable.includes(String(s).toLowerCase()));
        if (!matches) return false;
      }
      return true;
    });
  }
  return undefined;
}
