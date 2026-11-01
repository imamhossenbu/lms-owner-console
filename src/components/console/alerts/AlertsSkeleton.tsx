import React from "react";
import { ConsoleHeaderSkeleton, FiltersSkeleton, PillTabsSkeleton } from "../shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "../subscriptions/shared/TableSkeleton";

/** Mirrors /alerts: header + Mark all read, 4 KPI cards, capsule tabs, filter card with the alerts table. */
export function AlertsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading alerts">
      <ConsoleHeaderSkeleton actions={1} />
      <KpiRowSkeleton count={4} className="xl:grid-cols-4" />
      <PillTabsSkeleton tabs={5} />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={1} />
        <ColumnTableSkeleton columns={["institution", "badge", "twoLine", "badge", "badge", "menu"]} widths={["26%", "16%", "28%", "10%", "12%", "8%"]} rows={8} />
      </div>
    </div>
  );
}

export default AlertsSkeleton;
