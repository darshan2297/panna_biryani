"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductSize } from "@/types";
import { extras } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { formatINR, cn } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Flame,
  ShieldCheck,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const router = useRouter();
  const defaultSize = product.sizes.find((s) => s.id === "500g") || product.sizes[0];
  const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);
  const [quantity, setQuantity] = useState(1);

  // Extras state: map of extraId -> selected quantity
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"ingredients" | "preparation" | "reheating">(
    "ingredients"
  );
  const [isAdding, setIsAdding] = useState(false);

  const { addItem, setCartDrawerOpen } = useCartStore();

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras((prev) => {
      const current = prev[extraId] || 0;
      return {
        ...prev,
        [extraId]: current > 0 ? 0 : 1,
      };
    });
  };

  // Calculate unit price with extras
  const extrasCost = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    if (qty <= 0) return sum;
    const item = extras.find((e) => e.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const unitTotal = selectedSize.price + extrasCost;
  const grandTotal = unitTotal * quantity;

  const prepareExtrasPayload = () => {
    return Object.entries(selectedExtras)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = extras.find((e) => e.id === id);
        return item ? { extra: item, quantity: qty } : null;
      })
      .filter((x): x is { extra: (typeof extras)[0]; quantity: number } => Boolean(x));
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const extrasPayload = prepareExtrasPayload();
    addItem(product, selectedSize, extrasPayload, quantity);
    toast.success(`Added ${quantity} × ${product.name} (${selectedSize.label}) to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setCartDrawerOpen(true),
      },
    });
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleBuyNow = () => {
    const extrasPayload = prepareExtrasPayload();
    addItem(product, selectedSize, extrasPayload, quantity);
    router.push("/checkout");
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen py-8">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-panna-deep">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <Link href="/menu" className="hover:text-panna-deep">
            Menu
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <span className="text-panna-deep font-semibold truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Big Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden border-2 border-panna-border bg-white shadow-xl">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#0c281e] text-panna-gold border border-panna-gold/40 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md">
                  {product.badge}
                </span>
              )}

              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">100% Pure Vegetarian</span>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-panna-border text-center">
                <Flame className="w-4 h-4 text-panna-gold mx-auto mb-1" />
                <p className="text-[11px] font-bold text-panna-deep">Sealed Handi Dum</p>
                <p className="text-[10px] text-zinc-500">Traditional dough seal</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-panna-border text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-panna-deep">Pure Desi Ghee</p>
                <p className="text-[10px] text-zinc-500">Zero artificial colors</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-panna-border text-center">
                <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-panna-deep">Fresh on Order</p>
                <p className="text-[10px] text-zinc-500">Never pre-cooked</p>
              </div>
            </div>
          </div>

          {/* Right Column: Customization and Ordering */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-xs border-2 border-emerald-600 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                </span>
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
                  {product.categoryLabel}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-zinc-500 font-medium">Spice: {product.spiceLevel}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="font-serif italic text-panna-gold-dark text-sm sm:text-base mt-1">
                  &ldquo;{product.tagline}&rdquo;
                </p>
              )}

              <p className="text-zinc-600 text-sm leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2 border-t border-panna-border">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-bold text-panna-deep">
                  Select Handi Portion Size:
                </label>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedSize.servesText}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "p-3 rounded-xl transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer select-none relative",
                        isSelected
                          ? "bg-[#EAF6ED] text-[#003F32] border-2 border-[#007A55] shadow-xs"
                          : "bg-white hover:bg-zinc-50 text-zinc-800 border-2 border-[#E2D8C9] hover:border-[#007A55]/40"
                      )}
                    >
                      <span className="font-bold text-sm">{size.label}</span>
                      <span
                        className={cn(
                          "text-base font-black",
                          isSelected ? "text-[#007A55]" : "text-panna-deep"
                        )}
                      >
                        {formatINR(size.price)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px]",
                          isSelected ? "text-[#007A55]/80 font-medium" : "text-zinc-500"
                        )}
                      >
                        {size.weightGrams}g
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Extra Items Customization */}
            <div className="space-y-3 pt-2 border-t border-panna-border">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-bold text-panna-deep">
                  Customize with Extras:
                </label>
                <span className="text-[11px] text-zinc-500">Optional add-ons</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {extras.map((extra) => {
                  const isChecked = (selectedExtras[extra.id] || 0) > 0;
                  return (
                    <div
                      key={extra.id}
                      onClick={() => handleExtraToggle(extra.id)}
                      className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none",
                        isChecked
                          ? "bg-amber-50/70 border-panna-gold shadow-2xs"
                          : "bg-white border-panna-border hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0">
                          <Image
                            src={extra.image}
                            alt={extra.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={90}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-panna-deep">{extra.name}</p>
                          <p className="text-[11px] text-panna-gold-dark font-black">
                            +{formatINR(extra.price)}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-panna-forest border-panna-forest text-white"
                            : "border-zinc-300 bg-white"
                        )}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector + Price Breakdown */}
            <div className="pt-4 border-t border-panna-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-panna-deep uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-panna-border rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-l-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-panna-deep">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-r-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block">Total Amount</span>
                <span className="text-2xl font-black text-panna-deep">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full flex items-center justify-center gap-2 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold py-3.5 px-6 rounded-xl border border-panna-gold/50 shadow-md text-sm uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold py-3.5 px-6 rounded-xl shadow-md text-sm uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* In-depth Food Tabs */}
            <div className="pt-6 border-t border-panna-border space-y-3">
              <div className="flex border-b border-panna-border gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("ingredients")}
                  className={cn(
                    "pb-2 border-b-2 transition-colors cursor-pointer",
                    activeTab === "ingredients"
                      ? "border-panna-deep text-panna-deep"
                      : "border-transparent text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  Ingredients & Allergens
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preparation")}
                  className={cn(
                    "pb-2 border-b-2 transition-colors cursor-pointer",
                    activeTab === "preparation"
                      ? "border-panna-deep text-panna-deep"
                      : "border-transparent text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  Dum Technique
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reheating")}
                  className={cn(
                    "pb-2 border-b-2 transition-colors cursor-pointer",
                    activeTab === "reheating"
                      ? "border-panna-deep text-panna-deep"
                      : "border-transparent text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  Reheating Tips
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-panna-border text-xs leading-relaxed text-zinc-600">
                {activeTab === "ingredients" && (
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-panna-deep mb-1">Key Ingredients:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-zinc-700">
                        {product.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-panna-gold shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-panna-border/60">
                      <span className="font-bold text-panna-deep">Allergens: </span>
                      <span>{product.allergens.join(", ") || "None"}</span>
                    </div>

                    {product.nutritionInfo && (
                      <div className="pt-2 border-t border-panna-border/60 flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>{product.nutritionInfo.calories}</span>
                        <span>• Protein: {product.nutritionInfo.protein}</span>
                        <span>• Carbs: {product.nutritionInfo.carbs}</span>
                        <span>• Fat: {product.nutritionInfo.fat}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "preparation" && (
                  <div className="space-y-2">
                    <p className="font-bold text-panna-deep">Authentic Dum Seal Technique:</p>
                    <p>{product.preparationNotes}</p>
                    <p className="text-zinc-500">
                      We never microwave or toss our biryani in open pans. The long grain basmati
                      gently cooks inside the steam envelope created by natural whole dough seals.
                    </p>
                  </div>
                )}

                {activeTab === "reheating" && (
                  <div className="space-y-2">
                    <p className="font-bold text-panna-deep">Best Reheating Method:</p>
                    <p>{product.reheatingTips}</p>
                    <p className="text-zinc-500">
                      Serving Suggestion: {product.servingSuggestions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-panna-border">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
                More From Our Kitchen
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-panna-deep mt-1">
                You May Also Enjoy
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl overflow-hidden border border-panna-border shadow-xs hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-panna-cream-muted">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-base text-panna-deep">{rel.name}</h3>
                    <p className="text-xs text-zinc-600 line-clamp-2">{rel.shortDescription}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Starts from{" "}
                        <strong className="text-panna-deep">{formatINR(rel.sizes[0].price)}</strong>
                      </span>
                      <Link
                        href={`/menu/${rel.slug}`}
                        className="text-xs font-bold text-panna-gold-dark hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
