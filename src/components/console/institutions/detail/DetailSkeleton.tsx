import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardHeaderSkeleton, PillTabsSkeleton, TableSkeleton, TimelineSkeleton } from "../../shared/ConsoleSkeletonParts";
import type { DetailTab } from "./detailTabs";

function FactGridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-dash p-3.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Mirrors the institution page: breadcrumb, profile header with badges + actions, capsule tabs, then the active tab. */
export function DetailSkeleton({ tab = "overview" }: { tab?: DetailTab }) {
  return (
    <div className="space-y-5 pb-8" aria-busy="true" aria-label="Loading institution">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <div className="dashboard-card flex flex-col gap-5 p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
      <PillTabsSkeleton tabs={5} />
      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="dashboard-card space-y-4 p-5 shadow-2xs">
              <CardHeaderSkeleton control={i === 1} />
              {i === 0 ? (
                <div className="divide-y divide-dash">
                  {Array.from({ length: 6 }, (_, r) => (
                    <div key={r} className="flex items-center gap-3 py-2.5">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-40" />
                    </div>
                  ))}
                </div>
              ) : (
                <FactGridSkeleton />
              )}
            </div>
          ))}
        </div>
      )}
      {tab === "usage" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dashboard-card space-y-4 p-5 shadow-2xs">
              <CardHeaderSkeleton />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      )}
      {(tab === "billing" || tab === "domain") && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="dashboard-card space-y-4 p-5 shadow-2xs">
                <CardHeaderSkeleton control />
                <FactGridSkeleton n={tab === "billing" ? 4 : 2} />
              </div>
            ))}
          </div>
          <div className="dashboard-card space-y-4 p-5 shadow-2xs">
            <CardHeaderSkeleton control />
            <TableSkeleton rows={tab === "billing" ? 6 : 2} cols={tab === "billing" ? 7 : 5} />
          </div>
        </div>
      )}
      {tab === "activity" && (
        <div className="dashboard-card space-y-5 p-5 shadow-2xs">
          <CardHeaderSkeleton control />
          <div className="flex gap-2.5">
            <Skeleton className="h-16 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
          <TimelineSkeleton rows={6} />
        </div>
      )}
    </div>
  );
}

export default DetailSkeleton;
