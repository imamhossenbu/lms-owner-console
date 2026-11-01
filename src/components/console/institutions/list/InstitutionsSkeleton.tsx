import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConsoleHeaderSkeleton, FiltersSkeleton, TableSkeleton } from "../../shared/ConsoleSkeletonParts";

/** Mirrors /console/institutions: header + Add, status chips, filters, table with 8 columns and pagination. */
export function InstitutionsSkeleton() {
  return (
    <div className="space-y-5 pb-8" aria-busy="true" aria-label="Loading institutions">
      <ConsoleHeaderSkeleton actions={1} />
      <div className="flex flex-wrap gap-2">
        {[64, 84, 92, 88, 100, 104].map((w, i) => (
          <Skeleton key={i} className="h-8.5 rounded-xl" style={{ width: w }} />
        ))}
      </div>
      <div className="dashboard-card space-y-4 p-5 shadow-2xs">
        <FiltersSkeleton selects={3} />
        <TableSkeleton rows={10} cols={8} />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-48" />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstitutionsSkeleton;
