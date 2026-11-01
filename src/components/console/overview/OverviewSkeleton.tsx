import React from "react";
import { CardHeaderSkeleton, ChartCardSkeleton, ConsoleHeaderSkeleton, DonutCardSkeleton, KpiTileSkeleton, ListRowsSkeleton, TimelineSkeleton } from "../shared/ConsoleSkeletonParts";

/** Mirrors /console: header, 8 KPI tiles, MRR chart + plan donut, signups chart + needs-attention list, activity feed. */
export function OverviewSkeleton() {
  return (
    <div className="space-y-5 pb-8" aria-busy="true" aria-label="Loading overview">
      <ConsoleHeaderSkeleton actions={2} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" />
        <DonutCardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCardSkeleton />
        <div className="dashboard-card p-5 shadow-2xs">
          <CardHeaderSkeleton control />
          <div className="mt-4">
            <ListRowsSkeleton rows={5} />
          </div>
        </div>
      </div>
      <div className="dashboard-card p-5 shadow-2xs">
        <CardHeaderSkeleton />
        <div className="mt-5">
          <TimelineSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export default OverviewSkeleton;
