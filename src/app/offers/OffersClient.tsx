"use client";

import { Offer } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useUserSessionStore } from "@/store/useUserSessionStore";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { formatINR } from "@/lib/utils";
import { Gift, Check, Copy, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { CouponMessage } from "@/components/cart/CouponMessage";

export function OffersClient() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);
  const { applyCoupon, setCartDrawerOpen } = useCartStore();
  const sessionUser = useUserSessionStore((s) => s.user);
  const promoCodes = useStorefrontStore((s) => s.promoCodes);

  // Only CRM promo codes — no static offers fallback
  const offers: Offer[] =
    promoCodes.length > 0
      ? promoCodes
          .filter((p) => p.active)
          .map((p) => ({
            id: String(p.id),
            code: p.code,
            title: p.title,
            subtitle: p.subtitle || "",
            description: p.description || "",
            badge: p.badge || undefined,
            minOrderValue: p.min_order_value || 0,
            discountType: (p.discount_type === "free_delivery" ? "fixed" : p.discount_type) as Offer["discountType"],
            discountValue: p.discount_value,
            freeItemName: p.free_item_name || undefined,
            discountOn: p.discount_on,
            customerType: p.customer_type,
            active: p.active,
          }))
      : [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code ${code} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyDirect = async (code: string) => {
    // Reuse the profile phone when signed in — never re-ask for identity.
    const profilePhone =
      sessionUser?.phone && sessionUser.phone.length >= 10 ? sessionUser.phone : undefined;

    const res = await applyCoupon(code, profilePhone);
    if (res.success) {
      toast.success(res.message, { duration: 4000 });
      setCartDrawerOpen(true);
      return;
    }

    // Surface the reason inline in the drawer too, so the message survives
    // after the toast fades — otherwise a rejected code looks like nothing happened.
    setApplyNotice(res.requiresPhone ? null : res.message);
    setCartDrawerOpen(true);

    if (res.requiresPhone) {
      toast.info("Enter your mobile number in the cart to check eligibility.", { duration: 5000 });
    } else {
      toast.error(res.message, { duration: 5000 });
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-[#091c15] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-panna-gold/25 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-panna-gold uppercase tracking-widest px-3 py-1 bg-panna-gold/20 rounded-full border border-panna-gold/30">
            <Gift className="w-3.5 h-3.5" />
            <span>Direct Website Rewards</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white">
            Offers & Special Perks
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Order directly from our official portal to enjoy exclusive gifts, family sharing
            discounts, and free doorstep delivery in Surat.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Reason a code could not be applied stays visible here, not just in a toast. */}
        {applyNotice && (
          <div className="mb-5">
            <CouponMessage
              tone="error"
              action={{
                label: "Dismiss",
                onClick: () => setApplyNotice(null),
              }}
            >
              {applyNotice}
            </CouponMessage>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border-2 border-panna-border p-6 shadow-xs hover:border-panna-gold transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {offer.badge && (
                  <span className="inline-block bg-[#0c281e] text-panna-gold border border-panna-gold/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {offer.badge}
                  </span>
                )}

                <h3 className="font-serif text-lg font-bold text-panna-deep">{offer.title}</h3>
                <p className="font-serif italic text-xs text-panna-gold-dark font-medium">
                  &ldquo;{offer.subtitle}&rdquo;
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed">{offer.description}</p>
                <p className="text-[11px] text-zinc-400">
                  Min. order required: <strong>{formatINR(offer.minOrderValue)}</strong>
                </p>
              </div>

              <div className="pt-4 border-t border-panna-border/60 space-y-2.5">
                <div className="flex items-center justify-between bg-[#faf8f5] p-2.5 rounded-xl border border-dashed border-panna-gold/60">
                  <span className="font-mono font-black text-xs text-panna-deep tracking-wider pl-1">
                    {offer.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="text-xs font-bold text-panna-forest hover:text-panna-deep flex items-center gap-1 p-1"
                    title="Copy Promo Code"
                  >
                    {copiedCode === offer.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedCode === offer.code ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyDirect(offer.code)}
                  className="w-full py-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  Apply in Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <span>Explore Menu & Use Offers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
