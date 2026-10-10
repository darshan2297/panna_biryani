"use client";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { useStorefrontStore } from "@/store/useStorefrontStore";

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping & Delivery Policy", href: "/shipping-delivery-policy" },
];

export function Footer() {
  useStorefrontStore((s) => s.config);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#00241b] text-white border-t border-[#e8b94a]/30 select-none">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1850px] 3xl:max-w-[2400px] 4k:max-w-[3200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 4k:px-28 pt-8 pb-6">
        {/* MOBILE VIEW (< md): Balanced, structured, premium mobile layout */}
        <div className="md:hidden space-y-6 pb-6">
          {/* Top Row: Brand & Socials */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
            <BrandLogo size="footer" showText={true} />
            <div className="flex items-center gap-2">
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 2 Equal Columns: Quick Links & Contact */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <h4 className="text-[12px] font-bold text-[#E8B94A] tracking-wider uppercase mb-2.5">
                Quick Links
              </h4>
              <ul className="space-y-1.5 text-[12px] text-white/80">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="hover:text-white transition-colors">
                    Our Menu
                  </Link>
                </li>
                <li>
                  <Link href="/menu#combos" className="hover:text-white transition-colors">
                    Combos &amp; Packs
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-bold text-[#E8B94A] tracking-wider uppercase mb-2.5">
                Contact &amp; Hours
              </h4>
              <ul className="space-y-2 text-[11.5px] text-white/80">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E8B94A] shrink-0" />
                  <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white truncate">
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#E8B94A] shrink-0" />
                  <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white truncate">
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E8B94A] shrink-0" />
                  <span>Surat, Gujarat</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E8B94A] shrink-0" />
                  <span>Mon–Fri 5–11 PM • Sat–Sun 11 AM–11 PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Scan to Order Card - Clean Full Width */}
          <div className="bg-white/5 border border-[#E8B94A]/30 p-2.5 rounded-2xl flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 p-0.5">
              <Image
                src="/images/brand/qr-code.png"
                alt="Scan to Order QR Code"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-[12px] leading-tight">Scan to Order</p>
                <span className="text-[9px] font-bold text-[#00241b] bg-[#E8B94A] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Direct Handi
                </span>
              </div>
              <p className="text-zinc-300 text-[10.5px] leading-tight mt-0.5">
                Vesu Cloud Kitchen • Fresh Dum Pickup &amp; Delivery
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW (>= md): Full horizontal column layout */}
        <div className="hidden md:flex flex-nowrap items-start justify-between gap-6 lg:gap-8 pb-6">
          {/* Column 1: Logo + Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo size="footer" showText={true} />
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2.5 shrink-0">
            <h4 className="text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-[12px] sm:text-[13px] text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link href="/menu#combos" className="hover:text-white transition-colors">
                  Combos &amp; Packs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-2.5 shrink-0">
            <h4 className="text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase">Contact</h4>
            <ul className="space-y-2 text-[12px] sm:text-[13px] text-white/80">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B94A] shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B94A] shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B94A] shrink-0" />
                <span>Surat, Gujarat</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B94A] shrink-0" />
                <span>Mon - Fri &nbsp;|&nbsp; 5 PM - 11 PM</span>
                <span>Sat - Sun &nbsp;|&nbsp; 11 AM - 11 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="space-y-2.5 shrink-0">
            <h4 className="text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase">Follow Us</h4>
            <div className="flex items-center gap-3 text-white/90">
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 5: Scan to Order QR Code */}
          <div className="bg-white text-zinc-900 p-2 sm:p-2.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-2.5 shrink-0">
            <div className="relative w-11 h-11 rounded-sm overflow-hidden bg-white shrink-0">
              <Image
                src="/images/brand/qr-code.png"
                alt="Scan to Order QR Code"
                fill
                className="object-contain"
              />
            </div>
            <div className="text-left pr-1">
              <p className="font-bold text-zinc-900 text-[11px] sm:text-[12px] leading-tight">Scan to Order</p>
              <p className="text-zinc-500 text-[10px] sm:text-[10.5px] leading-tight mt-0.5">Direct • Pickup • Delivery</p>
            </div>
          </div>
        </div>

        {/* Policies Bar */}
        <div className="border-t border-white/15 py-3.5">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] sm:text-[12px] text-white/75 leading-none">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap hover:text-[#E8B94A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-3 border-t border-white/15 text-[11px] sm:text-[12px] text-white/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {currentYear} Panna Biryani. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">Made with <span className="text-red-400">❤️</span> for Biryani Lovers</p>
        </div>
      </div>
    </footer>
  );
}
