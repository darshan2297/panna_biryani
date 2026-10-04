"use client";

import { useShopStatus } from "@/components/shop/ShopStatusProvider";
import { toast } from "sonner";

/**
 * Small helper so every "Add to Cart" / checkout entry point consistently
 * blocks ordering while the shop is closed and surfaces a friendly message.
 */
export function useShopGate() {
  const { isOpen, businessHours, closedMessage, hydrated } = useShopStatus();

  const guard = (): boolean => {
    if (!isOpen) {
      toast.error("Shop is closed", {
        description: closedMessage || "We are currently closed and not accepting orders.",
      });
      return false;
    }
    return true;
  };

  return { isOpen, businessHours, hydrated, guard };
}
