import { useUserSessionStore } from "@/store/useUserSessionStore";

/**
 * Create-or-resume a storefront session from a phone number.
 *
 * Used when a guest submits a number for an identity-gated promo: if the CRM
 * already knows the number we sign them back in, otherwise we register them as
 * new. Either way a local session starts so later promo checks reuse the phone
 * instead of prompting again.
 */

export interface PhoneLookupResult {
  ok: boolean;
  exists: boolean;
  /** Real customer name when the CRM has one; null for a genuinely new number. */
  name: string | null;
  error?: string;
}

/** Resolve a phone number to a sign-in identity. Returns `ok:false` on failure. */
export async function lookupPhone(phone: string): Promise<PhoneLookupResult> {
  try {
    const res = await fetch("/api/customers/phone-exists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, exists: false, name: null, error: json?.error || "Lookup failed" };
    }
    return {
      ok: true,
      exists: Boolean(json?.exists),
      name: typeof json?.name === "string" && json.name.trim() ? json.name.trim() : null,
    };
  } catch {
    return { ok: false, exists: false, name: null, error: "Could not verify the number right now." };
  }
}

/**
 * Placeholder names written by older builds of the promo sign-in flow. They must
 * never be treated as a real name — checkout would submit "Returning Customer"
 * as the customer's name on the order.
 */
const PLACEHOLDER_NAMES = new Set(["returning customer", "panna guest"]);

export function isPlaceholderName(name: string | null | undefined): boolean {
  if (!name) return true;
  return PLACEHOLDER_NAMES.has(name.trim().toLowerCase());
}

/**
 * Start (or resume) a storefront session from a phone number.
 *
 * The name comes from the CRM when the number is known, so checkout is
 * pre-filled with the real customer. For a genuinely new customer there is no
 * name to know, so it is left empty and the checkout form asks — never faked.
 */
export function startSessionForPhone(phone: string, name: string | null): void {
  const clean = phone.replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) return;

  const { user, startSession } = useUserSessionStore.getState();

  // Already signed in as this number — refresh the name if we only had a
  // placeholder before, otherwise leave the profile alone.
  if (user && user.phone === clean) {
    if (name && isPlaceholderName(user.name)) {
      startSession({ name, phone: clean, email: user.email, tag: user.tag });
    }
    return;
  }

  startSession({
    // Don't throw away a name we already have (the phone may just have been
    // typed to satisfy a promo gate while signed in as someone else).
    name: name || (!isPlaceholderName(user?.name) ? user?.name || "" : ""),
    phone: clean,
  });
}
