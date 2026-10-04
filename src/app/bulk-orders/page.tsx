import { Metadata } from "next";
import { BulkOrderForm } from "./BulkOrderForm";

export const metadata: Metadata = {
  title: "Bulk Biryani Orders for Parties & Events in Surat",
  description:
    "Planning a family gathering, house party, or corporate event in Surat? Order bulk authentic vegetarian dum biryani from Panna Biryani. Custom packages for 10 to 200+ guests.",
  keywords: [
    "Bulk Biryani Orders Surat",
    "Biryani Catering Surat",
    "Veg Biryani for Party Surat",
    "Family Biryani Pack Surat",
    "Corporate Lunch Biryani Surat",
  ],
  openGraph: {
    title: "Bulk Biryani Orders & Event Catering | Panna Biryani Surat",
    description:
      "Authentic sealed handi dum biryani for your parties and functions in Surat. Freshly prepared with accompaniment raita and chutney.",
    images: ["/images/banners/bulk-catering.jpg"],
  },
};

export default function BulkOrdersPage() {
  return <BulkOrderForm />;
}
