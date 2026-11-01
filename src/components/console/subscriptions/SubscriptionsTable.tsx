"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import type { Plan } from "@/types/saas";
import { formatMoney } from "@/lib/saasStats";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { PlanBadge } from "@/components/console/shared/ConsoleBadges";
import { formatDate } from "@/components/console/shared/consoleMeta";
import { InstitutionCell } from "./shared/InstitutionCell";
import { CycleBadge, DaysLeftBadge, SubStatusBadge } from "./shared/SubscriptionBadges";
import type { SubscriptionRow, SubscriptionSort } from "./subscriptionUtils";

interface SubscriptionsTableProps {
  rows: SubscriptionRow[];
  plans: Plan[];
  sort: SubscriptionSort;
  dir: "asc" | "desc";
  onSort: (sort: SubscriptionSort) => void;
  onRowClick: (row: SubscriptionRow) => void;
  getMenuItems: (row: SubscriptionRow) => DropdownActionItem[];
  footer?: React.ReactNode;
  emptyMessage: string;
}

const endLabel = (row: SubscriptionRow) => {
  const s = row.institution.subscription;
  if (s.status === "TRIALING") return "Trial ends";
  if (s.status === "CANCELLED") return "Ended";
  if (s.cancelAtPeriodEnd) return "Ends";
  return "Renews";
};

/** Subscriptions DataTable: fixed layout, truncating cells, vertical borders, sortable MRR / dates. */
export function SubscriptionsTable({ rows, plans, sort, dir, onSort, onRowClick, getMenuItems, footer, emptyMessage }: SubscriptionsTableProps) {
  const sortDir = (key: SubscriptionSort) => (sort === key ? dir : null);
  const columns: ColumnDef<SubscriptionRow>[] = [
    {
      key: "institution",
      header: "Institution",
      width: "25%",
      sortDirection: sortDir("name"),
      onHeaderClick: () => onSort("name"),
      render: (row) => <InstitutionCell institution={row.institution} />,
    },
    { key: "plan", header: "Plan", width: "11%", render: (row) => <PlanBadge planId={row.institution.subscription.planId} plans={plans} /> },
    { key: "cycle", header: "Cycle", width: "9%", render: (row) => <CycleBadge cycle={row.institution.subscription.cycle} /> },
    {
      key: "status",
      header: "Status",
      width: "11%",
      render: (row) => <SubStatusBadge status={row.institution.subscription.status} cancelling={row.institution.subscription.cancelAtPeriodEnd} />,
    },
    {
      key: "mrr",
      header: "MRR",
      width: "9%",
      align: "right",
      sortDirection: sortDir("mrr"),
      onHeaderClick: () => onSort("mrr"),
      render: (row) =>
        row.mrr > 0 ? (
          <span className="body-sm-medium text-primary-500">{formatMoney(Math.round(row.mrr * 100) / 100)}</span>
        ) : (
          <span className="body-sm-regular text-primary-300" title={row.potential ? `${formatMoney(row.potential)}/mo when paying` : undefined}>
            —
          </span>
        ),
    },
    {
      key: "end",
      header: "Period end / Trial ends",
      width: "15%",
      sortDirection: sortDir("end"),
      onHeaderClick: () => onSort("end"),
      render: (row) => {
        const s = row.institution.subscription;
        const showDays = s.status === "TRIALING" || (s.status !== "CANCELLED" && row.daysLeft <= 30);
        return (
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate body-sm-regular text-primary-500">{formatDate(row.endAt)}</p>
              <p className="truncate body-xsm-regular text-primary-300">{endLabel(row)}</p>
            </div>
            {showDays && <DaysLeftBadge days={row.daysLeft} />}
          </div>
        );
      },
    },
    {
      key: "payment",
      header: "Payment method",
      width: "13%",
      render: (row) => {
        const pm = row.institution.subscription.paymentMethod;
        return pm ? (
          <span className="flex min-w-0 items-center gap-2 body-sm-regular text-primary-500" title={`${pm.brand} •••• ${pm.last4}`}>
            <CreditCard className="h-4 w-4 shrink-0 text-primary-300" />
            <span className="truncate">
              {pm.brand} •••• {pm.last4}
            </span>
          </span>
        ) : (
          <ToneBadge tone="yellow" size="sm">
            None on file
          </ToneBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "7%",
      align: "center",
      render: (row) => <RowMoreMenu size="sm" label={`Actions for ${row.institution.name}`} items={getMenuItems(row)} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        verticalBorders
        tableClassName="table-fixed"
        containerClassName="border-0 rounded-none overflow-x-hidden"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        emptyMessage={emptyMessage}
      />
      {footer}
    </div>
  );
}

export default SubscriptionsTable;
