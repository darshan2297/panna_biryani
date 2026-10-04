"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ShopStatus, PublicBusinessHours } from "@/types";

interface ShopStatusContextValue {
  status: ShopStatus;
  businessHours: PublicBusinessHours;
  isOpen: boolean;
  hydrated: boolean;
  statusText: string;
  nextOpenText: string | null;
  closedMessage: string;
  refresh: () => Promise<void>;
}

const DEFAULT_BUSINESS_HOURS: PublicBusinessHours = {
  is_open: true,
  auto_schedule_enabled: false,
  display_hours: "5:00 PM - 11:00 PM",
  status_text: "Accepting Orders",
  next_open_text: null,
  holiday_message: null,
  full_schedule: {},
};

const DEFAULT_STATUS: ShopStatus = {
  website_open: true,
  is_open: true,
  business_hours: DEFAULT_BUSINESS_HOURS,
};

const ShopStatusContext = createContext<ShopStatusContextValue>({
  status: DEFAULT_STATUS,
  businessHours: DEFAULT_BUSINESS_HOURS,
  isOpen: true,
  hydrated: false,
  statusText: "Accepting Orders",
  nextOpenText: null,
  closedMessage: "",
  refresh: async () => {},
});

const POLL_INTERVAL_MS = 60_000;

export function ShopStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ShopStatus>(DEFAULT_STATUS);
  const [hydrated, setHydrated] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/shop-status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ShopStatus;
      if (mountedRef.current) {
        setStatus({
          ...DEFAULT_STATUS,
          ...data,
          business_hours: { ...DEFAULT_BUSINESS_HOURS, ...(data.business_hours || {}) },
        });
        setHydrated(true);
      }
    } catch {
      // Fail open — keep the last known (or default open) state.
      if (mountedRef.current) setHydrated(true);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const isOpen = status.website_open !== false && status.is_open !== false;

  // Resolved copy that already accounts for the manual master switch.
  const statusText =
    status.status_text || status.business_hours.status_text || "Accepting Orders";
  const nextOpenText = status.next_open_text ?? status.business_hours.next_open_text ?? null;

  const closedMessage = (() => {
    if (isOpen) return "";
    const base = statusText || "We are currently closed.";
    if (nextOpenText) {
      return `${base} We open ${nextOpenText.toLowerCase()}.`;
    }
    return base;
  })();

  return (
    <ShopStatusContext.Provider
      value={{
        status,
        businessHours: status.business_hours,
        isOpen,
        hydrated,
        statusText,
        nextOpenText,
        closedMessage,
        refresh,
      }}
    >
      {children}
    </ShopStatusContext.Provider>
  );
}

export function useShopStatus() {
  return useContext(ShopStatusContext);
}
