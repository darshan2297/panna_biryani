import { Metadata } from "next";
import { getOrder } from "@/services/orders/orderService";
import { notFound } from "next/navigation";
import { OrderSuccessClient } from "./OrderSuccessClient";

interface Props {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Order Confirmed | Panna Biryani Surat",
  description: "Your Panna Biryani order has been received and confirmed. Track preparation and delivery in real-time.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderSuccessPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return <OrderSuccessClient order={order} />;
}
