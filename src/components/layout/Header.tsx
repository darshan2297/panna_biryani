"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useCartStore } from "@/store/useCartStore";
import { useUserSessionStore } from "@/store/useUserSessionStore";
import { useShopStatus } from "@/components/shop/ShopStatusProvider";
import { formatINR, cn } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const { getTotal, getItemCount, setCartDrawerOpen } = useCartStore();
  const { user, isLoggedIn } = useUserSessionStore();
  const { isOpen, businessHours, closedMessage, hydrated } = useShopStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActiveSession = mounted && isLoggedIn();
  const showClosed = mounted && hydrated && !isOpen;

  const totalAmount = mounted ? getTotal() : 0;
  const itemCount = mounted ? getItemCount() : 0;

  // The oversized mark belongs to the home hero only. Everywhere else -- and on
  // home once the mobile menu opens -- the logo drops to a compact height so it
  // stays inside the 64px bar instead of crossing into the banner/content below.
  const showBannerLogo = pathname === "/" && !mobileMenuOpen;
  const logoSize: "banner" | "compact" = showBannerLogo ? "banner" : "compact";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Our Menu", href: "/menu" },
    { label: "Combos & Packs", href: "/menu#combos" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-[64px] bg-[#00241b] border-b border-[#e8b94a]/30 text-white select-none overflow-visible">
        <div className="w-full h-full max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28 relative flex items-center justify-between">
          {/* Logo. The compact mark is centred inside the 64px header; the banner
            mark hangs from the top so it overlaps the hero deliberately. */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Panna Biryani Home"
            className={cn(
              // inline-flex, not a plain block: a block wrapper around an
              // inline-level child generates a line box, and the inherited 24px
              // line-height added a ~6px descender gap, making this box 54px tall
              // around a 48px logo. "self-center" then centred the gap and left
              // the logo sitting 3px above the middle of the bar.
              "shrink-0 z-[60] relative inline-flex transition-all duration-300 ease-in-out",
              showBannerLogo ? "self-start" : "self-center my-auto"
            )}
          >
            <BrandLogo
              size={logoSize}
              showText={!showBannerLogo}
              label="Panna Biryani"
              highlightFirstWord
              priority
              linkToHome={false}
              className="transition-all duration-300 ease-in-out"
              imageClassName="transition-all duration-300 ease-in-out"
            />
          </Link>

          {/* Navigation sits at a predictable distance from the logo. The type is a
            little smaller than it used to be (15.5px at xl read as oversized inside
            the 64px bar) and the left margin is wider, so the links breathe away
            from the wordmark instead of crowding it -- there is spare room on every
            laptop width, it was just being wasted. */}
          <nav className="hidden lg:flex min-w-0 items-center gap-3 xl:gap-5 2xl:gap-7 3xl:gap-9 4k:gap-11 ml-6 lg:ml-8 xl:ml-12 2xl:ml-16 3xl:ml-20 text-[13.5px] xl:text-[14.5px] 2xl:text-[15.5px] 3xl:text-[17px] 4k:text-[19px] font-medium text-white/90">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-white py-1 whitespace-nowrap",
                    // The active page wears the header's accent gold (#E8B94A --
                    // same token as the cart pill and login pill), not the
                    // dimmer brand gold used for the wordmark. On #00241b that
                    // is a 9:1 contrast ratio, so the current page still reads
                    // as the highlighted item for low-vision users.
                    isActive
                      ? "text-[#E8B94A] font-bold"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: User icon, Cart with red badge & price */}
          <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 ml-auto mr-2 sm:mr-4 lg:mr-8 xl:mr-12 2xl:mr-16">
            {/* Shop Open / Closed status pill */}
            <div
              className={cn(
                "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-colors",
                !mounted || !hydrated
                  ? "border-white/20 text-white/70"
                  : showClosed
                    ? "border-rose-400/60 bg-rose-500/15 text-rose-200"
                    : "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
              )}
              title={
                showClosed
                  ? businessHours.next_open_text
                    ? `Closed • Opens ${businessHours.next_open_text}`
                    : "Currently closed"
                  : `Open • ${businessHours.display_hours}`
              }
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  !mounted || !hydrated
                    ? "bg-white/40"
                    : showClosed
                      ? "bg-rose-400"
                      : "bg-emerald-400 animate-pulse"
                )}
              />
              {!mounted || !hydrated ? (
                <span>Hours</span>
              ) : showClosed ? (
                <span>Closed</span>
              ) : (
                <span>Open Now</span>
              )}
            </div>

            {/* User Icon — only displayed when a user session is active */}
            {hasActiveSession ? (
              <Link
                href="/profile"
                id="header-user-btn"
                aria-label="My Account & Order History"
                title={
                  user
                    ? `${user.name} • ${user.tag || "Royal Patron"} (+91 ${user.phone})`
                    : "My Account"
                }
                className="relative p-1 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer group"
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={28}
                    height={28}
                    unoptimized
                    className="w-7 h-7 rounded-full object-cover border-2 border-[#E8B94A] group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <User className="w-5 h-5 sm:w-[22px] sm:h-[22px] stroke-[2] text-[#E8B94A] group-hover:scale-110 transition-transform" />
                )}
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#00241b]" />
              </Link>
            ) : (
              mounted && (
                <Link
                  href="/login"
                  id="header-login-btn"
                  aria-label="Login with WhatsApp"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E8B94A]/60 hover:border-[#E8B94A] bg-white/5 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <span>Login</span>
                </Link>
              )
            )}

            {/* Cart Icon with Border, Red Badge & Total — opens the cart drawer */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border-[1.5px] border-[#E8B94A] hover:border-[#F2C94C] bg-white/5 hover:bg-white/15 text-white transition-all duration-200 active:scale-95 group cursor-pointer shadow-xs"
              aria-label={`Cart with ${mounted ? itemCount : 0} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-[#E8B94A] group-hover:scale-105 transition-transform" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#d32f2f] text-white font-bold text-[10.5px] sm:text-[11px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center leading-none shadow-md border-2 border-[#00241b]">
                    {itemCount}
                  </span>
                )}
              </div>

              <span className="text-[14.5px] sm:text-[15.5px] font-bold text-white tracking-tight">
                {mounted && itemCount > 0 ? formatINR(totalAmount) : "Cart"}
              </span>
            </button>

            {/* Mobile / Tablet Menu Toggle. Gated on `lg`, not `md`, so it matches the
                nav above: the old `md:hidden` hid the hamburger from 768px up while
                the nav only appeared at 1024px, leaving tablets with no navigation. */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 -mr-1 text-white hover:text-zinc-200 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#00241b] border-t border-[#e8b94a]/30 px-5 pt-3 pb-5 space-y-3 shadow-xl">
            {/* Active user session banner in mobile menu */}
            {hasActiveSession && user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 text-white border border-[#E8B94A]/40 transition-colors hover:bg-white/15"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#E8B94A] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#E8B94A] text-[#00241b] font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                    <span>{user.name}</span>
                    {user.tag && (
                      <span className="text-[10px] font-semibold text-[#E8B94A] bg-[#E8B94A]/20 border border-[#E8B94A]/40 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                        {user.tag}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-300 font-mono">+91 {user.phone}</p>
                </div>
                <span className="text-[11px] font-bold text-[#E8B94A] uppercase tracking-wide shrink-0">
                  My Orders →
                </span>
              </Link>
            ) : (
              mounted && (
                <Link
                  href="/login"
                  id="mobile-login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/10 text-white border border-[#E8B94A]/40 transition-colors hover:bg-white/15"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">Login / Register</p>
                      <p className="text-[11px] text-zinc-300">Fast WhatsApp code login</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#E8B94A]">Login →</span>
                </Link>
              )
            )}

            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search your favourite biryani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm rounded-full pl-3.5 pr-9 focus:outline-none"
              />
              <Search className="w-4 h-4 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <div className="flex flex-col space-y-2 pt-1 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-zinc-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Closed banner — shown under the header on all pages while the shop is closed.
        On mobile the left half is covered by the decorative brand art, so the
        message is pushed to the right; from sm up there is room to centre it. */}
      {showClosed && (
        <div className="sticky top-[64px] z-40 w-full bg-rose-700 text-white text-right sm:text-center text-[12px] sm:text-[13px] font-semibold px-4 py-2 flex items-center justify-end sm:justify-center gap-2 shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="min-w-0">{closedMessage || "We are currently closed."}</span>
        </div>
      )}
    </>
  );
}
