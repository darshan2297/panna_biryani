"use client";

import Link from "next/link";
import { Order, OrderStatus } from "@/types";
import { formatINR, cn } from "@/lib/utils";
import { siteConfig } from "@/data/siteConfig";
import {
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  Bike,
  Phone,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const TIMELINE_STEPS: {
  status: OrderStatus;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    status: "PENDING",
    label: "Order Received",
    description: "Your order details have been securely recorded.",
    icon: Clock,
  },
  {
    status: "CONFIRMED",
    label: "Order Confirmed",
    description: "Kitchen has accepted your order and started ingredients setup.",
    icon: CheckCircle2,
  },
  {
    status: "PREPARING",
    label: "Dum Cooking in Sealed Handi",
    description: "Slow cooking under dough seal over gentle dum heat.",
    icon: Flame,
  },
  {
    status: "READY",
    label: "Quality Checked & Packed",
    description: "Garnished with birista and packed with chilled raita and chutney.",
    icon: PackageCheck,
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Delivery partner is on their way with your hot handi.",
    icon: Bike,
  },
  {
    status: "DELIVERED",
    label: "Delivered & Enjoyed",
    description: "Enjoy your authentic royal biryani feast with family!",
    icon: Sparkles,
  },
];

export function OrderTrackerClient({ order }: { order: Order }) {
  // Simulate active progress step based on orderStatus
  const statusHierarchy: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
    COMPLETED: 5,
    CANCELLED: -1,
  };

  const currentStepIndex = statusHierarchy[order.orderStatus] ?? 2;

  return (
    <div className="bg-[#faf7f2] min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-panna-deep"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          <span className="text-xs font-mono font-bold bg-white border border-panna-border px-3 py-1 rounded-full text-panna-deep">
            {order.orderNumber}
          </span>
        </div>

        {/* Live Status Card */}
        <div className="bg-white rounded-3xl border border-panna-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-panna-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
                  Live Kitchen Tracker
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-panna-deep">
                {TIMELINE_STEPS[currentStepIndex]?.label || "Order in Progress"}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {order.orderType === "delivery"
                  ? `Delivering to ${order.deliveryAddress?.area || "Surat"}`
                  : "Self Pickup at Vesu Cloud Kitchen"}
              </p>
            </div>

            <div className="bg-[#0c281e] text-panna-gold px-4 py-2.5 rounded-2xl text-center border border-panna-gold/40 shrink-0">
              <span className="text-[10px] text-panna-gold-light/80 block uppercase font-bold">
                Estimated Ready In
              </span>
              <span className="text-lg font-black font-mono">
                ~{order.estimatedDeliveryMinutes} Mins
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-panna-border">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Step Bubble Indicator */}
                  <div
                    className={cn(
                      "absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all",
                      isPast
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : isCurrent
                        ? "bg-[#0c281e] border-panna-gold text-panna-gold shadow-md scale-110"
                        : "bg-white border-zinc-300 text-zinc-300"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 pt-0.5">
                    <h3
                      className={cn(
                        "font-serif text-sm sm:text-base font-bold transition-colors",
                        isCurrent
                          ? "text-panna-forest text-base sm:text-lg"
                          : isPast
                          ? "text-panna-deep"
                          : "text-zinc-400"
                      )}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={cn(
                        "text-xs leading-relaxed mt-0.5",
                        isCurrent
                          ? "text-zinc-700 font-medium"
                          : isPast
                          ? "text-zinc-500"
                          : "text-zinc-400"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Accordion / Summary */}
        <div className="bg-white rounded-2xl border border-panna-border p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-panna-deep border-b border-panna-border pb-2.5">
            Order Details
          </h2>

          <div className="space-y-2.5 text-xs divide-y divide-panna-border/50">
            {order.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between">
                <div>
                  <p className="font-bold text-panna-deep">
                    {item.quantity} × {item.productName} ({item.size.label})
                  </p>
                  {item.extras?.map((e) => (
                    <p key={e.extra.id} className="text-[11px] text-zinc-500">
                      + {e.extra.name}
                    </p>
                  ))}
                </div>
                <span className="font-bold text-panna-deep">{formatINR(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-panna-border flex items-center justify-between text-xs font-bold text-panna-deep">
            <span>Total Paid</span>
            <span className="text-base text-panna-forest">{formatINR(order.total)}</span>
          </div>

          <div className="pt-3 border-t border-panna-border flex items-center justify-between text-xs text-zinc-500">
            <span>Customer: {order.customerName} ({order.phone})</span>
            <span className="capitalize">Payment: {order.paymentStatus}</span>
          </div>
        </div>

        {/* WhatsApp Real-time Updates */}
        <div className="bg-[#12372a] text-white p-5 rounded-2xl border border-panna-gold/40 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-bold text-panna-gold">
              Need Live Driver Updates?
            </h3>
            <p className="text-xs text-zinc-300">
              Our Surat dispatcher is available 5:00 PM - 11:00 PM on WhatsApp.
            </p>
          </div>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
              `Hello Panna Biryani, checking live status for order ${order.orderNumber}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat Dispatcher</span>
          </a>
        </div>
      </div>
    </div>
  );
}
