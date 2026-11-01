"use client";

import React from "react";
import { CheckCircle2, FileText, RefreshCcw, Undo2 } from "lucide-react";
import type { Plan, SaasInvoice } from "@/types/saas";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { formatMoney } from "@/lib/saasStats";
import { InvoiceStatusBadge, PlanBadge } from "../../../shared/ConsoleBadges";
import { ConsoleEmptyState } from "../../../shared/ConsoleEmptyState";
import { CYCLE_LABEL, formatDate } from "../../../shared/consoleMeta";

export type InvoiceAction = "retry" | "refund" | "markPaid";

/** Institution invoices (newest first) with retry / mark paid / refund in the row menu. */
export function InvoicesTable({ invoices, plans, onAction }: { invoices: SaasInvoice[]; plans: Plan[]; onAction: (inv: SaasInvoice, action: InvoiceAction) => void }) {
  const menu = (inv: SaasInvoice): DropdownActionItem[] => {
    const unpaid = inv.status === "FAILED" || inv.status === "OPEN";
    return [
      { key: "retry", label: "Retry payment", icon: <RefreshCcw className="h-4 w-4" />, disabled: !unpaid, onClick: () => onAction(inv, "retry") },
      { key: "paid", label: "Mark as paid", icon: <CheckCircle2 className="h-4 w-4" />, disabled: !unpaid, onClick: () => onAction(inv, "markPaid") },
      { key: "refund", label: "Refund", icon: <Undo2 className="h-4 w-4" />, disabled: inv.status !== "PAID", danger: true, separatorBefore: true, onClick: () => onAction(inv, "refund") },
    ];
  };

  const columns: ColumnDef<SaasInvoice>[] = [
    {
      key: "number",
      header: "Invoice",
      render: (inv) => (
        <div className="min-w-0">
          <p className="truncate body-sm-medium text-primary-500" title={inv.number}>
            {inv.number}
          </p>
          <p className="truncate body-xsm-regular text-primary-300" title={inv.description}>
            {inv.description ?? "Subscription"}
          </p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      width: "120px",
      render: (inv) => (
        <div className="flex flex-col items-start gap-1">
          <PlanBadge planId={inv.planId} plans={plans} />
          <span className="body-2xsm-regular text-primary-300">{CYCLE_LABEL[inv.cycle]}</span>
        </div>
      ),
    },
    {
      key: "period",
      header: "Period",
      width: "190px",
      render: (inv) => (
        <span className="block truncate body-sm-regular text-primary-400" title={`${formatDate(inv.periodStart)} – ${formatDate(inv.periodEnd)}`}>
          {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      width: "110px",
      align: "right",
      render: (inv) => (
        <div className="text-right">
          <p className="tabular-nums body-sm-medium text-primary-500">{formatMoney(inv.total, { cents: inv.total % 1 !== 0 })}</p>
          {inv.tax > 0 && <p className="tabular-nums body-2xsm-regular text-primary-300">incl. {formatMoney(inv.tax, { cents: true })} tax</p>}
        </div>
      ),
    },
    { key: "status", header: "Status", width: "110px", render: (inv) => <InvoiceStatusBadge status={inv.status} /> },
    {
      key: "paid",
      header: "Issued / paid",
      width: "130px",
      render: (inv) => (
        <div className="min-w-0">
          <p className="truncate body-sm-regular text-primary-400">{formatDate(inv.issuedAt)}</p>
          <p className="truncate body-2xsm-regular text-primary-300">{inv.paidAt ? `Paid ${formatDate(inv.paidAt)}` : inv.status === "OPEN" || inv.status === "FAILED" ? `Due ${formatDate(inv.dueAt)}` : "—"}</p>
        </div>
      ),
    },
    { key: "actions", header: "", width: "60px", align: "center", render: (inv) => <RowMoreMenu size="sm" label={`Actions for ${inv.number}`} items={menu(inv)} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      rowKey={(r) => r.id}
      tableClassName="table-fixed"
      minWidth="min-w-0"
      emptyMessage={<ConsoleEmptyState icon={<FileText className="h-6 w-6" />} title="No invoices yet" message="Invoices appear once the trial converts or a paid period starts." />}
    />
  );
}

export default InvoicesTable;
