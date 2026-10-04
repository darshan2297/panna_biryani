# Panna Biryani (પન્ના બિરયાની) — Online Order Portal

> **"Biryani Made For Sharing"**  
> Premium but affordable vegetarian dum biryani cloud kitchen based in Surat, Gujarat, India.

---

## 1. Project Overview & Architecture

Panna Biryani's website is a high-converting, mobile-first direct food ordering portal built to foster authentic direct customer relationships and repeat orders without depending entirely on marketplace aggregators.

### Tech Stack
- **Framework:** Next.js 16.3+ (App Router, React 19)
- **Styling:** Tailwind CSS 4.x with `@theme` design tokens
- **Palette:** Deep Forest Green (`#0c281e`), Antique Gold (`#c59b27`), Warm Cream (`#faf7f2`), Leaf Green (`#386641`)
- **State Management:** Zustand with `persist` middleware (`localStorage`) for cart persistence across page navigation
- **Validation:** Zod + React Hook Form
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Structured Data:** JSON-LD (`Restaurant`, `FoodEstablishment`, `Product`, `FAQPage`)
- **Payment Abstraction:** Decoupled `PaymentProvider` interface (Mock provider included for frictionless testing, Razorpay ready for production)

---

## 2. Setup & Installation

Ensure you have Node.js 20+ installed.

```bash
# Clone the repository
cd panna_biryani

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

---

## 3. Environment Variables

Configure your `.env.local` based on `.env.example`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Canonical website URL | `https://pannabiryani.in` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_live_...` (or blank for mock) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `secret_...` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`| WhatsApp phone for direct ordering | `919876543210` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID | `G-XXXXXXXXXX` |

---

## 4. Development & Running Locally

```bash
# Run Next.js development server
npm run dev

# Open in browser:
http://localhost:3000
```

---

## 5. Production Build

```bash
# Typecheck and create production build
npm run build

# Start production server
npm start
```

---

## 6. How To Add Products

Products are defined in `src/data/products.ts`. To add a new biryani or specialty dish:

1. Open `src/data/products.ts`.
2. Add an object to the `products` array:

```typescript
{
  id: "panna-shahi-dum-biryani",
  slug: "panna-shahi-dum-biryani",
  name: "Panna Shahi Dum Biryani",
  shortDescription: "Saffron-rich royal dum biryani with dried fruits.",
  description: "...",
  image: "/images/food/panna-shahi-dum-biryani.jpg",
  category: "royal",
  categoryLabel: "Royal Dum",
  vegetarian: true,
  available: true,
  badge: "Chef Special",
  sizes: [
    { id: "250g", label: "250g", weightGrams: 250, price: 199, servesText: "Serves 1 person" },
    { id: "500g", label: "500g", weightGrams: 500, price: 339, servesText: "Serves 1-2 people" },
    { id: "750g", label: "750g", weightGrams: 750, price: 469, servesText: "Serves 2-3 people" },
    { id: "1kg", label: "1kg", weightGrams: 1000, price: 659, servesText: "Serves 3-4 people" }
  ],
  ingredients: ["..."],
  allergens: ["Milk (Ghee)", "Tree Nuts"],
  spiceLevel: "Medium",
  preparationNotes: "...",
  servingSuggestions: "...",
  reheatingTips: "..."
}
```

---

## 7. How To Change Prices & Portion Sizes

Portion prices are never hardcoded inside JSX; they live exclusively in `src/data/products.ts`.
To change the price of any portion:
- Modify the `price` field inside the corresponding `sizes` array entry.
- Server-side order verification (`src/services/orders/orderService.ts`) automatically validates and enforces the updated prices.

---

## 8. How To Change Business & Delivery Information

Open `src/data/siteConfig.ts` to update:
- **Kitchen Address & Pickup Location:** `pickupLocation`
- **Phone & WhatsApp Number:** `contact.phone`, `contact.whatsapp`
- **Operating Hours:** `operatingHours.openTime` ("19:00") and `operatingHours.closeTime` ("23:00")
- **Delivery Zones in Surat:** `deliveryAreas` (add or remove areas like Vesu, Adajan, Pal, Althan with their respective fees and pincodes)
- **Free Delivery Minimum:** `pricingRules.freeDeliveryThreshold` (default: ₹800)

---

## 9. How To Connect Payment Gateway (Razorpay)

The payment flow is decoupled using the `PaymentProvider` interface in `src/services/payments/paymentProvider.ts`.

1. Obtain your Key ID and Key Secret from the Razorpay Dashboard.
2. Add them to `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=yyyyyyyyyyyy
   ```
3. `activePaymentProvider` will automatically switch from `MockPaymentProvider` to `RazorpayPaymentProvider` without changing any UI code.
4. Server verification is handled in `/api/orders/verify-payment`.

---

## 10. How To Connect A Database (Prisma / PostgreSQL / MongoDB)

Currently, `src/services/orders/orderService.ts` implements in-memory order persistence.
To switch to PostgreSQL / Prisma:
1. Run `npx prisma init`
2. Define `Order` model matching `src/types/index.ts`
3. Replace the `ordersStore.set()` and `ordersStore.get()` calls in `src/services/orders/orderService.ts` with:
   ```typescript
   await prisma.order.create({ data: ... });
   await prisma.order.findUnique({ where: { id } });
   ```

---

## 11. How To Connect Analytics

The analytics abstraction is in `src/services/analytics/analyticsService.ts`.
Tracked events include:
- `view_menu`, `view_product`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `select_pickup`, `select_delivery`, `purchase`, `bulk_order_submit`, `whatsapp_click`.

To enable Google Analytics 4:
- Add `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to `.env.local`.

---

## 12. SEO & Local Search Implementation

- **Next.js App Router Metadata API:** Fully unique metadata, OpenGraph images, and canonical URLs on every page.
- **Local Surat SEO:** Targeted natural search keywords (`Veg Dum Biryani Surat`, `Biryani Delivery Surat`, `Paneer Biryani Surat`).
- **Structured Data (JSON-LD):** Auto-generated Schema.org `Restaurant`, `FoodEstablishment`, `Product`, and `FAQPage` schemas in `src/components/seo/JsonLd.tsx`.
- **Dynamic Sitemap:** `src/app/sitemap.ts` automatically lists all public pages and individual product URLs.
- **Robots.txt:** `src/app/robots.ts` allows public crawling while protecting checkout, tracking, and private cart sessions.

---

## 13. Deployment

Ready for zero-configuration deployment to **Vercel**, **AWS Amplify**, or **Docker/VPS**:

```bash
# Deploy to Vercel
vercel
```

All static assets, responsive next/image loaders, and server routes will deploy automatically.
