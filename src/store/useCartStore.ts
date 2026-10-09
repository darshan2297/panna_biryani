import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product, ProductSize, ExtraItem, OrderType, Offer, ComboPack } from "@/types";
import { siteConfig } from "@/data/siteConfig";
import { getDeliverySettings, findPromoCode, getStorefront } from "@/store/useStorefrontStore";
import { validatePromoCode, resolveDiscountAmount, PHONE_REQUIRED } from "@/services/storefront/configService";

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  selectedArea: string;
  pincode: string;
  appliedCoupon: Offer | null;
  specialInstructions: string;
  isCartDrawerOpen: boolean;

  // Actions
  addItem: (
    product: Product,
    selectedSize: ProductSize,
    selectedExtras?: { extra: ExtraItem; quantity: number }[],
    quantity?: number
  ) => void;
  addComboItem: (combo: ComboPack, quantity?: number) => void;
  addExtraItem: (extra: ExtraItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setSelectedArea: (area: string, pincode?: string) => void;
  applyCoupon: (
    code: string,
    customerPhone?: string
  ) => Promise<{ success: boolean; message: string; requiresPhone?: boolean }>;
  removeCoupon: () => void;
  setSpecialInstructions: (instructions: string) => void;
  setCartDrawerOpen: (isOpen: boolean) => void;

  // Computed helper getters
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "delivery",
      selectedArea: "Vesu",
      pincode: "395007",
      appliedCoupon: null,
      specialInstructions: "",
      isCartDrawerOpen: false,

      addItem: (product, selectedSize, selectedExtras = [], quantity = 1) => {
        if (!product || !selectedSize) return;

        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          // Create stable hash for extras
          const safeExtras = (selectedExtras || []).filter(
            (e) => e && e.extra && typeof e.extra.id === "string"
          );
          const sortedExtras = [...safeExtras].sort((a, b) =>
            (a.extra.id || "").localeCompare(b.extra.id || "")
          );
          const extrasHash = sortedExtras
            .map((e) => `${e.extra.id}x${e.quantity || 1}`)
            .join("_");
          const compositeId = `${product.id}-${selectedSize.id}-${extrasHash}`;

          const existingIndex = currentItems.findIndex((item) => item.id === compositeId);

          const extrasCost = sortedExtras.reduce(
            (sum, e) => sum + (Number(e.extra?.price) || 0) * (Number(e.quantity) || 1),
            0
          );
          const basePrice = Number(selectedSize.price) || 0;
          const unitPrice = basePrice + extrasCost;
          const addQty = Math.max(1, Math.round(Number(quantity) || 1));

          if (existingIndex > -1) {
            // Update quantity of existing identical item
            const updatedItems = [...currentItems];
            const existing = updatedItems[existingIndex];
            const newQty = (existing.quantity || 1) + addQty;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: unitPrice * newQty,
            };
            return { items: updatedItems };
          }

          // Add fresh item
          const newItem: CartItem = {
            id: compositeId,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.image || "/biryani/veg-dum-biryani.png",
            isCombo: false,
            size: selectedSize,
            quantity: addQty,
            extras: sortedExtras,
            unitBasePrice: basePrice,
            totalPrice: unitPrice * addQty,
          };

          return { items: [...currentItems, newItem] };
        });
      },

      addComboItem: (combo, quantity = 1) => {
        if (!combo) return;

        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const compositeId = `combo-${combo.id}`;
          const existingIndex = currentItems.findIndex((item) => item.id === compositeId);
          const addQty = Math.max(1, Math.round(Number(quantity) || 1));
          const comboPrice = Number(combo.price) || 0;

          if (existingIndex > -1) {
            const updatedItems = [...currentItems];
            const existing = updatedItems[existingIndex];
            const newQty = (existing.quantity || 1) + addQty;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: comboPrice * newQty,
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            id: compositeId,
            productId: combo.id,
            productName: combo.name,
            productSlug: combo.slug,
            productImage: combo.image || "/combos/combo-family-pack.png",
            isCombo: true,
            size: {
              id: "combo",
              label: combo.servesText || "Combo Pack",
              weightGrams: 1000,
              price: comboPrice,
              servesText: combo.servesText || "Serves 3-4",
            },
            quantity: addQty,
            extras: [],
            unitBasePrice: comboPrice,
            totalPrice: comboPrice * addQty,
          };

          return { items: [...currentItems, newItem] };
        });
      },

      addExtraItem: (extra, quantity = 1) => {
        if (!extra) return;

        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const compositeId = `standalone-extra-${extra.id}`;
          const existingIndex = currentItems.findIndex((item) => item.id === compositeId);
          const addQty = Math.max(1, Math.round(Number(quantity) || 1));
          const extraPrice = Number(extra.price) || 0;

          if (existingIndex > -1) {
            const updatedItems = [...currentItems];
            const existing = updatedItems[existingIndex];
            const newQty = (existing.quantity || 1) + addQty;
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: extraPrice * newQty,
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            id: compositeId,
            productId: extra.id,
            productName: extra.name,
            productSlug: extra.id,
            productImage: extra.image || "/extras/extra-raita.png",
            isCombo: false,
            size: {
              id: "extra",
              label: "Portion Bowl",
              weightGrams: 100,
              price: extraPrice,
              servesText: "1 Serving",
            },
            quantity: addQty,
            extras: [],
            unitBasePrice: extraPrice,
            totalPrice: extraPrice * addQty,
          };

          return { items: [...currentItems, newItem] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: (state.items || []).filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, newQuantity) => {
        const qty = Math.round(Number(newQuantity) || 0);
        if (qty <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const updatedItems = (state.items || []).map((item) => {
            if (item.id === itemId) {
              const safeExtras = (item.extras || []).filter((e) => e && e.extra);
              const extrasCost = safeExtras.reduce(
                (sum, e) => sum + (Number(e?.extra?.price) || 0) * (Number(e?.quantity) || 1),
                0
              );
              const unitBase = Number(item.unitBasePrice) || Number(item.size?.price) || 0;
              const unitPrice = unitBase + extrasCost;
              const clampedQty = Math.min(99, Math.max(1, qty));
              return {
                ...item,
                quantity: clampedQty,
                totalPrice: unitPrice * clampedQty,
              };
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null, specialInstructions: "" });
      },

      setOrderType: (type) => {
        set({ orderType: type });
      },

      setSelectedArea: (area, pincode) => {
        set({ selectedArea: area || "Vesu", pincode: pincode || "395007" });
      },

      applyCoupon: async (code, customerPhone) => {
        const state = get();
        const cartItems = state.items || [];
        const cartSlugs = cartItems
          .filter((i) => !i.isFree)
          .map((item) => item.productSlug || item.productId);
        const promo = findPromoCode(code, cartSlugs);
        if (!promo) {
          return { success: false, message: "Invalid promo code" };
        }

        const offer: Offer = {
          id: String(promo.id),
          code: promo.code,
          title: promo.title,
          subtitle: promo.subtitle || "",
          description: promo.description || "",
          discountType:
            promo.discount_type === "percentage"
              ? "percentage"
              : promo.discount_type === "free_item"
              ? "free_item"
              : "fixed",
          discountValue: promo.discount_value,
          maxDiscountAmount: promo.max_discount_amount ?? null,
          freeItemName: promo.free_item_name || undefined,
          minOrderValue: promo.min_order_value,
          maxOrderValue: promo.max_order_value ?? null,
          discountOn: promo.discount_on,
          minQuantity: promo.min_quantity ?? null,
          maxQuantity: promo.max_quantity ?? null,
          customerType: promo.customer_type,
          validFrom: promo.valid_from,
          validUntil: promo.valid_until,
          applicableItems: promo.applicable_items,
          termsConditions: promo.terms_conditions,
          badge: promo.badge || undefined,
          active: promo.active,
          firstOrderOnly: promo.first_order_only === true,
        };

        // Drop any free gift left over from a previously applied coupon
        const itemsWithoutFree = cartItems.filter((i) => !i.isFree);

        const subtotal = itemsWithoutFree.reduce(
          (sum, item) => sum + (Number(item?.totalPrice) || 0),
          0
        );
        if (subtotal < (offer.minOrderValue || 0)) {
          return {
            success: false,
            message: `Minimum order of ₹${offer.minOrderValue} required for this offer`,
          };
        }

        if (promo.minimum_order_items != null) {
          const itemCount = itemsWithoutFree.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
          );
          if (itemCount < promo.minimum_order_items) {
            return {
              success: false,
              message: `A minimum of ${promo.minimum_order_items} item(s) is required for this promo code`,
            };
          }
        }

        // Server-side validation: enforces first_order_only, event windows,
        // min/max thresholds and per-user limits.
        const validation = await validatePromoCode({
          code: offer.code,
          orderValue: subtotal,
          itemCount: itemsWithoutFree.reduce((s, i) => s + (Number(i.quantity) || 0), 0),
          cartItemSlugs: cartSlugs,
          customerPhone,
        });
        if (validation && !validation.valid) {
          if (validation.reason === PHONE_REQUIRED) {
            return {
              success: false,
              message: "Enter your mobile number to check eligibility for this offer.",
              requiresPhone: true,
            };
          }
          return {
            success: false,
            message: validation.reason || "This promo code cannot be applied to your order.",
          };
        }

        // Attach the complimentary gift as a real ₹0 cart line item so it is
        // visible in the cart, counted, and carried through to the KOT/invoice.
        let nextItems = itemsWithoutFree;
        if (offer.discountType === "free_item" && offer.freeItemName) {
          nextItems = [
            ...itemsWithoutFree,
            {
              id: `free-gift-${offer.code}`,
              productId: `free-gift-${offer.code}`,
              productName: offer.freeItemName,
              productSlug: `free-gift-${offer.code}`,
              productImage: "",
              isCombo: false,
              isFree: true,
              size: {
                id: "single",
                label: "Complimentary",
                weightGrams: 0,
                price: 0,
                servesText: "1 pc",
              },
              quantity: 1,
              extras: [],
              unitBasePrice: 0,
              totalPrice: 0,
            },
          ];
        }

        set({ appliedCoupon: offer, items: nextItems });
        return {
          success: true,
          message:
            offer.discountType === "free_item" && offer.freeItemName
              ? `${offer.freeItemName} added FREE to your order!`
              : `Offer '${offer.code}' applied successfully!`,
        };
      },

      removeCoupon: () => {
        set({
          appliedCoupon: null,
          items: (get().items || []).filter((i) => !i.isFree),
        });
      },

      setSpecialInstructions: (instructions) => {
        set({ specialInstructions: instructions || "" });
      },

      setCartDrawerOpen: (isOpen) => {
        set({ isCartDrawerOpen: Boolean(isOpen) });
      },

      getSubtotal: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => sum + (Number(item?.totalPrice) || 0), 0);
      },

      getDeliveryFee: () => {
        const state = get();
        if (state.orderType === "pickup") return 0;
        const subtotal = state.getSubtotal();
        const ds = getDeliverySettings();
        if (ds.freeDeliveryEnabled && subtotal >= ds.freeDeliveryThreshold) return 0;

        // Location-wise fee from CRM delivery areas (matches by area name or pincode)
        const areas = getStorefront().deliveryAreas || [];
        const areaName = (state.selectedArea || "").toLowerCase();
        const matched = areas.find(
          (a: any) =>
            (areaName && String(a.name).toLowerCase() === areaName) ||
            (state.pincode && a.pincode === state.pincode)
        );
        if (matched) return Number((matched as any).delivery_fee ?? ds.deliveryFee);

        // Fallback: flat fee from CRM storefront config
        return ds.deliveryFee;
      },

      getDiscount: () => {
        const state = get();
        if (!state.appliedCoupon) return 0;

        const subtotal = state.getSubtotal();
        if (subtotal < (state.appliedCoupon.minOrderValue || 0)) return 0;

        return Math.round(
          resolveDiscountAmount({
            discountType: state.appliedCoupon.discountType,
            discountValue: state.appliedCoupon.discountValue,
            maxDiscountAmount: state.appliedCoupon.maxDiscountAmount,
            subtotal,
          })
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount + deliveryFee);
      },

      getItemCount: () => {
        const items = get().items || [];
        return items.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
      },
    }),
    {
      name: "panna_biryani_cart_v2",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            items: [],
            orderType: "delivery",
            selectedArea: "Vesu",
            pincode: "395007",
            appliedCoupon: null,
            specialInstructions: "",
          };
        }
        const stateObj = persistedState as Record<string, unknown>;
        const rawItems = Array.isArray(stateObj.items) ? stateObj.items : [];
        return {
          ...stateObj,
          selectedArea: (stateObj.selectedArea as string) || "Vesu",
          pincode: (stateObj.pincode as string) || "395007",
          orderType: (stateObj.orderType as "delivery" | "takeaway") || "delivery",
          items: rawItems.filter(
            (item): item is CartItem =>
              Boolean(
                item &&
                typeof item === "object" &&
                "id" in item &&
                typeof (item as Record<string, unknown>).totalPrice === "number" &&
                !isNaN((item as Record<string, unknown>).totalPrice as number)
              )
          ),
        };
      },
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        selectedArea: state.selectedArea,
        pincode: state.pincode,
        appliedCoupon: state.appliedCoupon,
        specialInstructions: state.specialInstructions,
      }),
    }
  )
);

