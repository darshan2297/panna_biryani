import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "PANNA BIRYANI",
  tagline: "Biryani Made For Sharing",
  description:
    "Order freshly prepared authentic vegetarian dum biryani from Panna Biryani in Surat. Slow-cooked with premium basmati, pure desi ghee and aromatic spices. Available for direct pickup & doorstep delivery.",
  established: "2024",
  city: "Surat",
  state: "Gujarat",
  country: "India",
  pickupLocation: {
    name: "Panna Biryani Cloud Kitchen",
    address: "Shop 14, Royal Heritage Arcade, Near VIP Circle, Vesu",
    area: "Vesu",
    city: "Surat",
    pincode: "395007",
    googleMapsUrl: "https://maps.google.com/?q=Surat+Gujarat",
  },
  contact: {
    phone: "+919876543210",
    phoneDisplay: "+91 98765 43210",
    whatsapp: "919876543210",
    whatsappDisplay: "+91 98765 43210",
    email: "hello@pannabiryani.in",
  },
  operatingHours: {
    openTime: "17:00", // 5:00 PM (weekdays)
    closeTime: "23:00", // 11:00 PM
    displayHours: "Mon–Fri 5:00 PM – 11:00 PM",
    days: "Sat–Sun 11:00 AM – 11:00 PM",
    isAcceptingOrders: true,
  },
  pricingRules: {
    currency: "INR",
    currencySymbol: "₹",
    freeDeliveryThreshold: 800, // Orders ₹800+ get free delivery
    defaultDeliveryFee: 49,
    taxPercentage: 0, // All prices are inclusive of taxes for customer transparency
    firstOrderFreeDessertThreshold: 299,
  },
  deliveryAreas: [
    { name: "Vesu", pincode: "395007", deliveryFee: 30, estimatedMinutes: 30, minOrder: 199 },
    { name: "VIP Road", pincode: "395007", deliveryFee: 30, estimatedMinutes: 30, minOrder: 199 },
    { name: "Althan", pincode: "395017", deliveryFee: 39, estimatedMinutes: 35, minOrder: 249 },
    { name: "City Light", pincode: "395007", deliveryFee: 39, estimatedMinutes: 35, minOrder: 249 },
    { name: "Piplod", pincode: "395007", deliveryFee: 45, estimatedMinutes: 40, minOrder: 299 },
    { name: "Dumas Road", pincode: "395007", deliveryFee: 49, estimatedMinutes: 40, minOrder: 299 },
    { name: "Ghod Dod Road", pincode: "395001", deliveryFee: 49, estimatedMinutes: 45, minOrder: 299 },
    { name: "Athwa Lines", pincode: "395001", deliveryFee: 49, estimatedMinutes: 45, minOrder: 299 },
    { name: "Adajan", pincode: "395009", deliveryFee: 59, estimatedMinutes: 50, minOrder: 349 },
    { name: "Pal", pincode: "395009", deliveryFee: 59, estimatedMinutes: 50, minOrder: 349 },
    { name: "Nanpura", pincode: "395001", deliveryFee: 49, estimatedMinutes: 45, minOrder: 299 },
    { name: "Rander", pincode: "395005", deliveryFee: 65, estimatedMinutes: 55, minOrder: 399 },
    { name: "Varachha", pincode: "395006", deliveryFee: 69, estimatedMinutes: 60, minOrder: 499 },
    { name: "Katargam", pincode: "395004", deliveryFee: 69, estimatedMinutes: 60, minOrder: 499 },
  ],
  socialLinks: {
    instagram: "https://www.instagram.com/panna.biryani/",
    facebook: "https://facebook.com/pannabiryani",
    whatsapp: "https://wa.me/919876543210",
  },
};
