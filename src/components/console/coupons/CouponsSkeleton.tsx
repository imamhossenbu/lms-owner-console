import React from "react";
import { ConsoleHeaderSkeleton, FiltersSkeleton } from "../shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "../subscriptions/shared/TableSkeleton";

/** Mirrors /coupons: header + Create, 4 KPI cards, filter card with the coupons table. */
export function CouponsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading coupons">
      <ConsoleHeaderSkeleton actions={1} />
      <KpiRowSkeleton count={4} className="xl:grid-cols-4" />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={2} />
        <ColumnTableSkeleton columns={["twoLine", "twoLine", "badge", "twoLine", "twoLine", "badge", "menu"]} widths={["22%", "13%", "17%", "15%", "12%", "12%", "9%"]} rows={7} />
      </div>
    </div>
  );
}

export default CouponsSkeleton;
