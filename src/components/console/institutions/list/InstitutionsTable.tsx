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
}

/** Institutions DataTable (fixed layout, truncation with titles, vertical borders, sortable MRR / dates). */
export function InstitutionsTable({ rows, plans, sort, onSort, open, now, emptyMessage }: InstitutionsTableProps) {
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
          <div className="flex min-w-0 items-center gap-2.5">
            <InstitutionAvatar initials={i.logoInitials} tone={i.tone} size="sm" />
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
      width: "130px",
      render: (i) => (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <PlanBadge planId={i.subscription.planId} plans={plans} />
          <span className="truncate body-2xsm-regular text-primary-300">{CYCLE_LABEL[i.subscription.cycle]}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "130px",
      render: (i) => {
        const left = trialDaysLeft(i, now);
        return (
          <div className="flex min-w-0 flex-col items-start gap-1">
            <SubscriptionStatusBadge subscription={i.subscription} />
            {left !== null && <span className={left <= 3 ? "body-2xsm-regular text-red" : "body-2xsm-regular text-primary-300"}>{left <= 0 ? "Ends today" : `${left}d left`}</span>}
          </div>
        );
      },
    },
    {
      key: "students",
      header: "Students",
      width: "160px",
      render: (i) => <UsageBar usage={i.usage.students} limit={plans.find((p) => p.id === i.subscription.planId)?.limits.students ?? null} limitKey="students" variant="compact" />,
    },
    {
      key: "mrr",
      header: "MRR",
      width: "96px",
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
      width: "112px",
      sortDirection: dir("created"),
      onHeaderClick: () => onSort("created"),
      render: (i) => (
        <span className="block truncate body-sm-regular text-primary-400" title={formatDate(i.createdAt)}>
          {formatDate(i.createdAt)}
        </span>
      ),
    },
    {
      key: "active",
      header: "Last active",
      width: "104px",
      sortDirection: dir("active"),
      onHeaderClick: () => onSort("active"),
      render: (i) => (
        <span className="block truncate body-sm-regular text-primary-400" title={formatDate(i.lastActiveAt)}>
          {relativeTime(i.lastActiveAt, now)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      align: "center",
      render: (i) => (
        <RowMoreMenu
          size="sm"
          label={`Actions for ${i.name}`}
          items={institutionMenuItems(i, open, { view: () => router.push(`/institutions/${i.id}`), edit: () => router.push(`/institutions/${i.id}/edit`) })}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/institutions/${r.id}`)}
      emptyMessage={emptyMessage}
      tableClassName="table-fixed"
      minWidth="min-w-0"
      className="rounded-none border-0"
    />
  );
}

export default InstitutionsTable;
