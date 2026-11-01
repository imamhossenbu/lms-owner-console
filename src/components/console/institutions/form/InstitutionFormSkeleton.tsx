import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardHeaderSkeleton, ConsoleHeaderSkeleton, FieldSkeleton } from "../../shared/ConsoleSkeletonParts";

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-dash p-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-6 w-16" />
      <div className="mt-3 space-y-2 border-t border-dash pt-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors the institution form: details (with subdomain preview), owner, plan cards + trial toggle (create), notes, save bar. */
export function InstitutionFormSkeleton({ mode = "create" }: { mode?: "create" | "edit" }) {
  return (
    <div className="space-y-5 pb-8" aria-busy="true" aria-label="Loading form">
      <ConsoleHeaderSkeleton actions={0} />
      <div className="dashboard-card space-y-5 p-5 shadow-2xs">
        <CardHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldSkeleton className="md:col-span-2" />
          <FieldSkeleton />
          <FieldSkeleton />
          <div className="space-y-2 md:col-span-2">
            <FieldSkeleton />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="dashboard-card space-y-5 p-5 shadow-2xs">
        <CardHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </div>
      {mode === "create" && (
        <div className="dashboard-card space-y-5 p-5 shadow-2xs">
          <CardHeaderSkeleton control />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-dash p-4">
            <Skeleton className="h-6 w-11 rounded-full" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
      )}
      <div className="dashboard-card space-y-4 p-5 shadow-2xs">
        <CardHeaderSkeleton />
        <div className="h-24 rounded-lg border border-dash p-3.5">
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-dash bg-white p-3 pl-4">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default InstitutionFormSkeleton;
