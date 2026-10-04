import { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Account & Orders | Panna Biryani Surat",
  description:
    "View your royal feast profile, past orders, live delivery tracking, and itemized invoices for Panna Biryani Surat.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
