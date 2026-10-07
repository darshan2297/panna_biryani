"use client";

import { Star, CheckCircle, MapPin, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { ReviewItem } from "@/types";

interface Props {
  initialReviews: ReviewItem[] | null;
}

export function ClientReviewsSection({ initialReviews }: Props) {
  const storeReviews = useStorefrontStore((s) => s.reviews);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);

  useEffect(() => {
    // Once the store loads from CRM, use those reviews (they're fresher)
    if (storeReviews && storeReviews.length > 0) {
      setReviews(storeReviews);
    }
  }, [storeReviews]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-[#f4efe6] border-y border-panna-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-panna-gold-dark font-bold">
            Real Customer Reviews
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep mt-1">
            Loved Across Surat
          </h2>
          <p className="text-zinc-600 text-sm mt-2">
            Read what local biryani lovers in Vesu, Adajan, and City Light have to say about their
            orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-panna-border shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                <Quote className="w-6 h-6 text-panna-gold/40" />

                <p className="text-xs text-zinc-700 leading-relaxed italic">
                  &ldquo;{rev.review_text}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-panna-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-panna-deep">{rev.customer_name}</h4>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-panna-gold" />
                      <span>{rev.location}</span>
                    </p>
                  </div>
                  {rev.verified_order && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-semibold text-panna-gold-dark mt-2">
                  Dish Loved: {rev.dish_loved}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
