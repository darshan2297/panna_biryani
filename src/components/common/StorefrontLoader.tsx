"use client";

import { useEffect } from "react";
import { useStorefrontStore } from "@/store/useStorefrontStore";

export function StorefrontLoader() {
  const load = useStorefrontStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return null;
}
