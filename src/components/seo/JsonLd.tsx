import { siteConfig } from "@/data/siteConfig";
import { Product } from "@/types";
import { hydrateServerStorefront, getServerStorefront } from "@/services/storefront/serverConfig";

export async function RestaurantJsonLd() {
  let menuProducts: Product[] = [];
  let config: Awaited<ReturnType<typeof hydrateServerStorefront>>["config"] | null = null;
  try {
    const srv = await hydrateServerStorefront();
    const menu = srv.menu;
    menuProducts = menu?.products ?? [];
    config = srv.config;
  } catch {
    menuProducts = [];
  }

  // Use CRM config values for operating hours and geo coordinates
  const operatingHours = config?.operating_hours || undefined;
  const googleMapsUrl = config?.google_maps_url || undefined;

  // Try to extract lat/lng from Google Maps URL
  let latitude: number | undefined;
  let longitude: number | undefined;
  if (googleMapsUrl) {
    const coordsMatch = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      googleMapsUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      latitude = parseFloat(coordsMatch[1]);
      longitude = parseFloat(coordsMatch[2]);
    }
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://pannabiryani.in/#restaurant",
    name: siteConfig.name,
    description: siteConfig.description,
    servesCuisine: ["Indian", "Biryani", "Vegetarian"],
    priceRange: "₹₹",
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    url: "https://pannabiryani.in",
    logo: "https://pannabiryani.in/images/brand/logo.jpg",
    image: "https://pannabiryani.in/images/food/hero-biryani.jpg",
    menu: "https://pannabiryani.in/menu",
    acceptsReservations: "False",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.pickupLocation.address,
      addressLocality: siteConfig.pickupLocation.city,
      addressRegion: siteConfig.state,
      postalCode: siteConfig.pickupLocation.pincode,
      addressCountry: "IN",
    },
    ...(latitude && longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          },
        }
      : {}),
    ...(operatingHours
      ? { openingHours: operatingHours }
      : {
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "17:00",
              closes: "23:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday"],
              opens: "11:00",
              closes: "23:00",
            },
          ],
        }),
    hasMenu: {
      "@type": "Menu",
      name: "Panna Biryani Signature Menu",
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "Signature Veg Dum Biryanis",
          hasMenuItem: menuProducts
            .filter((p) => p.sizes && p.sizes.length > 0)
            .map((p) => ({
            "@type": "MenuItem",
            name: p.name,
            description: p.description,
            suitableForDiet: "https://schema.org/VegetarianDiet",
            offers: {
              "@type": "Offer",
              price: p.sizes[0].price,
              priceCurrency: "INR",
            },
          })),
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function FAQJsonLd() {
  let faqs: { question: string; answer: string }[] = [];
  try {
    await hydrateServerStorefront();
    faqs = getServerStorefront().faqs ?? [];
  } catch {
    faqs = [];
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `https://pannabiryani.in${product.image}`,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    suitableForDiet: "https://schema.org/VegetarianDiet",
    offers: product.sizes.map((size) => ({
      "@type": "Offer",
      name: `${product.name} - ${size.label}`,
      price: size.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `https://pannabiryani.in/menu/${product.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
