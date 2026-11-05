"use client";

import React, { useEffect, useState } from "react";
import type { SaasInvoice } from "@/types/saas";
import { fetchInvoice } from "@/lib/invoicePages";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileX2, Printer, RefreshCw, Undo2 } from "lucide-react";
import { useConsoleSettings } from "@/lib/consoleSettingsStorage";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { InvoiceStatusBadge } from "@/components/console/shared/ConsoleBadges";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { useConsoleSaas } from "@/components/console/subscriptions/shared/useConsoleSaas";
import { canCollect, useInvoiceActions } from "../useInvoiceActions";
import { formatMoney } from "../invoiceUtils";
import { InvoiceDocument } from "./InvoiceDocument";
import { InvoiceSidePanel } from "./InvoiceSidePanel";
import { InvoiceDetailSkeleton } from "./InvoiceDetailSkeleton";

/** /console/invoices/[id] — invoice document preview with collect / refund / download actions. */
export function InvoiceDetailView({ invoiceId }: { invoiceId: string }) {
  const { store, ready } = useConsoleSaas();
  const actions = useInvoiceActions(store, { showView: false });
  const consoleSettings = useConsoleSettings();
  // Invoices older than the store's ~15-month window are read on their own.
  const inStore = store.invoices.find((i) => i.id === invoiceId);
  const [fetched, setFetched] = useState<{ id: string; invoice: SaasInvoice | null } | null>(null);
  useEffect(() => {
    if (!ready || inStore || fetched?.id === invoiceId) return;
    let alive = true;
    fetchInvoice(invoiceId).then(
      (inv) => alive && setFetched({ id: invoiceId, invoice: inv }),
      () => alive && setFetched({ id: invoiceId, invoice: null })
    );
    return () => {
      alive = false;
    };
  }, [ready, inStore, fetched, invoiceId]);
  if (!ready || (!inStore && fetched?.id !== invoiceId)) return <InvoiceDetailSkeleton />;

  const invoice = inStore ?? fetched?.invoice ?? undefined;
  if (!invoice)
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
        <ConsoleHeader crumbs={[{ label: "Invoices", href: "/invoices" }, { label: "Not found" }]} title="Invoice not found" />
        <div className="flex flex-col items-center rounded-xl border border-dashed border-dash bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-light text-brand-orange">
            <FileX2 className="h-6 w-6" />
          </span>
          <p className="mt-3 body-medium text-primary-500">We couldn&apos;t find this invoice</p>
          <p className="mt-1 body-sm-regular text-primary-300">It may have been removed or the link is incorrect.</p>
          <Link href="/invoices" className="mt-4 body-sm-medium text-brand-orange hover:underline">
            Back to all invoices
          </Link>
        </div>
      </motion.div>
    );

  const institution = store.institutions.find((i) => i.id === invoice.institutionId);
  const plan = store.plans.find((p) => p.id === invoice.planId);
  const settings = consoleSettings.settings;
  const retrying = actions.retrying === invoice.id;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Invoices", href: "/invoices" }, { label: invoice.number }]}
        title={invoice.number}
        badge={<InvoiceStatusBadge status={invoice.status} />}
        subtitle={`${formatMoney(invoice.total, { cents: true })} · ${institution?.name ?? "Unknown institution"}`}
        actions={
          <>
            <SecondaryButton size="lg" type="button" leftIcon={<Printer className="h-4 w-4" />} onClick={() => actions.print(invoice)}>
              Print
            </SecondaryButton>
            <SecondaryButton size="lg" type="button" leftIcon={<Download className="h-4 w-4" />} onClick={() => actions.download(invoice)}>
              Download PDF
            </SecondaryButton>
            {canCollect(invoice) && (
              <>
                <SecondaryButton size="lg" type="button" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={() => actions.requestMarkPaid(invoice)}>
                  Mark as paid
                </SecondaryButton>
                <PrimaryButton size="lg" type="button" leftIcon={<RefreshCw className="h-4 w-4" />} isLoading={retrying} disabled={retrying} onClick={() => void actions.retry(invoice)}>
                  {retrying ? "Retrying..." : "Retry payment"}
                </PrimaryButton>
              </>
            )}
            {invoice.status === "PAID" && (
              <SecondaryButton size="lg" type="button" leftIcon={<Undo2 className="h-4 w-4" />} onClick={() => actions.requestRefund(invoice)}>
                Refund
              </SecondaryButton>
            )}
          </>
        }
      />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <InvoiceDocument invoice={invoice} institution={institution} plan={plan} company={settings.company} footer={settings.billing.invoiceFooter} />
        </div>
        <aside className="min-w-0 xl:sticky xl:top-6 xl:col-span-4">
          <InvoiceSidePanel invoice={invoice} institution={institution} plans={store.plans} events={store.events} />
        </aside>
      </div>
      {actions.modals}
    </motion.div>
  );
}

export default InvoiceDetailView;
