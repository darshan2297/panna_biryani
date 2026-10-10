"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { Product, ProductSize, ComboPack, ExtraItem } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useShopGate } from "@/components/shop/useShopGate";
import { formatINR, cn } from "@/lib/utils";
import {
  ShoppingBag,
  Sparkles,
  Eye,
  Plus,
  Minus,
  Search,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function MenuContent() {
  const products = useStorefrontStore((st) => st.products);
  const combos = useStorefrontStore((st) => st.combos);
  const extras = useStorefrontStore((st) => st.extras);
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Derive product categories from the API products instead of hardcoding
  const productCategories = useMemo(() => {
    const cats: { id: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const p of products) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        cats.push({ id: p.category, label: p.categoryLabel });
      }
    }
    return cats;
  }, [products]);

  const categories = [
    { id: "all", label: "Full Menu" },
    ...productCategories,
    { id: "combos", label: "Combos & Packs" },
    { id: "extras", label: "Extras & Sides" },
  ];

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        selectedCategory === p.category;
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const showCombos =
    (selectedCategory === "all" || selectedCategory === "combos") &&
    (searchQuery === "" ||
      combos.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())));

  const showExtras =
    (selectedCategory === "all" || selectedCategory === "extras") &&
    (searchQuery === "" ||
      extras.some((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="bg-[#faf7f2] min-h-screen pb-20">
      {/* Menu Header Banner */}
      <div className="bg-[#091c15] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-panna-gold/25 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-panna-gold/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-panna-gold uppercase tracking-widest px-3 py-1 bg-panna-gold/20 rounded-full border border-panna-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Vegetarian Cloud Kitchen • Surat</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white">
            Our Handcrafted Dum Menu
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Slow cooked in sealed handis to capture royal aromas. Select your preferred size from
            250g personal portion up to 1kg family handi.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-panna-border">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all capitalize",
                    isActive
                      ? "bg-[#0c281e] text-panna-gold shadow-sm"
                      : "bg-white text-zinc-700 border border-panna-border hover:border-zinc-400"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <input
              type="text"
              placeholder="Filter by name or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-panna-border rounded-xl text-xs pl-9 pr-4 py-2.5 text-panna-deep placeholder-zinc-400 focus:outline-none focus:border-panna-gold shadow-2xs"
            />
            <Search className="w-4 h-4 text-panna-gold-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Signature Biryanis */}
        {(selectedCategory === "all" ||
          productCategories.some((c) => c.id === selectedCategory)) && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-black text-panna-deep flex items-center gap-2">
                <span>Signature Dum Biryanis</span>
                <span className="text-xs font-sans font-bold bg-panna-green-light text-panna-forest px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} varieties
                </span>
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-panna-border">
                <p className="text-zinc-500 text-sm">No biryanis match your filter &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-bold text-panna-gold-dark hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <MenuBiryaniCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Combos & Family Packs */}
        {showCombos && (
          <div id="combos" className="mb-14 pt-4 border-t border-panna-border">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
                For Gatherings & Sharing
              </span>
              <h2 className="font-serif text-2xl font-black text-panna-deep mt-0.5">
                Combos & Family Sharing Packs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {combos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Extras & Accompaniments */}
        {showExtras && (
          <div id="extras" className="pt-4 border-t border-panna-border">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
                Sides & Accompaniments
              </span>
              <h2 className="font-serif text-2xl font-black text-panna-deep mt-0.5">
                Raitas, Chutneys & Sweets
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {extras.map((extra) => (
                <ExtraCard key={extra.id} extra={extra} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuBiryaniCard({ product }: { product: Product }) {
  const [mounted, setMounted] = useState(false);
  const defaultSize = product.sizes.find((s) => s.id === "250g") || product.sizes[0];
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(defaultSize);
  const { items, addItem, updateQuantity, setCartDrawerOpen } = useCartStore();
  const { isOpen, guard } = useShopGate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Products coming from the CRM can have no purchasable sizes (e.g. marked
  // unavailable). Treat them as out of stock instead of crashing the page.
  const isUnavailable = product.available === false || !selectedSize;

  // Find if currently selected size is in cart
  const matchingItem = mounted && selectedSize
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
    if (!guard() || !selectedSize) return;
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
    if (!guard() || !selectedSize) return;
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
        <div className="relative aspect-4/3 overflow-hidden bg-[#ECE4D4]">
          <Link href={`/menu/${product.slug}`} className="block w-full h-full group/img">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500 group-hover/img:scale-105",
                isUnavailable && "opacity-60 grayscale"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {product.badge && (
            <span
              className={cn(
                "absolute z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white shadow-md pointer-events-none select-none",
                product.badge === "Best Seller" && "top-3 left-3 bg-[#007A55]",
                product.badge === "New" && "top-3 left-3 bg-[#B3261E]",
                product.badge === "Premium" && "top-3 right-3 bg-[#C59B27]",
                product.badge === "Out of Stock" && "top-3 left-3 bg-zinc-500"
              )}
            >
              {product.badge}
            </span>
          )}

          {isUnavailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
              <span className="px-4 py-1.5 bg-zinc-800/90 text-white text-sm font-bold rounded-full tracking-wide shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          <Link
            href={`/menu/${product.slug}`}
            className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="View Details & Customization"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-3.5 space-y-2">
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

          <p className="text-[11.5px] sm:text-[12px] text-[#4A5D56] leading-relaxed line-clamp-2 h-[34px] sm:h-[36px] flex items-center">
            {product.shortDescription}
          </p>

          {/* Clean, Non-Messy 2x2 Size and Price Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
            {product.sizes.map((size) => {
              const isSelected = selectedSize?.id === size.id;
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

          <p className="text-[11px] font-medium text-[#556963] h-[18px] flex items-center">
            {selectedSize ? selectedSize.servesText : "Currently unavailable"}
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
        ) : isUnavailable ? (
          <button
            type="button"
            disabled
            className="w-full h-[46px] sm:h-[48px] rounded-xl font-bold text-[12.5px] sm:text-[13.5px] tracking-wide text-white bg-zinc-400 cursor-not-allowed flex items-center justify-center gap-2 select-none"
          >
            <span>Out of Stock</span>
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
              aria-label={`Decrease quantity of ${selectedSize?.label}`}
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
              aria-label={`Increase quantity of ${selectedSize?.label}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ComboCard({ combo }: { combo: ComboPack }) {
  const { addComboItem, setCartDrawerOpen } = useCartStore();
  const { isOpen, guard } = useShopGate();

  const handleAdd = () => {
    if (!guard()) return;
    addComboItem(combo, 1);
    toast.success(`Added ${combo.name} to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-panna-border p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:border-panna-gold transition-colors">
      <div className="relative aspect-4/3 sm:aspect-square sm:w-48 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
        <Image
          src={combo.image}
          alt={combo.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 200px"
        />
        {combo.badge && (
          <span className="absolute top-3 left-3 bg-red-800 text-white font-black text-xs uppercase px-2 py-0.5 rounded shadow">
            {combo.badge}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Users className="w-3.5 h-3.5" />
            <span>{combo.servesText}</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-panna-deep mt-0.5">{combo.name}</h3>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{combo.description}</p>

          <div className="mt-2.5 space-y-1">
            {combo.includedItems.map((item, idx) => (
              <p key={idx} className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-panna-gold shrink-0" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-panna-border flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-panna-deep">{formatINR(combo.price)}</span>
              <span className="text-xs text-zinc-400 line-through">
                {formatINR(combo.originalPrice)}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Includes Raita & Chutney</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!isOpen}
            className="py-2.5 px-5 bg-[#003F32] hover:bg-[#002e24] disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer select-none"
          >
            {isOpen ? <ShoppingBag className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{isOpen ? "Add Combo" : "Shop Closed"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtraCard({ extra }: { extra: ExtraItem }) {
  const { addExtraItem, setCartDrawerOpen } = useCartStore();
  const { isOpen, guard } = useShopGate();

  const handleAdd = () => {
    if (!guard()) return;
    addExtraItem(extra, 1);
    toast.success(`Added ${extra.name} to order!`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-panna-border flex flex-col justify-between items-center text-center hover:border-panna-gold transition-colors">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden mb-2 bg-zinc-100 shadow-2xs">
        <Image
          src={extra.image}
          alt={extra.name}
          fill
          className="object-cover"
          sizes="160px"
          quality={90}
        />
      </div>

      <div className="w-full">
        <h4 className="text-xs font-bold text-panna-deep truncate">{extra.name}</h4>
        <p className="text-xs font-black text-panna-gold-dark mt-0.5">{formatINR(extra.price)}</p>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!isOpen}
        className="mt-2.5 w-full py-2 bg-[#003F32] hover:bg-[#002e24] disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer select-none"
      >
        {isOpen ? <Plus className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        <span>{isOpen ? "Add" : "Closed"}</span>
      </button>
    </div>
  );
}
