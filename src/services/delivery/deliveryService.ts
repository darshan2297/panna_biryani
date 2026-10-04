import { siteConfig } from "@/data/siteConfig";
import { OrderType } from "@/types";

export interface DeliveryCalculationResult {
  deliveryFee: number;
  isFreeDelivery: boolean;
  freeDeliveryReason?: string;
  estimatedMinutes: number;
  minOrderRequired: number;
  areaFound: boolean;
  areaName: string;
}

/**
 * Server-safe delivery fee calculation based on order type, subtotal, and area
 */
export function calculateDeliveryFee(
  orderType: OrderType,
  subtotal: number,
  areaName?: string,
  pincode?: string
): DeliveryCalculationResult {
  if (orderType === "pickup") {
    return {
      deliveryFee: 0,
      isFreeDelivery: true,
      freeDeliveryReason: "Pickup from kitchen is 100% Free",
      estimatedMinutes: 20,
      minOrderRequired: 0,
      areaFound: true,
      areaName: "Kitchen Pickup (Vesu)",
    };
  }

  // Free delivery threshold check
  if (subtotal >= siteConfig.pricingRules.freeDeliveryThreshold) {
    return {
      deliveryFee: 0,
      isFreeDelivery: true,
      freeDeliveryReason: `Free delivery applied (Order ₹${subtotal} >= ₹${siteConfig.pricingRules.freeDeliveryThreshold})`,
      estimatedMinutes: 40,
      minOrderRequired: 199,
      areaFound: true,
      areaName: areaName || "Surat",
    };
  }

  // Find specific zone in Surat
  if (areaName) {
    const area = siteConfig.deliveryAreas.find(
      (a) =>
        a.name.toLowerCase() === areaName.toLowerCase() ||
        (pincode && a.pincode === pincode)
    );

    if (area) {
      return {
        deliveryFee: area.deliveryFee,
        isFreeDelivery: false,
        estimatedMinutes: area.estimatedMinutes,
        minOrderRequired: area.minOrder,
        areaFound: true,
        areaName: area.name,
      };
    }
  }

  // Default Surat city delivery fee
  return {
    deliveryFee: siteConfig.pricingRules.defaultDeliveryFee,
    isFreeDelivery: false,
    estimatedMinutes: 45,
    minOrderRequired: 249,
    areaFound: false,
    areaName: areaName || "Surat City",
  };
}

/**
 * Checks if kitchen is currently accepting orders based on operating hours
 */
export function getKitchenOperatingStatus(): {
  isOpen: boolean;
  statusText: string;
  displayHours: string;
  nextOpenTime: string;
} {
  // Configured hours: 17:00 - 23:00 (5 PM - 11 PM)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinutes;

  const [openH, openM] = siteConfig.operatingHours.openTime.split(":").map(Number);
  const [closeH, closeM] = siteConfig.operatingHours.closeTime.split(":").map(Number);
  const openTimeVal = openH * 60 + openM;
  const closeTimeVal = closeH * 60 + closeM;

  // For testing convenience and daytime browsing, if siteConfig isAcceptingOrders is true,
  // we indicate open or accepting pre-orders
  const isWithinHours =
    siteConfig.operatingHours.isAcceptingOrders &&
    currentTimeVal >= openTimeVal &&
    currentTimeVal <= closeTimeVal;

  return {
    isOpen: true, // We allow orders/pre-orders 24/7 with delivery starting 5 PM
    statusText: isWithinHours ? "Open Now • Fresh Dum Cooking" : "Accepting Orders • Delivery from 5:00 PM",
    displayHours: siteConfig.operatingHours.displayHours,
    nextOpenTime: "5:00 PM Today",
  };
}
