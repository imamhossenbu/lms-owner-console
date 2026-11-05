import React from "react";
import { ColumnTableSkeleton } from "@/components/console/subscriptions/shared/TableSkeleton";

/** Header, filters and the testimonials table while the first page loads. */
export function TestimonialsSkeleton() {
  return (
    <div className="space-y-5 pb-8 animate-pulse" aria-busy="true" aria-label="Loading testimonials">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-7 w-48 rounded bg-slate-200" />
          <div className="h-3.5 w-80 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-slate-200" />
      </div>
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-lg border border-dash bg-slate-100" />
          <div className="h-10 w-40 rounded-lg border border-dash bg-slate-100" />
        </div>
        <ColumnTableSkeleton columns={["institution", "twoLine", "badge", "text", "menu"]} widths={["26%", "40%", "12%", "10%", "12%"]} rows={6} />
      </div>
    </div>
  );
}

export default TestimonialsSkeleton;
