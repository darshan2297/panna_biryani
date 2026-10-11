import { Metadata } from "next";
import { getOrder } from "@/services/orders/orderService";
import { CRM_API_BASE } from "@/lib/crmConfig";
import { RefundDetails } from "@/types";
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

  // Hydrate the refund server-side. `getOrder` reads the in-memory order store,
  // which never carries refund data because refunds are issued later by the
  // CRM. Without this the slip would be missing until the first client poll,
  // flashing in a second after load. Fail-soft: a refund slip is an addition,
  // never a reason to fail the page.
  let refund: RefundDetails | null = null;
  if (initialOrder?.crmOrderNumber) {
    try {
      const res = await fetch(
        `${CRM_API_BASE}/public/orders/track/${initialOrder.crmOrderNumber}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json().catch(() => null);
        refund = (json?.data?.refund as RefundDetails | undefined) ?? null;
      }
    } catch {
      refund = null;
    }
  }

  const order = refund && initialOrder ? { ...initialOrder, refund } : initialOrder;

  return <OrderDetailClient orderId={orderId} initialOrder={order || null} />;
}
