import React from "react";
import { ConsoleHeaderSkeleton, FiltersSkeleton } from "../../shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "../../subscriptions/shared/TableSkeleton";

const WIDTHS = ["26%", "10%", "11%", "17%", "8%", "11%", "10%", "7%"];

/** Mirrors /institutions: header + Add, 5 KPI cards, filter card with the bordered table and pagination inside. */
export function InstitutionsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading institutions">
      <ConsoleHeaderSkeleton actions={1} />
      <KpiRowSkeleton count={5} className="lg:grid-cols-3 2xl:grid-cols-5" />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={3} />
        <ColumnTableSkeleton columns={["institution", "twoLine", "twoLine", "twoLine", "money", "twoLine", "twoLine", "menu"]} widths={WIDTHS} rows={10} />
      </div>
    </div>
  );
}

export default InstitutionsSkeleton;
