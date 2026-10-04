import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Order } from "@/types";
import { getDeterministicRoyalTag } from "@/lib/royalTags";

export interface UserProfile {
  name: string;
  phone: string; // 10-digit mobile number as unique key
  email?: string;
  avatarUrl?: string;
  tag?: string; // Royal culinary title / tag
  createdAt: string;
}

interface UserSessionState {
  user: UserProfile | null;
  orders: Order[]; // client-persisted order history

  // Actions
  startSession: (
    userData: { name: string; phone: string; email?: string; avatarUrl?: string; tag?: string },
    initialOrder?: Order
  ) => void;
  endSession: () => void;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  isLoggedIn: () => boolean;
}

export const useUserSessionStore = create<UserSessionState>()(
  persist(
    (set, get) => ({
      user: null,
      orders: [],

      startSession: (userData, initialOrder) => {
        const cleanPhone = userData.phone.replace(/\D/g, "").slice(-10);
        const assignedTag =
          userData.tag?.trim() || getDeterministicRoyalTag(cleanPhone || userData.name).title;
        const newUser: UserProfile = {
          name: userData.name.trim(),
          phone: cleanPhone,
          email: userData.email?.trim() || undefined,
          avatarUrl: userData.avatarUrl || undefined,
          tag: assignedTag,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const currentOrders = Array.isArray(state.orders) ? [...state.orders] : [];
          if (initialOrder) {
            const exists = currentOrders.some(
              (o) => o.id === initialOrder.id || o.orderNumber === initialOrder.orderNumber
            );
            if (!exists) {
              currentOrders.unshift(initialOrder);
            }
          }
          return {
            user: newUser,
            orders: currentOrders,
          };
        });
      },

      endSession: () => {
        set({ user: null, orders: [] });
      },

      addOrder: (order) => {
        set((state) => {
          const currentOrders = Array.isArray(state.orders) ? [...state.orders] : [];
          const existsIndex = currentOrders.findIndex(
            (o) => o.id === order.id || o.orderNumber === order.orderNumber
          );
          if (existsIndex >= 0) {
            currentOrders[existsIndex] = order;
          } else {
            currentOrders.unshift(order);
          }
          return { orders: currentOrders };
        });
      },

      setOrders: (orders) => {
        set({ orders: Array.isArray(orders) ? orders : [] });
      },

      updateUser: (data) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...data },
          };
        });
      },

      isLoggedIn: () => {
        const user = get().user;
        return Boolean(user && user.phone && user.phone.length >= 10);
      },
    }),
    {
      name: "panna_user_session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
