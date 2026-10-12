"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStorefrontStore, getStorefrontImage } from "@/store/useStorefrontStore";

interface BrandLogoProps {
  /**
   * `compact` is the default header mark and is sized by HEIGHT so it always
   * fits inside the 64px header bar. `banner` is the oversized mark used only on
   * the home hero, where spilling over the banner is deliberate.
   */
  size?: "sm" | "md" | "lg" | "xl" | "compact" | "banner" | "footer";
  showText?: boolean;
  /** Brand name shown beside the mark. Defaults to the footer's wording. */
  label?: string;
  /** Tint the first word with --color-panna-gold (opt-in; the footer is unchanged). */
  highlightFirstWord?: boolean;
  className?: string;
  imageClassName?: string;
  linkToHome?: boolean;
  priority?: boolean;
}

export function BrandLogo({
  size = "md",
  showText = false,
  label = "Panna Biryani",
  highlightFirstWord = false,
  className,
  imageClassName,
  linkToHome = true,
  priority = false,
}: BrandLogoProps) {
  useStorefrontStore((s) => s.config);
  const sizeMap = {
    sm: "w-11 h-auto",
    md: "w-16 h-auto",
    lg: "w-20 h-auto",
    xl: "w-24 h-auto",
    // The asset is near-square (733x752), so width-based sizing made the mark
    // as TALL as it was wide -- a 210px-wide logo rendered ~216px tall and
    // overflowed the 64px header by 152px on desktop. Sizing by height keeps
    // the compact mark safely inside the bar at every breakpoint.
    compact: "h-10 sm:h-11 lg:h-12 w-auto drop-shadow-xl",
    // Home hero only, where the oversized mark overlaps the banner on purpose.
    // Heights (not widths) so the resize is tweenable: CSS cannot interpolate
    // to/from `height: auto`, so an `h-auto` banner snapped instantly instead
    // of growing smoothly. These heights reproduce the previous widths
    // (130/165/200/210px) to within a pixel.
    banner: "h-[134px] sm:h-[170px] lg:h-[205px] xl:h-[216px] w-auto drop-shadow-xl",
    footer: "w-16 sm:w-20 h-auto",
  };

  // Without an accurate `sizes`, the browser assumes the logo spans the whole
  // viewport and pulls a ~210px candidate even when only ~48px is rendered.
  const sizesMap: Partial<Record<NonNullable<BrandLogoProps["size"]>, string>> = {
    compact: "(max-width: 640px) 39px, (max-width: 1024px) 43px, 47px",
    banner: "(max-width: 640px) 130px, (max-width: 1024px) 165px, 210px",
  };

  // Only the compact header mark animates its wordmark; the footer wordmark is
  // always shown and the banner header mark never shows one.
  const isCompactHeader = size === "compact";

  // Split the label so the leading word can carry the brand colour.
  const [headWord, ...rest] = label.trim().split(/\s+/);
  const tailWords = rest.join(" ");

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      <Image
        src={getStorefrontImage("logo")}
        alt="Panna Royal Dum Biryani - Made For Sharing"
        width={733}
        height={752}
        preload={priority}
        sizes={sizesMap[size] ?? "(max-width: 640px) 85px, (max-width: 1024px) 175px, 210px"}
        className={cn(
          "object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.02]",
          sizeMap[size],
          imageClassName
        )}
      />

      {/* Wordmark. Always rendered (rather than mounted/unmounted) so the header
          can collapse it smoothly when swapping between the banner mark and the
          compact one -- a conditional render would pop the text in and shove the
          nav sideways mid-transition.

          The collapse uses grid-template-columns 0fr -> 1fr, which animates
          because `fr` is interpolatable. A max-width would clip "BIRYANI" off
          the end, and `max-width: none` (needed to avoid that) cannot be
          transitioned at all. */}
      <div
        aria-hidden={!showText}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          // Shown from sm (640px). Below that the mark, cart pill and hamburger fill
          // the row on their own and the wordmark would overflow the viewport.
          isCompactHeader && "hidden sm:grid",
          showText ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden flex flex-col text-left">
          {/* Deliberately small: this is a wordmark beside the mark, not a
              heading. At heading sizes it consumed ~290px of the header row and
              squeezed the nav into the controls. "Panna" carries the brand
              colour (--color-panna-gold); the rest stays white for contrast. */}
          <span className="font-serif font-bold tracking-wide text-white text-[13px] xl:text-[15px] 2xl:text-base uppercase leading-tight whitespace-nowrap">
            <span className={cn(highlightFirstWord && "text-panna-gold")}>{headWord}</span>
            {tailWords ? ` ${tailWords}` : null}
          </span>
          <span className="text-zinc-300 italic font-medium tracking-wide text-[9px] xl:text-[10px] 2xl:text-[11px] whitespace-nowrap">
            Biryani Made For Sharing
          </span>
        </div>
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block" aria-label="Panna Biryani Home">
        {content}
      </Link>
    );
  }

  return content;
}
