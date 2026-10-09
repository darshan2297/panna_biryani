"use client";

import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "error" | "warning" | "success" | "info";

const TONE: Record<Tone, { wrap: string; icon: React.ElementType; iconColor: string }> = {
  error: {
    wrap: "bg-red-50 border-red-200 text-red-800",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200 text-amber-900",
    icon: AlertCircle,
    iconColor: "text-amber-600",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  info: {
    wrap: "bg-slate-50 border-slate-200 text-slate-700",
    icon: Info,
    iconColor: "text-slate-500",
  },
};

/**
 * Single presentation for every promo outcome, so an invalid code always
 * reads the same way across the cart page, the cart drawer and checkout.
 */
export function CouponMessage({
  tone,
  children,
  className,
  action,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  action?: { label: string; onClick: () => void };
}) {
  const { wrap, icon: Icon, iconColor } = TONE[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed",
        wrap,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1">{children}</div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}