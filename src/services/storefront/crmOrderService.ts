import { Order } from "@/types";

const BASE = (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

function toCrmPaymentMethod(pm: string): string {
  if (pm === "online") return "ONLINE_UPI";
  return "COD";
}

/**
 * Forward a newly created website order to the CRM so it appears in the
 * orders dashboard. Failures are logged but never block customer ordering.
 * Returns the CRM-side order number (e.g. PB-W-20261005-1064) when the
 * order was accepted, or null when the CRM could not be reached.
 */
export async function forwardOrderToCrm(order: Order): Promise<string | null> {
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
        const crmOrderNumber = json?.data?.order_number;
        console.info(`[crmOrder] Order forwarded to CRM: ${crmOrderNumber || "ok"}`);
        return crmOrderNumber ?? null;
      }
    } catch (err) {
      console.error(`[crmOrder] Error forwarding order to CRM (attempt ${attempt}):`, err);
    }
  }
  return null;
}
