"use client";

import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { FAQItem } from "@/types";

interface Props {
  initialFaqs: FAQItem[] | null;
}

export function ClientFAQSection({ initialFaqs }: Props) {
  const storeFaqs = useStorefrontStore((s) => s.faqs);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs || []);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    if (storeFaqs && storeFaqs.length > 0) {
      setFaqs(storeFaqs);
    }
  }, [storeFaqs]);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-[#faf7f2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-panna-gold-dark font-bold mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-panna-gold" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-panna-deep">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600 text-sm mt-2">
            Everything you need to know about our vegetarian dum biryani, delivery across Surat, and
            kitchen timings.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-xl border border-panna-border overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-panna-deep hover:text-panna-gold-dark transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-panna-gold shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-panna-border/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
