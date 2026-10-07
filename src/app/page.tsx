import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { SignatureBiryaniSection } from "@/components/home/SignatureBiryaniSection";
import { AddExtraAndCombosSection } from "@/components/home/AddExtraAndCombosSection";
import { HowWouldYouLikeToOrderSection } from "@/components/home/HowWouldYouLikeToOrderSection";
import { HomeSections } from "@/components/home/HomeSections";
import { FAQJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Panna Biryani | Best Veg Dum Biryani in Surat — Order Online",
  description:
    "Surat's highest rated pure vegetarian dum biryani cloud kitchen. Slow-cooked Veg Dum, Paneer Dum, Hyderabadi & Royal biryanis in sealed handis with free raita & chutney. Order online for delivery across Surat or free pickup in Vesu.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Panna Biryani | Best Veg Dum Biryani in Surat",
    description:
      "Slow-cooked pure vegetarian dum biryani delivered hot across Surat. Veg Dum, Paneer Dum, Hyderabadi & Royal handis with free raita & chutney. Order online now!",
    url: "https://pannabiryani.in",
    type: "website",
    images: [
      {
        url: "/hero/panna-hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Panna Biryani — Veg Dum Biryani Handi, Surat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panna Biryani | Best Veg Dum Biryani in Surat",
    description:
      "Slow-cooked pure vegetarian dum biryani delivered hot across Surat. Order online for delivery or free pickup.",
    images: ["/hero/panna-hero-banner.jpg"],
  },
};

export default function HomePage() {
  return (
    <>
      <FAQJsonLd />
      <HeroSection />
      <SignatureBiryaniSection />
      <AddExtraAndCombosSection />
      <HowWouldYouLikeToOrderSection />
      <HomeSections />
    </>
  );
}
