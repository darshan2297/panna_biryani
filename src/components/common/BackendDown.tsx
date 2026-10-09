"use client";

import Link from "next/link";
import { ServerCrash, RefreshCw, Home, WifiOff } from "lucide-react";

export function BackendDown() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#faf7f2]">
      <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm mb-6">
        <ServerCrash className="w-10 h-10" />
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-panna-deep">
          Kitchen is Temporarily Offline
        </h1>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Our ordering system is temporarily unavailable. Please check back in a few moments —
          we&apos;re working to get things back up and running.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-panna-deep font-semibold px-6 py-2.5 rounded-full text-xs border border-panna-border transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Homepage</span>
        </Link>
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-zinc-400">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Backend service unreachable</span>
      </div>
    </div>
  );
}
