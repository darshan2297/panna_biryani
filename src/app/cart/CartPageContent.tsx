"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { extras } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { formatINR, cn } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Gift,
  CheckCircle2,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export function CartPageContent() {
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const [confirmClear, setConfirmClear] = useState(false);

  const {
    items,
    orderType,
    appliedCoupon,
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

  // Safe fallback getters that never crash
  const itemsList = Array.isArray(items) ? items : [];
  const subtotal = typeof getSubtotal === "function" ? getSubtotal() : 0;
  const deliveryFee = typeof getDeliveryFee === "function" ? getDeliveryFee() : 0;
  const discount = typeof getDiscount === "function" ? getDiscount() : 0;
  const total = typeof getTotal === "function" ? getTotal() : 0;
  const itemCount = typeof getItemCount === "function" ? getItemCount() : 0;

  if (!mounted) {
    return (
      <div className="bg-[#faf7f2] min-h-screen pt-8 sm:pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-zinc-200/80 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-24 bg-white rounded-2xl border border-panna-border animate-pulse p-6" />
              <div className="h-64 bg-white rounded-2xl border border-panna-border animate-pulse p-6" />
            </div>
            <div className="lg:col-span-4 h-72 bg-white rounded-2xl border border-panna-border animate-pulse p-6" />
          </div>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      toast.success(res.message);
      setCouponInput("");
    }
  };

  const handleAddExtraDirect = (extraItem: (typeof extras)[0]) => {
    const { addExtraItem } = useCartStore.getState();
    addExtraItem(extraItem, 1);
    toast.success(`Added ${extraItem.name} to order!`);
  };

  if (itemsList.length === 0) {
    return (
      <div className="bg-[#faf7f2] min-h-[75vh] flex items-center justify-center pt-8 sm:pt-10 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-panna-gold/50 flex items-center justify-center mx-auto text-[#003F32] shadow-md">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-black text-[#17332C]">Your table is waiting.</h1>
            <p className="text-zinc-600 text-sm max-w-md mx-auto">
              Your shopping cart is currently empty. Explore our authentic dum-cooked biryanis in
              Surat and start your feast today.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#E8B94A] hover:bg-[#dca835] text-[#00291F] font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-95"
          >
            <span>Explore Biryani Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-8 sm:pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="p-2 rounded-full bg-white border border-panna-border text-zinc-600 hover:text-panna-deep shadow-2xs"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-panna-deep">Shopping Cart</h1>
              <p className="text-xs text-zinc-500">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your feast
              </p>
            </div>
          </div>

          {/* Option to remove whole cart */}
          {itemsList.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                confirmClear
                  ? "bg-red-600 hover:bg-red-700 text-white border border-red-700 animate-pulse"
                  : "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
              )}
              title="Remove all items from your cart"
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmClear ? "Click to Confirm Clear" : "Clear Entire Cart"}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Delivery / Pickup Option Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-panna-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-base font-bold text-panna-deep">
                  Fulfillment Method
                </h3>
                <p className="text-xs text-zinc-500">
                  {orderType === "pickup"
                    ? "Kitchen Pickup from Vesu, Surat (Free)"
                    : "Doorstep Delivery across Surat"}
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-panna-cream-muted p-1 border border-panna-border font-medium text-xs">
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all",
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
                    "px-4 py-2 rounded-lg transition-all",
                    orderType === "pickup"
                      ? "bg-[#0c281e] text-panna-gold font-bold shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  Pickup (Free)
                </button>
              </div>
            </div>

            {/* Items Container */}
            <div className="bg-white rounded-2xl border border-panna-border p-4 sm:p-6 shadow-xs divide-y divide-panna-border">
              {itemsList.map((item) => {
                const sizeLabel = item.size?.label || (item.isCombo ? "Combo Pack" : "Portion");
                const servesText = item.size?.servesText || "";
                const productImage = item.productImage || "/biryani/veg-dum-biryani.png";
                const itemQuantity = Math.max(1, Number(item.quantity) || 1);
                const itemTotal = Number(item.totalPrice) || 0;

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border border-panna-border">
                      <Image
                        src={productImage}
                        alt={item.productName || "Biryani"}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-base font-bold text-panna-deep">
                            {item.productName}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {sizeLabel}
                            </span>
                            {servesText && <span className="text-xs text-zinc-500">{servesText}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-2 space-y-0.5 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                          {item.extras.map((extra, idx) => (
                            <div
                              key={extra?.extra?.id || `cart-extra-${idx}`}
                              className="text-xs text-zinc-600 flex items-center justify-between"
                            >
                              <span>+ {extra?.extra?.name || "Extra"}</span>
                              <span className="font-semibold text-panna-deep">
                                {formatINR((Number(extra?.extra?.price) || 0) * (Number(extra?.quantity) || 1))}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <div className="inline-flex items-center border border-panna-border rounded-xl bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                            className="p-2 text-zinc-600 hover:text-panna-deep hover:bg-zinc-100 rounded-l-xl transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-panna-deep min-w-[28px] text-center select-none">
                            {itemQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                            className="p-2 text-zinc-600 hover:text-panna-deep hover:bg-zinc-100 rounded-r-xl transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-panna-deep">
                            {formatINR(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upsell: Complete Your Order */}
            <div className="bg-white p-5 rounded-2xl border border-panna-border shadow-xs">
              <h3 className="font-serif text-base font-bold text-panna-deep mb-3 flex items-center justify-between">
                <span>Complete Your Order</span>
                <span className="text-xs font-sans text-panna-gold-dark font-semibold">
                  Frequently Ordered Together
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {extras.slice(0, 4).map((extra) => (
                  <div
                    key={extra.id}
                    className="p-3 rounded-xl border border-panna-border bg-[#faf8f5] flex flex-col items-center text-center justify-between"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden mb-2 bg-zinc-100">
                      <Image
                        src={extra.image}
                        alt={extra.name}
                        fill
                        className="object-cover"
                        sizes="120px"
                        quality={90}
                      />
                    </div>
                    <p className="text-xs font-bold text-panna-deep truncate w-full">{extra.name}</p>
                    <p className="text-xs font-bold text-panna-gold-dark mt-0.5">
                      {formatINR(extra.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddExtraDirect(extra)}
                      className="mt-2 w-full py-1.5 bg-[#003F32] hover:bg-[#002e24] text-white font-bold text-xs rounded-lg transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1 cursor-pointer select-none"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            {/* Free Dessert Notification */}
            {subtotal >= siteConfig.pricingRules.firstOrderFreeDessertThreshold && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Gift className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">
                    Complimentary First-Order Gift! 🍮
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your free Shahi Brownie Sweet will be automatically added to your delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Promo Code Card */}
            <div className="bg-white p-4 rounded-xl border border-panna-border shadow-xs">
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-950">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-700">{appliedCoupon.title}</p>
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
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. FIRSTPANNA)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full bg-[#faf7f2] border border-panna-border rounded-lg text-xs pl-8 pr-3 py-2.5 uppercase font-bold text-panna-deep focus:outline-none focus:border-panna-gold"
                      />
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      className="bg-panna-forest hover:bg-panna-deep text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Bill Details */}
            <div className="bg-white p-5 rounded-2xl border border-panna-border shadow-xs space-y-3 text-xs">
              <h3 className="font-serif text-base font-bold text-panna-deep border-b border-panna-border pb-2.5">
                Order Summary
              </h3>

              <div className="flex items-center justify-between text-zinc-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-panna-deep">{formatINR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-zinc-600">
                <span>
                  Delivery Fee{" "}
                  {orderType === "pickup"
                    ? "(Pickup)"
                    : subtotal >= siteConfig.pricingRules.freeDeliveryThreshold
                    ? "(Free >₹800)"
                    : ""}
                </span>
                <span className="font-semibold text-panna-deep">
                  {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-dashed border-panna-border flex items-center justify-between text-base font-bold text-panna-deep">
                <span>Total Amount</span>
                <span className="text-xl text-panna-forest">{formatINR(total)}</span>
              </div>
              <p className="text-[10px] text-zinc-400 text-right">Taxes included</p>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold py-3.5 px-6 rounded-full shadow-lg transition-all active:scale-98 text-sm uppercase tracking-wider mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
