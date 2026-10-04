"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service if desired
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-6 bg-[#faf7f2]">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-panna-deep">
          We couldn&apos;t complete your request
        </h1>
        <p className="text-zinc-600 text-xs sm:text-sm max-w-md mx-auto">
          A temporary issue occurred while loading this page. Please try refreshing or return to the
          homepage.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-panna-deep font-semibold px-6 py-2.5 rounded-full text-xs border border-panna-border transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
