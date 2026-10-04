"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";

export function HowWouldYouLikeToOrderSection() {
  const { setOrderType } = useCartStore();
  const [selectedType, setSelectedType] = useState<"delivery" | "pickup">("pickup");

  return (
    <section className="pt-2 pb-6 bg-[#FAF7F2] select-none">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">

          {/* ============================================================ */}
          {/* LEFT (6 cols): How Would You Like To Order?                  */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 bg-[#FAF7F2] rounded-xl p-3.5 border border-[#E3DACB] shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-[17px] text-[#17332C]">
                How Would You Like To Order?
              </h3>
              <p className="text-[12px] text-[#556963] mb-3">Choose what works best for you.</p>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Delivery Card */}
                <div
                  onClick={() => {
                    setSelectedType("delivery");
                    setOrderType("delivery");
                    toast.success("Delivery selected. Fast doorstep delivery.");
                  }}
                  className={cn(
                    "rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white border",
                    selectedType === "delivery"
                      ? "border-2 border-[#003F32] shadow-xs"
                      : "border-[#E0D5C3] hover:border-[#003F32]/50"
                  )}
                >
                  <Bike className="w-6 h-6 text-[#003F32] stroke-[1.75]" />
                  <div className="space-y-0.5 w-full">
                    <h4 className="font-bold text-[13px] text-[#17332C]">Delivery</h4>
                    <p className="text-[11px] text-[#556963] leading-tight">Fast &amp; Safe Delivery</p>
                    <p className="text-[10.5px] text-[#888]">₹30 – ₹60 (extra)</p>
                  </div>
                  {/* Preference bar */}
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#888]">Users prefer</span>
                      <span className="text-[11px] font-bold text-[#556963]">32%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EEE8DC] rounded-full overflow-hidden">
                      <div className="h-full w-[32%] bg-[#003F32]/40 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 2. Pickup Card */}
                <div
                  onClick={() => {
                    setSelectedType("pickup");
                    setOrderType("pickup");
                    toast.success("Pickup selected. No extra charge.");
                  }}
                  className={cn(
                    "relative rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white border",
                    selectedType === "pickup"
                      ? "border-2 border-[#003F32] shadow-xs"
                      : "border-[#E0D5C3] hover:border-[#003F32]/50"
                  )}
                >
                  {/* Most Popular badge */}
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#003F32] text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    ⭐ Most Popular
                  </span>

                  <ShoppingBag className="w-6 h-6 text-[#003F32] stroke-[1.75]" />
                  <div className="space-y-0.5 w-full">
                    <h4 className="font-bold text-[13px] text-[#17332C]">Pickup</h4>
                    <p className="text-[11px] text-[#556963] leading-tight">No Extra Charge</p>
                    <p className="text-[10.5px] text-[#003F32] font-semibold">100% Free</p>
                  </div>
                  {/* Preference bar */}
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#888]">Users prefer</span>
                      <span className="text-[11px] font-bold text-[#003F32]">68%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EEE8DC] rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-[#003F32] rounded-full" />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT (6 cols): BULK ORDERS FOR PARTIES & EVENTS BANNER     */}
          {/* ============================================================ */}
          <div
            className="lg:col-span-6 rounded-xl border border-[#4a3424] shadow-md px-5 py-4 overflow-hidden relative flex flex-col justify-center text-white bg-no-repeat"
            style={{
              backgroundImage: "url('/bulk/bulk-banner-bg.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none" />

            <div className="space-y-1.5 text-left max-w-[260px] relative z-10">
              <h4 className="text-[14px] sm:text-[15px] font-serif font-bold tracking-wider text-[#E8B94A] uppercase">
                BULK ORDERS
              </h4>
              <p className="font-serif font-bold text-[13px] sm:text-[14px] text-white tracking-wide leading-tight">
                FOR PARTIES &amp; EVENTS
              </p>
              <p className="text-[11px] text-white/70 font-light leading-snug pt-0.5">
                Family Gatherings&nbsp;|&nbsp;Office Lunch&nbsp;|&nbsp;Celebrations
              </p>

              <div className="pt-2">
                <Link
                  href="/bulk-orders"
                  className="inline-flex items-center gap-1.5 bg-[#E8B94A] hover:bg-[#dca835] text-[#00291F] font-bold py-1.5 px-4 rounded-full text-[11px] tracking-wide shadow-sm transition-all active:scale-95"
                >
                  <span>Get Quote</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
