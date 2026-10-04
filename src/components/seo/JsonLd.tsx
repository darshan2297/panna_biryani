import { siteConfig } from "@/data/siteConfig";
import { products } from "@/data/products";
import { faqs } from "@/data/faq";

export function RestaurantJsonLd() {
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
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.1418,
      longitude: 72.7709,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: siteConfig.operatingHours.openTime,
        closes: siteConfig.operatingHours.closeTime,
      },
    ],
    hasMenu: {
      "@type": "Menu",
      name: "Panna Biryani Signature Menu",
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "Signature Veg Dum Biryanis",
          hasMenuItem: products.map((p) => ({
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

export function FAQJsonLd() {
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

export function ProductJsonLd({
  product,
}: {
  product: (typeof products)[0];
}) {
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
