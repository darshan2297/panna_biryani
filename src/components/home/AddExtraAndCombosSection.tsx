"use client";

import Image from "next/image";
import Link from "next/link";
import { combos, extras } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { formatINR } from "@/lib/utils";
import { ShoppingBag, Plus } from "lucide-react";
import { toast } from "sonner";

export function AddExtraAndCombosSection() {
  const { addComboItem, addExtraItem, setCartDrawerOpen } = useCartStore();

  const handleAddCombo = (combo: (typeof combos)[0]) => {
    addComboItem(combo, 1);
    toast.success(`Added ${combo.name} to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
  };

  const handleAddExtra = (extra: (typeof extras)[0]) => {
    addExtraItem(extra, 1);
    toast.success(`Added ${extra.name} to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
  };

  const displayExtras = extras.slice(0, 4);

  return (
    <section className="py-4 bg-[#FAF7F2] select-none">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* ============================================================ */}
          {/* PANEL 1: Add Extra (Left side)                               */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 bg-[#FAF7F2] rounded-xl p-3 sm:p-3.5 border border-[#E3DACB] shadow-2xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[17px] sm:text-[18px] text-[#17332C]">Add Extra</h3>
                <Link
                  href="/menu#extras"
                  className="text-[11.5px] font-medium text-[#556963] hover:text-[#003F32] transition-colors"
                >
                  View All &gt;
                </Link>
              </div>
              <p className="text-[11.5px] text-[#556963] mb-2.5 sm:mb-3">Make it even more delicious!</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 flex-1 items-stretch">
              {displayExtras.map((extra) => (
                <div
                  key={extra.id}
                  className="bg-white border border-[#E0D5C3] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-[#003F32]/30 transition-all h-full group"
                >
                  <div className="flex flex-col items-center text-center w-full">
                    {/* Image */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#ECE4D4] border border-[#E0D5C3]/40">
                      <Image
                        src={extra.image}
                        alt={extra.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 180px"
                        quality={90}
                      />
                    </div>

                    {/* Product Name */}
                    <div className="min-h-[28px] sm:min-h-[30px] flex items-center justify-center mt-2 px-0.5">
                      <h4 className="font-serif font-bold text-[11.5px] sm:text-[12.5px] text-[#17332C] leading-tight line-clamp-2">
                        {extra.name}
                      </h4>
                    </div>

                    {/* Small Product Description */}
                    {extra.description && (
                      <p className="text-[9.5px] sm:text-[10.5px] text-[#556963] leading-snug line-clamp-2 mt-1 px-0.5 min-h-[28px] sm:min-h-[30px] flex items-center justify-center">
                        {extra.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Add Button */}
                  <div className="mt-auto pt-2 w-full flex flex-col items-center">
                    <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#17332C] mb-1.5">
                      {formatINR(extra.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddExtra(extra)}
                      className="w-full bg-[#003F32] hover:bg-[#002e24] text-white text-[11.5px] sm:text-[12px] font-bold py-1.5 px-2 rounded-lg transition-all active:scale-95 shadow-2xs hover:shadow-xs flex items-center justify-center gap-1 cursor-pointer select-none"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* PANEL 2: Family & Saver Packs (Middle)                      */}
          {/* ============================================================ */}
          {/* ============================================================ */}
          {/* PANEL 2: Family & Saver Packs                                */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 bg-[#FAF7F2] rounded-xl p-3 sm:p-3.5 border border-[#E3DACB] shadow-2xs flex flex-col h-full">
            <div>
              <h3 className="font-serif font-bold text-[17px] sm:text-[18px] text-[#17332C]">Family &amp; Saver Packs</h3>
              <p className="text-[11.5px] text-[#556963] mb-2.5 sm:mb-3">More food. More happiness.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 items-stretch">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="border border-[#E0D5C3] rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-all h-full"
                >
                  {/* Image — taller and no extra padding so it fills edge-to-edge */}
                  <div className="relative w-full h-[110px] sm:h-[120px] shrink-0">
                    <Image
                      src={combo.image}
                      alt={combo.name}
                      fill
                      loading="eager"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                    {/* Savings badge over image */}
                    {combo.discountPercent && (
                      <span className="absolute top-2 right-2 bg-[#B3261E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        Save {combo.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
                    <div>
                      <h4 className="font-serif font-bold text-[14px] sm:text-[15px] text-[#17332C] leading-tight">
                        {combo.name}
                      </h4>
                      <p className="text-[11px] sm:text-[11.5px] text-[#556963] leading-snug mt-1">
                        {combo.itemsSummary}
                      </p>
                      <p className="text-[10.5px] text-[#7a8f8a] mt-0.5">{combo.servesText}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-auto pt-1">
                      <span className="font-bold text-[15px] sm:text-[16px] text-[#17332C]">
                        {formatINR(combo.price)}
                      </span>
                      {combo.originalPrice && (
                        <span className="text-[11px] text-[#aaa] line-through">
                          {formatINR(combo.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCombo(combo)}
                      className="mt-1.5 w-full bg-[#003F32] hover:bg-[#002e24] text-white text-[12px] sm:text-[13px] font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer group/combo select-none"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2] text-[#E8B94A] transition-transform group-hover/combo:scale-110" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* PANEL 3: First Order Special Gift! (Right side)              */}
          {/* ============================================================ */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-[#041c14] border border-[#e8b94a]/40 w-full group">
            <Link
              href="/menu"
              className="block relative w-full aspect-square"
              aria-label="First Order Special Gift! Order directly from our website and get a FREE Dessert on your first order. Order Now."
            >
              <Image
                src="/offers/first-order-gift-banner.jpg"
                alt="First Order Special Gift! Order directly from our website and get a FREE Dessert on your first order. Order Now."
                fill
                priority
                className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 360px"
              />
            </Link>
          </div>


        </div>
      </div>
    </section>
  );
}
