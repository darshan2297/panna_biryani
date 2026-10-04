import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Panna Biryani Surat",
  description: "Terms and conditions of service for Panna Biryani online order portal.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-800 space-y-6">
      <h1 className="font-serif text-3xl font-black text-panna-deep">Terms and Conditions</h1>
      <p className="text-xs text-zinc-500">Effective Date: October 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          Welcome to Panna Biryani. By placing an order through this website, you agree to comply with
          and be bound by the following terms and conditions.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">1. Pure Vegetarian Guarantee</h2>
        <p>
          All items on our menu are 100% vegetarian, cooked in accordance with strict hygiene standards
          using genuine ingredients including pure desi ghee and fresh farm produce.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">2. Orders and Pricing</h2>
        <p>
          Prices listed on the website are in Indian Rupees (INR) and inclusive of applicable taxes.
          Panna Biryani reserves the right to adjust menu pricing or availability without prior notice.
          Once confirmed, orders are slow-cooked fresh on order.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">3. Delivery and Pickup</h2>
        <p>
          Delivery times provided during checkout are estimates based on distance and live kitchen
          traffic in Surat. Self-pickup orders must be collected from our kitchen counter in Vesu within
          45 minutes of the ready notification.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">4. Governing Law</h2>
        <p>
          These terms are governed by the laws of India and subject to the jurisdiction of courts in
          Surat, Gujarat.
        </p>
      </div>
    </div>
  );
}
