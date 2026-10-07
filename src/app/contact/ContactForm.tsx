"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitInquiry } from "@/services/storefront/inquiryService";

const SUBJECTS: { value: string; label: string }[] = [
  { value: "general", label: "General Enquiry" },
  { value: "feedback", label: "Order Feedback" },
  { value: "bulk", label: "Party / Catering Enquiry" },
  { value: "franchise", label: "Franchise & Partnership" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const subjectLabel = SUBJECTS.find((s) => s.value === subject)?.label || subject;
      await submitInquiry({
        inquiry_type: "contact",
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        subject: subjectLabel,
        message: message.trim(),
      });
      setSubmitted(true);
      toast.success("Thank you for your message! Our team will contact you shortly.");
    } catch {
      toast.error("Could not send your message right now. Please try again or WhatsApp us directly.");
    } finally {
      setSending(false);
    }
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
          onClick={() => {
            setSubmitted(false);
            setMessage("");
          }}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priyanshu Shah"
            className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
          />
        </div>
        <div>
          <label className="block font-bold text-panna-deep mb-1.5">Mobile Number *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
        />
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep font-semibold focus:outline-none focus:border-panna-gold"
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold text-panna-deep mb-1.5">Your Message *</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          className="w-full bg-[#faf7f2] border border-panna-border rounded-xl text-sm p-3 text-panna-deep focus:outline-none focus:border-panna-gold"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full py-4 bg-[#0c281e] hover:bg-[#143a2d] disabled:opacity-60 disabled:cursor-not-allowed text-panna-gold font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all active:scale-98"
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
