import { Offer } from "@/types";

/**
 * Legacy hard-coded offers. Superseded by CRM promo codes — the storefront
 * store reads from the backend and no longer falls back to this list.
 * Kept only so the `Offer` type stays exercised; new offers belong in the CRM.
 */
export const offers: Offer[] = [
  {
    id: "offer-first-order",
    code: "FIRSTPANNA",
    title: "First Order Special Gift",
    subtitle: "A Little Extra Love for Your First Celebration",
    description:
      "Order directly from our website and get a complimentary Shahi Dessert on your first order of ₹299 or more.",
    discountType: "free_item",
    discountValue: 89,
    freeItemName: "Complimentary Shahi Brownie Sweet",
    minOrderValue: 299,
    discountOn: "amount",
    customerType: "new",
    badge: "Special Welcome Gift",
    active: true,
  },
  {
    id: "offer-family-pack",
    code: "FAMILY100",
    title: "Family Pack Savings",
    subtitle: "More Food, More Happiness",
    description: "Get flat ₹100 instant discount on Family & Saver Packs when ordering for gatherings.",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 999,
    discountOn: "amount",
    customerType: "all",
    badge: "Save ₹100",
    active: true,
  },
  {
    id: "offer-free-delivery",
    code: "FREEDEL",
    title: "Free Doorstep Delivery",
    subtitle: "Complimentary Delivery in Surat",
    description:
      "Enjoy zero delivery fee on all orders of ₹800 and above anywhere within our Surat delivery network.",
    discountType: "fixed",
    discountValue: 49,
    minOrderValue: 800,
    discountOn: "amount",
    customerType: "all",
    badge: "Free Delivery",
    active: true,
  },
];

export function getOfferByCode(code: string): Offer | undefined {
  return offers.find((o) => o.code.toUpperCase() === code.trim().toUpperCase() && o.active);
}