"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, FileText, RefreshCcw, Undo2 } from "lucide-react";
import type { Institution, Plan, SaasInvoice } from "@/types/saas";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { formatMoney, subscriptionPrice } from "@/lib/saasStats";
import { formatDate } from "../../../shared/consoleMeta";
import { Receipt } from "lucide-react";
import { ActionConfirmModal } from "../../../shared/ActionConfirmModal";
import type { InstitutionActions } from "../../actions/useInstitutionActions";
import { InvoicesTable, type InvoiceAction } from "./InvoicesTable";
import { PaymentMethodCard } from "./PaymentMethodCard";

function BillingTotals({ paid, unpaid, count, nextCharge, nextAmount }: { paid: number; unpaid: number; count: number; nextCharge: string | null; nextAmount: number }) {
  const facts = [
    { label: "Lifetime collected", value: formatMoney(Math.round(paid)), tone: "text-primary-500" },
    { label: "Outstanding", value: formatMoney(unpaid, { cents: unpaid % 1 !== 0 }), tone: unpaid ? "text-red" : "text-primary-500" },
    { label: "Invoices", value: count.toLocaleString("en-US"), tone: "text-primary-500" },
    { label: "Next charge", value: nextCharge && nextAmount ? `${formatMoney(nextAmount)} · ${formatDate(nextCharge)}` : "—", tone: "text-primary-500" },
  ];
  return (
    <IconSectionCard icon={<Receipt className="h-5 w-5" />} tone="purple" title="Billing summary" description="Totals across every invoice.">
      <div className="grid grid-cols-2 gap-3">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
            <p className="truncate body-xsm-regular text-primary-300">{f.label}</p>
            <p className={`mt-1 truncate body-md-medium font-semibold! ${f.tone}`}>{f.value}</p>
          </div>
        ))}
      </div>
    </IconSectionCard>
  );
}

/** Billing tab: invoices (retry / mark paid / refund with confirmation) + payment method and totals. */
export function BillingTab({ institution: inst, invoices, plans, actions }: { institution: Institution; invoices: SaasInvoice[]; plans: Plan[]; actions: InstitutionActions }) {
  const [pending, setPending] = useState<{ inv: SaasInvoice; action: InvoiceAction } | null>(null);
  const rows = useMemo(() => invoices.filter((i) => i.institutionId === inst.id).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)), [invoices, inst.id]);
  const paid = rows.filter((r) => r.status === "PAID").reduce((s, r) => s + r.total, 0);
  const unpaid = rows.filter((r) => r.status === "FAILED" || r.status === "OPEN");
  const unpaidTotal = unpaid.reduce((s, r) => s + r.total, 0);
  const s = inst.subscription;
  const nextCharge = s.status === "ACTIVE" && !s.cancelAtPeriodEnd ? s.currentPeriodEnd : s.status === "TRIALING" ? s.trialEndsAt : null;
  const close = () => setPending(null);
  const inv = pending?.inv;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PaymentMethodCard institution={inst} nextCharge={nextCharge} />
        <BillingTotals paid={paid} unpaid={unpaidTotal} count={rows.length} nextCharge={nextCharge} nextAmount={nextCharge ? subscriptionPrice(plans, inst) : 0} />
      </div>
      <div className="min-w-0">
        <IconSectionCard
          icon={<FileText className="h-5 w-5" />}
          title="Invoices"
          description={`${rows.length} invoice${rows.length === 1 ? "" : "s"} · ${formatMoney(Math.round(paid))} collected`}
          action={
            unpaid.length ? (
              <ToneBadge tone="red" variant="pill">
                {formatMoney(unpaidTotal, { cents: unpaidTotal % 1 !== 0 })} unpaid
              </ToneBadge>
            ) : (
              <ToneBadge tone="green" variant="pill">
                All settled
              </ToneBadge>
            )
          }
        >
          <InvoicesTable invoices={rows} plans={plans} onAction={(i, action) => setPending({ inv: i, action })} />
        </IconSectionCard>
      </div>

      <ActionConfirmModal
        isOpen={pending?.action === "retry"}
        title={`Retry ${inv?.number ?? "invoice"}?`}
        subtitle={inst.name}
        message={<>We&apos;ll charge {inv ? formatMoney(inv.total, { cents: inv.total % 1 !== 0 }) : ""} to {s.paymentMethod ? `${s.paymentMethod.brand} •••• ${s.paymentMethod.last4}` : "the payment method on file (none — this will fail)"}.</>}
        confirmLabel="Retry payment"
        pendingLabel="Charging..."
        confirmIcon={<RefreshCcw className="h-4 w-4" />}
        onClose={close}
        onConfirm={() => actions.retryInvoice(inv!)}
      />
      <ActionConfirmModal
        isOpen={pending?.action === "markPaid"}
        title={`Mark ${inv?.number ?? "invoice"} as paid?`}
        subtitle="Record an offline payment (bank transfer, cash, manual bKash)."
        message={<>The invoice is marked paid today. If no other invoice is unpaid, the subscription returns to Active.</>}
        confirmLabel="Mark as paid"
        pendingLabel="Saving..."
        confirmIcon={<CheckCircle2 className="h-4 w-4" />}
        onClose={close}
        onConfirm={() => actions.markInvoicePaid(inv!)}
      />
      <ConfirmModal
        isOpen={pending?.action === "refund"}
        title={`Refund ${inv?.number ?? "invoice"}?`}
        message={<>{inv ? formatMoney(inv.total, { cents: inv.total % 1 !== 0 }) : ""} goes back to the customer. The subscription itself is not changed.</>}
        confirmLabel="Refund invoice"
        pendingLabel="Refunding..."
        confirmIcon={<Undo2 className="h-4 w-4" />}
        onClose={close}
        onConfirm={async () => {
          await actions.refundInvoice(inv!);
        }}
      />
    </div>
  );
}

export default BillingTab;
