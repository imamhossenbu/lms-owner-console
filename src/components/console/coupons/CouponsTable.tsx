"use client";

import React from "react";
import type { Coupon } from "@/types/coupon";
import type { Plan } from "@/types/saas";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { couponStatus, cycleLabel, daysUntilExpiry, discountLabel, durationLabel, totalDiscount } from "@/lib/couponMath";
import { formatMoney } from "@/lib/saasStats";
import { cn } from "@/lib/cn";
import { formatDate } from "../shared/consoleMeta";
import { PlanBadge } from "../shared/ConsoleBadges";
import { CouponStatusBadge } from "./couponMeta";

interface CouponsTableProps {
  rows: Coupon[];
  plans: Plan[];
  now: number;
  onRowClick: (c: Coupon) => void;
  getMenuItems: (c: Coupon) => DropdownActionItem[];
  emptyMessage: React.ReactNode;
  footer?: React.ReactNode;
}

/** Coupons table — panel OrdersTable frame. */
export function CouponsTable({ rows, plans, now, onRowClick, getMenuItems, emptyMessage, footer }: CouponsTableProps) {
  const columns: ColumnDef<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => (
        <div className="flex min-w-52 items-center gap-2">
          <div className="min-w-0">
            <p className="whitespace-nowrap body-sm-medium text-primary-500">{c.code}</p>
            <p className="max-w-64 truncate body-xsm-regular text-primary-300" title={c.description}>
              {c.description || "No description"}
            </p>
          </div>
          <span onClick={(e) => e.stopPropagation()}>
            <CopyButton value={c.code} label={`Copy ${c.code}`} />
          </span>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (c) => (
        <div className="whitespace-nowrap">
          <p className="body-sm-medium text-primary-500">{discountLabel(c)}</p>
          <p className="body-xsm-regular text-primary-300">{durationLabel(c)}</p>
        </div>
      ),
    },
    {
      key: "applies",
      header: "Applies to",
      render: (c) => (
        <div className="min-w-36 space-y-1">
          <div className="flex flex-wrap gap-1">
            {c.planIds.length ? c.planIds.map((id) => <PlanBadge key={id} planId={id} plans={plans} />) : <ToneBadge tone="navy">All plans</ToneBadge>}
          </div>
          <p className="whitespace-nowrap body-xsm-regular text-primary-300">
            {cycleLabel(c.cycle)}
            {c.newCustomersOnly ? " · new only" : ""}
          </p>
        </div>
      ),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      render: (c) => {
        const pct = c.maxRedemptions ? Math.min(100, (c.redemptions.length / c.maxRedemptions) * 100) : null;
        return (
          <div className="min-w-32">
            <div className="flex items-center justify-between gap-3 whitespace-nowrap">
              <span className="body-sm-medium text-primary-500">
                {c.redemptions.length}
                <span className="body-sm-regular text-primary-300"> / {c.maxRedemptions ?? "∞"}</span>
              </span>
              <span className="body-xsm-regular text-primary-300">{formatMoney(Math.round(totalDiscount(c)))}</span>
            </div>
            {pct !== null && (
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full", pct >= 100 ? "bg-yellow" : "bg-brand-orange")} style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "expires",
      header: "Expires",
      render: (c) => {
        const days = daysUntilExpiry(c, now);
        return (
          <div className="whitespace-nowrap">
            <p className="body-sm-regular text-primary-500">{c.expiresAt ? formatDate(`${c.expiresAt.slice(0, 10)}T12:00:00.000Z`) : "Never"}</p>
            <p className={cn("body-xsm-regular", days !== null && days >= 0 && days <= 7 ? "text-red" : "text-primary-300")}>
              {days === null ? "No end date" : days < 0 ? `${-days}d ago` : days === 0 ? "Ends today" : `${days}d left`}
            </p>
          </div>
        );
      },
    },
    { key: "status", header: "Status", render: (c) => <CouponStatusBadge status={couponStatus(c, now)} /> },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      width: "76px",
      render: (c) => <RowMoreMenu label={`Actions for ${c.code}`} items={getMenuItems(c)} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(c) => c.id}
        onRowClick={onRowClick}
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

export default CouponsTable;
