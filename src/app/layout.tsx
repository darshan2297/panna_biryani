import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileStickyCart } from "@/components/cart/MobileStickyCart";
import { WhatsAppFloatButton } from "@/components/common/WhatsAppFloatButton";
import { RestaurantJsonLd } from "@/components/seo/JsonLd";
import { ShopStatusProvider } from "@/components/shop/ShopStatusProvider";
import { StorefrontLoader } from "@/components/common/StorefrontLoader";
import { BackendStatusProvider } from "@/components/common/BackendStatusProvider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0c281e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pannabiryani.in"),
  title: {
    default: "Panna Biryani | Premium Veg Dum Biryani in Surat",
    template: "%s | Panna Biryani Surat",
  },
  description:
    "Order freshly prepared authentic vegetarian dum biryani from Panna Biryani in Surat. Veg, Paneer, Hyderabadi and Royal biryani with pickup and delivery options.",
  keywords: [
    "Veg Biryani in Surat",
    "Best Veg Biryani in Surat",
    "Veg Dum Biryani Surat",
    "Paneer Biryani Surat",
    "Hyderabadi Veg Biryani Surat",
    "Biryani Delivery Surat",
    "Biryani Pickup Surat",
    "Biryani for Family in Surat",
    "Bulk Biryani Orders Surat",
    "Panna Biryani",
    "Vegetarian Dum Biryani",
  ],
  authors: [{ name: "Panna Biryani Cloud Kitchen" }],
  creator: "Panna Biryani",
  publisher: "Panna Biryani Surat",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pannabiryani.in",
    siteName: "Panna Biryani",
    title: "Panna Biryani | Premium Veg Dum Biryani in Surat",
    description:
      "Order freshly prepared authentic vegetarian dum biryani from Panna Biryani in Surat. Slow-cooked with premium basmati, pure desi ghee and aromatic spices.",
    images: [
      {
        url: "/images/food/hero-biryani.jpg",
        width: 1200,
        height: 630,
        alt: "Panna Biryani - Authentic Vegetarian Dum Biryani in Surat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panna Biryani | Premium Veg Dum Biryani in Surat",
    description:
      "Order freshly prepared authentic vegetarian dum biryani from Panna Biryani in Surat. Available for pickup and delivery.",
    images: ["/images/food/hero-biryani.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/brand/logo.jpg",
    apple: "/images/brand/logo.jpg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${caveat.variable}`}>
      <head>
        <RestaurantJsonLd />
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf7f2] text-panna-charcoal font-sans antialiased selection:bg-panna-gold selection:text-panna-deep">
        <Toaster position="top-center" richColors closeButton />
        <BackendStatusProvider>
          <ShopStatusProvider>
            <StorefrontLoader />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileStickyCart />
            <WhatsAppFloatButton />
          </ShopStatusProvider>
        </BackendStatusProvider>
      </body>
    </html>
  );
}
