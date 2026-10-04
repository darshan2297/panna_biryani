import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flame, Leaf, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Panna Biryani - Authentic Veg Dum Biryani in Surat",
  description:
    "Learn about Panna Biryani, a premium vegetarian dum biryani cloud kitchen in Vesu, Surat. Slow-cooked with aged basmati, pure cow ghee, and royal whole spices.",
  openGraph: {
    title: "About Panna Biryani Surat | Biryani Made For Sharing",
    description:
      "Surat's home for authentic vegetarian dum biryani slow-cooked under dough seal. Our story, ingredients, and kitchen ethics.",
    images: ["/images/food/hero-biryani.jpg"],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#faf7f2] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-[#091c15] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-panna-gold/25 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-panna-gold font-bold">
            Our Kitchen Story
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white">
            Biryani Made For Sharing
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Born out of a simple desire in Surat: bringing people together around authentic,
            uncompromised vegetarian dum biryani cooked the way royalty enjoyed it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden border-2 border-panna-border shadow-xl">
            <Image
              src="/images/food/hero-biryani.jpg"
              alt="Panna Biryani Slow Dum Cooking"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
              The Philosophy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-panna-deep">
              No Shortcuts. True Dum Cooking.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              In most cities, vegetable biryani has unfortunately become boiled rice hurriedly tossed
              with curry paste in a hot wok. That is pulav, not biryani.
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              At Panna Biryani, we do things the traditional way. Long-grain royal basmati rice is
              layered with tender vegetables or fresh dairy paneer, fresh mint, coriander, and
              fragrant spices. The handi is sealed with dough (purdah) and slow-cooked over gentle
              dum heat so the flavors marry together inside their own natural steam.
            </p>
          </div>
        </div>

        {/* 3 Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-panna-green-light flex items-center justify-center text-panna-forest">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-panna-deep">100% Vegetarian Purity</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Our cloud kitchen in Surat is strictly pure vegetarian. No meat or egg is ever stored
              or prepared in our facility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-panna-green-light flex items-center justify-center text-panna-forest">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-panna-deep">Pure Desi Cow Ghee</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              We never cut corners with cheap palm oils or artificial aromas. We finish every handi
              with real desi cow ghee and toasted cashews.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-panna-green-light flex items-center justify-center text-panna-forest">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-panna-deep">Portions For Gatherings</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Food is best when shared. Our 500g, 750g, and 1kg handis are designed to create warm
              moments around family dining tables.
            </p>
          </div>
        </div>

        {/* Cloud Kitchen Location Surat */}
        <div className="bg-[#12372a] text-white p-8 rounded-3xl border border-panna-gold/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold text-panna-gold tracking-widest">
              Based in Surat, Gujarat
            </span>
            <h3 className="font-serif text-2xl font-bold text-white">
              Prepared Fresh in Adajan, Delivered Hot Across the City
            </h3>
            <p className="text-xs text-zinc-300 max-w-lg">
              Visit our pickup counter or place a delivery order to experience genuine dum cooking.
            </p>
          </div>

          <Link
            href="/menu"
            className="bg-panna-gold hover:bg-[#d8af37] text-panna-deep font-bold px-7 py-3 rounded-full text-xs uppercase tracking-wider shrink-0 transition-transform active:scale-95 flex items-center gap-2 shadow-md"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
