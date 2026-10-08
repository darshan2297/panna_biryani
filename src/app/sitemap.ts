import { MetadataRoute } from "next";
import { hydrateServerStorefront, getServerStorefront } from "@/services/storefront/serverConfig";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://pannabiryani.in";

  // Static marketing routes
  const routes = [
    "",
    "/menu",
    "/offers",
    "/bulk-orders",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
    "/shipping-delivery-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/menu" ? 0.9 : 0.7,
  }));

  // Dynamic product routes from the live CRM menu only
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    await hydrateServerStorefront();
    const menu = getServerStorefront().menu;
    productRoutes = (menu?.products ?? []).map((product) => ({
      url: `${baseUrl}/menu/${product.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    productRoutes = [];
  }

  return [...routes, ...productRoutes];
}
