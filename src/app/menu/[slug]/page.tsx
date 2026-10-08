import { Metadata } from "next";
import { notFound } from "next/navigation";
import { hydrateServerStorefront, getServerStorefront } from "@/services/storefront/serverConfig";
import { resolveImageUrl } from "@/services/storefront/configService";
import { Product } from "@/types";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductJsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

// Always render with the freshest CRM menu data (prices, availability, images)
export const dynamic = "force-dynamic";

/** Resolve a product by slug from the live CRM menu only — no static catalog fallback. */
async function resolveProduct(slug: string): Promise<{ product: Product | undefined; all: Product[] }> {
  try {
    await hydrateServerStorefront();
    const menu = getServerStorefront().menu;
    if (menu && menu.products) {
      const all = menu.products.map((p) => ({ ...p, image: resolveImageUrl(p.image) }));
      const product = all.find((p) => p.slug === slug);
      return { product, all };
    }
  } catch {
    /* API unavailable — no product to show */
  }
  return { product: undefined, all: [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await resolveProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const startingPrice = product.sizes.length > 0 ? product.sizes[0].price : 0;

  return {
    title: `${product.name} in Surat | Order from ₹${startingPrice}`,
    description: `${product.shortDescription} Slow dum cooked in Surat with royal basmati, desi cow ghee and aromatic spices. Available in 250g, 500g, 750g and 1kg handis.`,
    keywords: [
      product.name,
      `${product.name} Surat`,
      `${product.categoryLabel} Biryani Surat`,
      "Veg Dum Biryani Surat",
      "Panna Biryani Menu",
    ],
    openGraph: {
      title: `${product.name} | Panna Biryani Surat`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const { product, all } = await resolveProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = all.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
