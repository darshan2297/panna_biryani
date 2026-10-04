import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Panna Biryani Surat",
  description: "Privacy policy for Panna Biryani online order portal.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-800 space-y-6">
      <h1 className="font-serif text-3xl font-black text-panna-deep">Privacy Policy</h1>
      <p className="text-xs text-zinc-500">Last updated: October 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          At <strong>Panna Biryani</strong>, we respect your privacy and are committed to protecting
          your personal information. This Privacy Policy describes how we collect, use, and protect
          your data when you visit our website or place an order.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">1. Information We Collect</h2>
        <p>
          When you place an order or contact us, we collect details necessary to fulfill your request:
          name, contact phone number, delivery address in Surat, and email address (optional for
          receipts). We do not store your credit card or UPI credentials on our servers; payments are
          processed securely by authorized Indian payment gateways.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">2. How We Use Your Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To prepare, package, and deliver your food orders accurately.</li>
          <li>To communicate live order status via SMS or WhatsApp notifications.</li>
          <li>To respond to customer support inquiries and process feedback.</li>
          <li>To prevent fraudulent transactions and maintain kitchen safety records.</li>
        </ul>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">3. Data Sharing</h2>
        <p>
          We do not sell, rent, or lease your personal data to third parties. We share delivery
          details only with our dedicated delivery partners for the sole purpose of reaching your
          address.
        </p>

        <h2 className="font-serif text-xl font-bold text-panna-deep pt-4">4. Contact Us</h2>
        <p>
          If you have questions regarding this Privacy Policy, please email us at{" "}
          <strong>hello@pannabiryani.in</strong>.
        </p>
      </div>
    </div>
  );
}
