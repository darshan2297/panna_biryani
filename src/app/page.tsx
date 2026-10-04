import { HeroSection } from "@/components/home/HeroSection";
import { SignatureBiryaniSection } from "@/components/home/SignatureBiryaniSection";
import { AddExtraAndCombosSection } from "@/components/home/AddExtraAndCombosSection";
import { HowWouldYouLikeToOrderSection } from "@/components/home/HowWouldYouLikeToOrderSection";
import { FAQJsonLd } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <>
      <FAQJsonLd />
      <HeroSection />
      <SignatureBiryaniSection />
      <AddExtraAndCombosSection />
      <HowWouldYouLikeToOrderSection />
    </>
  );
}
