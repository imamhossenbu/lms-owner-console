import React from "react";
import { ConsoleHeaderSkeleton, ChartCardSkeleton, FiltersSkeleton, ListRowsSkeleton, PillTabsSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "./shared/TableSkeleton";

export const SUBSCRIPTION_SKELETON_WIDTHS = ["25%", "11%", "9%", "11%", "9%", "15%", "13%", "7%"];

/** Mirrors /console/subscriptions: header, 6 KPIs, capsule tabs, filters, table, revenue chart + status list. */
export function SubscriptionsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading subscriptions">
      <ConsoleHeaderSkeleton actions={0} />
      <KpiRowSkeleton count={6} className="xl:grid-cols-3 2xl:grid-cols-6" />
      <PillTabsSkeleton tabs={5} />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={2} />
        <ColumnTableSkeleton columns={["institution", "badge", "badge", "badge", "money", "twoLine", "text", "menu"]} widths={SUBSCRIPTION_SKELETON_WIDTHS} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCardSkeleton bars={4} className="xl:col-span-2" />
        <div className="dashboard-card p-5">
          <ListRowsSkeleton rows={5} action={false} />
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsSkeleton;
