import React from "react";
import { cn } from "@/lib/cn";
import { ConsoleHeaderSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";

const Bar = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-200", className)} />;
const Soft = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-100", className)} />;

/** One pricing card: name, tagline, price, CTA, limits, feature ticks, owner footer. */
export function PricingCardSkeleton({ highlighted = false, footer = true }: { highlighted?: boolean; footer?: boolean }) {
  return (
    <div className={cn("relative flex flex-col rounded-2xl border bg-white", highlighted ? "border-brand-orange" : "border-dash")}>
      {highlighted && <div className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rounded-full bg-brand-orange-light" />}
      <div className="space-y-4 p-5">
        <Bar className="h-5 w-24" />
        <Soft className="h-3.5 w-full" />
        <div className="flex items-end gap-2">
          <Bar className="h-8 w-20" />
          <Soft className="h-3.5 w-12" />
        </div>
        <div className={cn("h-10 w-full rounded-lg", highlighted ? "bg-brand-orange-light" : "border border-dash")} />
        <div className="space-y-2.5 border-t border-dash pt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Soft className="h-3.5 w-20" />
              <Bar className="h-3.5 w-12" />
            </div>
          ))}
        </div>
        <div className="space-y-2.5 border-t border-dash pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-full bg-green-bg" />
              <Soft className="h-3.5 w-28" />
            </div>
          ))}
        </div>
      </div>
      {footer && (
        <div className="space-y-3 rounded-b-2xl border-t border-dash bg-gray-bg/60 px-5 py-3.5">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5">
                <Soft className="h-2.5 w-16" />
                <Bar className="h-4 w-12" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-8.5 flex-1 rounded-lg border border-dash bg-white" />
            <div className="h-8.5 w-8.5 rounded-lg border border-dash bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

/** Mirrors /console/plans: header, cycle toggle, 4 pricing cards, comparison matrix. */
export function PlansSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading plans">
      <ConsoleHeaderSkeleton actions={1} />
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-dash bg-white p-1">
          <div className="h-8 w-20 rounded-md bg-slate-200" />
          <div className="h-8 w-20 rounded-md" />
        </div>
        <Soft className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-5 pt-3 md:grid-cols-2 2xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <PricingCardSkeleton key={i} highlighted={i === 1} />
        ))}
      </div>
      <div className="rounded-xl border border-dash bg-white p-5">
        <Bar className="mb-1.5 h-5 w-48" />
        <Soft className="mb-4 h-3.5 w-72" />
        <div className="overflow-hidden rounded-lg border border-dash">
          <div className="flex divide-x divide-dash border-b border-dash bg-slate-50">
            {["40%", "15%", "15%", "15%", "15%"].map((w, i) => (
              <div key={i} className="px-3.5 py-3" style={{ width: w }}>
                <Bar className="h-3 w-16" />
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, r) => (
            <div key={r} className="flex divide-x divide-dash border-b border-dash last:border-b-0">
              <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ width: "40%" }}>
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <Bar className="h-3.5 w-28" />
                  <Soft className="h-3 w-44" />
                </div>
              </div>
              {[0, 1, 2, 3].map((c) => (
                <div key={c} className="flex items-center justify-center px-3.5 py-3" style={{ width: "15%" }}>
                  <div className={cn("h-6 rounded-full", r < 2 ? "w-14 bg-slate-100" : "w-6 bg-green-bg")} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlansSkeleton;
