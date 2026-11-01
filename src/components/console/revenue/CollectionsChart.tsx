"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CollectionsRow } from "@/lib/saasStats";
import { formatCompactMoney, formatMoney } from "@/lib/saasStats";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import { DashboardCard } from "../shared/DashboardCard";

/** Cash collected per month, with unpaid and refunded amounts beside it. */
export function CollectionsChart({ rows }: { rows: CollectionsRow[] }) {
  const total = rows.reduce((s, r) => s + r.collected, 0);
  const unpaid = rows.reduce((s, r) => s + r.outstanding, 0);
  return (
    <DashboardCard
      title="Collections"
      description={
        <>
          Cash received · <span className="body-sm-medium font-semibold! text-primary-500">{formatMoney(total)}</span>
          {unpaid > 0 && <> · {formatMoney(unpaid)} unpaid</>}
        </>
      }
      bodyClassName="flex flex-col"
      action={
        <div className="hidden sm:flex items-center gap-4">
          {[
            { label: "Collected", dot: "bg-green" },
            { label: "Unpaid", dot: "bg-yellow" },
            { label: "Refunded", dot: "bg-red" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 body-xsm-medium text-primary-400 whitespace-nowrap">
              <span className={`h-2 w-2 rounded-full ${l.dot}`} /> {l.label}
            </span>
          ))}
        </div>
      }
    >
      {total + unpaid === 0 ? (
        <ChartEmpty title="No invoices in this period" message="Pick a longer range to see collections." />
      ) : (
        <div className="w-full flex-1 min-h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} interval="preserveStartEnd" minTickGap={8} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} width={52} tickFormatter={(v: number) => formatCompactMoney(v)} />
              <Tooltip
                cursor={{ fill: "var(--color-gray-bg)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0]!.payload as CollectionsRow;
                  return (
                    <ChartTooltip title={`${r.fullLabel} · ${r.invoices} invoice${r.invoices === 1 ? "" : "s"}`}>
                      Collected {formatMoney(r.collected)} · Unpaid {formatMoney(r.outstanding)} · Refunded {formatMoney(r.refunded)}
                    </ChartTooltip>
                  );
                }}
              />
              <Bar dataKey="collected" fill={CHART.green} radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={700} />
              <Bar dataKey="outstanding" fill={CHART.yellow} radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={700} />
              <Bar dataKey="refunded" fill={CHART.red} radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

export default CollectionsChart;
