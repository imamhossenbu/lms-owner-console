import React from "react";
import { cn } from "@/lib/cn";

export type SkeletonCell = "institution" | "text" | "twoLine" | "badge" | "money" | "menu" | "mono";

const Bar = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-200", className)} />;
const Soft = ({ className }: { className: string }) => <div className={cn("rounded bg-slate-100", className)} />;

function Cell({ kind }: { kind: SkeletonCell }) {
  switch (kind) {
    case "institution":
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-1.5">
            <Bar className="h-3.5 w-28" />
            <Soft className="h-3 w-24" />
          </div>
        </div>
      );
    case "twoLine":
      return (
        <div className="space-y-1.5">
          <Bar className="h-3.5 w-20" />
          <Soft className="h-3 w-14" />
        </div>
      );
    case "badge":
      return <Soft className="h-5.5 w-16 rounded-md" />;
    case "money":
      return <Bar className="h-3.5 w-14" />;
    case "mono":
      return <Bar className="h-3.5 w-24" />;
    case "menu":
      return <div className="mx-auto h-7 w-7 rounded-lg border border-dash" />;
    default:
      return <Soft className="h-3.5 w-20" />;
  }
}

/** Table skeleton with header cells, rows and vertical column borders (mirrors the shared DataTable). */
export function ColumnTableSkeleton({ columns, widths, rows = 8, pagination = true }: { columns: SkeletonCell[]; widths: string[]; rows?: number; pagination?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <div className="flex divide-x divide-dash border-b border-dash bg-slate-50">
        {columns.map((_, i) => (
          <div key={i} className="px-3.5 py-3" style={{ width: widths[i] }}>
            <Bar className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-dash">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex min-h-15 items-center divide-x divide-dash">
            {columns.map((kind, i) => (
              <div key={i} className="px-3.5 py-3" style={{ width: widths[i] }}>
                <Cell kind={kind} />
              </div>
            ))}
          </div>
        ))}
      </div>
      {pagination && (
        <div className="flex items-center justify-between border-t border-dash p-4">
          <Soft className="h-4 w-44" />
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("h-8 w-8 rounded-lg", i === 1 ? "bg-slate-200" : "border border-dash")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Row of KPI cards (icon tile + label + value) like TrendStatCard. */
export function KpiRowSkeleton({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-dash bg-white p-4">
          <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <Soft className="h-3.5 w-24" />
            <div className="flex items-end justify-between">
              <Bar className="h-7 w-20" />
              <Soft className="h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
