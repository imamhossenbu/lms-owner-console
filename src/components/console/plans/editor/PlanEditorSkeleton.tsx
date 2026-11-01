import React from "react";
import { cn } from "@/lib/cn";
import { ConsoleHeaderSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";
import { PricingCardSkeleton } from "../PlansSkeleton";

const Bar = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-200", className)} />;
const Soft = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-100", className)} />;

function CardHead() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-11 w-11 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <Bar className="h-4 w-32" />
        <Soft className="h-3 w-64 max-w-full" />
      </div>
    </div>
  );
}

const Input = ({ label = "w-24" }: { label?: string }) => (
  <div className="space-y-2">
    <Bar className={cn("h-3.5", label)} />
    <div className="flex h-10 items-center rounded-lg border border-dash bg-white px-3.5">
      <Soft className="h-3 w-1/2" />
    </div>
  </div>
);

/** Mirrors the plan editor: header, form cards (details, pricing, limits, features) + sticky preview/impact aside. */
export function PlanEditorSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading plan editor">
      <ConsoleHeaderSkeleton actions={0} />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <div className="dashboard-card p-5">
            <CardHead />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Input />
              <Input label="w-16" />
              <div className="col-span-2">
                <Input label="w-20" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-dash pt-5">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-1.5">
                    <Bar className="h-3.5 w-28" />
                    <Soft className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card p-5">
            <CardHead />
            <div className="mt-5 grid grid-cols-3 gap-4">
              <Input />
              <Input />
              <Input label="w-20" />
            </div>
          </div>
          <div className="dashboard-card p-5">
            <CardHead />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2.5 rounded-xl border border-dash p-3.5">
                  <div className="flex justify-between">
                    <Bar className="h-4 w-24" />
                    <div className="h-6 w-11 rounded-full bg-slate-200" />
                  </div>
                  <Soft className="h-3 w-40" />
                  <div className="h-10 rounded-lg border border-dash" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5 xl:col-span-4">
          <div className="flex justify-between">
            <Bar className="h-4 w-24" />
            <div className="h-9 w-40 rounded-lg border border-dash" />
          </div>
          <PricingCardSkeleton highlighted footer={false} />
          <div className="dashboard-card p-5">
            <CardHead />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-1.5 rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
                  <Soft className="h-2.5 w-16" />
                  <Bar className="h-5 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanEditorSkeleton;
