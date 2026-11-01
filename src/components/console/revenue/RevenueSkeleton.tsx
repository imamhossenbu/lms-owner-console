import React from "react";
import { ChartCardSkeleton, ConsoleHeaderSkeleton } from "../shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "../subscriptions/shared/TableSkeleton";

/** Mirrors /revenue: header + range control + export, 5 KPI cards, two charts, month table. */
export function RevenueSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading revenue">
      <ConsoleHeaderSkeleton actions={2} />
      <KpiRowSkeleton count={5} className="lg:grid-cols-3 2xl:grid-cols-5" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCardSkeleton icon={false} bars={12} />
        <ChartCardSkeleton icon={false} bars={12} />
      </div>
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-64 rounded bg-slate-100" />
        </div>
        <ColumnTableSkeleton columns={["twoLine", "money", "twoLine", "twoLine", "twoLine", "twoLine", "money", "money"]} widths={["16%", "12%", "12%", "12%", "12%", "12%", "12%", "12%"]} rows={8} pagination={false} />
      </div>
    </div>
  );
}

export default RevenueSkeleton;
