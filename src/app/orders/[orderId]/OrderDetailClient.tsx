"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { formatINR, cn } from "@/lib/utils";
import { siteConfig } from "@/data/siteConfig";
import { products } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useUserSessionStore } from "@/store/useUserSessionStore";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  Store,
  Phone,
  Mail,
  Printer,
  RotateCcw,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  ExternalLink,
  Flame,
  PackageCheck,
  User,
} from "lucide-react";

interface OrderDetailClientProps {
  orderId: string;
  initialOrder: Order | null;
}

export function OrderDetailClient({ orderId, initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);

  const { addItem, setCartDrawerOpen } = useCartStore();
  const { orders: sessionOrders } = useUserSessionStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // If initialOrder was null, attempt client fallback from session store or API
  useEffect(() => {
    if (order) return;

    // Check Zustand session store
    const localMatch = sessionOrders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (localMatch) {
      setOrder(localMatch);
      setLoading(false);
      return;
    }

    // Try fetching from API
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, order, sessionOrders]);

  if (!mounted || loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-3 border-[#007A55] border-t-transparent animate-spin mx-auto" />
          <p className="font-serif text-sm font-bold text-[#00241b]">Loading Order Invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FAF7F2] min-h-[80vh] py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E3DACB] p-8 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <Receipt className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-[#00241b]">Order Not Found</h1>
            <p className="text-xs text-zinc-500">
              We couldn&apos;t find order reference <code>{orderId}</code>. Please check your order history.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/profile"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white text-xs font-bold transition-all shadow-xs"
            >
              View Order History
            </Link>
            <Link
              href="/menu"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E3DACB] bg-white hover:bg-zinc-50 text-[#00241b] text-xs font-semibold transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper formatting
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Order Confirmed",
          color: "bg-emerald-50 text-emerald-800 border-emerald-300",
          step: 1,
          description: "Kitchen has confirmed your order. Fresh preparation starting.",
        };
      case "PREPARING":
        return {
          label: "Cooking in Dum Handi",
          color: "bg-amber-50 text-amber-800 border-amber-300",
          step: 2,
          description: "Our chefs are slow-cooking your royal biryani with fragrant basmati & whole spices.",
        };
      case "READY":
        return {
          label: "Ready for Pickup",
          color: "bg-teal-50 text-teal-800 border-teal-300",
          step: 3,
          description: "Your handi is packed piping hot and waiting at our kitchen counter.",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          color: "bg-blue-50 text-blue-800 border-blue-300",
          step: 3,
          description: "Our delivery partner is on the way to your doorstep.",
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          label: "Delivered Warm",
          color: "bg-emerald-100 text-emerald-900 border-emerald-400",
          step: 4,
          description: "Enjoy your royal feast! Thank you for dining with Panna Biryani.",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
          step: 0,
          description: "This order has been cancelled.",
        };
      default:
        return {
          label: "Received",
          color: "bg-zinc-100 text-zinc-800 border-zinc-300",
          step: 1,
          description: "Order received by system.",
        };
    }
  };

  const statusInfo = getStatusInfo(order.orderStatus);

  // 1-Click Reorder handler
  const handleReorder = () => {
    let count = 0;
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.slug === item.productSlug);
      if (prod) {
        addItem(prod, item.size, item.extras, item.quantity);
        count += item.quantity;
      }
    });

    if (count > 0) {
      toast.success(`Added ${count} items from this feast to your cart! 🛍️`);
      setCartDrawerOpen(true);
    } else {
      toast.info("Could not auto-add. Redirecting to fresh menu.");
      router.push("/menu");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00241b] hover:text-[#007A55] bg-white border border-[#E3DACB] px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white border border-[#E3DACB] hover:bg-zinc-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Print or Save Receipt as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Print Invoice</span>
            </button>

            <Link
              href={`/track-order/${order.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8B94A] bg-[#00241b] hover:bg-[#00382b] px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live Tracker</span>
            </Link>

            <button
              type="button"
              onClick={handleReorder}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#007A55] hover:bg-[#006245] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reorder</span>
            </button>
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white rounded-3xl border border-[#E3DACB] p-6 sm:p-9 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header Branding & Order ID */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E3DACB]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8B94A]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#007A55]">
                  Authentic Surat Dum Biryani
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#00241b]">
                Invoice #{order.orderNumber}
              </h1>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Placed on {formatDate(order.createdAt)}</span>
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border",
                  statusInfo.color
                )}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{statusInfo.label}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                {order.orderType === "delivery" ? "Doorstep Delivery" : "Kitchen Counter Pickup"}
              </span>
            </div>
          </div>

          {/* Progress Timeline (Hidden in print) */}
          {order.orderStatus !== "CANCELLED" && (
            <div className="bg-[#FAF7F2] border border-[#E3DACB]/80 rounded-2xl p-4 sm:p-5 space-y-4 print:hidden">
              <div className="flex items-center justify-between text-xs font-bold text-[#00241b]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#E8B94A]" />
                  <span>Preparation & Delivery Progress</span>
                </span>
                <span className="text-zinc-500 font-normal">
                  Estimated: ~{order.estimatedDeliveryMinutes} mins
                </span>
              </div>

              {/* Progress Steps Bar */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { step: 1, label: "Confirmed", icon: CheckCircle2 },
                  { step: 2, label: "Cooking", icon: Flame },
                  {
                    step: 3,
                    label: order.orderType === "delivery" ? "On the Way" : "Ready",
                    icon: order.orderType === "delivery" ? Bike : Store,
                  },
                  { step: 4, label: "Delivered", icon: PackageCheck },
                ].map((s) => {
                  const isDone = statusInfo.step >= s.step;
                  const isCurrent = statusInfo.step === s.step;
                  return (
                    <div key={s.step} className="space-y-1.5">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          isDone ? "bg-[#007A55]" : "bg-zinc-200"
                        )}
                      />
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "text-[11px] font-bold",
                            isCurrent
                              ? "text-[#007A55]"
                              : isDone
                              ? "text-zinc-800"
                              : "text-zinc-400"
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11.5px] text-zinc-600 text-center italic">
                {statusInfo.description}
              </p>
            </div>
          )}

          {/* Customer & Fulfillment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FCFAF7] border border-[#E3DACB] rounded-2xl p-5 text-xs">
            {/* Customer Details */}
            <div className="space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                Billed To (Customer)
              </span>
              <div className="space-y-1 text-zinc-700">
                <p className="font-bold text-sm text-[#00241b] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#007A55]" />
                  <span>{order.customerName}</span>
                </p>
                <p className="flex items-center gap-1.5 font-mono font-medium text-zinc-900">
                  <Phone className="w-3.5 h-3.5 text-[#007A55]" />
                  <span>+91 {order.phone}</span>
                </p>
                {order.email && (
                  <p className="flex items-center gap-1.5 text-zinc-500">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{order.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delivery or Pickup Destination */}
            <div className="space-y-2.5 md:border-l md:border-[#E3DACB] md:pl-6">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                {order.orderType === "delivery" ? "Delivery Destination" : "Kitchen Pickup Location"}
              </span>

              {order.orderType === "delivery" && order.deliveryAddress ? (
                <div className="space-y-1 text-zinc-700">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#007A55] shrink-0" />
                    <span>
                      {order.deliveryAddress.area}, {order.deliveryAddress.city} -{" "}
                      {order.deliveryAddress.pincode}
                    </span>
                  </p>
                  <p className="text-zinc-600 pl-5">
                    {order.deliveryAddress.streetAddress}
                    {order.deliveryAddress.landmark && (
                      <span className="block text-zinc-500 text-[11px]">
                        Landmark: {order.deliveryAddress.landmark}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-zinc-700">
                  <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#007A55] shrink-0" />
                    <span>{siteConfig.pickupLocation.name}</span>
                  </p>
                  <p className="text-zinc-600 pl-5 leading-relaxed">
                    {siteConfig.pickupLocation.address}, {siteConfig.pickupLocation.city} -{" "}
                    {siteConfig.pickupLocation.pincode}
                  </p>
                </div>
              )}

              {order.specialInstructions && (
                <p className="text-[11px] text-zinc-500 bg-amber-50/60 border border-amber-200/60 rounded-lg p-2 mt-2">
                  <strong className="text-amber-900">Kitchen Note:</strong>{" "}
                  {order.specialInstructions}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#00241b]">Itemized Feast Order</h2>

            <div className="border border-[#E3DACB] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] text-zinc-600 font-bold uppercase tracking-wider text-[10.5px] border-b border-[#E3DACB]">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-3 text-center">Portion</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DACB]/70">
                  {order.items.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-[3px] border border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 p-[1px] bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                          </span>
                          <div>
                            <p className="font-bold text-zinc-900 text-[13px]">
                              {item.productName}
                            </p>
                            {item.extras && item.extras.length > 0 && (
                              <div className="text-[11px] text-zinc-500 mt-0.5 space-y-0.5">
                                {item.extras.map((extra) => (
                                  <p key={extra.extra.id}>
                                    + {extra.extra.name} (x{extra.quantity}) &bull;{" "}
                                    {formatINR(extra.extra.price * extra.quantity)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-medium text-zinc-700">
                        {item.size.label}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-zinc-900">
                        {item.quantity}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-zinc-900 text-sm">
                        {formatINR(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation & Payment Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Payment Method Badge */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                Payment Information
              </span>
              <div className="bg-[#FAF7F2] border border-[#E3DACB] rounded-xl p-3.5 text-xs space-y-1.5 inline-block min-w-[220px]">
                <div className="flex items-center gap-2 font-bold text-zinc-800">
                  {order.paymentMethod === "online" ? (
                    <CreditCard className="w-4 h-4 text-[#007A55]" />
                  ) : (
                    <Banknote className="w-4 h-4 text-[#007A55]" />
                  )}
                  <span className="capitalize">
                    {order.paymentMethod === "online" ? "Paid Online (Razorpay)" : "Cash on Delivery"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Status:{" "}
                  <span className="font-bold text-emerald-700">
                    {order.paymentStatus === "PAID" ? "Completed / Paid" : "Pending on Delivery"}
                  </span>
                </p>
                {order.razorpayPaymentId && (
                  <p className="text-[10.5px] font-mono text-zinc-400">
                    Ref: {order.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Bill Summary Calculations */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatINR(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount {order.appliedCoupon ? `(${order.appliedCoupon})` : ""}</span>
                  <span>- {formatINR(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Delivery & Packaging</span>
                <span className="font-semibold text-zinc-900">
                  {order.deliveryFee === 0 ? "FREE" : formatINR(order.deliveryFee)}
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-[#E3DACB] flex justify-between text-sm sm:text-base font-black text-[#00241b]">
                <span>Total Amount Paid</span>
                <span className="font-serif text-[#007A55]">{formatINR(order.total)}</span>
              </div>

              <p className="text-[10px] text-zinc-400 text-right pt-0.5">
                (Taxes & kitchen packing charges included)
              </p>
            </div>
          </div>

          {/* Footer Note & WhatsApp Assistance */}
          <div className="pt-6 border-t border-[#E3DACB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>
              Thank you for ordering with <strong>Panna Biryani Surat</strong>! Taste the royal tradition.
            </p>

            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                `Hello Panna Biryani, I am inquiring about my order #${order.orderNumber}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Kitchen on WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
