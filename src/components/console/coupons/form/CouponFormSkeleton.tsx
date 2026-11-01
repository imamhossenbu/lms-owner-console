import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardHeaderSkeleton, ConsoleHeaderSkeleton, FieldSkeleton } from "../../shared/ConsoleSkeletonParts";

/** Mirrors the coupon form: code, discount (choice cards), restrictions (plan checkboxes, toggles), ticket preview, price list. */
export function CouponFormSkeleton() {
  return (
    <div className="space-y-5 pb-8 animate-pulse" aria-busy="true" aria-label="Loading coupon">
      <ConsoleHeaderSkeleton actions={0} />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <div className="dashboard-card space-y-4 p-5">
            <CardHeaderSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <div className="flex items-center justify-between border-t border-dash pt-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
          <div className="dashboard-card space-y-4 p-5">
            <CardHeaderSkeleton />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-18 rounded-xl" />
              ))}
            </div>
            <FieldSkeleton className="max-w-xs" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-18 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="dashboard-card space-y-4 p-5">
            <CardHeaderSkeleton />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-dash p-3.5">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5 xl:col-span-4">
          <div className="space-y-3 rounded-xl border border-dashed border-dash p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="dashboard-card space-y-3 p-5">
            <CardHeaderSkeleton />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between py-1">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CouponFormSkeleton;
