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
    { id: -1, name: "Vesu", pincode: "395007", delivery_fee: 30, estimated_minutes: 30, min_order: 199, is_active: true, sort_order: 1, created_at: "", updated_at: "" },
    { id: -2, name: "VIP Road", pincode: "395007", delivery_fee: 30, estimated_minutes: 30, min_order: 199, is_active: true, sort_order: 2, created_at: "", updated_at: "" },
    { id: -3, name: "Althan", pincode: "395017", delivery_fee: 39, estimated_minutes: 35, min_order: 249, is_active: true, sort_order: 3, created_at: "", updated_at: "" },
    { id: -4, name: "City Light", pincode: "395007", delivery_fee: 39, estimated_minutes: 35, min_order: 249, is_active: true, sort_order: 4, created_at: "", updated_at: "" },
    { id: -5, name: "Piplod", pincode: "395007", delivery_fee: 45, estimated_minutes: 40, min_order: 299, is_active: true, sort_order: 5, created_at: "", updated_at: "" },
    { id: -6, name: "Dumas Road", pincode: "395007", delivery_fee: 49, estimated_minutes: 40, min_order: 299, is_active: true, sort_order: 6, created_at: "", updated_at: "" },
    { id: -7, name: "Ghod Dod Road", pincode: "395001", delivery_fee: 49, estimated_minutes: 45, min_order: 299, is_active: true, sort_order: 7, created_at: "", updated_at: "" },
    { id: -8, name: "Athwa Lines", pincode: "395001", delivery_fee: 49, estimated_minutes: 45, min_order: 299, is_active: true, sort_order: 8, created_at: "", updated_at: "" },
    { id: -9, name: "Adajan", pincode: "395009", delivery_fee: 59, estimated_minutes: 50, min_order: 349, is_active: true, sort_order: 9, created_at: "", updated_at: "" },
    { id: -10, name: "Pal", pincode: "395009", delivery_fee: 59, estimated_minutes: 50, min_order: 349, is_active: true, sort_order: 10, created_at: "", updated_at: "" },
    { id: -11, name: "Nanpura", pincode: "395001", delivery_fee: 49, estimated_minutes: 45, min_order: 299, is_active: true, sort_order: 11, created_at: "", updated_at: "" },
    { id: -12, name: "Rander", pincode: "395005", delivery_fee: 65, estimated_minutes: 55, min_order: 399, is_active: true, sort_order: 12, created_at: "", updated_at: "" },
    { id: -13, name: "Varachha", pincode: "395006", delivery_fee: 69, estimated_minutes: 60, min_order: 499, is_active: true, sort_order: 13, created_at: "", updated_at: "" },
    { id: -14, name: "Katargam", pincode: "395004", delivery_fee: 69, estimated_minutes: 60, min_order: 499, is_active: true, sort_order: 14, created_at: "", updated_at: "" },
  ],
  socialLinks: {
    instagram: "https://www.instagram.com/panna.biryani/",
    facebook: "https://facebook.com/pannabiryani",
    whatsapp: "https://wa.me/919876543210",
  },
};
