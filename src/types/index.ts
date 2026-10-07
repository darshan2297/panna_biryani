export type BiryaniCategory = 'all' | 'veg-dum' | 'paneer' | 'hyderabadi' | 'royal' | 'combos' | 'extras';

export interface ProductSize {
  id: string; // e.g. "250g", "500g", "750g", "1kg"
  label: string;
  weightGrams: number;
  price: number;
  servesText: string; // e.g. "Serves 1 person"
  originalPrice?: number;
  isPopular?: boolean;
}

export interface ExtraItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'raita' | 'chutney' | 'sides' | 'sweet';
  isPopular?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  shortDescription: string;
  description: string;
  image: string;
  category: 'veg-dum' | 'paneer' | 'hyderabadi' | 'royal';
  categoryLabel: string;
  vegetarian: boolean;
  available: boolean;
  badge?: 'Best Seller' | 'New' | 'Premium' | 'Chef Special' | 'Out of Stock';
  sizes: ProductSize[];
  ingredients: string[];
  allergens: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Medium-Spicy' | 'Spicy';
  preparationNotes: string;
  servingSuggestions: string;
  reheatingTips: string;
  nutritionInfo?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface ComboPack {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  itemsSummary: string; // e.g. "2 x 500g Biryani + 2 Raita + 2 Chutney"
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  servesText: string; // e.g. "Serves 3-4 People"
  badge?: string;
  includedItems: string[];
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number;
  freeItemName?: string;
  minOrderValue: number;
  badge?: string;
  active: boolean;
}

export interface CartItemExtra {
  extra: ExtraItem;
  quantity: number;
}

export interface CartItem {
  id: string; // composite key: `${productId}-${sizeId}-${extrasHash}`
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  isCombo?: boolean;
  size: ProductSize;
  quantity: number;
  extras: CartItemExtra[];
  unitBasePrice: number;
  totalPrice: number;
}

export type OrderType = 'delivery' | 'pickup';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email?: string;
  streetAddress: string;
  area: string;
  landmark?: string;
  pincode: string;
  city: string;
  notes?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'online' | 'cash_on_delivery' | 'cash_on_pickup';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  orderType: OrderType;
  deliveryAddress?: DeliveryAddress;
  pickupTime?: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  crmOrderNumber?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkOrderRequest {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  guestCount: number;
  preferredBiryani: string;
  orderType: OrderType;
  areaLocation: string;
  message?: string;
}

export interface ReviewItem {
  id: number;
  customer_name: string;
  location: string | null;
  rating: number;
  review_text: string;
  verified_order: boolean;
  dish_loved: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'ordering' | 'food' | 'delivery' | 'bulk';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAreaConfig {
  id: number;
  name: string;
  pincode: string;
  delivery_fee: number;
  estimated_minutes: number;
  min_order: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  established: string;
  city: string;
  state: string;
  country: string;
  pickupLocation: {
    name: string;
    address: string;
    area: string;
    city: string;
    pincode: string;
    googleMapsUrl: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
  };
  operatingHours: {
    openTime: string; // e.g. "17:00"
    closeTime: string; // e.g. "23:00"
    displayHours: string;
    days: string;
    isAcceptingOrders: boolean;
  };
  pricingRules: {
    currency: string;
    currencySymbol: string;
    freeDeliveryThreshold: number;
    defaultDeliveryFee: number;
    taxPercentage: number;
    firstOrderFreeDessertThreshold: number;
  };
  deliveryAreas: DeliveryAreaConfig[];
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}

export interface PublicBusinessHours {
  is_open: boolean;
  auto_schedule_enabled: boolean;
  display_hours: string;
  status_text: string;
  next_open_text?: string | null;
  holiday_message?: string | null;
  full_schedule?: Record<string, string>;
}

export interface ShopStatus {
  website_open: boolean;
  zomato_open?: boolean;
  swiggy_open?: boolean;
  is_open: boolean;
  schedule_active?: boolean;
  status_text?: string;
  next_open_text?: string | null;
  display_hours?: string | null;
  holiday_message?: string | null;
  business_hours: PublicBusinessHours;
}
