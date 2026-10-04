import { products as staticProducts, combos as staticCombos, extras as staticExtras } from "@/data/products";

function currentMenu() {
  const srv = getServerStorefront();
  const resolveImg = (url: string) => (url && url.startsWith("/media/") ? (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1.*$/, "") + url : url);
  return {
    products: srv.menu && srv.menu.products.length > 0 ? srv.menu.products.map((p) => ({ ...p, image: resolveImg(p.image) })) : staticProducts,
    combos: srv.menu && srv.menu.combos.length > 0 ? srv.menu.combos.map((c) => ({ ...c, image: resolveImg(c.image) })) : staticCombos,
    extras: srv.menu && srv.menu.extras.length > 0 ? srv.menu.extras.map((e) => ({ ...e, image: resolveImg(e.image) })) : staticExtras,
  };
}
import { getOfferByCode } from "@/data/offers";
import { siteConfig } from "@/data/siteConfig";
import { getServerStorefront } from "@/services/storefront/serverConfig";
import { forwardOrderToCrm } from "@/services/storefront/crmOrderService";
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

// Seed a demo initial order so customers can test order tracking right away
const seedDemoOrder: Order = {
  id: "order_demo_12345",
  orderNumber: "PB-2026-10492",
  customerName: "Darshan Vora",
  phone: "+91 98765 43210",
  email: "darshan@example.com",
  items: [
    {
      id: "panna-royal-dum-biryani-500g",
      productId: "panna-royal-dum-biryani",
      productName: "Panna Royal Dum Biryani",
      productSlug: "panna-royal-dum-biryani",
      productImage: "/images/food/panna-royal-dum-biryani.jpg",
      size: {
        id: "500g",
        label: "500g",
        weightGrams: 500,
        price: 319,
        servesText: "Serves 1-2 people",
      },
      quantity: 1,
      extras: [
        {
          extra: staticExtras[0], // Raita Bowl
          quantity: 1,
        },
      ],
      unitBasePrice: 319,
      totalPrice: 368,
    },
  ],
  subtotal: 368,
  discount: 0,
  deliveryFee: 30,
  tax: 0,
  total: 398,
  orderType: "delivery",
  deliveryAddress: {
    fullName: "Darshan Vora",
    phone: "+91 98765 43210",
    streetAddress: "Flat 402, Royal Palms, VIP Circle",
    area: "Vesu",
    landmark: "Near Reliance Fresh",
    pincode: "395007",
    city: "Surat",
  },
  paymentMethod: "online",
  paymentStatus: "PAID",
  orderStatus: "PREPARING",
  estimatedDeliveryMinutes: 35,
  createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  updatedAt: new Date().toISOString(),
};
ordersStore.set(seedDemoOrder.id, seedDemoOrder);
ordersStore.set(seedDemoOrder.orderNumber, seedDemoOrder);

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

  if (couponCode) {
    const srv = getServerStorefront();
    const promo = (srv.promoCodes || []).find(
      (p) => p.code.toUpperCase() === couponCode.trim().toUpperCase() && p.active
    );
    const offer = promo
      ? {
          discountType:
            promo.discount_type === "percentage"
              ? "percentage"
              : promo.discount_type === "free_item"
              ? "free_item"
              : "fixed",
          discountValue: promo.discount_value,
        }
      : (() => {
          const o = getOfferByCode(couponCode);
          return o
            ? { discountType: o.discountType, discountValue: o.discountValue, code: o.code }
            : undefined;
        })();
    const minOrder = promo ? promo.min_order_value : (getOfferByCode(couponCode)?.minOrderValue ?? 0);
    if (offer && subtotal >= minOrder) {
      appliedCoupon = promo ? promo.code : getOfferByCode(couponCode)?.code;
      if (offer.discountType === "fixed") {
        discount = offer.discountValue;
      } else if (offer.discountType === "percentage") {
        discount = Math.round((subtotal * offer.discountValue) / 100);
      } else if (offer.discountType === "free_item") {
        // Free item is given as complimentary item or fixed value offset
        discount = 0; // Value is shown as free gift
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

  return newOrder;
}

/**
 * Fetch an order by ID or Order Number
 */
export async function getOrder(idOrNumber: string): Promise<Order | null> {
  const order = ordersStore.get(idOrNumber);
  if (order) return order;

  // Fallback check demo order
  if (idOrNumber === seedDemoOrder.id || idOrNumber === seedDemoOrder.orderNumber) {
    return seedDemoOrder;
  }

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

  // Check demo seed order
  const demoClean = seedDemoOrder.phone.replace(/\D/g, "").slice(-10);
  if (demoClean === cleanPhone) {
    matched.set(seedDemoOrder.id, seedDemoOrder);
  }

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
