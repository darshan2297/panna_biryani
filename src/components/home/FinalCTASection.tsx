import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-16 bg-[#081d15] text-white border-t border-panna-gold/30 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-panna-forest/40 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-panna-gold/20 text-panna-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-panna-gold/40">
          <Sparkles className="w-3.5 h-3.5 text-panna-gold" />
          <span>Freshly Prepared Upon Order</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Ready To Share?
        </h2>

        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
          Bring your family and loved ones together around hot, aromatic dum biryani. Prepared with
          love and delivered to your doorstep in Surat.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-8 py-3.5 rounded-full text-sm sm:text-base uppercase tracking-wider shadow-xl transition-all active:scale-95 group"
          >
            <span>Order Panna Biryani</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/bulk-orders"
            className="inline-flex items-center gap-2 bg-[#12372a] hover:bg-[#1a4b3a] text-white font-semibold px-6 py-3.5 rounded-full text-sm sm:text-base border border-panna-gold/40 transition-colors"
          >
            <span>Plan A Bulk Order</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
