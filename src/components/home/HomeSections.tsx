import { fetchReviews, fetchFAQs } from "@/services/storefront/configService";
import { ReviewItem, FAQItem } from "@/types";
import { ClientReviewsSection } from "./ClientReviewsSection";
import { ClientFAQSection } from "./ClientFAQSection";

export async function HomeSections() {
  let reviews: ReviewItem[] | null = null;
  let faqs: FAQItem[] | null = null;

  try {
    [reviews, faqs] = await Promise.all([fetchReviews(), fetchFAQs()]);
  } catch {
    // Fall through to null - components will use static fallback
  }

  return (
    <>
      <ClientReviewsSection initialReviews={reviews} />
      <ClientFAQSection initialFaqs={faqs} />
    </>
  );
}
