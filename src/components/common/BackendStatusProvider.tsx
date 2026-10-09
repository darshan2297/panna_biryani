"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { BackendDown } from "./BackendDown";

interface BackendStatusContextValue {
  isBackendDown: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  recheck: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextValue>({
  isBackendDown: false,
  isChecking: true,
  lastChecked: null,
  recheck: async () => {},
});

// Probes the backend directly through our own proxy. NOT /api/shop-status —
// that route fails closed (HTTP 200 + fallback payload) when the CRM is down,
// so it reports "online" for an outage and the offline page never renders.
const HEALTH_ENDPOINT = "/api/health";
const POLL_INTERVAL_MS = 15_000;
const CHECK_TIMEOUT_MS = 8_000;

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const checkHealth = async () => {
    if (typeof window === "undefined") return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
      const res = await fetch(HEALTH_ENDPOINT, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (mountedRef.current) {
        setIsBackendDown(!res.ok);
        setIsChecking(false);
        setLastChecked(new Date());
      }
    } catch {
      clearTimeout(timeout);
      if (mountedRef.current) {
        setIsBackendDown(true);
        setIsChecking(false);
        setLastChecked(new Date());
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") checkHealth();
    };
    // Recover as soon as the network comes back rather than waiting a poll.
    const onOnline = () => checkHealth();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <BackendStatusContext.Provider
      value={{
        isBackendDown,
        isChecking,
        lastChecked,
        recheck: checkHealth,
      }}
    >
      {isChecking ? (
        // Hold the page until the probe resolves. Rendering children first would
        // flash the half-rendered storefront for ~1 frame before the offline
        // page replaced it, which is exactly the broken view we're avoiding.
        <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
          <div className="w-10 h-10 rounded-full border-2 border-panna-gold/30 border-t-panna-gold animate-spin" />
        </div>
      ) : isBackendDown ? (
        <BackendDown />
      ) : (
        children
      )}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  return useContext(BackendStatusContext);
}
