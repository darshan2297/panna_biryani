import { Flame, ShieldCheck, Leaf, Users, PackageCheck, Heart } from "lucide-react";

export function WhyPannaSection() {
  const pillars = [
    {
      icon: Flame,
      title: "Authentic Dum Cooking",
      description:
        "Slow-cooked in sealed handis over gentle dum heat. Never pre-mixed or tossed in woks like fast food.",
    },
    {
      icon: Leaf,
      title: "100% Pure Vegetarian Kitchen",
      description:
        "Dedicated strictly pure vegetarian cloud kitchen in Surat. Clean kitchen, sacred hygiene, pure desi cow ghee, and absolutely zero non-vegetarian ingredients.",
    },
    {
      icon: Users,
      title: "Made For Sharing",
      description:
        "Portion sizes and family packs specially designed to bring family, friends, and colleagues together around one table.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Preservatives",
      description:
        "No artificial colourings, MSG, or frozen premixes. Just whole spices, fresh curd, and aged basmati rice.",
    },
    {
      icon: PackageCheck,
      title: "Sealed Handi Packaging",
      description:
        "Delivered in thermal-safe, spill-proof packaging ensuring the biryani reaches your door piping hot and fragrant.",
    },
    {
      icon: Heart,
      title: "Complimentary Raita & Chutney",
      description:
        "Every order comes with fresh boondi or cucumber raita and tangy mint chutney made daily from scratch.",
    },
  ];

  return (
    <section className="py-16 bg-[#faf7f2] border-t border-panna-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
            The Panna Difference
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep mt-1">
            Why Surat Loves Panna Biryani
          </h2>
          <p className="text-zinc-600 text-sm mt-2">
            Every grain of rice is treated with the patience and respect authentic royal dum cooking
            deserves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white p-6 rounded-2xl border border-panna-border shadow-xs hover:border-panna-gold/70 hover:shadow-lg transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-panna-green-light border border-panna-forest/20 flex items-center justify-center text-panna-forest">
                  <Icon className="w-6 h-6 text-panna-forest" />
                </div>
                <h3 className="font-serif text-lg font-bold text-panna-deep">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
