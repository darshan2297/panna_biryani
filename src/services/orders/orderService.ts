function currentMenu() {
  const srv = getServerStorefront();
  const resolveImg = resolveCrmMediaUrl;
  return {
    products: srv.menu && srv.menu.products ? srv.menu.products.map((p) => ({ ...p, image: resolveImg(p.image) })) : [],
    combos: srv.menu && srv.menu.combos ? srv.menu.combos.map((c) => ({ ...c, image: resolveImg(c.image) })) : [],
    extras: srv.menu && srv.menu.extras ? srv.menu.extras.map((e) => ({ ...e, image: resolveImg(e.image) })) : [],
  };
}
import { siteConfig } from "@/data/siteConfig";
import { getServerStorefront } from "@/services/storefront/serverConfig";
import { forwardOrderToCrm } from "@/services/storefront/crmOrderService";
import { validatePromoCode, redeemPromoCode, resolveDiscountAmount, PHONE_REQUIRED } from "@/services/storefront/configService";
import { calculateDeliveryFee } from "@/services/delivery/deliveryService";
import {
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderType,
  PaymentMethod,
  DeliveryAddress,
} from "@/types";
import { CRM_API_BASE, resolveCrmMediaUrl } from "@/lib/crmConfig";
import { generateOrderNumber } from "@/lib/utils";

/** Display label for the complimentary promo gift line item. */
const FREE_ITEM_DISPLAY_NAME = "Complimentary Shahi Brownie Sweet";

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email?: string;
  items: {
    productId: string;
    sizeId: string;
    quantity: number;
    extraIds?: { id: string; quantity: number }[];
    isCombo?: boolean;
    isFree?: boolean;
  }[];
  orderType: OrderType;
  deliveryAddress?: DeliveryAddress;
  specialInstructions?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

export interface OrderCalculationResult {
  validatedItems: CartItem[];
  subtotal: number;
  discount: number;
  discountType?: "fixed" | "percentage" | "free_item" | "free_delivery";
  freeItemName?: string;
  appliedCoupon?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  freeDessertEligible: boolean;
  estimatedDeliveryMinutes: number;
}

/**
 * EPHEMERAL IN-MEMORY ORDER STORE — KNOWN LIMITATION
 *
 * Orders are stored in a Map on globalThis for consistent state across Next.js
 * server contexts. This store is VOLATILE: all orders are lost on server restart
 * or serverless function cold-start. This is acceptable for the current phase
 * because every order is also forwarded to the CRM via `forwardOrderToCrm`
 * (see `createOrder`), which is the persistent system of record.
 *
 * If durable order history is needed in the future, replace this with a
 * database-backed store (e.g. PostgreSQL, MongoDB) or query the CRM API.
 */
const globalOrdersStore = (globalThis as unknown as { _pannaOrdersStore?: Map<string, Order> });
if (!globalOrdersStore._pannaOrdersStore) {
  globalOrdersStore._pannaOrdersStore = new Map<string, Order>();
}
const ordersStore = globalOrdersStore._pannaOrdersStore;

/**
 * STRICT SERVER-SIDE PRICING VALIDATION
 * Re-computes item prices, checks menu catalogue, validates combos & extras,
 * computes coupons and delivery fees. Browser-provided prices are completely discarded!
 */
export function calculateOrderTotals(
  items: CreateOrderInput["items"],
  orderType: OrderType,
  areaName?: string,
  pincode?: string,
  couponCode?: string
): OrderCalculationResult {
  const validatedItems: CartItem[] = [];
  let subtotal = 0;

  for (const itemInput of items) {
    // Complimentary promo gift: carried through at ₹0 and never menu-validated.
    if (itemInput.isFree) {
      const freeQty = Math.max(1, Math.min(5, itemInput.quantity));
      validatedItems.push({
        id: `${itemInput.productId}-free`,
        productId: itemInput.productId,
        productName: FREE_ITEM_DISPLAY_NAME,
        productSlug: itemInput.productId,
        productImage: "",
        isCombo: false,
        isFree: true,
        size: {
          id: "single",
          label: "Complimentary",
          weightGrams: 0,
          price: 0,
          servesText: "1 pc",
        },
        quantity: freeQty,
        extras: [],
        unitBasePrice: 0,
        totalPrice: 0,
      });
      continue;
    }

    if (itemInput.isCombo) {
      // Find matching combo
      const { combos } = currentMenu();
      const combo = combos.find((c) => c.id === itemInput.productId);
      if (!combo) continue;

      const unitPrice = combo.price;
      const quantity = Math.max(1, Math.min(20, itemInput.quantity));
      const totalPrice = unitPrice * quantity;

      validatedItems.push({
        id: `combo-${combo.id}`,
        productId: combo.id,
        productName: combo.name,
        productSlug: combo.slug,
        productImage: combo.image,
        isCombo: true,
        size: {
          id: "combo",
          label: combo.servesText,
          weightGrams: 1000,
          price: combo.price,
          servesText: combo.servesText,
        },
        quantity,
        extras: [],
        unitBasePrice: unitPrice,
        totalPrice,
      });

      subtotal += totalPrice;
      continue;
    }

    // Standard biryani product
    const { products, extras } = currentMenu();
    const product = products.find((p) => p.id === itemInput.productId);
    if (!product || !product.available) continue;

    const sizeObj = product.sizes.find((s) => s.id === itemInput.sizeId) || product.sizes[0];
    const unitBasePrice = sizeObj.price;
    const quantity = Math.max(1, Math.min(20, itemInput.quantity));

    // Validate extras server-side
    const validatedExtras: CartItem["extras"] = [];
    let extrasTotal = 0;

    if (itemInput.extraIds && itemInput.extraIds.length > 0) {
      for (const eInput of itemInput.extraIds) {
        const foundExtra = extras.find((e) => e.id === eInput.id);
        if (foundExtra) {
          const eQty = Math.max(1, Math.min(10, eInput.quantity));
          validatedExtras.push({
            extra: foundExtra,
            quantity: eQty,
          });
          extrasTotal += foundExtra.price * eQty;
        }
      }
    }

    const itemUnitPriceWithExtras = unitBasePrice + extrasTotal;
    const itemTotalPrice = itemUnitPriceWithExtras * quantity;

    validatedItems.push({
      id: `${product.id}-${sizeObj.id}-${validatedExtras.map((e) => `${e.extra.id}x${e.quantity}`).join("_")}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.image,
      isCombo: false,
      size: sizeObj,
      quantity,
      extras: validatedExtras,
      unitBasePrice,
      totalPrice: itemTotalPrice,
    });

    subtotal += itemTotalPrice;
  }

  // Delivery fee calculation
  const deliveryCalc = calculateDeliveryFee(orderType, subtotal, areaName, pincode);
  const deliveryFee = deliveryCalc.deliveryFee;

  // Coupon discount calculation
  let discount = 0;
  let appliedCoupon: string | undefined = undefined;
  let discountType: "fixed" | "percentage" | "free_item" | "free_delivery" | undefined;
  let freeItemName: string | undefined;

  if (couponCode) {
    const srv = getServerStorefront();
    const promo = (srv.promoCodes || []).find(
      (p) => p.code.toUpperCase() === couponCode.trim().toUpperCase() && p.active
    );
    const offer = promo
      ? {
          discountType:
            promo.discount_type === "percentage"
              ? ("percentage" as const)
              : promo.discount_type === "free_item"
              ? ("free_item" as const)
              : ("fixed" as const),
          discountValue: promo.discount_value,
        }
      : undefined;
    const minOrder = promo ? promo.min_order_value : 0;
    if (offer && subtotal >= minOrder) {
      appliedCoupon = promo?.code;
      discountType = offer.discountType;
      if (offer.discountType === "free_item") {
        discount = 0;
        freeItemName = promo?.free_item_name || undefined;
      } else {
        // Shared resolver so the cart preview and this server-side figure agree.
        discount = Math.round(
          resolveDiscountAmount({
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            maxDiscountAmount: promo?.max_discount_amount,
            subtotal,
          })
        );
      }
    }
  }

  // First order free dessert eligibility (₹299+)
  const freeDessertEligible = subtotal >= siteConfig.pricingRules.firstOrderFreeDessertThreshold;

  // Final total
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    validatedItems,
    subtotal,
    discount,
    discountType,
    freeItemName,
    appliedCoupon,
    deliveryFee,
    tax: 0,
    total,
    freeDessertEligible,
    estimatedDeliveryMinutes: deliveryCalc.estimatedMinutes,
  };
}

/**
 * Create a new order with server validation
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Compute real totals first: the authoritative promo re-check below needs the
  // actual order value, because the server enforces min_order_value against it.
  const calculation = calculateOrderTotals(
    input.items,
    input.orderType,
    input.deliveryAddress?.area,
    input.deliveryAddress?.pincode,
    input.couponCode
  );

  if (calculation.validatedItems.length === 0) {
    throw new Error("Cannot create order with empty or unavailable items.");
  }

  // Authoritative promo re-check now that the customer's phone AND the real
  // cart totals are known. Enforces first_order_only / customer_type,
  // min/max thresholds and per-user redemption limits.
  if (input.couponCode) {
    const srv = getServerStorefront();
    const promo = (srv.promoCodes || []).find(
      (p) => p.code.toUpperCase() === input.couponCode!.trim().toUpperCase() && p.active
    );
    if (promo) {
      // The complimentary gift is not part of the paid cart: it must neither
      // count toward the threshold nor be matched against applicable_items.
      const paidItems = calculation.validatedItems.filter((i) => !i.isFree);
      const result = await validatePromoCode({
        code: promo.code,
        orderValue: calculation.subtotal,
        itemCount: paidItems.reduce((n, i) => n + (i.quantity || 0), 0),
        cartItemSlugs: paidItems.map((i) => i.productSlug || i.productId),
        customerPhone: input.phone.trim(),
      });
      if (result && !result.valid) {
        throw new Error(
          result.reason === PHONE_REQUIRED
            ? "A valid mobile number is required to use this promo code."
            : result.reason || "This promo code is not valid for your account."
        );
      }
    }
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const orderNumber = generateOrderNumber();

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim(),
    items: calculation.validatedItems,
    subtotal: calculation.subtotal,
    discount: calculation.discount,
    discountType: calculation.discountType,
    freeItemName: calculation.freeItemName,
    appliedCoupon: calculation.appliedCoupon,
    deliveryFee: calculation.deliveryFee,
    tax: calculation.tax,
    total: calculation.total,
    orderType: input.orderType,
    deliveryAddress: input.orderType === "delivery" ? input.deliveryAddress : undefined,
    specialInstructions: input.specialInstructions?.trim(),
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "online" ? "PAID" : "PENDING",
    orderStatus: "CONFIRMED",
    estimatedDeliveryMinutes: calculation.estimatedDeliveryMinutes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.set(orderId, newOrder);
  ordersStore.set(orderNumber, newOrder);

  // Forward to CRM so the order shows up in the CRM orders dashboard.
  // The CRM is the pricing authority: it adds the online-payment
  // transaction fee, GST and the flat VAS notification charge on top
  // of the base cart total. Adopt its authoritative totals so the
  // amount the customer is charged (Razorpay) matches the order
  // recorded in the CRM exactly.
  const crmResult = await forwardOrderToCrm(newOrder);
  if (crmResult) {
    newOrder.crmOrderNumber = crmResult.orderNumber;
    newOrder.total = crmResult.totalAmount;
    newOrder.tax = crmResult.tax;
    newOrder.transactionFee = crmResult.transactionFee;
    newOrder.vasFee = crmResult.vasFee;
    ordersStore.set(orderId, newOrder);
    ordersStore.set(orderNumber, newOrder);
  }

  // Burn the promo redemption against this phone so per-user limits hold
  // across future orders. Failure must not block the order itself.
  if (input.couponCode) {
    try {
      await redeemPromoCode({ code: input.couponCode, customerPhone: input.phone.trim() });
    } catch {
      /* non-fatal: order already placed */
    }
  }

  return newOrder;
}

/**
 * Fetch an order by ID or Order Number
 */
export async function getOrder(idOrNumber: string): Promise<Order | null> {
  const order = ordersStore.get(idOrNumber);
  if (order) return order;
  return null;
}

/**
 * Update order status (future admin / status progression)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const order = ordersStore.get(orderId);
  if (!order) return false;

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();
  ordersStore.set(orderId, order);
  return true;
}

/**
 * Fetch a customer's order history from the CRM.
 *
 * This used to read `ordersStore`, an in-memory Map populated only by orders
 * placed since the server last started. A returning customer therefore saw an
 * empty profile — zero orders, ₹0 spent — even with a decade of real orders in
 * the CRM, which is where the CRM's own customer list disagreed with the
 * website. The CRM is the system of record; the in-memory map is now only a
 * fallback for orders placed in this process whose CRM write may still be in
 * flight.
 */
export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (cleanPhone.length < 10) return [];

  let remote: Order[] = [];
  try {
    const res = await fetch(`${CRM_API_BASE}/public/orders/by-phone/${cleanPhone}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      remote = (Array.isArray(json?.data) ? (json.data as CrmOrderSummary[]) : [])
        .map(mapCrmOrderToStorefrontOrder)
        .filter((o): o is Order => o !== null);
    }
  } catch {
    // CRM unreachable — fall through to the local cache below.
  }

  // Merge anything this process created that the CRM has not yet listed, so an
  // order placed seconds ago still appears immediately.
  const merged = new Map<string, Order>();
  for (const o of remote) merged.set(o.id, o);
  for (const order of ordersStore.values()) {
    if (order.phone.replace(/\D/g, "").slice(-10) === cleanPhone) {
      merged.set(order.id, order);
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Shape returned by GET /public/orders/by-phone/{phone}. */
interface CrmOrderSummary {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: {
    item_name: string;
    portion_size: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_free: boolean;
  }[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  order_type: string | null;
  delivery_address: string | null;
  created_at: string;
}

/** "500g" -> 500, "1kg" -> 1000. Used only to fill the size summary. */
function parsePortionGrams(portion: string): number {
  const raw = (portion || "").trim().toLowerCase();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.includes("kg") ? Math.round(n * 1000) : Math.round(n);
}

/** Map a CRM order summary onto the storefront's own Order shape. */
function mapCrmOrderToStorefrontOrder(row: CrmOrderSummary): Order | null {
  if (!row?.order_number) return null;

  const type = (row.order_type || "").toUpperCase();
  const method = (row.payment_method || "COD").toUpperCase();
  const isOnline =
    method.includes("ONLINE") || method.includes("UPI") || method.includes("CARD");

  const deliveryAddress: DeliveryAddress | undefined = row.delivery_address
    ? {
        fullName: "",
        phone: "",
        streetAddress: row.delivery_address,
        area: row.delivery_address,
        pincode: "",
        city: "Surat",
      }
    : undefined;

  const items: CartItem[] = (row.items || []).map((i, idx) => ({
    id: `${row.order_number}-${idx}`,
    productId: i.item_name,
    productName: i.item_name,
    productSlug: i.item_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    productImage: "",
    isFree: Boolean(i.is_free),
    size: {
      id: i.portion_size,
      label: i.portion_size,
      weightGrams: parsePortionGrams(i.portion_size),
      price: i.unit_price,
      servesText: "",
    },
    quantity: i.quantity,
    extras: [],
    unitBasePrice: i.unit_price,
    totalPrice: i.total_price,
  }));

  const order: Order = {
    id: row.order_number,
    orderNumber: row.order_number,
    // Carried through so the invoice's "Billed To" block is not blank.
    customerName: row.customer_name || "",
    phone: row.customer_phone || "",
    items,
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    tax: Number(row.tax) || 0,
    total: Number(row.total_amount) || 0,
    orderType: (type === "PICKUP" ? "pickup" : "delivery") as OrderType,
    deliveryAddress,
    paymentMethod: (isOnline ? "online" : "cash_on_delivery") as PaymentMethod,
    paymentStatus: (row.payment_status || "PENDING").toUpperCase() as PaymentStatus,
    orderStatus: (row.order_status || "NEW").toUpperCase() as OrderStatus,
    crmOrderNumber: row.order_number,
    estimatedDeliveryMinutes: 35,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };

  return order;
}
