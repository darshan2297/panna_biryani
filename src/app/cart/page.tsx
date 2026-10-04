import { Metadata } from "next";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = {
  title: "Your Cart | Panna Biryani Surat",
  description: "Review your selected vegetarian dum biryanis, extras, and proceed to checkout for pickup or delivery in Surat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartPageContent />;
}
