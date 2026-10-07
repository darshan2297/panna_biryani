import {
  fetchStorefrontConfig,
  fetchPaymentMethods,
  fetchPromoCodes,
  fetchMenuData,
  fetchReviews,
  fetchFAQs,
  fetchDeliveryAreas,
  StorefrontConfig,
  PaymentMethodInfo,
  PromoCodeInfo,
  MenuData,
} from "./configService";
import { ReviewItem, FAQItem, DeliveryAreaConfig } from "@/types";

// Server-side cached storefront data (hydrated per request in route handlers)
let cached: {
  at: number;
  config: StorefrontConfig | null;
  paymentMethods: PaymentMethodInfo[] | null;
  promoCodes: PromoCodeInfo[] | null;
  menu: MenuData | null;
  reviews: ReviewItem[] | null;
  faqs: FAQItem[] | null;
  deliveryAreas: DeliveryAreaConfig[] | null;
} = {
  at: 0,
  config: null,
  paymentMethods: null,
  promoCodes: null,
  menu: null,
  reviews: null,
  faqs: null,
  deliveryAreas: null,
};

const TTL = 30_000;

export async function hydrateServerStorefront(force = false) {
  if (!force && Date.now() - cached.at < TTL && cached.config) return cached;
  const [config, paymentMethods, promoCodes, menu, reviews, faqs, deliveryAreas] = await Promise.all([
    fetchStorefrontConfig(),
    fetchPaymentMethods(),
    fetchPromoCodes(),
    fetchMenuData(),
    fetchReviews(),
    fetchFAQs(),
    fetchDeliveryAreas(),
  ]);
  cached = { at: Date.now(), config, paymentMethods, promoCodes, menu, reviews, faqs, deliveryAreas };
  return cached;
}

export function getServerStorefront() {
  return cached;
}
