"use client";

import React from "react";
import Link from "next/link";
import type { SaasInvoice } from "@/types/saas";
import type { AttentionItem } from "@/lib/saasStats";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { InstitutionAvatar } from "../shared/InstitutionAvatar";
import { tenantHost } from "../shared/consoleMeta";
import { ATTENTION_KIND, AttentionAction } from "../shared/attentionMeta";
import type { InstitutionDialogOpeners } from "../institutions/actions/useInstitutionDialogs";
import type { InstitutionActions } from "../institutions/actions/useInstitutionActions";

interface AlertsTableProps {
  rows: AttentionItem[];
  seen: string[];
  invoices: SaasInvoice[];
  open: InstitutionDialogOpeners;
  actions: InstitutionActions;
  onRead: (item: AttentionItem) => void;
  getMenuItems: (item: AttentionItem) => DropdownActionItem[];
  emptyMessage: React.ReactNode;
  footer?: React.ReactNode;
}

/** Alerts table — panel table frame; unread rows tinted like the panel's notification list. */
export function AlertsTable({ rows, seen, invoices, open, actions, onRead, getMenuItems, emptyMessage, footer }: AlertsTableProps) {
  const columns: ColumnDef<AttentionItem>[] = [
    {
      key: "institution",
      header: "Institution",
      render: (item) => {
        const unread = !seen.includes(item.id);
        return (
          <div className="flex min-w-56 items-center gap-3">
            <InstitutionAvatar initials={item.institution.logoInitials} tone={item.institution.tone} size="md" />
            <div className="min-w-0">
              <Link
                href={`/institutions/${item.institution.id}`}
                onClick={() => onRead(item)}
                className={cn("block truncate body-sm-medium hover:text-brand-orange", unread ? "text-primary-500 font-bold!" : "text-primary-500")}
              >
                {item.institution.name}
              </Link>
              <p className="truncate body-xsm-regular text-primary-300">{tenantHost(item.institution.slug)}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (item) => {
        const meta = ATTENTION_KIND[item.kind];
        const Icon = meta.icon;
        return (
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.tile)}>
              <Icon className="h-4 w-4" />
            </span>
            <ToneBadge tone={meta.tone}>{meta.label}</ToneBadge>
          </div>
        );
      },
    },
    {
      key: "alert",
      header: "Alert",
      render: (item) => (
        <div className="min-w-56">
          <p className="body-sm-medium text-primary-500">{item.title}</p>
          <p className="body-xsm-regular text-primary-300">{item.detail}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) =>
        seen.includes(item.id) ? <ToneBadge tone="gray">Read</ToneBadge> : <ToneBadge tone="orange">New</ToneBadge>,
    },
    {
      key: "fix",
      header: "Fix",
      align: "center",
      render: (item) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <AttentionAction item={item} invoices={invoices} open={open} actions={actions} onAct={() => onRead(item)} />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      width: "76px",
      render: (item) => <RowMoreMenu label={`Actions for ${item.institution.name}`} items={getMenuItems(item)} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        verticalBorders
        containerClassName="border-0 rounded-none"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        rowClassName={(r) => (seen.includes(r.id) ? undefined : "bg-brand-orange-soft")}
        emptyMessage={emptyMessage}
      />
      {footer}
    </div>
  );
}

export default AlertsTable;
