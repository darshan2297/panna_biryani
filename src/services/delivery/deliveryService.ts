import { siteConfig } from "@/data/siteConfig";
import { OrderType } from "@/types";
import { getServerStorefront } from "@/services/storefront/serverConfig";

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
 * Server-safe delivery fee calculation based on order type, subtotal, and area.
 * Uses only CRM delivery areas/config; no static fallback prices.
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

  const srv = getServerStorefront();
  const fdEnabled = srv.config ? srv.config.free_delivery_enabled : false;
  const fdThreshold = srv.config
    ? Number(srv.config.free_delivery_threshold)
    : Number.POSITIVE_INFINITY;

  // Try to find a matching CRM delivery area by name or pincode
  const crmAreas = srv.deliveryAreas || [];
  const matchedArea = crmAreas.find(
    (a) =>
      (areaName && a.name.toLowerCase() === areaName.toLowerCase()) ||
      (pincode && a.pincode === pincode)
  );

  // If we have a CRM-matched area, use its specific fee/ETA/minOrder
  if (matchedArea) {
    if (fdEnabled && subtotal >= fdThreshold) {
      return {
        deliveryFee: 0,
        isFreeDelivery: true,
        freeDeliveryReason: `Free delivery applied (Order ₹${subtotal} >= ₹${fdThreshold})`,
        estimatedMinutes: matchedArea.estimated_minutes,
        minOrderRequired: matchedArea.min_order,
        areaFound: true,
        areaName: matchedArea.name,
      };
    }

    return {
      deliveryFee: matchedArea.delivery_fee,
      isFreeDelivery: false,
      estimatedMinutes: matchedArea.estimated_minutes,
      minOrderRequired: matchedArea.min_order,
      areaFound: true,
      areaName: matchedArea.name,
    };
  }

  // Fallback to flat fee from CRM config or static config
  const flatFee = srv.config ? Number(srv.config.delivery_fee) : 0;

  if (fdEnabled && subtotal >= fdThreshold) {
    return {
      deliveryFee: 0,
      isFreeDelivery: true,
      freeDeliveryReason: `Free delivery applied (Order ₹${subtotal} >= ₹${fdThreshold})`,
      estimatedMinutes: 40,
      minOrderRequired: 199,
      areaFound: true,
      areaName: areaName || "Surat",
    };
  }

  return {
    deliveryFee: flatFee,
    isFreeDelivery: false,
    estimatedMinutes: 40,
    minOrderRequired: 199,
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

  const isWithinHours =
    siteConfig.operatingHours.isAcceptingOrders &&
    currentTimeVal >= openTimeVal &&
    currentTimeVal <= closeTimeVal;

  return {
    isOpen: isWithinHours,
    statusText: isWithinHours
      ? "Open Now • Fresh Dum Cooking"
      : "Accepting Orders • Delivery from 5:00 PM",
    displayHours: siteConfig.operatingHours.displayHours,
    nextOpenTime: "5:00 PM Today",
  };
}
