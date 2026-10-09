function currentMenu() {
  const srv = getServerStorefront();
  const resolveImg = (url: string) => (url && url.startsWith("/media/") ? (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1.*$/, "") + url : url);
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
  OrderType,
  PaymentMethod,
  DeliveryAddress,
} from "@/types";
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

// In-memory order storage attached to globalThis for consistent state across Next.js server contexts
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
      const { combos, products, extras } = currentMenu();
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

  // Forward to CRM so the order shows up in the CRM orders dashboard
  const crmOrderNumber = await forwardOrderToCrm(newOrder);
  if (crmOrderNumber) {
    newOrder.crmOrderNumber = crmOrderNumber;
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
 * Fetch all orders belonging to a customer's phone number (unique identifier)
 */
export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (!cleanPhone) return [];

  const matched = new Map<string, Order>();

  // Iterate stored orders (deduplicating by order.id)
  for (const order of ordersStore.values()) {
    const orderClean = order.phone.replace(/\D/g, "").slice(-10);
    if (orderClean === cleanPhone) {
      matched.set(order.id, order);
    }
  }

  return Array.from(matched.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
