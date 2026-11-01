"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Download, Eye, Printer, RefreshCw, Undo2 } from "lucide-react";
import type { SaasInvoice, SaasStore } from "@/types/saas";
import { markInvoicePaid, refundInvoice, retryInvoice } from "@/lib/saasStorage";
import { getConsoleSettingsSnapshot } from "@/lib/consoleSettingsStorage";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { downloadSaasInvoice, formatMoney, openSaasInvoice, type InvoiceDocInput } from "./invoiceUtils";

type Pending = { invoice: SaasInvoice; kind: "paid" | "refund" } | null;

export const canCollect = (i: SaasInvoice) => i.status === "FAILED" || i.status === "OPEN";

/** Invoice actions shared by the list (⋮ menu) and the detail page. */
export function useInvoiceActions(store: SaasStore, opts: { showView?: boolean } = {}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const docInput = (invoice: SaasInvoice): InvoiceDocInput => {
    const settings = getConsoleSettingsSnapshot().settings;
    return {
      invoice,
      institution: store.institutions.find((i) => i.id === invoice.institutionId),
      plan: store.plans.find((p) => p.id === invoice.planId),
      company: settings.company,
      footer: settings.billing.invoiceFooter,
    };
  };

  const download = (invoice: SaasInvoice) => {
    try {
      downloadSaasInvoice(docInput(invoice));
      toast.success("Invoice downloaded", { description: `${invoice.number}.html — open it and print to PDF.` });
    } catch {
      toast.error("Couldn't download the invoice", { description: "Please try again." });
    }
  };

  const print = (invoice: SaasInvoice) => openSaasInvoice(docInput(invoice));

  const retry = async (invoice: SaasInvoice) => {
    setRetrying(invoice.id);
    const id = toast.loading("Retrying payment...", { description: `${invoice.number} · ${formatMoney(invoice.total, { cents: true })}` });
    try {
      await retryInvoice(invoice.id);
      toast.success("Payment collected", { id, description: `${invoice.number} is now paid.` });
    } catch (err) {
      toast.error("Payment failed again", { id, description: err instanceof Error ? err.message : "Please try again later." });
    } finally {
      setRetrying(null);
    }
  };

  const getMenuItems = (invoice: SaasInvoice): DropdownActionItem[] => {
    const items: DropdownActionItem[] = [];
    if (opts.showView !== false) items.push({ key: "view", label: "View invoice", icon: <Eye className="h-4 w-4" />, onClick: () => router.push(`/invoices/${invoice.id}`) });
    items.push(
      { key: "download", label: "Download PDF", icon: <Download className="h-4 w-4" />, onClick: () => download(invoice) },
      { key: "print", label: "Open printable", icon: <Printer className="h-4 w-4" />, onClick: () => print(invoice) }
    );
    if (canCollect(invoice)) {
      items.push(
        { key: "retry", label: "Retry payment", icon: <RefreshCw className="h-4 w-4" />, separatorBefore: true, disabled: retrying === invoice.id, onClick: () => void retry(invoice) },
        { key: "paid", label: "Mark as paid", icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => setPending({ invoice, kind: "paid" }) }
      );
    }
    if (invoice.status === "PAID") items.push({ key: "refund", label: "Refund", icon: <Undo2 className="h-4 w-4" />, danger: true, separatorBefore: true, onClick: () => setPending({ invoice, kind: "refund" }) });
    return items;
  };

  const p = pending;
  const modals = (
    <ConfirmModal
      isOpen={!!p}
      title={p?.kind === "refund" ? `Refund ${p.invoice.number}?` : `Mark ${p?.invoice.number ?? "invoice"} as paid?`}
      subtitle={p ? `${formatMoney(p.invoice.total, { cents: true })} · ${store.institutions.find((i) => i.id === p.invoice.institutionId)?.name ?? ""}` : undefined}
      message={
        p?.kind === "refund"
          ? "The full amount is returned to the institution's payment method. This can't be undone."
          : "Use this for payments received outside the gateway (bank transfer, cash, manual bKash). The subscription returns to Active if nothing else is overdue."
      }
      confirmLabel={p?.kind === "refund" ? "Refund invoice" : "Mark as paid"}
      pendingLabel={p?.kind === "refund" ? "Refunding..." : "Saving..."}
      confirmIcon={p?.kind === "refund" ? <Undo2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      onClose={() => setPending(null)}
      onConfirm={async () => {
        if (!p) return;
        const refund = p.kind === "refund";
        const id = toast.loading(refund ? "Refunding invoice..." : "Recording payment...", { description: p.invoice.number });
        try {
          if (refund) await refundInvoice(p.invoice.id);
          else await markInvoicePaid(p.invoice.id);
          toast.success(refund ? "Invoice refunded" : "Invoice marked as paid", { id, description: `${p.invoice.number} · ${formatMoney(p.invoice.total, { cents: true })}` });
        } catch (err) {
          toast.error(refund ? "Couldn't refund the invoice" : "Couldn't mark it as paid", { id, description: err instanceof Error ? err.message : "Please try again." });
          throw err;
        }
      }}
    />
  );

  return {
    getMenuItems,
    download,
    print,
    retry,
    retrying,
    requestMarkPaid: (invoice: SaasInvoice) => setPending({ invoice, kind: "paid" }),
    requestRefund: (invoice: SaasInvoice) => setPending({ invoice, kind: "refund" }),
    modals,
  };
}

export default useInvoiceActions;
