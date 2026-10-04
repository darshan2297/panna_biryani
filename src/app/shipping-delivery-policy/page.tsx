import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Delivery & Shipping Policy | Panna Biryani Surat",
  description: "Delivery coverage, time estimates, and pickup policy for Panna Biryani in Surat.",
};

export default function ShippingDeliveryPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-800 space-y-6">
      <h1 className="font-serif text-3xl font-black text-panna-deep">
        Delivery & Pickup Policy
      </h1>
      <p className="text-xs text-zinc-500">Effective Date: October 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          Panna Biryani operates a modern vegetarian cloud kitchen in Vesu, Surat. We provide both
          direct kitchen pickup and prompt doorstep delivery across Surat.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">1. Delivery Zones in Surat</h2>
        <p>
          We currently service neighborhoods including Vesu, VIP Road, City Light, Piplod, Althan,
          Ghod Dod Road, Athwa Lines, Adajan, Pal, Nanpura, Rander, Varachha, and Katargam.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">2. Delivery Charges</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Self Pickup:</strong> 100% Free of charge from our kitchen in Vesu.</li>
          <li><strong>Orders of ₹800 and above:</strong> FREE delivery across our service network.</li>
          <li><strong>Standard Orders:</strong> Nominal distance fee ranging from ₹30 to ₹69.</li>
        </ul>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">3. Estimated Timing</h2>
        <p>
          Each biryani is dum-cooked and sealed fresh. Most deliveries arrive within 35 to 55 minutes
          depending on distance and traffic conditions.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">4. Food Handover</h2>
        <p>
          Deliveries are handed over in thermal-safe sealed handis. Please inspect the seal upon
          delivery. For any issues, contact our support line at {siteConfig.contact.phoneDisplay}.
        </p>
      </div>
    </div>
  );
}
