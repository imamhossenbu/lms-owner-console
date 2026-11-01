"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { Institution, Plan } from "@/types/saas";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { formatMoney, trialDaysLeft } from "@/lib/saasStats";
import { InstitutionAvatar } from "../../shared/InstitutionAvatar";
import { PlanBadge, SubscriptionStatusBadge } from "../../shared/ConsoleBadges";
import { UsageBar } from "../../shared/UsageBar";
import { CYCLE_LABEL, formatDate, relativeTime, tenantHost } from "../../shared/consoleMeta";
import type { InstitutionDialogOpeners } from "../actions/useInstitutionDialogs";
import { institutionMenuItems } from "./institutionMenuItems";
import { institutionMrr, type InstitutionSort, type SortKey } from "./institutionsFilters";

export interface InstitutionsTableProps {
  rows: Institution[];
  plans: Plan[];
  sort: InstitutionSort;
  onSort: (key: SortKey) => void;
  open: InstitutionDialogOpeners;
  now: number;
  emptyMessage: React.ReactNode;
  /** Rendered inside the table frame, under the rows (pagination). */
  footer?: React.ReactNode;
}

/** Institutions DataTable — same frame as the panel's OrdersTable (bordered box, column borders, pagination footer inside). */
export function InstitutionsTable({ rows, plans, sort, onSort, open, now, emptyMessage, footer }: InstitutionsTableProps) {
  const router = useRouter();
  const dir = (key: SortKey) => (sort.key === key ? sort.dir : null);

  const columns: ColumnDef<Institution>[] = [
    {
      key: "name",
      header: "Institution",
      sortDirection: dir("name"),
      onHeaderClick: () => onSort("name"),
      render: (i) => {
        const host = i.customDomain?.status === "VERIFIED" ? i.customDomain.domain : tenantHost(i.slug);
        return (
          <div className="flex min-w-56 items-center gap-3">
            <InstitutionAvatar initials={i.logoInitials} tone={i.tone} size="md" />
            <div className="min-w-0">
              <p className="truncate body-sm-medium text-primary-500" title={i.name}>
                {i.name}
              </p>
              <p className="truncate body-xsm-regular text-primary-300" title={host}>
                {host}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "plan",
      header: "Plan",
      render: (i) => (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <PlanBadge planId={i.subscription.planId} plans={plans} />
          <span className="whitespace-nowrap body-xsm-regular text-primary-300">{CYCLE_LABEL[i.subscription.cycle]}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (i) => {
        const left = trialDaysLeft(i, now);
        return (
          <div className="flex min-w-0 flex-col items-start gap-1">
            <SubscriptionStatusBadge subscription={i.subscription} />
            {left !== null && <span className={left <= 3 ? "whitespace-nowrap body-xsm-regular text-red" : "whitespace-nowrap body-xsm-regular text-primary-300"}>{left <= 0 ? "Ends today" : `${left}d left`}</span>}
          </div>
        );
      },
    },
    {
      key: "students",
      header: "Students",
      render: (i) => (
        <div className="min-w-40">
          <UsageBar usage={i.usage.students} limit={plans.find((p) => p.id === i.subscription.planId)?.limits.students ?? null} limitKey="students" variant="compact" />
        </div>
      ),
    },
    {
      key: "mrr",
      header: "MRR",
      align: "right",
      sortDirection: dir("mrr"),
      onHeaderClick: () => onSort("mrr"),
      render: (i) => {
        const v = institutionMrr(plans, i);
        return <span className={v ? "tabular-nums body-sm-medium text-primary-500" : "tabular-nums body-sm-regular text-primary-300"}>{v ? formatMoney(Math.round(v)) : "—"}</span>;
      },
    },
    {
      key: "created",
      header: "Created",
      sortDirection: dir("created"),
      onHeaderClick: () => onSort("created"),
      render: (i) => (
        <div className="whitespace-nowrap">
          <p className="body-sm-regular text-primary-500">{formatDate(i.createdAt)}</p>
          <p className="body-xsm-regular text-primary-300">{relativeTime(i.createdAt, now)}</p>
        </div>
      ),
    },
    {
      key: "active",
      header: "Last active",
      sortDirection: dir("active"),
      onHeaderClick: () => onSort("active"),
      render: (i) => (
        <div className="whitespace-nowrap">
          <p className="body-sm-regular text-primary-500">{relativeTime(i.lastActiveAt, now)}</p>
          <p className="body-xsm-regular text-primary-300">{formatDate(i.lastActiveAt)}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "76px",
      align: "center",
      render: (i) => (
        <RowMoreMenu
          label={`Actions for ${i.name}`}
          items={institutionMenuItems(i, open, { view: () => router.push(`/institutions/${i.id}`), edit: () => router.push(`/institutions/${i.id}/edit`) })}
        />
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/institutions/${r.id}`)}
        verticalBorders
        containerClassName="border-0 rounded-none"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        emptyMessage={emptyMessage}
      />
      {footer}
    </div>
  );
}

export default InstitutionsTable;
