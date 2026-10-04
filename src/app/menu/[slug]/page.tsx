import { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductJsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const startingPrice = product.sizes[0].price;

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
