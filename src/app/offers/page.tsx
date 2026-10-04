import { Metadata } from "next";
import { offers } from "@/data/offers";
import { OffersClient } from "./OffersClient";

export const metadata: Metadata = {
  title: "Special Offers & Deals | Panna Biryani Surat",
  description:
    "Exclusive online direct discounts from Panna Biryani. Get a free Shahi Dessert on your first order, family pack discounts, and free delivery in Surat.",
  openGraph: {
    title: "Panna Biryani Offers & Free Dessert Gift | Surat",
    description:
      "Save on authentic vegetarian dum biryani when ordering directly from our official website.",
    images: ["/images/food/shahi-dessert.jpg"],
  },
};

export default function OffersPage() {
  return <OffersClient offers={offers} />;
}
