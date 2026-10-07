"use client";

import { useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import { useStorefrontStore, getStorefrontImage } from "@/store/useStorefrontStore";
import {
  Users,
  Phone,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Building,
  PartyPopper,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/services/analytics/analyticsService";
import { submitInquiry } from "@/services/storefront/inquiryService";

export function BulkOrderForm() {
  useStorefrontStore((s) => s.config);
  const deliveryAreas = useStorefrontStore((s) => s.deliveryAreas);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("25");
  const [preferredBiryani, setPreferredBiryani] = useState("Assorted Mix (Veg Dum + Paneer Dum)");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [areaLocation, setAreaLocation] = useState(deliveryAreas[0]?.name || "Surat");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !eventDate) {
      toast.error("Please fill in your Name, Phone number, and Event Date.");
      return;
    }

    setIsSubmitting(true);
    trackEvent("bulk_order_submit", {
      name,
      guestCount: Number(guestCount),
      preferredBiryani,
      orderType,
    });

    try {
      await submitInquiry({
        inquiry_type: "bulk",
        name: name.trim(),
        phone: phone.trim(),
        subject: `Bulk Order for ${eventDate} (${guestCount} guests)`,
        message: notes.trim() || undefined,
        details: {
          event_date: eventDate,
          guest_count: guestCount,
          preferred_biryani: preferredBiryani,
          order_type: orderType,
          area: areaLocation,
        },
      });
      setIsSubmitted(true);
      toast.success("Bulk order inquiry received! Our catering manager will call you shortly.");
    } catch {
      toast.error("Could not submit your request right now. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCases = [
    { title: "Family Gatherings", icon: Users, desc: "Festive dinners, anniversaries & celebrations at home." },
    { title: "House Parties", icon: PartyPopper, desc: "Hassle-free piping hot dum handis delivered to your door." },
    { title: "Office Lunches", icon: Building, desc: "Nutritious and fragrant lunches for teams and corporate events." },
    { title: "Functions & Poojas", icon: Flame, desc: "100% strictly pure vegetarian food prepared with sacred care." },
  ];

  return (
    <div className="bg-[#faf7f2] min-h-screen pb-20">
      {/* Hero Banner */}
      <div
        className="relative bg-[#091c15] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-panna-gold/30 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('${getStorefrontImage("bulk")}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#061711]/92 via-[#091c15]/85 to-[#061711]/95" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-panna-gold uppercase tracking-widest px-3 py-1 bg-panna-gold/20 rounded-full border border-panna-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biryani Made For Sharing • Surat Catering</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-white">
            Feeding A Crowd? <br />
            <span className="gold-gradient-text">Plan A Bulk Biryani Order</span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            From intimate 10-person family feasts to large 200+ guest celebrations in Surat.
            Delivered hot in sealed handis with complimentary raitas, mint chutneys, and salads.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* 4 Use Case Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="bg-white p-5 rounded-2xl border border-panna-border shadow-xs space-y-2 hover:border-panna-gold transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-panna-green-light flex items-center justify-center text-panna-forest">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-panna-deep">{uc.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{uc.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid: Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-panna-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-panna-deep">
                Request A Custom Bulk Quote
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Tell us about your event and our catering supervisor in Surat will prepare a tailored
                menu with discounts.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-emerald-950">
                    Quote Request Received!
                  </h3>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    Thank you <strong>{name}</strong>. Our chef will review your requirement for{" "}
                    <strong>{guestCount} guests</strong> on {eventDate} and call you on {phone}{" "}
                    within 2 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-900 underline pt-2"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amish Parikh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep focus:outline-none focus:border-panna-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Approximate Guests <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold"
                    >
                      <option value="10-15">10 to 15 People</option>
                      <option value="15-25">15 to 25 People</option>
                      <option value="25-50">25 to 50 People</option>
                      <option value="50-100">50 to 100 People</option>
                      <option value="100+">100+ People (Custom Catering)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Preferred Biryani Variety
                    </label>
                    <select
                      value={preferredBiryani}
                      onChange={(e) => setPreferredBiryani(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold"
                    >
                      <option value="Assorted Mix (Veg Dum + Paneer Dum)">
                        Assorted Mix (Veg Dum + Paneer Dum)
                      </option>
                      <option value="Panna Paneer Dum Biryani">Panna Paneer Dum Biryani</option>
                      <option value="Panna Royal Dum Biryani (Cashews)">
                        Panna Royal Dum Biryani (Cashews)
                      </option>
                      <option value="Panna Veg Dum Biryani">Panna Veg Dum Biryani</option>
                      <option value="Panna Hyderabadi Dum Biryani">
                        Panna Hyderabadi Dum Biryani
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-panna-deep mb-1">
                      Delivery Area / Venue in Surat
                    </label>
                    <select
                      value={areaLocation}
                      onChange={(e) => setAreaLocation(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm px-3.5 py-2.5 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold"
                    >
                      {deliveryAreas.map((area) => (
                        <option key={area.name} value={area.name}>
                          {area.name} (Surat)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-panna-deep mb-1">
                    Fulfillment Preference
                  </label>
                  <div className="flex gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        checked={orderType === "delivery"}
                        onChange={() => setOrderType("delivery")}
                        className="text-panna-forest focus:ring-panna-gold"
                      />
                      <span>Doorstep Venue Delivery</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        checked={orderType === "pickup"}
                        onChange={() => setOrderType("pickup")}
                        className="text-panna-forest focus:ring-panna-gold"
                      />
                      <span>Self Kitchen Pickup (Vesu)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-panna-deep mb-1">
                    Special Event Notes / Custom Requests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Jain preparation required, need extra raita bowls, or specific delivery time slot."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold rounded-full text-sm uppercase tracking-wider shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Request Bulk Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct WhatsApp & Catering Perks (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Instant WhatsApp Card */}
            <div className="bg-[#12372a] text-white p-6 rounded-3xl border border-panna-gold/40 shadow-xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-panna-gold">
                Prefer Instant Chat?
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Book Catering on WhatsApp
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect directly with our Surat kitchen manager to discuss custom quantities, portion
                recommendations, and tasting samples.
              </p>

              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  "Hello Panna Biryani, I would like to inquire about a bulk biryani order for an upcoming event in Surat."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Chat with Catering Manager</span>
              </a>
            </div>

            {/* What's Included in Bulk Orders */}
            <div className="bg-white p-6 rounded-3xl border border-panna-border shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-panna-deep border-b border-panna-border pb-2.5">
                Every Bulk Order Includes:
              </h3>
              <ul className="space-y-2 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Slow-cooked Sealed Handi Pots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Chilled Boondi & Cucumber Raita</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fresh Spicy Mint Chutney</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lachha Onion Salad with Lemon</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Disposable Serving Cutlery & Plates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Delivery Time-Slot Guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
