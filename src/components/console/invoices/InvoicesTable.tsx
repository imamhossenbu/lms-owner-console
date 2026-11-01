"use client";

import React from "react";
import type { Institution, SaasInvoice } from "@/types/saas";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { InvoiceStatusBadge } from "@/components/console/shared/ConsoleBadges";
import { InstitutionCell } from "@/components/console/subscriptions/shared/InstitutionCell";
import { formatDate, formatMoney, formatPeriod } from "./invoiceUtils";

export type InvoiceSort = "issued" | "amount";

interface InvoicesTableProps {
  invoices: SaasInvoice[];
  institutions: Map<string, Institution>;
  planName: (id: string) => string;
  sort: InvoiceSort;
  dir: "asc" | "desc";
  onSort: (key: InvoiceSort) => void;
  onRowClick: (invoice: SaasInvoice) => void;
  getMenuItems: (invoice: SaasInvoice) => DropdownActionItem[];
  footer?: React.ReactNode;
}

/** Invoices DataTable (fixed layout, truncation with titles, vertical borders, failed rows flagged). */
export function InvoicesTable({ invoices, institutions, planName, sort, dir, onSort, onRowClick, getMenuItems, footer }: InvoicesTableProps) {
  const sortDir = (key: InvoiceSort) => (sort === key ? dir : null);
  const columns: ColumnDef<SaasInvoice>[] = [
    {
      key: "number",
      header: "Number",
      width: "14%",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-mono body-sm-medium text-primary-500" title={row.number}>
            {row.number}
          </p>
          <p className="truncate body-xsm-regular text-primary-300" title={row.description}>
            {planName(row.planId)} · {row.cycle === "YEARLY" ? "Yearly" : "Monthly"}
          </p>
        </div>
      ),
    },
    { key: "institution", header: "Institution", width: "23%", render: (row) => <InstitutionCell institution={institutions.get(row.institutionId)} /> },
    {
      key: "period",
      header: "Period",
      width: "16%",
      render: (row) => (
        <span className="block truncate body-sm-regular text-primary-500" title={formatPeriod(row.periodStart, row.periodEnd)}>
          {formatPeriod(row.periodStart, row.periodEnd)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "10%",
      align: "right",
      sortDirection: sortDir("amount"),
      onHeaderClick: () => onSort("amount"),
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate body-sm-medium text-primary-500">{formatMoney(row.total, { cents: true })}</p>
          {row.tax > 0 && <p className="truncate body-2xsm-regular text-primary-300">incl. {formatMoney(row.tax, { cents: true })} tax</p>}
        </div>
      ),
    },
    { key: "status", header: "Status", width: "11%", render: (row) => <InvoiceStatusBadge status={row.status} /> },
    {
      key: "issued",
      header: "Issued",
      width: "10%",
      sortDirection: sortDir("issued"),
      onHeaderClick: () => onSort("issued"),
      render: (row) => <span className="block truncate body-sm-regular text-primary-500">{formatDate(row.issuedAt)}</span>,
    },
    {
      key: "paid",
      header: "Paid",
      width: "10%",
      render: (row) =>
        row.paidAt ? (
          <span className="block truncate body-sm-regular text-primary-500">{formatDate(row.paidAt)}</span>
        ) : (
          <span className="block truncate body-xsm-regular text-primary-300" title={`Due ${formatDate(row.dueAt)}`}>
            Due {formatDate(row.dueAt)}
          </span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "6%",
      align: "center",
      render: (row) => <RowMoreMenu size="sm" label={`Actions for ${row.number}`} items={getMenuItems(row)} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={invoices}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        verticalBorders
        tableClassName="table-fixed"
        containerClassName="border-0 rounded-none overflow-x-hidden"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        emptyMessage="No invoices match your filters."
      />
      {footer}
    </div>
  );
}

export default InvoicesTable;
