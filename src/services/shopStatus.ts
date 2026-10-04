/**
 * Checks live shop open/closed state controlled from the CRM backend.
 * Fails open (treats shop as open) if the CRM backend is unreachable,
 * so customers can still browse/order if the CRM service is down.
 */
export async function getWebsiteShopOpen(): Promise<boolean> {
  try {
    const base =
      process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${base}/public/shop-status`, { cache: "no-store" });
    if (!res.ok) return true;
    const data = await res.json();
    return data?.data?.website_open !== false;
  } catch {
    return true;
  }
}
