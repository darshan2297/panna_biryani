import { Metadata } from "next";
import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Login with WhatsApp | Panna Biryani Surat",
  description:
    "Login securely with your WhatsApp verification code to view your royal profile, past biryani orders, live delivery tracking, and invoices.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF7F2] min-h-[85vh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#007A55] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
