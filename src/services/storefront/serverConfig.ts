import {
  fetchStorefrontConfig,
  fetchPaymentMethods,
  fetchPromoCodes,
  fetchMenuData,
  StorefrontConfig,
  PaymentMethodInfo,
  PromoCodeInfo,
  MenuData,
} from "./configService";

// Server-side cached storefront data (hydrated per request in route handlers)
let cached: {
  at: number;
  config: StorefrontConfig | null;
  paymentMethods: PaymentMethodInfo[] | null;
  promoCodes: PromoCodeInfo[] | null;
  menu: MenuData | null;
} = {
  at: 0,
  config: null,
  paymentMethods: null,
  promoCodes: null,
  menu: null,
};

const TTL = 30_000;

export async function hydrateServerStorefront(force = false) {
  if (!force && Date.now() - cached.at < TTL && cached.config) return cached;
  const [config, paymentMethods, promoCodes, menu] = await Promise.all([
    fetchStorefrontConfig(),
    fetchPaymentMethods(),
    fetchPromoCodes(),
    fetchMenuData(),
  ]);
  cached = { at: Date.now(), config, paymentMethods, promoCodes, menu };
  return cached;
}

export function getServerStorefront() {
  return cached;
}
