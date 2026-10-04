"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatINR } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function MobileStickyCart() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { items, getTotal, getItemCount, setCartDrawerOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not show sticky cart on checkout or order success pages
  if (
    !mounted ||
    !items || items.length === 0 ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-success")
  ) {
    return null;
  }

  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden p-3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
      <button
        type="button"
        onClick={() => setCartDrawerOpen(true)}
        className="pointer-events-auto w-full bg-[#0c281e] text-white p-3 rounded-2xl shadow-2xl border-2 border-panna-gold/70 flex items-center justify-between active:scale-98 transition-transform cursor-pointer"
        aria-label="View Cart"
      >
        <div className="flex items-center gap-3">
          <div className="relative bg-panna-gold text-panna-deep p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5 text-panna-deep" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[11px] text-panna-gold-light/80 font-medium">
              {itemCount} {itemCount === 1 ? "item" : "items"} added
            </p>
            <p className="text-base font-black text-panna-gold leading-tight">
              {formatINR(total)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
