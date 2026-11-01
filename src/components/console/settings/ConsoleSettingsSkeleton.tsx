import React from "react";
import { cn } from "@/lib/cn";

const Bar = ({ className }: { className?: string }) => <div className={cn("rounded-md bg-slate-200", className)} />;
const Soft = ({ className }: { className?: string }) => <div className={cn("rounded-md bg-slate-100", className)} />;

function CardSkeleton({ rows, toggles = 0 }: { rows: number; toggles?: number }) {
  return (
    <div className="dashboard-card shadow-2xs p-5">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <Bar className="h-4 w-36" />
          <Soft className="h-3 w-64 max-w-full" />
        </div>
        <div className="h-6 w-11 rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 divide-y divide-dash border-t border-dash">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex flex-col gap-2.5 py-4 last:pb-0 md:flex-row md:gap-8">
            <div className="space-y-1.5 md:w-2/5 md:max-w-64 md:pt-2">
              <Bar className="h-3.5 w-28" />
              <Soft className="h-3 w-44 max-w-full" />
            </div>
            <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-dash bg-white px-3.5">
              <Soft className="h-3 w-1/2" />
            </div>
          </div>
        ))}
        {Array.from({ length: toggles }, (_, i) => (
          <div key={`t${i}`} className="flex items-start gap-3 py-4 last:pb-0">
            <div className="h-6 w-11 shrink-0 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <Bar className="h-3.5 w-52" />
              <Soft className="h-3 w-80 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors /console/settings: breadcrumb + title, 4-tab capsule bar, section header, cards + preview aside. */
export function ConsoleSettingsSkeleton() {
  return (
    <div className="space-y-5 pb-8 text-left animate-pulse" aria-busy="true" aria-label="Loading console settings">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Soft className="h-4 w-4" />
          <Bar className="h-3.5 w-16" />
          <Soft className="h-3 w-3" />
          <Bar className="h-3.5 w-16" />
        </div>
        <Bar className="h-7 w-48" />
        <Soft className="h-3.5 w-96 max-w-full" />
      </div>

      <div className="flex w-fit max-w-full items-center gap-1.5 overflow-hidden rounded-2xl border border-dash bg-gray-bg p-1.5">
        {["w-16", "w-12", "w-28", "w-14"].map((w, i) => (
          <div key={i} className={cn("flex h-9 shrink-0 items-center gap-2 rounded-xl px-4", i === 0 && "border border-dash bg-white")}>
            <div className="h-4 w-4 rounded bg-slate-200" />
            <Bar className={cn("h-3", w)} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-brand-orange-light" />
          <div className="space-y-2">
            <Bar className="h-5 w-28" />
            <Soft className="h-3.5 w-72 max-w-full" />
          </div>
        </div>
        <div className="hidden h-7 w-40 rounded-full border border-dash bg-gray-bg sm:block" />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={2} toggles={1} />
        </div>
        <div className="space-y-5 xl:col-span-4">
          <div className="dashboard-card shadow-2xs p-5">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <Bar className="h-4 w-28" />
                <Soft className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-dash">
              <div className="flex items-start justify-between border-b border-dash bg-gray-bg px-4 py-3">
                <div className="space-y-2">
                  <div className="h-6 w-20 rounded-md bg-brand-orange-light" />
                  <Bar className="h-3 w-32" />
                  <Soft className="h-2.5 w-40" />
                </div>
                <div className="space-y-1.5">
                  <Bar className="h-3 w-24" />
                  <div className="ml-auto h-5 w-10 rounded-md bg-green-bg" />
                </div>
              </div>
              <div className="space-y-2.5 p-4">
                {[0, 1, 2].map((r) => (
                  <div key={r} className="flex items-center justify-between">
                    <Soft className="h-3 w-28" />
                    <Bar className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange-light p-4">
            <div className="h-5 w-5 rounded bg-brand-orange/20" />
            <div className="flex-1 space-y-2">
              <Bar className="h-3.5 w-32" />
              <Soft className="h-3 w-full" />
              <Soft className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsoleSettingsSkeleton;
