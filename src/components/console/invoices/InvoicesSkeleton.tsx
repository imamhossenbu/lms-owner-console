import React from "react";
import { ConsoleHeaderSkeleton, FiltersSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "@/components/console/subscriptions/shared/TableSkeleton";

/** Mirrors /console/invoices: header, 4 KPIs, filters (search, status, plan, date range) and the invoice table. */
export function InvoicesSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading invoices">
      <ConsoleHeaderSkeleton actions={1} />
      <KpiRowSkeleton count={4} className="2xl:grid-cols-4" />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={3} />
        <ColumnTableSkeleton
          columns={["mono", "institution", "text", "money", "badge", "text", "text", "menu"]}
          widths={["14%", "23%", "16%", "10%", "11%", "10%", "10%", "6%"]}
          rows={10}
        />
      </div>
    </div>
  );
}

export default InvoicesSkeleton;
