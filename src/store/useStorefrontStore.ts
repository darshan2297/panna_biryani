"use client";

import { create } from "zustand";
import { Product, ComboPack, ExtraItem } from "@/types";
import { products as staticProducts, combos as staticCombos, extras as staticExtras } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import {
  StorefrontConfig,
  PaymentMethodInfo,
  PromoCodeInfo,
  fetchStorefrontConfig,
  fetchPaymentMethods,
  fetchPromoCodes,
  fetchMenuData,
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
  load: () => Promise<void>;
}

export const useStorefrontStore = create<StorefrontState>()((set, get) => ({
  loaded: false,
  config: null,
  paymentMethods: [],
  promoCodes: [],
  products: staticProducts,
  combos: staticCombos,
  extras: staticExtras,

  load: async () => {
    if (get().loaded) return;
    const [config, paymentMethods, promoCodes, menu] = await Promise.all([
      fetchStorefrontConfig(),
      fetchPaymentMethods(),
      fetchPromoCodes(),
      fetchMenuData(),
    ]);
    set({
      loaded: true,
      config: config,
      paymentMethods: paymentMethods && paymentMethods.length > 0 ? paymentMethods : [],
      promoCodes: promoCodes && promoCodes.length > 0 ? promoCodes : [],
      products: menu && menu.products && menu.products.length > 0 ? menu.products.map((p) => ({ ...p, image: resolveImageUrl(p.image) })) : staticProducts,
      combos: menu && menu.combos && menu.combos.length > 0 ? menu.combos.map((c) => ({ ...c, image: resolveImageUrl(c.image) })) : staticCombos,
      extras: menu && menu.extras && menu.extras.length > 0 ? menu.extras.map((e) => ({ ...e, image: resolveImageUrl(e.image) })) : staticExtras,
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
        (siteConfig as any).deliveryAreas = config.delivery_enabled !== false
          ? [{ name: config.area || "Surat", pincode: config.pincode || "395007", deliveryFee: Number(config.delivery_fee), estimatedMinutes: 40, minOrder: 0 }]
          : [];
      } catch {
        /* ignore mutation errors */
      }
    }
  },
}));

// Sync helpers with static fallbacks (safe to call outside React render)
export function getStorefront() {
  return useStorefrontStore.getState();
}

export function getDeliverySettings() {
  const { config } = getStorefront();
  return {
    deliveryEnabled: config ? config.delivery_enabled : true,
    pickupEnabled: config ? config.pickup_enabled : true,
    deliveryFee: config ? Number(config.delivery_fee) : siteConfig.pricingRules.defaultDeliveryFee,
    freeDeliveryEnabled: config ? config.free_delivery_enabled : true,
    freeDeliveryThreshold: config ? Number(config.free_delivery_threshold) : siteConfig.pricingRules.freeDeliveryThreshold,
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

/** Match a CRM promo code (case-insensitive). Falls back to static offers. */
export function findPromoCode(code: string): PromoCodeInfo | undefined {
  const { promoCodes } = getStorefront();
  if (promoCodes.length > 0) {
    return promoCodes.find((p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.active);
  }
  return undefined;
}
