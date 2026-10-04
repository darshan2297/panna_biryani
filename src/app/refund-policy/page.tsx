import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Panna Biryani Surat",
  description: "Refund and cancellation guidelines for Panna Biryani customers in Surat.",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-800 space-y-6">
      <h1 className="font-serif text-3xl font-black text-panna-deep">
        Refund & Cancellation Policy
      </h1>
      <p className="text-xs text-zinc-500">Effective Date: October 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          At Panna Biryani, we strive to deliver the highest quality food and dining satisfaction.
          Because food items are prepared fresh to order, our cancellation policy is designed with
          kitchen readiness in mind.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">1. Order Cancellation</h2>
        <p>
          Orders may be cancelled within <strong>5 minutes</strong> of placement by contacting our
          kitchen team via phone or WhatsApp. Once the chef begins dum layering and dough sealing,
          cancellation cannot be accepted.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">2. Eligible Refund Situations</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Wrong or missing item delivered compared to the confirmed order receipt.</li>
          <li>Packaging seal damaged or compromised during transit.</li>
          <li>Unusually severe delivery delay exceeding 60 minutes beyond the estimated window.</li>
        </ul>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">3. Refund Processing</h2>
        <p>
          Approved refunds for online payments are credited back to the original source account (UPI,
          card, or netbanking) within 3-5 business days through our payment gateway.
        </p>
      </div>
    </div>
  );
}
