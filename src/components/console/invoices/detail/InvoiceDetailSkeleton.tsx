import React from "react";
import { cn } from "@/lib/cn";
import { ConsoleHeaderSkeleton, TimelineSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";

const Bar = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-200", className)} />;
const Soft = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-100", className)} />;

/** Mirrors the invoice detail page: header + actions, invoice document, institution + activity side panel. */
export function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading invoice">
      <ConsoleHeaderSkeleton actions={3} />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="rounded-2xl border border-dash bg-white p-8 xl:col-span-8">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-8 w-28 rounded-md bg-brand-orange-light" />
              <Bar className="h-4 w-44" />
              <Soft className="h-3 w-56" />
              <Soft className="h-3 w-40" />
            </div>
            <div className="space-y-2 text-right">
              <Bar className="ml-auto h-6 w-28" />
              <Bar className="ml-auto h-4 w-32" />
              <Soft className="ml-auto h-3 w-24" />
              <Soft className="ml-auto h-3 w-24" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 rounded-xl border border-dash bg-gray-bg p-4">
            {[0, 1].map((i) => (
              <div key={i} className={cn("space-y-1.5", i === 1 && "text-right")}>
                <Soft className={cn("h-3 w-14", i === 1 && "ml-auto")} />
                <Bar className={cn("h-4 w-40", i === 1 && "ml-auto")} />
                <Soft className={cn("h-3 w-32", i === 1 && "ml-auto")} />
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-dash">
            <div className="flex divide-x divide-dash border-b border-dash bg-slate-50">
              {["46%", "28%", "8%", "18%"].map((w, i) => (
                <div key={i} className="px-3.5 py-3" style={{ width: w }}>
                  <Bar className="h-3 w-14" />
                </div>
              ))}
            </div>
            <div className="flex divide-x divide-dash">
              {["46%", "28%", "8%", "18%"].map((w, i) => (
                <div key={i} className="px-3.5 py-3.5" style={{ width: w }}>
                  <Soft className="h-3.5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-auto mt-4 w-64 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Soft className="h-3.5 w-20" />
                <Bar className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5 xl:col-span-4">
          <div className="dashboard-card space-y-4 p-5">
            <Bar className="h-4 w-28" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-1.5">
                <Bar className="h-3.5 w-32" />
                <Soft className="h-3 w-40" />
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Soft className="h-3.5 w-20" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>
            ))}
            <div className="h-8.5 rounded-lg border border-dash" />
          </div>
          <div className="dashboard-card p-5">
            <TimelineSkeleton rows={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailSkeleton;
