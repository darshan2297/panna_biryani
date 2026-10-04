import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Ban, CheckCircle2, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section
      aria-label="Panna Biryani introduction"
      className="relative isolate w-full min-h-[520px] sm:min-h-[440px] lg:min-h-[460px] xl:min-h-[clamp(460px,28vw,520px)] bg-[#00241b] text-white overflow-hidden select-none"
    >
      {/* Mobile: portrait biryani image fills full viewport */}
      <Image
        src="/hero/panna-hero-mobile.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover object-[center_60%] sm:hidden"
      />

      {/* Tablet + Desktop: use the banner image for all wider breakpoints.
          object-[38%_center] keeps the biryani pot as visible as possible
          while leaving dark-green space on the left for text contrast. */}
      <Image
        src="/hero/panna-hero-banner.jpg"
        alt=""
        fill
        sizes="100vw"
        className="hidden sm:block object-cover object-[38%_center]"
      />

      {/* Gradient — stronger vertical fade on mobile, horizontal on sm+ */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#001f18]/92 via-[#001f18]/55 to-[#001f18]/20 sm:hidden pointer-events-none" />
      <div className="absolute inset-0 z-[1] hidden sm:block bg-gradient-to-r from-[#001f18]/90 via-[#001f18]/60 via-[45%] to-transparent pointer-events-none" />

      <div className="relative z-10 w-full h-full min-h-[inherit] max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28 flex flex-col">

        {/* Hero text — pt clears the overflowing logo:
            logo = 130px mobile / 165px sm / 200px lg
            header = 60px
            overflow into hero = 70px / 105px / 140px
            pt = overflow + ~20px breathing room */}
        <div className="pt-[100px] sm:pt-[125px] lg:pt-[160px] xl:pt-[165px] pb-4 sm:pb-6 space-y-2.5 sm:space-y-3.5 max-w-[320px] sm:max-w-[400px] lg:max-w-[460px] xl:max-w-[500px] 3xl:max-w-[580px] pointer-events-auto">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-[#E8B94A] text-[11px] sm:text-[13px] font-bold tracking-[0.22em] uppercase">
              PREMIUM VEG BIRYANIS
            </p>
            <h1 className="font-serif text-[28px] xs:text-[32px] sm:text-[38px] lg:text-[46px] xl:text-[52px] 3xl:text-[62px] font-bold text-white leading-[1.1] tracking-tight">
              Authentic Flavours,<br />Royal Experience
            </h1>
            <p className="text-white/90 text-[12px] sm:text-[14px] font-medium leading-relaxed flex items-center flex-wrap pt-0.5 sm:pt-1">
              <span>Slow-cooked</span>
              <span className="text-[#E8B94A]/70 mx-1.5 sm:mx-2.5">|</span>
              <span>Fresh Ingredients</span>
              <span className="text-[#E8B94A]/70 mx-1.5 sm:mx-2.5">|</span>
              <span>Made with Love</span>
            </p>
          </div>

          <div className="pt-2 sm:pt-3">
            <Link
              href="/menu"
              className="relative z-30 inline-flex items-center gap-2 bg-[#E8B94A] hover:bg-[#dca835] text-[#00291F] font-bold text-[13px] sm:text-[15px] px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full tracking-wider shadow-lg transition-all active:scale-95 group"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#00291F] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Trust bar — mt-auto pins it to the bottom of the flex column */}
        <div className="mt-auto self-start flex items-center gap-2.5 sm:gap-5 text-white/90 mb-5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/20 backdrop-blur-[2px] border border-white/10 overflow-x-auto no-scrollbar max-w-full">
          <div className="flex items-center gap-2 pr-4 sm:pr-5 border-r border-white/20">
            <Leaf className="w-3.5 h-3.5 text-white stroke-[2] shrink-0" />
            <div className="text-[10px] leading-tight font-medium text-white/90">
              <p>Freshly</p>
              <p>Prepared</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-4 sm:pr-5 border-r border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-white stroke-[2] shrink-0" />
            <div className="text-[10px] leading-tight font-medium text-white/90">
              <p>Hygienic</p>
              <p>Kitchen</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-4 sm:pr-5 border-r border-white/20">
            <Ban className="w-3.5 h-3.5 text-white stroke-[2] shrink-0" />
            <div className="text-[10px] leading-tight font-medium text-white/90">
              <p>No</p>
              <p>Preservatives</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2] shrink-0" />
            <div className="text-[10px] leading-tight font-medium text-white/90">
              <p>100%</p>
              <p>Veg</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
