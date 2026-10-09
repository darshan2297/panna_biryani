import { Offer } from "@/types";

export interface CouponCheckContext {
  subtotal: number;
  itemCount: number;
  cartSlugs: string[];
}

export type CouponCheckResult =
  | { ok: true }
  | { ok: false; reason: string; needsPhone?: boolean };

const inr = (n: number) => `₹${Number(n).toFixed(0)}`;

/**
 * Re-evaluate an already-applied coupon against the current cart.
 *
 * This is a UX pre-check only — the server stays authoritative. Its purpose is
 * to explain *why* a code that was accepted earlier has stopped applying, e.g.
 * after the customer removed items and fell below the minimum. Without it the
 * discount silently becomes ₹0 while the badge still reads "applied".
 */
export function checkAppliedCoupon(
  offer: Offer | null | undefined,
  ctx: CouponCheckContext
): CouponCheckResult {
  if (!offer) return { ok: true };

  const now = Date.now();

  if (offer.validFrom && new Date(offer.validFrom).getTime() > now) {
    return { ok: false, reason: "This offer has not started yet." };
  }
  if (offer.validUntil && new Date(offer.validUntil).getTime() < now) {
    return { ok: false, reason: "This offer has expired." };
  }

  // Thresholds are read per `discount_on` — quantity ignores cart value.
  if (offer.discountOn === "quantity") {
    const min = offer.minQuantity ?? null;
    const max = offer.maxQuantity ?? null;
    if (min != null && ctx.itemCount < min) {
      return {
        ok: false,
        reason: `Add ${min - ctx.itemCount} more item${min - ctx.itemCount === 1 ? "" : "s"} to use this offer (${min} minimum).`,
      };
    }
    if (max != null && ctx.itemCount > max) {
      return {
        ok: false,
        reason: `This offer applies to up to ${max} item${max === 1 ? "" : "s"} per order.`,
      };
    }
  } else {
    if (ctx.subtotal < (offer.minOrderValue || 0)) {
      return {
        ok: false,
        reason: `Add ${inr((offer.minOrderValue || 0) - ctx.subtotal)} more to use this offer (${inr(offer.minOrderValue || 0)} minimum).`,
      };
    }
    if (offer.maxOrderValue != null && ctx.subtotal > offer.maxOrderValue) {
      return {
        ok: false,
        reason: `This offer applies to orders up to ${inr(offer.maxOrderValue)}.`,
      };
    }
  }

  if (Array.isArray(offer.applicableItems) && offer.applicableItems.length > 0) {
    const applicable = offer.applicableItems.map((s) => String(s).toLowerCase());
    const matches = ctx.cartSlugs.some((s) => applicable.includes(String(s).toLowerCase()));
    if (!matches) {
      return { ok: false, reason: "This offer does not apply to the items in your cart." };
    }
  }

  // Identity-gated codes can't be judged without a phone — the server decides.
  if (offer.firstOrderOnly || offer.customerType !== "all") {
    return { ok: true };
  }

  return { ok: true };
}