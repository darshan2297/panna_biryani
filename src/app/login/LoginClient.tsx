"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserSessionStore } from "@/store/useUserSessionStore";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";

// WhatsApp brand icon SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.768.46 3.492 1.332 5.008L2 22l5.127-1.344a10.007 10.007 0 0 0 4.904 1.375h.004c5.535 0 10.031-4.496 10.031-10.031C22.066 6.496 17.566 2 12.031 2zm5.86 14.246c-.244.686-1.42 1.258-1.957 1.34-.51.077-1.176.11-3.666-.889-3.186-1.277-5.234-4.52-5.394-4.732-.157-.212-1.29-1.717-1.29-3.275 0-1.558.814-2.327 1.103-2.645.29-.319.632-.399.843-.399.21 0 .422.002.607.012.196.01.458-.075.717.545.267.635.91 2.223.99 2.384.079.16.133.348.025.563-.106.213-.16.346-.316.533-.158.187-.332.417-.474.56-.158.158-.323.33-.139.646.185.316.822 1.353 1.764 2.192 1.212 1.08 2.233 1.415 2.55 1.573.317.158.502.133.687-.08.185-.213.791-.92 1.002-1.237.211-.317.422-.264.712-.158.29.106 1.847.87 2.164 1.029.317.158.528.238.607.37.079.132.079.767-.165 1.453z" />
    </svg>
  );
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Phone, Step 2: WhatsApp OTP Code
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const { startSession, setOrders, isLoggedIn, user } = useUserSessionStore();

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect straight to profile or requested page
    if (isLoggedIn() && user) {
      router.push(redirectUrl);
    }
  }, [isLoggedIn, user, redirectUrl, router]);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!mounted) return null;

  // STEP 1: Request WhatsApp Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/auth/whatsapp-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: cleanPhone,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send WhatsApp code.");
      }

      toast.success(
        `WhatsApp verification code sent to +91 ${cleanPhone}!`,
        { duration: 5000 }
      );
      setStep(2);
      setCountdown(30);
      setCanResend(false);

      // Focus OTP input on next tick
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  // STEP 2: Verify WhatsApp Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanCode = otpCode.trim();

    if (cleanCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/whatsapp-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanPhone,
          code: cleanCode,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code.");
      }

      // Celebrate success
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#25D366", "#E8B94A", "#00241b"],
      });

      // Save user session — mark it OTP-verified so the
      // customer can apply promo codes (which require a
      // WhatsApp OTP login).
      startSession({ ...data.user, otpVerified: true });
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }

      toast.success(`Welcome back, ${data.user.name}! Session started.`);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[85vh] py-10 sm:py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E3DACB] p-6 sm:p-9 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00241b] border-2 border-[#E8B94A] text-[#E8B94A] flex items-center justify-center mx-auto shadow-sm">
            <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#007A55]">
              Royal Panna Account
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#00241b]">
              {step === 1 ? "Login with WhatsApp" : "Verify WhatsApp Code"}
            </h1>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              {step === 1
                ? "Enter your mobile number to get a 6-digit verification code on WhatsApp."
                : `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, "").slice(-10)} via WhatsApp.`}
            </p>
          </div>
        </div>

        {/* STEP 1 FORM: Mobile Number & Name */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="login-name"
                className="block text-xs font-bold text-[#00241b] mb-1.5"
              >
                Your Full Name <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="login-name"
                  type="text"
                  placeholder="e.g. Darshan Vora"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E3DACB] rounded-xl text-sm px-3.5 py-2.5 text-[#00241b] focus:outline-none focus:border-[#007A55]"
                />
                <User className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-phone"
                className="block text-xs font-bold text-[#00241b] mb-1.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-zinc-100 border border-r-0 border-[#E3DACB] px-3.5 py-2.5 rounded-l-xl text-xs font-bold text-zinc-700 select-none">
                  +91
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  maxLength={10}
                  autoFocus
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E3DACB] rounded-r-xl text-sm px-3.5 py-2.5 text-[#00241b] font-semibold focus:outline-none focus:border-[#007A55]"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>We will send your verification code directly to WhatsApp.</span>
              </p>
            </div>

            <button
              id="login-send-code-btn"
              type="submit"
              disabled={isSending}
              className="w-full h-12 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white font-bold text-sm tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-2"
            >
              {isSending ? (
                <span>Sending WhatsApp Code...</span>
              ) : (
                <>
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>Send Code via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 text-[#E8B94A]" />
                </>
              )}
            </button>

          </form>
        )}

        {/* STEP 2 FORM: 6-Digit WhatsApp Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Mobile number indicator & edit button */}
            <div className="bg-[#FCFAF7] border border-[#E3DACB] rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span className="font-mono font-bold text-zinc-900">
                  +91 {phone.replace(/\D/g, "").slice(-10)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode("");
                }}
                className="text-[#007A55] hover:text-[#00553b] font-bold text-[11px] hover:underline cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <div>
              <label
                htmlFor="whatsapp-otp-input"
                className="block text-xs font-bold text-[#00241b] mb-1.5"
              >
                6-Digit WhatsApp Code <span className="text-red-500">*</span>
              </label>
              <input
                id="whatsapp-otp-input"
                ref={otpInputRef}
                type="text"
                maxLength={6}
                autoFocus
                placeholder="1 2 3 4 5 6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#FAF7F2] border border-[#E3DACB] rounded-xl text-center text-xl sm:text-2xl font-mono font-black tracking-[0.5em] py-3 text-[#00241b] focus:outline-none focus:border-[#007A55]"
                required
              />
            </div>

            <button
              id="login-verify-code-btn"
              type="submit"
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full h-12 rounded-xl bg-[#003F32] hover:bg-[#002e24] text-white font-bold text-sm tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {isVerifying ? (
                <span>Verifying WhatsApp Code...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#E8B94A]" />
                  <span>Verify & Login</span>
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="text-center pt-1 text-xs">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="font-bold text-[#007A55] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend WhatsApp Code</span>
                </button>
              ) : (
                <p className="text-zinc-500 text-[11px]">
                  Resend WhatsApp code in <span className="font-bold text-zinc-700">{countdown}s</span>
                </p>
              )}
            </div>
          </form>
        )}

        {/* Benefits footer */}
        <div className="pt-4 border-t border-[#E3DACB]/70 space-y-2 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>View past order history & itemized invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Track live handi cooking & doorstep delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>1-Click reorder your favorite slow-cooked feast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
