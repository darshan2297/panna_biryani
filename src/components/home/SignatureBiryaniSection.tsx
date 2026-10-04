"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { Product, ProductSize } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useShopGate } from "@/components/shop/useShopGate";
import { formatINR, cn } from "@/lib/utils";
import { ShoppingBag, Plus, Minus, Clock } from "lucide-react";
import { toast } from "sonner";

export function SignatureBiryaniSection() {
  const products = useStorefrontStore((s) => s.products);
  return (
    <section id="signature" className="pt-6 pb-6 bg-[#FAF7F2] select-none">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28">
        {/* Section Heading & View All link aligned on same horizontal row */}
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="relative pl-7">
            {/* Elegant botanical leaf sprig illustration matching reference */}
            <div className="absolute left-0 top-0.5 text-[#52796F]">
              <svg className="w-5 h-6 fill-current text-[#476a5b]" viewBox="0 0 24 32">
                <path d="M12 32c-1-6 2-12 8-16-5 0-9 2-12 5-1-4 1-9 6-13-5 1-9 4-11 9-2-3-1-6 2-9-5 2-8 6-9 12 4-2 7-2 10-1-5 4-7 9-6 13 4-2 8-2 12 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-[#17332C] leading-tight tracking-tight">
              Our Signature Biryani
            </h2>
            <p className="text-[#556963] text-[12px] sm:text-[13px] mt-0.5 font-normal">
              Choose your favourite. Every bite tells a story.
            </p>
          </div>

          {/* View All link to full menu */}
          <Link
            href="/menu"
            className="text-[12.5px] sm:text-[13.5px] font-medium text-[#556963] hover:text-[#003F32] transition-colors flex items-center gap-1 shrink-0 pb-0.5"
          >
            <span>View All</span>
            <span aria-hidden="true">&gt;</span>
          </Link>
        </div>

        {/* 4 Cards Grid: balanced 4-column layout showing all signature biryanis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [mounted, setMounted] = useState(false);
  const defaultSize = product.sizes.find((s) => s.id === "250g") || product.sizes[0];
  const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);
  const { items, addItem, updateQuantity, setCartDrawerOpen } = useCartStore();
  const { isOpen, guard } = useShopGate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find if currently selected size is in cart
  const matchingItem = mounted
    ? items.find(
        (item) =>
          item.productId === product.id &&
          item.size?.id === selectedSize.id &&
          (!item.extras || item.extras.length === 0)
      ) ||
      items.find(
        (item) => item.productId === product.id && item.size?.id === selectedSize.id
      )
    : null;

  const count = matchingItem ? matchingItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!guard()) return;
    addItem(product, selectedSize, [], 1);
    toast.success(`Added 1 × ${product.name} (${selectedSize.label}) to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => {
          setCartDrawerOpen(true);
        },
      },
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!guard()) return;
    if (matchingItem) {
      updateQuantity(matchingItem.id, matchingItem.quantity + 1);
    } else {
      addItem(product, selectedSize, [], 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (matchingItem) {
      updateQuantity(matchingItem.id, matchingItem.quantity - 1);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#E3DACB] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        {/* Product Image Area */}
        <Link
          href={`/menu/${product.slug}`}
          className="relative block w-full aspect-[4/3] overflow-hidden bg-[#ECE4D4] group/img"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover/img:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          />

          {/* Dynamic HTML/CSS Tag Overlay */}
          {product.badge && (
            <span
              className={cn(
                "absolute z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white shadow-md pointer-events-none select-none",
                product.badge === "Best Seller" && "top-2.5 left-2.5 bg-[#007A55]",
                product.badge === "New" && "top-2.5 left-2.5 bg-[#B3261E]",
                product.badge === "Premium" && "top-2.5 right-2.5 bg-[#C59B27]"
              )}
            >
              {product.badge}
            </span>
          )}
        </Link>

        {/* Card Body */}
        <div className="p-3.5 space-y-2">
          {/* Product Title with Veg / Royal Emblem */}
          <div className="flex items-center gap-1.5 h-[24px]">
            {product.category === "paneer" ? (
              <span className="text-[#925c28] text-sm shrink-0">🧀</span>
            ) : product.category === "royal" ? (
              <span className="text-[#A67C2E] text-sm shrink-0">👑</span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0 p-[1.5px] bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              </span>
            )}
            <Link
              href={`/menu/${product.slug}`}
              className="font-bold text-[14px] sm:text-[15px] tracking-normal text-[#17332C] hover:text-[#003F32] leading-tight truncate transition-colors"
            >
              {product.name}
            </Link>
          </div>

          {/* Compact 2-line description with fixed height for exact cross-card alignment */}
          <p className="text-[11.5px] sm:text-[12px] text-[#4A5D56] leading-relaxed line-clamp-2 h-[34px] sm:h-[36px] flex items-center">
            {product.shortDescription}
          </p>

          {/* Clean, Non-Messy 2x2 Size and Price Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
            {product.sizes.map((size) => {
              const isSelected = selectedSize.id === size.id;
              const sizeItem = mounted
                ? items.find(
                    (item) => item.productId === product.id && item.size?.id === size.id
                  )
                : null;
              const sizeQty = sizeItem ? sizeItem.quantity : 0;

              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "relative flex items-center justify-between px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-lg text-[12px] sm:text-[13px] transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-[#EAF6ED] border-2 border-[#007A55] text-[#003F32] font-bold shadow-xs"
                      : "bg-white hover:bg-[#FAF7F2] text-[#2D3F38] font-semibold border-2 border-[#E2D8C9] hover:border-[#007A55]/40"
                  )}
                >
                  <span className="font-semibold tracking-tight">{size.label}</span>
                  <span
                    className={cn(
                      isSelected ? "text-[#007A55] font-extrabold" : "text-[#17332C] font-semibold"
                    )}
                  >
                    {formatINR(size.price)}
                  </span>

                  {/* Quantity badge if portion is in cart */}
                  {sizeQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#007A55] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs border border-white">
                      {sizeQty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Serves info subtitle */}
          <p className="text-[11px] font-medium text-[#556963] h-[18px] flex items-center">
            {selectedSize.servesText}
          </p>
        </div>
      </div>

      {/* Modern 1-Click Action Row: Single Click Add or In-Button Stepper */}
      <div className="p-3.5 pt-0">
        {!isOpen ? (
          <button
            type="button"
            disabled
            className="w-full h-[46px] sm:h-[48px] rounded-xl font-bold text-[12.5px] sm:text-[13.5px] tracking-wide text-white bg-zinc-400 cursor-not-allowed flex items-center justify-center gap-2 select-none"
            title="Shop is currently closed"
          >
            <Clock className="w-4 h-4" />
            <span>Shop Closed</span>
          </button>
        ) : count === 0 ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-[46px] sm:h-[48px] rounded-xl font-bold text-[13px] sm:text-[14px] tracking-wide text-white bg-[#003F32] hover:bg-[#002e24] active:scale-[0.98] transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 select-none group/btn"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2] text-[#E8B94A] transition-transform group-hover/btn:scale-110" />
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="w-full h-[46px] sm:h-[48px] rounded-xl bg-[#007A55] text-white shadow-sm flex items-center justify-between px-3 select-none">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-10 sm:w-12 h-9 rounded-lg flex items-center justify-center hover:bg-black/20 active:scale-90 transition-all cursor-pointer"
              aria-label={`Decrease quantity of ${selectedSize.label}`}
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="font-extrabold text-[15px] sm:text-[16px] text-white select-none">
              {count}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-10 sm:w-12 h-9 rounded-lg flex items-center justify-center hover:bg-black/20 active:scale-90 transition-all cursor-pointer"
              aria-label={`Increase quantity of ${selectedSize.label}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
