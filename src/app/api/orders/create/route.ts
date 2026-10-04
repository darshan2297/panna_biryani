import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/services/orders/orderService";
import { activePaymentProvider } from "@/services/payments/paymentProvider";

// Strict Zod schema for checkout submission
const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid 10-digit mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  orderType: z.enum(["delivery", "pickup"]),
  deliveryAddress: z
    .object({
      fullName: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      streetAddress: z.string().min(5, "Street address is required"),
      area: z.string().min(2, "Area is required"),
      landmark: z.string().optional(),
      pincode: z.string().min(6, "Valid 6-digit Surat pincode is required"),
      city: z.string().default("Surat"),
      notes: z.string().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        sizeId: z.string(),
        quantity: z.number().int().positive().max(20),
        extraIds: z
          .array(
            z.object({
              id: z.string(),
              quantity: z.number().int().positive(),
            })
          )
          .optional(),
        isCombo: z.boolean().optional(),
      })
    )
    .min(1, "At least one item is required to place an order"),
  specialInstructions: z.string().max(300).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["online", "cash_on_delivery", "cash_on_pickup"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    // If delivery is chosen, ensure address is present
    if (validatedData.orderType === "delivery" && !validatedData.deliveryAddress) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required for doorstep delivery." },
        { status: 400 }
      );
    }

    // Call server order service (validates all prices against backend database)
    const newOrder = await createOrder({
      customerName: validatedData.customerName,
      phone: validatedData.phone,
      email: validatedData.email,
      items: validatedData.items,
      orderType: validatedData.orderType,
      deliveryAddress: validatedData.deliveryAddress,
      specialInstructions: validatedData.specialInstructions,
      couponCode: validatedData.couponCode,
      paymentMethod: validatedData.paymentMethod,
    });

    // Initiate payment session through abstracted payment provider
    const paymentSession = await activePaymentProvider.createPayment(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentSession,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: err.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
