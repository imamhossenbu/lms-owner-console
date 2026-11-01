"use client";

import React from "react";
import type { CustomDomain } from "@/types/saas";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToneBadge } from "@/components/ui/ToneBadge";

interface DnsRow {
  id: string;
  type: "CNAME" | "TXT";
  host: string;
  value: string;
  purpose: string;
}

/** DNS records the institution must add at its registrar (CNAME → cname.edupro.com, TXT verification token). */
export function DnsRecordsTable({ domain }: { domain: CustomDomain }) {
  const ok = domain.status === "VERIFIED";
  const rows: DnsRow[] = [
    { id: "cname", type: "CNAME", host: domain.domain, value: domain.dnsTarget, purpose: "Routes traffic to EduPro" },
    { id: "txt", type: "TXT", host: `_edupro-verify.${domain.domain}`, value: domain.txtToken, purpose: "Proves ownership" },
  ];
  const columns: ColumnDef<DnsRow>[] = [
    {
      key: "type",
      header: "Type",
      width: "90px",
      render: (r) => (
        <ToneBadge tone="navy" size="sm">
          {r.type}
        </ToneBadge>
      ),
    },
    {
      key: "host",
      header: "Host / name",
      render: (r) => (
        <div className="flex min-w-0 items-center gap-1">
          <code className="truncate body-sm-medium text-primary-500" title={r.host}>
            {r.host}
          </code>
          <CopyButton value={r.host} label="Host copied" />
        </div>
      ),
    },
    {
      key: "value",
      header: "Value / points to",
      render: (r) => (
        <div className="flex min-w-0 items-center gap-1">
          <code className="truncate body-sm-medium text-primary-500" title={r.value}>
            {r.value}
          </code>
          <CopyButton value={r.value} label="Value copied" />
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      width: "180px",
      render: (r) => (
        <span className="block truncate body-sm-regular text-primary-400" title={r.purpose}>
          {r.purpose}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: () => (
        <ToneBadge tone={ok ? "green" : domain.status === "FAILED" ? "red" : "yellow"} size="sm" variant="pill" dot>
          {ok ? "Found" : domain.status === "FAILED" ? "Not found" : "Waiting"}
        </ToneBadge>
      ),
    },
  ];
  return <DataTable columns={columns} data={rows} rowKey={(r) => r.id} tableClassName="table-fixed" minWidth="min-w-0" />;
}

export default DnsRecordsTable;
