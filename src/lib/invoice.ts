/**
 * Standard GST tax invoice (storefront copy).
 *
 * Mirrors the CRM invoice (`panna_crm_frontend/src/lib/invoice.ts`) so a
 * customer sees the same conventional Indian tax invoice: seller block with
 * logo / address / GSTIN, billed-to block, invoice meta, itemised table and a
 * CGST + SGST breakdown reverse-calculated out of the tax-inclusive prices.
 */

/** Reverse-calculate the GST already contained in a tax-inclusive amount. */
export function extractGst(amount: number, gstPercent: number): number {
  if (!gstPercent || gstPercent <= 0 || !amount) return 0;
  return Number((amount - amount / (1 + gstPercent / 100)).toFixed(2));
}

const inr = (n: number | null | undefined) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export interface StoreInvoiceItem {
  name: string;
  portion?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  free?: boolean;
}

export interface StoreInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  crmOrderNumber?: string | null;
  date: string;
  orderType?: string | null;
  paymentStatus?: string | null;
  businessName?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  subtotal: number;
  discount?: number;
  discountLabel?: string | null;
  deliveryFee: number;
  total: number;
  gstPercent?: number;
  gstAmount?: number | null;
  paymentId?: string | null;
  items: StoreInvoiceItem[];
  autoPrint?: boolean;
}

/**
 * Builds a standalone, print-ready HTML tax invoice and downloads it.
 * The file opens in any browser and can be saved as PDF.
 */
/** Renders the storefront invoice HTML string. */
function buildStoreInvoiceHtml(data: StoreInvoiceData): string {
  const gstPct = Number(data.gstPercent ?? 0) || 0;
  const discounted = Math.max(0, (data.subtotal || 0) - (data.discount || 0));
  const gst =
    data.gstAmount != null
      ? Number(data.gstAmount)
      : extractGst(discounted, gstPct);
  const netGoods = Math.max(0, discounted - gst);

  const sellerLines = [
    data.address,
    [data.city, data.pincode].filter(Boolean).join(" - "),
    data.phone ? `Phone: ${data.phone}` : "",
    data.email ? `Email: ${data.email}` : "",
  ].filter(Boolean);

  const itemRows = data.items
    .map((it, i) => {
      const desc = [it.name, it.portion].filter(Boolean).join(" — ");
      return `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(desc)}${it.free ? ' <span class="tag">FREE</span>' : ""}</td>
        <td class="c">${it.quantity}</td>
        <td class="r">${inr(it.unitPrice)}</td>
        <td class="r">${inr(it.totalPrice)}</td>
      </tr>`;
    })
    .join("");

  const totalRows = [
    `<tr><td>Items subtotal (incl. GST)</td><td class="r">${inr(data.subtotal)}</td></tr>`,
    data.discount && data.discount > 0
      ? `<tr><td>Discount${
          data.discountLabel ? ` (${esc(data.discountLabel)})` : ""
        }</td><td class="r">- ${inr(data.discount)}</td></tr>`
      : "",
    `<tr><td>Delivery charges</td><td class="r">${
      data.deliveryFee === 0 ? "FREE" : inr(data.deliveryFee)
    }</td></tr>`,
    `<tr><td>Taxable value (incl. GST)</td><td class="r">${inr(discounted)}</td></tr>`,
    gst > 0
      ? `<tr><td>CGST @ ${(gstPct / 2).toFixed(2)}%</td><td class="r">${inr(gst / 2)}</td></tr>
         <tr><td>SGST @ ${(gstPct / 2).toFixed(2)}%</td><td class="r">${inr(gst / 2)}</td></tr>`
      : "",
    `<tr class="total"><td>Total amount paid</td><td class="r">${inr(data.total)}</td></tr>`,
  ]
    .filter(Boolean)
    .join("");

  const txnRows = [
    data.paymentStatus
      ? `<tr><td>Payment status</td><td>${esc(data.paymentStatus)}</td></tr>`
      : "",
    data.paymentId
      ? `<tr><td>Transaction ID</td><td class="m">${esc(data.paymentId)}</td></tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Tax Invoice ${esc(data.invoiceNumber)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
       color:#111827;margin:0;padding:28px;background:#fff;font-size:12px}
  .sheet{max-width:820px;margin:0 auto}
  h1{font-size:20px;margin:0;color:#00241b}
  .doc{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;font-weight:700}
  .hdr{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;
       border-bottom:2px solid #00241b;padding-bottom:14px}
  .logo{max-width:150px;max-height:56px;object-fit:contain;margin-bottom:6px}
  .tag{font-size:9px;background:#ecfdf5;color:#047857;padding:1px 5px;border-radius:3px;font-weight:700}
  .muted{color:#6b7280;font-size:11px}
  .meta{margin-top:4px;font-size:11px;line-height:1.6}
  .gst{display:inline-block;border:1px solid #00241b;padding:3px 8px;font-size:11px;
       font-weight:700;margin-top:6px}
  .parties{display:flex;gap:24px;margin:16px 0;flex-wrap:wrap}
  .party{flex:1;min-width:240px;border:1px solid #e5e7eb;padding:11px 13px}
  .party h3{margin:0 0 6px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6b7280}
  .party p{margin:0;font-size:11px;line-height:1.6}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}
  th,td{padding:7px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
  thead th{background:#f9fafb;font-size:10px;text-transform:uppercase;letter-spacing:.06em;
           text-align:left;border-bottom:1px solid #d1d5db}
  .r{text-align:right;white-space:nowrap}
  .c{text-align:center;width:34px}
  .m{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;word-break:break-all}
  .totals{margin-top:12px;margin-left:auto;width:min(320px,100%)}
  .totals td{border:0;padding:4px 8px}
  .totals tr.total td{border-top:2px solid #00241b;font-weight:800;font-size:14px;padding-top:8px}
  .foot{margin-top:22px;padding-top:12px;border-top:1px solid #e5e7eb;
        display:flex;justify-content:space-between;gap:20px;font-size:10.5px;color:#6b7280}
  .terms{margin-top:14px;font-size:10px;color:#6b7280;line-height:1.6}
  @media print{body{padding:0}}
</style></head><body>
<div class="sheet">
  <div class="hdr">
    <div>
      ${data.logoUrl ? `<img class="logo" src="${esc(data.logoUrl)}" alt=""/>` : ""}
      <h1>${esc(data.businessName || "Panna Biryani")}</h1>
      ${data.tagline ? `<div class="muted">${esc(data.tagline)}</div>` : ""}
      <div class="meta">${sellerLines.map(esc).join("<br/>")}</div>
      ${data.gstNumber ? `<div class="gst">GSTIN: ${esc(data.gstNumber)}</div>` : ""}
    </div>
    <div style="text-align:right">
      <div class="doc">Tax Invoice</div>
      <div class="meta">
        <b>Invoice No:</b> ${esc(data.invoiceNumber)}<br/>
        <b>Order No:</b> ${esc(data.crmOrderNumber || data.orderNumber)}<br/>
        <b>Date:</b> ${fmtDate(data.date)}<br/>
        <b>Type:</b> ${esc(data.orderType || "Delivery")}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Sold By</h3>
      <p><b>${esc(data.businessName || "Panna Biryani")}</b><br/>
      ${sellerLines.map(esc).join("<br/>")}
      ${data.gstNumber ? `<br/><b>GSTIN:</b> ${esc(data.gstNumber)}` : ""}</p>
    </div>
    <div class="party">
      <h3>Billed To</h3>
      <p><b>${esc(data.customerName || "Customer")}</b><br/>
      ${data.customerPhone ? `Phone: ${esc(data.customerPhone)}<br/>` : ""}
      ${data.customerAddress ? esc(data.customerAddress) : "—"}</p>
    </div>
  </div>

  <table>
    <thead><tr>
      <th class="c">#</th><th>Description</th><th class="c">Qty</th>
      <th class="r">Unit price</th><th class="r">Amount</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>

  <table class="totals"><tbody>${totalRows}</tbody></table>

  <div class="foot">
    <div>
      <b>Terms:</b> Goods once sold will not be taken back. Prices are inclusive of GST.
      Subject to Surat jurisdiction.
    </div>
    <div><b>Thank you!</b><br/>${esc(data.businessName || "Panna Biryani")}</div>
  </div>
  ${txnRows ? `<div class="terms"><b>Transaction details</b><table style="max-width:420px">${txnRows}</table></div>` : ""}
</div>
${
  data.autoPrint === false
    ? ""
    : "<script>window.addEventListener('load',function(){window.print()});</script>"
}
</body></html>`;
  return html;
}

/** Builds the storefront invoice HTML and returns it as a Blob URL. */
function buildStoreInvoiceUrl(data: StoreInvoiceData): string {
  const blob = new Blob([buildStoreInvoiceHtml(data)], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
}

/**
 * Prints an HTML document in a hidden same-origin iframe so no new browser
 * tab or window is opened — the user goes straight to the print dialog.
 */
function printInHiddenFrame(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  iframe.style.display = "block";
  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      iframe.parentNode?.removeChild(iframe);
    } catch {
      /* already removed */
    }
  };

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    cleanup();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const trigger = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Print failed", err);
      cleanup();
    }
  };

  iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(trigger, 150);
  window.setTimeout(cleanup, 60000);
}

/** Saves the tax invoice as a downloadable HTML file. */
export function downloadStoreInvoice(data: StoreInvoiceData) {
  const url = buildStoreInvoiceUrl({ ...data, autoPrint: false });
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${data.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Prints the invoice via a hidden iframe — no new tab/window is opened.
 * Printing the storefront page directly would include the site header/footer,
 * so the invoice is rendered into an isolated document instead.
 */
export function printStoreInvoice(data: StoreInvoiceData) {
  printInHiddenFrame(buildStoreInvoiceHtml({ ...data, autoPrint: false }));
}