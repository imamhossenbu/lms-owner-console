"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { DomainStatusBadge } from "@/components/console/shared/ConsoleBadges";
import { formatDate, relativeTime } from "@/components/console/shared/consoleMeta";
import { InstitutionCell } from "@/components/console/subscriptions/shared/InstitutionCell";
import { cn } from "@/lib/cn";
import type { DomainRow } from "./domainUtils";

interface DomainsTableProps {
  rows: DomainRow[];
  verifying: string | null;
  onVerify: (row: DomainRow) => void;
  getMenuItems: (row: DomainRow) => DropdownActionItem[];
  footer?: React.ReactNode;
}

/** Custom domains DataTable — failing rows tinted red. */
export function DomainsTable({ rows, verifying, onVerify, getMenuItems, footer }: DomainsTableProps) {
  const columns: ColumnDef<DomainRow>[] = [
    { key: "institution", header: "Institution", render: (row) => <InstitutionCell institution={row.institution} /> },
    {
      key: "domain",
      header: "Domain",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          {row.domain.status === "FAILED" ? <AlertTriangle className="h-4 w-4 shrink-0 text-red" /> : row.domain.status === "VERIFIED" ? <ShieldCheck className="h-4 w-4 shrink-0 text-green" /> : null}
          <span className={cn("whitespace-nowrap body-sm-medium", row.domain.status === "FAILED" ? "text-red" : "text-primary-500")} title={row.domain.domain}>
            {row.domain.domain}
          </span>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <DomainStatusBadge status={row.domain.status} /> },
    {
      key: "target",
      header: "DNS target",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1">
          <span className="whitespace-nowrap body-xsm-regular text-primary-400" title={`CNAME → ${row.domain.dnsTarget}`}>
            {row.domain.dnsTarget}
          </span>
          <CopyButton value={row.domain.dnsTarget} label="CNAME target copied" />
        </div>
      ),
    },
    { key: "added", header: "Added", render: (row) => <span className="block truncate body-sm-regular text-primary-500">{formatDate(row.domain.addedAt)}</span> },
    {
      key: "verified",
      header: "Verified",
      render: (row) =>
        row.domain.verifiedAt ? (
          <span className="block truncate body-sm-regular text-primary-500">{formatDate(row.domain.verifiedAt)}</span>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <CardActionButton icon={<ShieldCheck />} onClick={() => onVerify(row)} disabled={verifying === row.id}>
              {verifying === row.id ? "Checking..." : "Verify"}
            </CardActionButton>
            {row.domain.lastCheckedAt && <p className="mt-1 truncate body-2xsm-regular text-primary-300">Checked {relativeTime(row.domain.lastCheckedAt)}</p>}
          </div>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (row) => <RowMoreMenu size="sm" label={`Actions for ${row.domain.domain}`} items={getMenuItems(row)} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        verticalBorders
        containerClassName="border-0 rounded-none"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        rowClassName={(row) => (row.domain.status === "FAILED" ? "bg-red-14 hover:bg-red-14" : undefined)}
        emptyMessage="No custom domains match your filters."
      />
      {footer}
    </div>
  );
}

export default DomainsTable;
