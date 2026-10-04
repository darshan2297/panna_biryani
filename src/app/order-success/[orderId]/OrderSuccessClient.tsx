"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Order } from "@/types";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/data/siteConfig";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  Bike,
  Store,
  Phone,
  ArrowRight,
} from "lucide-react";

export function OrderSuccessClient({ order }: { order: Order }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c59b27", "#12372a", "#d4af37", "#1b4d3e"],
    });
  }, []);

  return (
    <div className="bg-[#faf7f2] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl border border-panna-border p-6 sm:p-10 text-center shadow-lg space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-600 animate-pulse-gold">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
              Payment & Order Successful
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep">
              Order Confirmed 🎉
            </h1>
            <p className="text-zinc-600 text-sm max-w-md mx-auto">
              Thank you, <strong>{order.customerName}</strong>! Our kitchen has received your order
              and our chefs are preparing your authentic dum biryani.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="bg-[#fcfaf7] border border-panna-border rounded-2xl p-4 inline-flex flex-wrap items-center justify-center gap-6 text-xs text-left">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                Order Number
              </span>
              <span className="font-mono text-sm font-black text-panna-deep">
                {order.crmOrderNumber || order.orderNumber}
              </span>
            </div>
            <div className="border-l border-panna-border pl-6">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                Fulfillment
              </span>
              <span className="font-bold text-panna-deep flex items-center gap-1">
                {order.orderType === "delivery" ? (
                  <>
                    <Bike className="w-3.5 h-3.5 text-panna-gold" />
                    <span>Doorstep Delivery</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Kitchen Pickup</span>
                  </>
                )}
              </span>
            </div>
            <div className="border-l border-panna-border pl-6">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                Estimated Time
              </span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>~{order.estimatedDeliveryMinutes} Minutes</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/track-order/${order.id}`}
              className="inline-flex items-center gap-2 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold px-6 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-panna-deep font-semibold px-5 py-3 rounded-full text-xs sm:text-sm border border-panna-border transition-colors shadow-2xs"
            >
              <span>View Full Invoice</span>
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#007A55] font-bold px-5 py-3 rounded-full text-xs sm:text-sm border border-[#E3DACB] transition-colors"
            >
              <span>My Orders & Profile</span>
            </Link>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl border border-panna-border p-6 shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-bold text-panna-deep border-b border-panna-border pb-3">
            Order Summary
          </h2>

          <div className="divide-y divide-panna-border/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-panna-deep text-sm">
                    {item.quantity} × {item.productName}
                  </p>
                  <p className="text-zinc-500">Portion: {item.size.label}</p>
                  {item.extras?.map((e) => (
                    <p key={e.extra.id} className="text-[11px] text-zinc-600">
                      + {e.extra.name} ({formatINR(e.extra.price * e.quantity)})
                    </p>
                  ))}
                </div>
                <span className="font-bold text-panna-deep text-sm shrink-0">
                  {formatINR(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-panna-border space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-semibold text-panna-deep">{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.appliedCoupon})</span>
                <span>- {formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-panna-deep">
                {order.deliveryFee === 0 ? "FREE" : formatINR(order.deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-dashed border-panna-border flex justify-between text-sm font-bold text-panna-deep">
              <span>Total Paid</span>
              <span className="text-base text-panna-forest">{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Delivery or Pickup Address Details */}
          <div className="pt-4 border-t border-panna-border bg-[#faf8f5] p-4 rounded-xl text-xs space-y-2">
            <span className="font-bold text-panna-deep block text-xs uppercase tracking-wider">
              {order.orderType === "delivery" ? "Delivery Address" : "Pickup Location"}
            </span>

            {order.orderType === "delivery" && order.deliveryAddress ? (
              <p className="text-zinc-600 leading-relaxed">
                {order.deliveryAddress.fullName} • {order.deliveryAddress.phone}
                <br />
                {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area},{" "}
                {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                {order.deliveryAddress.landmark && (
                  <span className="block text-zinc-500">
                    Landmark: {order.deliveryAddress.landmark}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-zinc-600 leading-relaxed">
                {siteConfig.pickupLocation.name}
                <br />
                {siteConfig.pickupLocation.address}, {siteConfig.pickupLocation.city} -{" "}
                {siteConfig.pickupLocation.pincode}
              </p>
            )}

            {order.specialInstructions && (
              <p className="text-zinc-500 text-[11px] pt-1">
                <strong>Instructions:</strong> {order.specialInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Reorder / WhatsApp Support Banner */}
        <div className="bg-[#12372a] text-white p-5 rounded-2xl border border-panna-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-serif text-base font-bold text-panna-gold">
              Need Help with Your Order?
            </h3>
            <p className="text-xs text-zinc-300">
              Message our kitchen team directly on WhatsApp for real-time support.
            </p>
          </div>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
              `Hello Panna Biryani, I have an inquiry regarding my order ${order.orderNumber}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shrink-0 transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
