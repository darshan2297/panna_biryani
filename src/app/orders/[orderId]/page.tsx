import { Metadata } from "next";
import { getOrder } from "@/services/orders/orderService";
import { OrderDetailClient } from "./OrderDetailClient";

interface Props {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Order Details & Invoice | Panna Biryani Surat",
  description:
    "View complete invoice, itemized bill, and status for your Panna Biryani slow-cooked feast.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  const initialOrder = await getOrder(orderId);

  return <OrderDetailClient orderId={orderId} initialOrder={initialOrder || null} />;
}
