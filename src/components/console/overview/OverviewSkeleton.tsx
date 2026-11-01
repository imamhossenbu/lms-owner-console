import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardHeaderSkeleton, ChartCardSkeleton, DonutCardSkeleton, KpiTileSkeleton, ListRowsSkeleton, TimelineSkeleton } from "../shared/ConsoleSkeletonParts";

/** Mirrors /: dashboard header, 8 KPI tiles, MRR chart + plan donut, signups chart + needs-attention list, activity feed. */
export function OverviewSkeleton() {
  return (
    <div className="space-y-3 pb-6 animate-pulse" aria-busy="true" aria-label="Loading overview">
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" icon={false} />
        <DonutCardSkeleton icon={false} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCardSkeleton icon={false} />
        <div className="dashboard-card p-5 shadow-2xs">
          <CardHeaderSkeleton control icon={false} />
          <div className="mt-4">
            <ListRowsSkeleton rows={5} />
          </div>
        </div>
      </div>
      <div className="dashboard-card p-5 shadow-2xs">
        <CardHeaderSkeleton icon={false} />
        <div className="mt-5">
          <TimelineSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export default OverviewSkeleton;
