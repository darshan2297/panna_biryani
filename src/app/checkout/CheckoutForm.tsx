"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { siteConfig } from "@/data/siteConfig";
import { formatINR, cn } from "@/lib/utils";
import {
  Store,
  Bike,
  CreditCard,
  Banknote,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/services/analytics/analyticsService";
import { useUserSessionStore } from "@/store/useUserSessionStore";

export function CheckoutForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedArea, setSelectedArea] = useState(siteConfig.deliveryAreas[0].name);
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState(siteConfig.deliveryAreas[0].pincode);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash_on_delivery">(
    "online"
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    items,
    orderType,
    appliedCoupon,
    setOrderType,
    getSubtotal,
    getDeliveryFee,
    getDiscount,
    getTotal,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
    trackEvent("begin_checkout");
    const existingUser = useUserSessionStore.getState().user;
    if (existingUser) {
      if (existingUser.name) setFullName((prev) => prev || existingUser.name);
      if (existingUser.phone) setPhone((prev) => prev || existingUser.phone);
      if (existingUser.email) setEmail((prev) => prev || existingUser.email || "");
    }
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscount();
  const total = getTotal();

  // If cart is empty, prompt user to go to menu
  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-panna-cream-muted border border-panna-gold/40 flex items-center justify-center mx-auto text-panna-deep">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-panna-deep">Your cart is empty</h2>
        <p className="text-zinc-600 text-sm">
          Please add biryanis from our menu before checking out.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-6 py-2.5 rounded-full text-sm uppercase tracking-wider"
        >
          <span>View Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    const found = siteConfig.deliveryAreas.find((a) => a.name === areaName);
    if (found) {
      setPincode(found.pincode);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (orderType === "delivery") {
      if (!streetAddress.trim() || streetAddress.trim().length < 5) {
        errors.streetAddress = "Please provide your street / flat address.";
      }
      if (!pincode.trim() || pincode.trim().length < 6) {
        errors.pincode = "Please enter a valid 6-digit Surat pincode.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map items for server-side payload
      const orderPayload = {
        customerName: fullName,
        phone,
        email: email || undefined,
        orderType,
        deliveryAddress:
          orderType === "delivery"
            ? {
                fullName,
                phone,
                email: email || undefined,
                streetAddress,
                area: selectedArea,
                landmark,
                pincode,
                city: "Surat",
                notes: specialInstructions,
              }
            : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          sizeId: item.size.id,
          quantity: item.quantity,
          isCombo: item.isCombo,
          extraIds: item.extras?.map((e) => ({
            id: e.extra.id,
            quantity: e.quantity,
          })),
        })),
        specialInstructions,
        couponCode: appliedCoupon?.code,
        paymentMethod:
          paymentMethod === "online"
            ? "online"
            : orderType === "pickup"
            ? "cash_on_pickup"
            : "cash_on_delivery",
      };

      // 1. Create order on server (prices validated server-side)
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      const order = data.order;
      const paymentSession = data.paymentSession;

      // 2. Handle Payment Verification
      if (paymentMethod === "online") {
        // Verify payment session with backend
        const verifyRes = await fetch("/api/orders/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            transactionToken: paymentSession.transactionToken,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || "Payment verification failed");
        }
      }

      // 3. Start user session with unique mobile number and save order to history
      useUserSessionStore.getState().startSession(
        {
          name: fullName,
          phone: phone,
          email: email || undefined,
        },
        order
      );

      // 4. Clear cart and redirect to order success
      trackEvent("purchase", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        value: order.total,
        orderType: order.orderType,
      });

      clearCart();
      toast.success("Order Placed Successfully! 🎉");
      router.push(`/order-success/${order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep">
            Checkout & Confirmation
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm mt-1">
            Complete your details below. Fast, safe delivery in Surat or convenient kitchen pickup.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Checkout Inputs (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Customer Contact */}
              <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-panna-border">
                  <div className="w-6 h-6 rounded-full bg-panna-forest text-panna-gold text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-serif text-lg font-bold text-panna-deep">
                    Customer Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-panna-deep mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Rahul Mehta"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={cn(
                        "w-full bg-[#faf7f2] border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold",
                        formErrors.fullName ? "border-red-500" : "border-panna-border"
                      )}
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-panna-deep mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="bg-zinc-100 border border-r-0 border-panna-border px-3 py-2.5 rounded-l-xl text-xs font-semibold text-zinc-600">
                        +91
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={cn(
                          "w-full bg-[#faf7f2] border rounded-r-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold",
                          formErrors.phone ? "border-red-500" : "border-panna-border"
                        )}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-panna-deep mb-1.5">
                    Email Address <span className="text-zinc-400 font-normal">(Optional for order receipt)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold"
                  />
                </div>
              </div>

              {/* Step 2: Order Type & Address */}
              <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-panna-border">
                  <div className="w-6 h-6 rounded-full bg-panna-forest text-panna-gold text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="font-serif text-lg font-bold text-panna-deep">
                    Fulfillment & Location
                  </h2>
                </div>

                {/* Pickup / Delivery selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3 transition-all",
                      orderType === "delivery"
                        ? "bg-amber-50/70 border-panna-gold shadow-sm"
                        : "bg-white border-panna-border hover:border-zinc-300"
                    )}
                  >
                    <Bike
                      className={cn(
                        "w-5 h-5 mt-0.5",
                        orderType === "delivery" ? "text-panna-forest" : "text-zinc-400"
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm text-panna-deep">Doorstep Delivery</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Delivered warm to your home in Surat
                      </p>
                      <span className="text-[11px] font-bold text-panna-gold-dark block mt-1">
                        {subtotal >= siteConfig.pricingRules.freeDeliveryThreshold
                          ? "FREE Delivery"
                          : "₹30 - ₹69 depending on area"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3 transition-all",
                      orderType === "pickup"
                        ? "bg-emerald-50/70 border-emerald-600 shadow-sm"
                        : "bg-white border-panna-border hover:border-zinc-300"
                    )}
                  >
                    <Store
                      className={cn(
                        "w-5 h-5 mt-0.5",
                        orderType === "pickup" ? "text-emerald-700" : "text-zinc-400"
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm text-panna-deep">Kitchen Pickup</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Pick up directly from our Vesu kitchen
                      </p>
                      <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                        100% Free (No Extra Fee)
                      </span>
                    </div>
                  </button>
                </div>

                {orderType === "pickup" ? (
                  /* Pickup Location Card */
                  <div className="bg-[#fcfaf7] border border-panna-border rounded-xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-panna-deep flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-panna-gold" />
                      <span>{siteConfig.pickupLocation.name}</span>
                    </p>
                    <p className="text-zinc-600">
                      {siteConfig.pickupLocation.address}, {siteConfig.pickupLocation.area},{" "}
                      {siteConfig.pickupLocation.city} - {siteConfig.pickupLocation.pincode}
                    </p>
                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ready for pickup in ~25-30 mins after ordering</span>
                    </p>
                  </div>
                ) : (
                  /* Delivery Address Form */
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-panna-deep mb-1.5">
                          Delivery Area in Surat <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedArea}
                          onChange={(e) => handleAreaChange(e.target.value)}
                          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold"
                        >
                          {siteConfig.deliveryAreas.map((area) => (
                            <option key={area.name} value={area.name}>
                              {area.name} (Fee: ₹{area.deliveryFee})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-panna-deep mb-1.5">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="395007"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className={cn(
                            "w-full bg-[#faf7f2] border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold",
                            formErrors.pincode ? "border-red-500" : "border-panna-border"
                          )}
                        />
                        {formErrors.pincode && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="streetAddress" className="block text-xs font-bold text-panna-deep mb-1.5">
                        House / Flat / Building / Street Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="streetAddress"
                        name="streetAddress"
                        type="text"
                        placeholder="e.g. Flat 402, Royal Residency, VIP Circle"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className={cn(
                          "w-full bg-[#faf7f2] border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold",
                          formErrors.streetAddress ? "border-red-500" : "border-panna-border"
                        )}
                      />
                      {formErrors.streetAddress && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {formErrors.streetAddress}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-panna-deep mb-1.5">
                        Landmark <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Reliance Mall or Next to Jain Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold"
                      />
                    </div>
                  </div>
                )}

                {/* Special Cooking & Delivery Instructions */}
                <div>
                  <label className="block text-xs font-bold text-panna-deep mb-1.5">
                    Cooking or Delivery Instructions{" "}
                    <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please send extra spoons, keep spice mild, do not ring bell."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
                  />
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-panna-border">
                  <div className="w-6 h-6 rounded-full bg-panna-forest text-panna-gold text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h2 className="font-serif text-lg font-bold text-panna-deep">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod("online")}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none",
                      paymentMethod === "online"
                        ? "bg-[#FAF7F2] border-[#007A55] shadow-xs ring-1 ring-[#007A55]/20"
                        : "bg-white border-[#E3DACB] hover:border-zinc-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          paymentMethod === "online"
                            ? "bg-[#007A55]/10 text-[#007A55]"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        <CreditCard className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[13px] sm:text-sm text-panna-deep leading-snug">
                          Online Payment (UPI, Cards, Netbanking)
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">
                          Instant confirmation via Google Pay, PhonePe, Paytm or Cards
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        paymentMethod === "online"
                          ? "border-[#007A55] bg-white shadow-2xs"
                          : "border-zinc-300 bg-white"
                      )}
                    >
                      {paymentMethod === "online" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#007A55] shrink-0" />
                      )}
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none",
                      paymentMethod === "cash_on_delivery"
                        ? "bg-[#FAF7F2] border-[#007A55] shadow-xs ring-1 ring-[#007A55]/20"
                        : "bg-white border-[#E3DACB] hover:border-zinc-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === "cash_on_delivery"}
                      onChange={() => setPaymentMethod("cash_on_delivery")}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          paymentMethod === "cash_on_delivery"
                            ? "bg-[#007A55]/10 text-[#007A55]"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        <Banknote className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[13px] sm:text-sm text-panna-deep leading-snug">
                          {orderType === "pickup" ? "Pay at Kitchen Counter" : "Cash on Delivery (COD)"}
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">
                          Pay cash or UPI upon handover
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        paymentMethod === "cash_on_delivery"
                          ? "border-[#007A55] bg-white shadow-2xs"
                          : "border-zinc-300 bg-white"
                      )}
                    >
                      {paymentMethod === "cash_on_delivery" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#007A55] shrink-0" />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-5 sticky top-24">
              <div className="bg-white p-5 rounded-2xl border border-panna-border shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-panna-deep border-b border-panna-border pb-3 flex items-center justify-between">
                  <span>Your Feast Summary</span>
                  <span className="text-xs font-sans font-semibold text-zinc-500">
                    {items?.length || 0} {(items?.length || 0) === 1 ? "item" : "items"}
                  </span>
                </h3>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-panna-border/50 text-xs">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-panna-deep">
                          {item.quantity} × {item.productName}
                        </p>
                        <p className="text-[11px] text-zinc-500">Portion: {item.size.label}</p>
                        {item.extras?.map((e) => (
                          <p key={e.extra.id} className="text-[10px] text-zinc-600">
                            + {e.extra.name}
                          </p>
                        ))}
                      </div>
                      <span className="font-bold text-panna-deep shrink-0">
                        {formatINR(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div className="pt-3 border-t border-panna-border space-y-2 text-xs">
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
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-panna-deep">
                      {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-dashed border-panna-border flex items-center justify-between text-base font-bold text-panna-deep">
                    <span>Total Amount</span>
                    <span className="text-2xl text-panna-forest font-black">
                      {formatINR(total)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-right">Inclusive of all taxes</p>
                </div>

                {/* Place Order CTA */}
                <button
                  id="place-order-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold py-4 px-6 rounded-full shadow-lg transition-all active:scale-98 text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Place Order • {formatINR(total)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified 100% Pure Veg Kitchen • Surat</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
