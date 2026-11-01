"use client";

import React from "react";
import { Check, Minus } from "lucide-react";
import type { Plan } from "@/types/saas";
import { FEATURE_KEYS, LIMIT_KEYS } from "@/types/saas";
import { FEATURE_META, LIMIT_META, formatLimit } from "@/lib/planAccess";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { featureIcon, limitIcon } from "./planUtils";

interface MatrixRow {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  group: "Limits" | "Features";
  values: Record<string, React.ReactNode>;
}

const Tick = ({ on }: { on: boolean }) =>
  on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-bg text-green" aria-label="Included">
      <Check className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-bg text-primary-300" aria-label="Not included">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );

/** Limit & feature × plan comparison matrix. */
export function PlanComparisonTable({ plans }: { plans: Plan[] }) {
  const rows: MatrixRow[] = [
    ...LIMIT_KEYS.map((key) => ({
      id: `limit-${key}`,
      label: LIMIT_META[key].label,
      description: LIMIT_META[key].description,
      icon: limitIcon(key),
      group: "Limits" as const,
      values: Object.fromEntries(plans.map((p) => [p.id, <span key={p.id} className="body-sm-medium text-primary-500">{formatLimit(p.limits[key], key)}</span>])),
    })),
    ...FEATURE_KEYS.map((key) => ({
      id: `feature-${key}`,
      label: FEATURE_META[key].label,
      description: FEATURE_META[key].description,
      icon: featureIcon(key),
      group: "Features" as const,
      values: Object.fromEntries(plans.map((p) => [p.id, <Tick key={p.id} on={p.features.includes(key)} />])),
    })),
  ];

  const planWidth = `${Math.floor(60 / Math.max(1, plans.length))}%`;
  const columns: ColumnDef<MatrixRow>[] = [
    {
      key: "label",
      header: "Limit / feature",
      width: "40%",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-bg text-primary-400">{row.icon}</span>
          <div className="min-w-0">
            <p className="truncate body-sm-medium text-primary-500" title={row.label}>
              {row.label}
            </p>
            <p className="truncate body-xsm-regular text-primary-300" title={row.description}>
              {row.description}
            </p>
          </div>
        </div>
      ),
    },
    ...plans.map<ColumnDef<MatrixRow>>((plan) => ({
      key: plan.id,
      header: plan.archived ? `${plan.name} (archived)` : plan.name,
      width: planWidth,
      align: "center",
      render: (row) => row.values[plan.id],
    })),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(row) => row.id}
      verticalBorders
      tableClassName="table-fixed"
      containerClassName="rounded-lg"
      headerClassName="bg-slate-50 border-b border-dash"
      thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
      cellClassName="px-3.5 py-3"
    />
  );
}

export default PlanComparisonTable;
