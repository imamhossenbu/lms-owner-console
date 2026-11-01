import React from "react";
import { ConsoleHeaderSkeleton, FiltersSkeleton, ListRowsSkeleton, CardHeaderSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";
import { ColumnTableSkeleton, KpiRowSkeleton } from "@/components/console/subscriptions/shared/TableSkeleton";

/** Mirrors /console/domains: header, 5 KPIs, filters + domain table, help card + subdomains card. */
export function DomainsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading domains">
      <ConsoleHeaderSkeleton actions={0} />
      <KpiRowSkeleton count={5} className="xl:grid-cols-5" />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <FiltersSkeleton selects={1} />
        <ColumnTableSkeleton columns={["institution", "mono", "badge", "mono", "text", "text", "menu"]} widths={["22%", "21%", "11%", "15%", "10%", "12%", "9%"]} rows={6} pagination={false} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="dashboard-card space-y-4 p-5">
          <CardHeaderSkeleton />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-brand-orange-light" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-slate-200" />
                <div className="h-3 w-72 max-w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 rounded-xl border border-dash bg-gray-bg p-3">
              <div className="flex justify-between">
                <div className="h-5 w-14 rounded-md bg-blue-14" />
                <div className="h-5 w-5 rounded bg-slate-200" />
              </div>
              <div className="h-3 w-56 rounded bg-slate-100" />
              <div className="h-3.5 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="dashboard-card p-5">
          <CardHeaderSkeleton control />
          <ListRowsSkeleton rows={6} action={false} />
        </div>
      </div>
    </div>
  );
}

export default DomainsSkeleton;
