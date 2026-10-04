import { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Panna Biryani Surat",
  description: "Complete your vegetarian dum biryani order. Fast doorstep delivery in Surat or free kitchen pickup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
