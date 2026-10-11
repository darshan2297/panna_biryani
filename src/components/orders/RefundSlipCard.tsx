"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle, Share2, Check, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RefundDetails } from "@/types";
import { siteConfig } from "@/data/siteConfig";
import {
  buildRefundSlip,
  buildRefundSlipMessage,
  buildWhatsAppShareUrl,
} from "@/lib/refundSlip";
import {
  renderRefundSlipImage,
  shareRefundSlipImage,
  refundSlipFilename,
} from "@/lib/refundSlipImage";

const TONE = {
  success: {
    icon: CheckCircle2,
    ring: "border-emerald-200 bg-emerald-50/70",
    iconClass: "text-emerald-600",
    headlineClass: "text-emerald-800",
  },
  warning: {
    icon: Clock,
    ring: "border-amber-200 bg-amber-50/70",
    iconClass: "text-amber-600",
    headlineClass: "text-amber-800",
  },
  danger: {
    icon: XCircle,
    ring: "border-red-200 bg-red-50/70",
    iconClass: "text-red-600",
    headlineClass: "text-red-800",
  },
} as const;

interface RefundSlipCardProps {
  orderNumber: string;
  refund: RefundDetails;
}

/**
 * Customer-facing refund slip.
 *
 * The status shown is the gateway's, not an assumption — a refund the gateway
 * has not processed is worded as still in progress rather than as money
 * returned.
 */
export function RefundSlipCard({ orderNumber, refund }: RefundSlipCardProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const slip = useMemo(() => buildRefundSlip(refund), [refund]);
  const message = useMemo(
    () => buildRefundSlipMessage(orderNumber, refund),
    [orderNumber, refund]
  );

  const tone = TONE[slip.tone];
  const Icon = tone.icon;

  // Text share stays available as a fallback: it is the only option that works
  // in a desktop browser that cannot attach files.
  const shareUrl = buildWhatsAppShareUrl(siteConfig.contact.whatsapp, message);

  /** Share as a PNG via the OS share sheet — the GPay-style flow. */
  const shareImage = async () => {
    setSharing(true);
    try {
      const blob = await renderRefundSlipImage({
        brandName: "Panna Biryani",
        tagline: "Biryani Made For Sharing",
        orderNumber,
        statusHeadline: slip.headline,
        tone: slip.tone,
        amount: refund.amount,
          // The image prints the amount as its headline, so drop that row —
          // otherwise "Refund amount" appears twice on the same slip.
        rows: slip.lines.filter((l) => l.label !== "Refund amount"),
        footnote: FOOTNOTES[refund.status] ?? FOOTNOTES.processed,
      });

      const outcome = await shareRefundSlipImage(blob, refundSlipFilename(orderNumber));

      if (outcome === "shared") {
        toast.success("Refund slip shared");
      } else if (outcome === "cancelled") {
        /* user dismissed the sheet — nothing to report */
      } else if (outcome === "downloaded") {
        toast.success("Slip downloaded — attach the image in your chat");
      } else {
        toast.info("Sharing images isn't supported here — the slip was downloaded", {
          description: "Open WhatsApp and attach the downloaded image manually.",
        });
      }
    } catch {
      toast.error("Could not create the slip image");
    } finally {
      setSharing(false);
    }
  };

  const copySlip = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Refund slip copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the text manually");
    }
  };

  return (
    <section
      className={`rounded-2xl border-2 p-4 sm:p-5 shadow-xs ${tone.ring}`}
      aria-label="Refund slip"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${tone.iconClass}`} />
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-sm sm:text-base ${tone.headlineClass}`}>
            {slip.headline}
          </h3>

          <dl className="mt-3 space-y-1.5 text-xs sm:text-[13px]">
            {slip.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-4">
                <dt className="text-zinc-600 shrink-0">{line.label}</dt>
                <dd className="font-semibold text-zinc-900 text-right break-all">
                  {line.value}
                </dd>
              </div>
            ))}
          </dl>

          {refund.status === "processed" && (
            <p className="mt-3 text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
              {INR_NOTE}
            </p>
          )}
          {refund.status === "pending" && (
            <p className="mt-3 text-[11px] sm:text-xs text-amber-700 leading-relaxed">
              Your bank is still processing this refund. It usually appears within 5–7
              working days.
            </p>
          )}
          {refund.status === "failed" && (
            <p className="mt-3 text-[11px] sm:text-xs text-red-700 leading-relaxed">
              We could not complete this refund automatically. Our team has been notified
              and will get back to you.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shareImage}
              disabled={sharing}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white hover:brightness-95 transition disabled:opacity-60"
            >
              {sharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {sharing ? "Preparing…" : "Share slip as image"}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share as text
            </a>
            <button
              type="button"
              onClick={copySlip}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : null}
              {copied ? "Copied" : "Copy slip"}
            </button>
          </div>

          <p className="mt-2 text-[10.5px] text-zinc-400 leading-relaxed">
            Sharing as an image opens your phone&apos;s share sheet — choose WhatsApp
            there to send it. On a computer the slip is downloaded instead.
          </p>
        </div>
      </div>
    </section>
  );
}

const INR_NOTE =
  "This amount has been returned to your original payment method. It may take 5–7 " +
  "working days to reflect in your bank statement.";

/** Wording shown on the image itself, keyed by the gateway's real status. */
const FOOTNOTES: Record<string, string> = {
  processed: INR_NOTE,
  pending:
    "Your bank is still processing this refund. It usually appears within 5–7 working days.",
  failed:
    "We could not complete this refund automatically. Our team has been notified and " +
    "will get back to you.",
};