"use client";

import { useState } from "react";
import { Phone, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  code: string;
  error: string;
  onCancel: () => void;
  onSubmit: (phone: string) => Promise<void>;
}

/**
 * Shown when a promo is gated on customer identity (first-order-only, or a
 * new/returning segment). The cart has no phone yet, so we ask for one and
 * re-validate server-side before the coupon is accepted.
 */
export function CouponPhonePrompt({ code, error, onCancel, onSubmit }: Props) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const digits = phone.replace(/\D/g, "").slice(-10);
  const valid = digits.length === 10;

  const submit = async () => {
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onSubmit(digits);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2.5">
      <div className="flex items-start gap-2">
        <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-900 leading-relaxed">
          <span className="font-bold">{code}</span> is limited to certain customers. Enter your
          10-digit mobile number — we&apos;ll sign you in (or create your account) and check
          eligibility.
        </div>
      </div>

      {/* Not a nested <form>: this sits inside the coupon <form>, and nesting
          forms is invalid HTML — browsers drop the inner one, so "Check"
          submitted the OUTER form and reloaded the page. */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            className="w-full bg-white border border-amber-300 rounded-lg text-xs pl-7 pr-2 py-2 font-semibold text-panna-deep focus:outline-none focus:border-amber-500"
          />
          <Phone className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!valid || busy}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Verify
        </button>
      </div>

      {touched && !valid && (
        <p className="text-[11px] text-red-600">Enter a valid 10-digit mobile number.</p>
      )}
      {error && (
        <p className="text-[11px] text-red-700 font-medium leading-relaxed">{error}</p>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="text-[11px] text-amber-800 hover:underline font-semibold"
      >
        Cancel
      </button>
    </div>
  );
}