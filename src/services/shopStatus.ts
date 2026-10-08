import { ShopStatus, PublicBusinessHours } from "@/types";

// Fail-closed defaults: while the CRM is unreachable we report the shop as
// closed/unknown rather than inventing an "open" status.
const DEFAULT_BUSINESS_HOURS: PublicBusinessHours = {
  is_open: false,
  auto_schedule_enabled: false,
  display_hours: "",
  status_text: "Store status unavailable",
  next_open_text: null,
  holiday_message: null,
  full_schedule: {},
};

const DEFAULT_SHOP_STATUS: ShopStatus = {
  website_open: false,
  is_open: false,
  schedule_active: false,
  business_hours: DEFAULT_BUSINESS_HOURS,
};

/**
 * Fetches the live shop open/closed state and business hours controlled from
 * the CRM backend. Fails closed (treats the shop as closed/unavailable) if the
 * CRM is unreachable — no data is invented when the API is down.
 */
export async function getWebsiteShopStatus(): Promise<ShopStatus> {
  try {
    const base = process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${base}/public/shop-status`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_SHOP_STATUS;
    const json = await res.json();
    const data = json?.data;
    if (!data) return DEFAULT_SHOP_STATUS;

    return {
      website_open: data.website_open === true,
      zomato_open: data.zomato_open,
      swiggy_open: data.swiggy_open,
      is_open: data.is_open === true && data.website_open !== false,
      schedule_active: Boolean(data.schedule_active),
      status_text: data.status_text,
      next_open_text: data.next_open_text ?? null,
      display_hours: data.display_hours ?? null,
      holiday_message: data.holiday_message ?? null,
      business_hours: {
        ...DEFAULT_BUSINESS_HOURS,
        ...(data.business_hours || {}),
      },
    };
  } catch {
    return DEFAULT_SHOP_STATUS;
  }
}

/**
 * Backwards-compatible helper returning only the website open flag.
 */
export async function getWebsiteShopOpen(): Promise<boolean> {
  const status = await getWebsiteShopStatus();
  return status.website_open;
}
