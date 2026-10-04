"use client";

import { siteConfig } from "@/data/siteConfig";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function WhatsAppFloatButton() {
  useStorefrontStore((s) => s.config);
  const pathname = usePathname();

  // If on checkout or order success, don't obstruct payment UI
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order-success")) {
    return null;
  }

  const defaultMsg = encodeURIComponent(
    "Hello Panna Biryani! I would like to enquire about ordering authentic veg dum biryani in Surat."
  );

  return (
    <aside aria-label="Quick contact" className="fixed bottom-20 right-5 z-40 flex md:hidden items-center group">
      {/* Tooltip on hover */}
      <span className="hidden mr-2 px-3 py-1.5 bg-[#0c281e] text-panna-gold text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-panna-gold/40">
        Order or enquire on WhatsApp
      </span>

      <a
        href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${defaultMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Panna Biryani on WhatsApp"
        className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/80"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </a>
    </aside>
  );
}
