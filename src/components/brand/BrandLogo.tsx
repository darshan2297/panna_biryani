import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "header" | "footer";
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  linkToHome?: boolean;
  priority?: boolean;
}

export function BrandLogo({
  size = "md",
  showText = false,
  className,
  imageClassName,
  linkToHome = true,
  priority = false,
}: BrandLogoProps) {
  const sizeMap = {
    sm: "w-11 h-auto",
    md: "w-16 h-auto",
    lg: "w-20 h-auto",
    xl: "w-24 h-auto",
    header: "w-[130px] sm:w-[165px] lg:w-[200px] xl:w-[210px] h-auto drop-shadow-xl",
    footer: "w-16 sm:w-20 h-auto",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      <Image
        src="/brand/panna-logo.png"
        alt="Panna Royal Dum Biryani - Made For Sharing"
        width={210}
        height={220}
        preload={priority}
        sizes="(max-width: 640px) 85px, (max-width: 1024px) 175px, 210px"
        className={cn(
          "object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.02]",
          sizeMap[size],
          imageClassName
        )}
      />

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-serif font-bold tracking-wide text-white text-lg sm:text-xl uppercase leading-tight">
            Panna Biryani
          </span>
          <span className="text-zinc-300 italic font-medium tracking-wide text-xs sm:text-[13px]">
            Biryani Made For Sharing
          </span>
        </div>
      )}
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
