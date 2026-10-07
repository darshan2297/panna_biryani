"use client";

const BASE = (process.env.PANNA_CRM_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export interface ContactInquiryPayload {
  inquiry_type: "contact" | "bulk";
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Submit a website contact / bulk-order enquiry directly to the CRM.
 * The CRM stores it in the Enquiries inbox and raises a realtime
 * notification (bell + socket) for the team.
 */
export async function submitInquiry(payload: ContactInquiryPayload): Promise<void> {
  const res = await fetch(`${BASE}/public/contact-inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || data?.detail || "Failed to submit enquiry");
  }
}
