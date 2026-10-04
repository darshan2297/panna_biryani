import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center space-y-6 bg-[#faf7f2]">
      <div className="w-20 h-20 rounded-full bg-panna-cream-muted border-2 border-panna-gold/50 flex items-center justify-center text-panna-deep shadow-md">
        <span className="font-serif font-black text-3xl text-panna-gold-dark">404</span>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-black text-panna-deep">Page Not Found</h1>
        <p className="text-zinc-600 text-xs sm:text-sm max-w-md mx-auto">
          The page or biryani you&apos;re looking for doesn&apos;t exist or has moved. Explore our fresh dum
          menu to find what you crave.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-7 py-3 rounded-full text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
        >
          <span>Explore Biryani Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-panna-deep font-semibold px-6 py-3 rounded-full text-xs border border-panna-border transition-colors"
        >
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
