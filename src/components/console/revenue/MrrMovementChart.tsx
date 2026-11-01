"use client";

import React from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MrrMovementRow } from "@/lib/saasStats";
import { formatCompactMoney, formatMoney } from "@/lib/saasStats";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import { DashboardCard } from "../shared/DashboardCard";
import { signedMoney } from "./revenueRange";

const SERIES = [
  { key: "newMrr", label: "New", color: CHART.green },
  { key: "expansion", label: "Expansion", color: CHART.blue },
  { key: "contraction", label: "Contraction", color: CHART.yellow },
  { key: "churned", label: "Churn", color: CHART.red },
] as const;

const LEGEND_DOT: Record<(typeof SERIES)[number]["key"] | "net", string> = {
  newMrr: "bg-green",
  expansion: "bg-blue",
  contraction: "bg-yellow",
  churned: "bg-red",
  net: "bg-brand-orange",
};

/** Stacked monthly MRR movement (gains up, losses down) with the net change as a line. */
export function MrrMovementChart({ rows, className }: { rows: MrrMovementRow[]; className?: string }) {
  const hasData = rows.some((r) => r.newMrr || r.expansion || r.contraction || r.churned);
  return (
    <DashboardCard
      title="MRR movement"
      description="Gains and losses per month"
      className={className}
      bodyClassName="flex flex-col"
      action={
        <div className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          {[...SERIES.map((s) => ({ key: s.key, label: s.label })), { key: "net" as const, label: "Net" }].map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 body-xsm-medium text-primary-400 whitespace-nowrap">
              <span className={`h-2 w-2 rounded-full ${LEGEND_DOT[s.key]}`} /> {s.label}
            </span>
          ))}
        </div>
      }
    >
      {!hasData ? (
        <ChartEmpty title="No movement yet" message="New subscriptions, upgrades and cancellations appear here." />
      ) : (
        <div className="w-full flex-1 min-h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} stackOffset="sign" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} interval="preserveStartEnd" minTickGap={8} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} width={52} tickFormatter={(v: number) => formatCompactMoney(v)} />
              <ReferenceLine y={0} stroke={CHART.grid} />
              <Tooltip
                cursor={{ fill: "var(--color-gray-bg)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0]!.payload as MrrMovementRow;
                  return (
                    <ChartTooltip title={r.fullLabel}>
                      <div className="space-y-0.5">
                        <p>New {signedMoney(r.newMrr, formatMoney)} · Expansion {signedMoney(r.expansion, formatMoney)}</p>
                        <p>Contraction {signedMoney(r.contraction, formatMoney)} · Churn {signedMoney(r.churned, formatMoney)}</p>
                        <p className="text-brand-orange">Net {signedMoney(r.net, formatMoney)} · MRR {formatMoney(Math.round(r.ending))}</p>
                      </div>
                    </ChartTooltip>
                  );
                }}
              />
              {SERIES.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} stackId="m" fill={s.color} maxBarSize={30} radius={i === 1 ? [4, 4, 0, 0] : i === 3 ? [0, 0, 4, 4] : 0} animationDuration={700} />
              ))}
              <Line type="monotone" dataKey="net" stroke={CHART.orange} strokeWidth={2.2} dot={{ r: 3, fill: CHART.orange }} animationDuration={700} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}

export default MrrMovementChart;
