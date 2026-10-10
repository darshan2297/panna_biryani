import { Order } from "@/types";

const BASE = (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

function toCrmPaymentMethod(pm: string): string {
  if (pm === "online") return "ONLINE_UPI";
  return "COD";
}

/** Authoritative result returned by the CRM for a forwarded order. */
export interface CrmOrderResult {
  orderNumber: string;
  totalAmount: number;
  transactionFee: number;
  vasFee: number;
  tax: number;
}

/**
 * Forward a newly created website order to the CRM so it appears in the
 * orders dashboard. Failures are logged but never block customer ordering.
 * Returns the CRM-side order number and the CRM's authoritative totals
 * (which include the online-payment transaction fee, GST and VAS charge),
 * or null when the CRM could not be reached.
 */
export async function forwardOrderToCrm(order: Order): Promise<CrmOrderResult | null> {
  const items = order.items.map((it) => ({
    item_name: it.productName,
    portion_size: it.size?.label || it.size?.id || "500g",
    quantity: it.quantity,
    unit_price: Math.round((it.totalPrice / Math.max(1, it.quantity)) * 100) / 100,
    is_free: it.isFree === true,
    notes: (it.extras || [])
      .map((e) => `${e.quantity}x ${e.extra.name}`)
      .join(", ") || null,
  }));

  const deliveryAddress =
    order.orderType === "delivery" && order.deliveryAddress
      ? `${order.deliveryAddress.streetAddress}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`
      : `Pickup from kitchen - ${order.customerName}`;

  const payload = {
    customer: {
      name: order.customerName,
      phone: order.phone,
      email: order.email || null,
      delivery_address: deliveryAddress,
    },
    items,
    payment_method: toCrmPaymentMethod(order.paymentMethod),
    order_type: order.orderType === "pickup" ? "PICKUP" : "DELIVERY",
    delivery_fee: order.deliveryFee,
    discount: order.discount,
    discount_type: order.discountType || null,
    free_item_name: order.freeItemName || null,
    tax: order.tax,
    notes: order.specialInstructions || null,
  };

  // Retry a few times so a transient backend hiccup doesn't lose the order.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${BASE}/public/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`[crmOrder] Failed to forward order to CRM (${res.status}): ${text}`);
      } else {
        const json = await res.json().catch(() => null);
        const data = json?.data;
        const crmOrderNumber = data?.order_number;
        console.info(`[crmOrder] Order forwarded to CRM: ${crmOrderNumber || "ok"}`);
        if (!crmOrderNumber) return null;
        // The CRM recomputes the grand total (adding the online-payment
        // transaction fee, GST and the flat VAS charge). Return those
        // authoritative figures so the caller charges the exact amount.
        return {
          orderNumber: crmOrderNumber,
          totalAmount: Number(data?.total_amount ?? order.total),
          transactionFee: Number(data?.transaction_fee ?? 0),
          vasFee: Number(data?.vas_fee ?? 0),
          tax: Number(data?.tax ?? order.tax),
        };
      }
    } catch (err) {
      console.error(`[crmOrder] Error forwarding order to CRM (attempt ${attempt}):`, err);
    }
  }
  return null;
}
