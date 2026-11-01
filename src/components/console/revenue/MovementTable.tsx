"use client";

import React from "react";
import type { MrrMovementRow } from "@/lib/saasStats";
import { formatMoney } from "@/lib/saasStats";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { cn } from "@/lib/cn";
import { signedMoney } from "./revenueRange";

const tone = (n: number) => (n > 0 ? "text-green" : n < 0 ? "text-red" : "text-primary-300");

function MoneyCell({ value, count, signed = true }: { value: number; count?: number; signed?: boolean }) {
  return (
    <div className="whitespace-nowrap text-right">
      <p className={cn("tabular-nums body-sm-medium", signed ? tone(value) : "text-primary-500")}>{signed ? signedMoney(value, formatMoney) : formatMoney(value)}</p>
      {count !== undefined && <p className="body-xsm-regular text-primary-300">{count ? `${count} account${count === 1 ? "" : "s"}` : "—"}</p>}
    </div>
  );
}

/** Month-by-month MRR bridge (newest first) — same table frame as the panel's OrdersTable. */
export function MovementTable({ rows }: { rows: MrrMovementRow[] }) {
  const columns: ColumnDef<MrrMovementRow>[] = [
    {
      key: "month",
      header: "Month",
      render: (r) => (
        <div className="whitespace-nowrap">
          <p className="body-sm-medium text-primary-500">{r.fullLabel}</p>
          <p className="body-xsm-regular text-primary-300">{r.key === rows[0]?.key ? "Month to date" : "Full month"}</p>
        </div>
      ),
    },
    { key: "starting", header: "Starting MRR", align: "right", render: (r) => <MoneyCell value={r.starting} signed={false} /> },
    { key: "new", header: "New", align: "right", render: (r) => <MoneyCell value={r.newMrr} count={r.newCount} /> },
    { key: "expansion", header: "Expansion", align: "right", render: (r) => <MoneyCell value={r.expansion} count={r.expansionCount} /> },
    { key: "contraction", header: "Contraction", align: "right", render: (r) => <MoneyCell value={r.contraction} count={r.contractionCount} /> },
    { key: "churn", header: "Churn", align: "right", render: (r) => <MoneyCell value={r.churned} count={r.churnedCount} /> },
    { key: "net", header: "Net change", align: "right", render: (r) => <MoneyCell value={r.net} /> },
    { key: "ending", header: "Ending MRR", align: "right", render: (r) => <MoneyCell value={r.ending} signed={false} /> },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-dash">
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.key}
        verticalBorders
        containerClassName="border-0 rounded-none"
        headerClassName="bg-slate-50 border-b border-dash"
        thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
        cellClassName="px-3.5 py-3"
        emptyMessage="No revenue in this period."
      />
    </div>
  );
}

export default MovementTable;
