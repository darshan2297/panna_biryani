import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/menu/*", "/offers", "/bulk-orders", "/about", "/contact"],
        disallow: [
          "/cart",
          "/checkout",
          "/order-success",
          "/order-success/*",
          "/track-order",
          "/track-order/*",
          "/account",
          "/account/*",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://pannabiryani.in/sitemap.xml",
  };
}
