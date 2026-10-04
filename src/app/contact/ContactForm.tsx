"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you for your message! Our team will contact you shortly.");
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
        <h3 className="font-serif text-lg font-bold text-emerald-950">Message Sent!</h3>
        <p className="text-xs text-emerald-800">
          We have received your enquiry and our kitchen team in Surat will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs font-bold text-emerald-900 underline pt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-panna-deep mb-1.5">Your Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Priyanshu Shah"
            className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
          />
        </div>
        <div>
          <label className="block font-bold text-panna-deep mb-1.5">Mobile Number *</label>
          <input
            type="tel"
            required
            placeholder="+91 98765 43210"
            className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Email Address</label>
        <input
          type="email"
          placeholder="name@example.com"
          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
        />
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Subject</label>
        <select className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold">
          <option value="general">General Enquiry</option>
          <option value="feedback">Order Feedback</option>
          <option value="bulk">Party / Catering Enquiry</option>
          <option value="franchise">Franchise & Partnership</option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Your Message *</label>
        <textarea
          rows={4}
          required
          placeholder="Write your message here..."
          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-[#0c281e] hover:bg-[#143a2d] text-panna-gold font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all active:scale-98"
      >
        Send Message
      </button>
    </form>
  );
}
