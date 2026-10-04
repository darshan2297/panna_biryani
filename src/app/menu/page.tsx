import { Metadata } from "next";
import { Suspense } from "react";
import { MenuContent } from "./MenuContent";

export const metadata: Metadata = {
  title: "Our Menu | Authentic Veg Dum Biryani, Combos & Extras in Surat",
  description:
    "Explore Panna Biryani's full menu: Veg Dum, Paneer Dum, Hyderabadi and Royal Biryanis. Available in 250g, 500g, 750g & 1kg handis with fresh raita and chutney.",
  openGraph: {
    title: "Panna Biryani Menu | Pure Vegetarian Dum Biryani in Surat",
    description:
      "Explore 100% vegetarian dum biryanis slow cooked in sealed handis. Order online for pickup in Vesu or delivery across Surat.",
    images: ["/images/food/hero-biryani.jpg"],
  },
};

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#E8B94A]/30 border-t-[#003F32] animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}

