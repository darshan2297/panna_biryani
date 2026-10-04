import { Metadata } from "next";
import { getOrder } from "@/services/orders/orderService";
import { notFound } from "next/navigation";
import { OrderTrackerClient } from "./OrderTrackerClient";

interface Props {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Track Order | Panna Biryani Surat",
  description: "Live order tracking for Panna Biryani kitchen in Surat.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TrackOrderPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return <OrderTrackerClient order={order} />;
}
