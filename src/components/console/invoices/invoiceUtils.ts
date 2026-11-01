import type { Institution, Plan, SaasInvoice } from "@/types/saas";
import { formatDate, INVOICE_STATUS_META } from "@/components/console/shared/consoleMeta";
import type { CompanySettings } from "@/validations/consoleSettingsSchema";
import { formatMoney } from "@/lib/saasStats";

export { formatMoney, formatCompactMoney } from "@/lib/saasStats";
export { formatDate } from "@/components/console/shared/consoleMeta";
const money = (n: number) => formatMoney(n, { cents: true });

/** Owner Console invoice helpers: formatting, status meta and the printable HTML invoice. */

export const formatShortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const formatPeriod = (start: string, end: string) => `${formatShortDate(start)} – ${formatDate(end)}`;

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export interface InvoiceDocInput {
  invoice: SaasInvoice;
  institution: Institution | undefined;
  plan: Plan | undefined;
  company: CompanySettings;
  footer?: string;
}

/** Line description shown on the invoice ("Growth plan — Monthly subscription"). */
export const invoiceLineLabel = (invoice: SaasInvoice, plan: Plan | undefined) =>
  invoice.description || `${plan?.name ?? invoice.planId} plan — ${invoice.cycle === "YEARLY" ? "Yearly" : "Monthly"} subscription`;

export const taxPercent = (invoice: SaasInvoice) => (invoice.amount ? Math.round((invoice.tax / invoice.amount) * 1000) / 10 : 0);

/** Standalone printable HTML invoice (download / open in a new window). */
export function buildSaasInvoiceHtml({ invoice, institution, plan, company, footer }: InvoiceDocInput): string {
  const status = INVOICE_STATUS_META[invoice.status];
  const stampClass = invoice.status === "PAID" ? "paid" : invoice.status === "REFUNDED" ? "refunded" : invoice.status === "FAILED" ? "failed" : "open";
  const billTo = institution
    ? `<strong>${escape(institution.name)}</strong><br>${escape(institution.ownerName)}<br>${escape(institution.ownerEmail)}<br><span class="muted">${escape(institution.slug)}.edupro.com · ${escape(institution.country)}</span>`
    : `<strong>Unknown institution</strong>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(invoice.number)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0F172A;max-width:760px;margin:40px auto;padding:0 24px}
  h1{font-size:26px;margin:0;color:#FF5B00}.muted{color:#64748B}.row{display:flex;justify-content:space-between;gap:24px}
  table{width:100%;border-collapse:collapse;margin-top:32px}th,td{border:1px solid #E2E8F0;padding:12px;text-align:left}
  th{background:#F8FAFC;font-size:13px;color:#334155}.total{font-weight:700}.right{text-align:right}
  .stamp{display:inline-block;margin-top:24px;padding:6px 14px;border-radius:6px;font-weight:700;letter-spacing:.08em}
  .stamp.paid{color:#0dc34a;background:#e6ffee}.stamp.refunded{color:#c218fb;background:#c218fb14}
  .stamp.failed{color:#df1c41;background:#df1c4114}.stamp.open{color:#2570fc;background:#2570fc14}
  @media print{body{margin:0}}
</style></head><body>
  <div class="row"><div><h1>EduPro</h1><p><strong>${escape(company.legalName)}</strong><br><span class="muted">${escape(company.address)}${company.taxId ? `<br>${escape(company.taxId)}` : ""}<br>${escape(company.supportEmail)}</span></p></div>
  <div class="right"><strong style="font-size:20px">INVOICE</strong><p><strong>${escape(invoice.number)}</strong><br><span class="muted">Issued ${escape(formatDate(invoice.issuedAt))}<br>Due ${escape(formatDate(invoice.dueAt))}${invoice.paidAt ? `<br>Paid ${escape(formatDate(invoice.paidAt))}` : ""}</span></p></div></div>
  <div class="row" style="margin-top:24px"><div><p class="muted">Bill to</p>${billTo}</div>
  <div class="right"><p class="muted">Billing period</p>${escape(formatPeriod(invoice.periodStart, invoice.periodEnd))}</div></div>
  <table><thead><tr><th>Description</th><th>Period</th><th class="right">Amount</th></tr></thead>
  <tbody><tr><td>${escape(invoiceLineLabel(invoice, plan))}</td><td>${escape(formatPeriod(invoice.periodStart, invoice.periodEnd))}</td><td class="right">${money(invoice.amount)}</td></tr>
  <tr><td colspan="2">Subtotal</td><td class="right">${money(invoice.amount)}</td></tr>
  <tr><td colspan="2">Tax (${taxPercent(invoice)}%)</td><td class="right">${money(invoice.tax)}</td></tr>
  <tr><td colspan="2" class="total">Total (USD)</td><td class="total right">${money(invoice.total)}</td></tr></tbody></table>
  <span class="stamp ${stampClass}">${escape(status.label.toUpperCase())}</span>
  ${footer ? `<p class="muted" style="margin-top:32px">${escape(footer)}</p>` : ""}
</body></html>`;
}

/** Mock "Download PDF": saves the printable HTML invoice. */
export function downloadSaasInvoice(input: InvoiceDocInput) {
  const url = URL.createObjectURL(new Blob([buildSaasInvoiceHtml(input)], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${input.invoice.number}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens the invoice in a new window ready to print / save as PDF. */
export function openSaasInvoice(input: InvoiceDocInput) {
  const url = URL.createObjectURL(new Blob([buildSaasInvoiceHtml(input)], { type: "text/html;charset=utf-8" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
