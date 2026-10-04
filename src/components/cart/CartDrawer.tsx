"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { extras } from "@/data/products";
import { formatINR, cn } from "@/lib/utils";
import { siteConfig } from "@/data/siteConfig";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Gift,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    items,
    orderType,
    appliedCoupon,
    isCartDrawerOpen,
    setCartDrawerOpen,
    removeItem,
    updateQuantity,
    clearCart,
    setOrderType,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryFee,
    getDiscount,
    getTotal,
    getItemCount,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearCart = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => {
        setConfirmClear(false);
      }, 4000);
      return;
    }
    clearCart();
    setConfirmClear(false);
    toast.success("Entire cart removed successfully");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartDrawerOpen]);

  if (!mounted || !isCartDrawerOpen) return null;

  const itemsList = Array.isArray(items) ? items : [];
  const subtotal = typeof getSubtotal === "function" ? getSubtotal() : 0;
  const deliveryFee = typeof getDeliveryFee === "function" ? getDeliveryFee() : 0;
  const discount = typeof getDiscount === "function" ? getDiscount() : 0;
  const total = typeof getTotal === "function" ? getTotal() : 0;
  const itemCount = typeof getItemCount === "function" ? getItemCount() : 0;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  const handleAddExtraDirect = (extraItem: (typeof extras)[0]) => {
    const { addExtraItem } = useCartStore.getState();
    addExtraItem(extraItem, 1);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 z-10"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-20 pointer-events-auto">
        <div className="w-screen max-w-md h-full min-h-0 bg-[#faf7f2] shadow-2xl flex flex-col border-l border-panna-gold/30">
          {/* Header */}
          <div className="px-5 py-4 bg-[#0c281e] text-white flex items-center justify-between border-b border-panna-gold/30">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-panna-gold" />
              <div>
                <h2 className="font-serif text-lg font-bold text-white">Your Order</h2>
                <p className="text-xs text-panna-gold-light/70">
                  {itemCount} {itemCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className={cn(
                    "text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer",
                    confirmClear
                      ? "bg-red-600 text-white"
                      : "text-red-300 hover:text-red-100 hover:bg-red-950/50 border border-red-400/40"
                  )}
                  title="Remove all items from your cart"
                >
                  {confirmClear ? "Confirm Clear?" : "Clear All"}
                </button>
              )}
              <Link
                href="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="text-xs font-semibold text-[#E8B94A] hover:text-white px-2.5 py-1 rounded-md border border-[#E8B94A]/40 hover:border-white/50 transition-colors"
              >
                Cart Page →
              </Link>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery / Pickup Toggle */}
          <div className="px-5 py-3 bg-[#f3ede2] border-b border-panna-border flex items-center justify-between">
            <span className="text-xs font-semibold text-panna-charcoal">Delivery Option:</span>
            <div className="inline-flex rounded-lg bg-white p-1 border border-panna-border shadow-xs text-xs font-medium">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all",
                  orderType === "delivery"
                    ? "bg-[#0c281e] text-panna-gold font-bold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all",
                  orderType === "pickup"
                    ? "bg-[#0c281e] text-panna-gold font-bold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                Pickup (Free)
              </button>
            </div>
          </div>

          {/* Free Delivery Bar Progress */}
          {orderType === "delivery" && (
            <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              {subtotal >= siteConfig.pricingRules.freeDeliveryThreshold ? (
                <span className="font-semibold text-emerald-800">
                  🎉 Congratulations! You have unlocked Free Delivery across Surat.
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong>
                    {formatINR(siteConfig.pricingRules.freeDeliveryThreshold - subtotal)}
                  </strong>{" "}
                  more for <strong>FREE Delivery</strong>
                </span>
              )}
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
            {itemsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-panna-gold/40 text-[#003F32]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-panna-deep">
                    Your table is waiting.
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Explore our authentic Surat veg dum biryani freshly prepared and slow-cooked for
                    sharing.
                  </p>
                </div>
                <Link
                  href="/menu"
                  onClick={() => setCartDrawerOpen(false)}
                  className="inline-flex items-center gap-2 bg-[#E8B94A] hover:bg-[#dca835] text-[#00291F] font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-transform active:scale-95 uppercase tracking-wide"
                >
                  <span>Explore Biryani Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="divide-y divide-panna-border/60">
                  {itemsList.map((item) => {
                    const sizeLabel = item.size?.label || (item.isCombo ? "Combo Pack" : "Portion");
                    const productImage = item.productImage || "/biryani/veg-dum-biryani.png";
                    const itemQuantity = Math.max(1, Number(item.quantity) || 1);
                    const itemTotal = Number(item.totalPrice) || 0;

                    return (
                      <div key={item.id} className="py-3 flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-panna-border bg-panna-cream-muted">
                          <Image
                            src={productImage}
                            alt={item.productName || "Biryani"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-serif text-sm font-bold text-panna-deep truncate">
                              {item.productName}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              aria-label={`Remove ${item.productName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                              {sizeLabel}
                            </span>
                            <span className="text-xs font-bold text-panna-deep">
                              {formatINR(itemTotal)}
                            </span>
                          </div>

                          {/* Extra customizations */}
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.extras.map((extra, idx) => (
                                <p
                                  key={extra?.extra?.id || `extra-${idx}`}
                                  className="text-[10px] text-zinc-600 flex items-center gap-1"
                                >
                                  <span>+ {extra?.extra?.name || "Extra"}</span>
                                  <span className="font-medium text-panna-charcoal">
                                    ({formatINR((Number(extra?.extra?.price) || 0) * (Number(extra?.quantity) || 1))})
                                  </span>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="inline-flex items-center border border-panna-border rounded-md bg-white shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                                className="p-1.5 text-zinc-600 hover:text-panna-deep hover:bg-zinc-100 transition-colors rounded-l-md cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-panna-deep min-w-[20px] text-center select-none">
                                {itemQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                                className="p-1.5 text-zinc-600 hover:text-panna-deep hover:bg-zinc-100 transition-colors rounded-r-md cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[11px] text-zinc-500 font-medium">
                              {formatINR(Math.round(itemTotal / itemQuantity))} each
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtle Upsell: Complete Your Order */}
                <div className="pt-3 border-t border-panna-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-panna-charcoal mb-2.5 flex items-center justify-between">
                    <span>Complete Your Feast</span>
                    <span className="text-[10px] text-panna-gold-dark font-medium lowercase">
                      popular extras
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {extras.slice(0, 4).map((extra) => (
                      <div
                        key={extra.id}
                        className="bg-white p-2 rounded-lg border border-panna-border flex items-center gap-2 hover:border-panna-gold/60 transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded shrink-0 overflow-hidden bg-zinc-100">
                          <Image
                            src={extra.image}
                            alt={extra.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={90}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-panna-deep truncate">
                            {extra.name}
                          </p>
                          <p className="text-[10px] font-semibold text-panna-gold-dark">
                            {formatINR(extra.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddExtraDirect(extra)}
                          className="p-1 rounded bg-panna-green-light hover:bg-panna-gold hover:text-panna-deep text-panna-forest transition-colors shrink-0"
                          title="Add Extra"
                          aria-label={`Add ${extra.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Dessert Gift Alert */}
                {subtotal >= siteConfig.pricingRules.firstOrderFreeDessertThreshold && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <Gift className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950">
                        First Order Gift Unlocked! 🍮
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Your complimentary Shahi Brownie dessert will be packed with your order.
                      </p>
                    </div>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="pt-2 border-t border-panna-border">
                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                          <span className="text-[11px] text-emerald-700 block">
                            {appliedCoupon.title} applied
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Promo code (e.g. FIRSTPANNA)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-panna-border rounded-lg text-xs pl-7 pr-3 py-2 uppercase font-semibold text-panna-deep focus:outline-none focus:border-panna-gold"
                          />
                          <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <button
                          type="submit"
                          className="bg-panna-forest hover:bg-panna-deep text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                    </form>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white p-3.5 rounded-xl border border-panna-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-panna-deep">{formatINR(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>- {formatINR(discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-zinc-600">
                    <span>
                      Delivery Fee{" "}
                      {orderType === "pickup"
                        ? "(Pickup)"
                        : subtotal >= siteConfig.pricingRules.freeDeliveryThreshold
                        ? "(Free)"
                        : ""}
                    </span>
                    <span className="font-semibold text-panna-deep">
                      {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-panna-border flex items-center justify-between text-sm font-bold text-panna-deep">
                    <span>Final Amount</span>
                    <span className="text-base text-panna-forest">{formatINR(total)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-right">Inclusive of all taxes</p>
                </div>
              </>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          {items && items.length > 0 && (
            <div className="p-4 bg-white border-t border-panna-border shadow-lg space-y-2">
              <Link
                href="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 bg-[#f5efe6] hover:bg-[#ede3d5] text-panna-deep font-semibold py-2 px-4 rounded-xl border border-panna-gold/40 text-xs transition-colors"
              >
                <span>View Full Cart Page</span>
                <span className="text-zinc-500">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              </Link>
              <Link
                href="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="w-full flex items-center justify-between bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-5 py-3 rounded-full shadow-md transition-all active:scale-98 text-sm uppercase tracking-wider"
              >
                <span>Proceed to Checkout</span>
                <span className="flex items-center gap-1 font-black text-base">
                  {formatINR(total)}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
              <p className="text-center text-[10px] text-zinc-500">
                100% Hygienic • Prepared Fresh on Order in Surat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
