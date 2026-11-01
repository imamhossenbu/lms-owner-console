import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

/** Building blocks for Owner Console skeletons — each mirrors the geometry of the real component. */

/** Breadcrumb + title + subtitle + action buttons. */
export function ConsoleHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
      <div className="flex gap-2.5">
        {Array.from({ length: actions }, (_, i) => (
          <Skeleton key={i} className={cn("h-10 rounded-lg", i === actions - 1 ? "w-36" : "w-28")} />
        ))}
      </div>
    </div>
  );
}

/** KPI tile: icon tile, label, value, change chip + caption. */
export function KpiTileSkeleton() {
  return (
    <div className="dashboard-card shadow-2xs p-4">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="mt-4 h-7 w-28" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Card header: icon tile + title + description (+ optional control on the right). */
export function CardHeaderSkeleton({ control = false }: { control?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
      {control && <Skeleton className="h-8 w-28 rounded-lg" />}
    </div>
  );
}

const BAR_HEIGHTS = ["h-10", "h-12", "h-14", "h-14", "h-20", "h-24", "h-28", "h-32", "h-36", "h-36", "h-40", "h-44", "h-44", "h-48"];

/** Area / bar chart card: header, y-axis ticks and rising columns. */
export function ChartCardSkeleton({ bars = 14, className }: { bars?: number; className?: string }) {
  return (
    <div className={cn("dashboard-card shadow-2xs p-5", className)}>
      <CardHeaderSkeleton control />
      <div className="mt-6 flex h-56 items-end gap-3">
        <div className="flex h-full flex-col justify-between pb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-2.5 w-8" />
          ))}
        </div>
        <div className="flex h-full flex-1 flex-col justify-end">
          <div className="flex flex-1 items-end gap-2 border-b border-dash">
            {Array.from({ length: bars }, (_, i) => (
              <Skeleton key={i} className={cn("flex-1 rounded-t-md rounded-b-none", BAR_HEIGHTS[Math.min(i, BAR_HEIGHTS.length - 1)])} />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {Array.from({ length: bars }, (_, i) => (
              <Skeleton key={i} className="h-2.5 flex-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Donut card: ring with centre metric and legend pills. */
export function DonutCardSkeleton({ legend = 4 }: { legend?: number }) {
  return (
    <div className="dashboard-card shadow-2xs p-5">
      <CardHeaderSkeleton />
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-18 border-slate-100">
          <div className="space-y-1.5 text-center">
            <Skeleton className="mx-auto h-6 w-10" />
            <Skeleton className="mx-auto h-2.5 w-16" />
          </div>
        </div>
        <div className="w-full flex-1 space-y-3.5">
          {Array.from({ length: legend }, (_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-3.5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** List rows: avatar + two lines + badge + action button. */
export function ListRowsSkeleton({ rows = 5, action = true }: { rows?: number; action?: boolean }) {
  return (
    <div className="divide-y divide-dash">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          {action && <Skeleton className="h-8.5 w-20 rounded-lg" />}
        </div>
      ))}
    </div>
  );
}

/** Timeline: dot + line + text lines grouped by day. */
export function TimelineSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {i < rows - 1 && <div className="mt-1 w-px flex-1 bg-slate-100" />}
          </div>
          <div className="flex-1 space-y-2 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Filters bar: search + N selects + reset. */
export function FiltersSkeleton({ selects = 3 }: { selects?: number }) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      {Array.from({ length: selects }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg xl:w-44" />
      ))}
      <Skeleton className="h-10 w-20 rounded-lg" />
    </div>
  );
}

/** Data table with header row, avatar first column, badges and vertical column borders. */
export function TableSkeleton({ rows = 8, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-dash">
      <div className="flex divide-x divide-dash border-b border-dash bg-gray-bg">
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className={cn("px-3.5 py-3", i === 0 ? "flex-2" : "flex-1")}>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex divide-x divide-dash border-b border-dash last:border-b-0">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className={cn("flex items-center gap-2.5 px-3.5 py-3", c === 0 ? "flex-2" : "flex-1")}>
              {c === 0 ? (
                <>
                  <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </>
              ) : c === 1 || c === 2 ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : c === cols - 1 ? (
                <Skeleton className="ml-auto h-7 w-7 rounded-lg" />
              ) : (
                <Skeleton className="h-3.5 w-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Capsule tab bar. */
export function PillTabsSkeleton({ tabs = 5 }: { tabs?: number }) {
  return (
    <div className="flex w-fit gap-1.5 rounded-2xl border border-dash bg-gray-bg p-1.5">
      {Array.from({ length: tabs }, (_, i) => (
        <Skeleton key={i} className={cn("h-9 rounded-xl", i === 0 ? "w-28 bg-white" : "w-24")} />
      ))}
    </div>
  );
}

/** Labelled form field outline. */
export function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-3.5 w-24" />
      <div className="flex h-10 items-center rounded-lg border border-dash px-3.5">
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
