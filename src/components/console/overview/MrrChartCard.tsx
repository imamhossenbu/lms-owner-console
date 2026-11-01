"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import type { SeriesPoint } from "@/lib/saasStats";
import { formatCompactMoney, formatMoney, pctChange } from "@/lib/saasStats";

/** MRR month-end area chart (14 months) with the growth over the window. */
export function MrrChartCard({ series }: { series: SeriesPoint[] }) {
  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const growth = pctChange(last, first);
  const hasData = series.some((p) => p.value > 0);

  return (
    <IconSectionCard
      icon={<LineChartIcon className="h-5 w-5" />}
      tone="orange"
      title="MRR growth"
      description={`Monthly recurring revenue · last ${series.length} months`}
      action={
        growth !== null ? (
          <ToneBadge tone={growth >= 0 ? "green" : "red"} variant="pill">
            {growth >= 0 ? "+" : "−"}
            {Math.abs(growth).toFixed(0)}% since {series[0]?.fullLabel}
          </ToneBadge>
        ) : undefined
      }
    >
      {!hasData ? (
        <ChartEmpty title="No revenue yet" message="MRR appears once the first institution pays." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="console-mrr-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.orange} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART.orange} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} interval="preserveStartEnd" minTickGap={12} />
              <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} width={52} tickFormatter={(v: number) => formatCompactMoney(v)} />
              <Tooltip
                cursor={{ stroke: CHART.grid, strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as SeriesPoint;
                  return (
                    <ChartTooltip title={row.fullLabel}>
                      MRR {formatMoney(Math.round(row.value))} · ARR {formatCompactMoney(row.value * 12)}
                    </ChartTooltip>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART.orange}
                strokeWidth={2.5}
                fill="url(#console-mrr-fill)"
                dot={false}
                activeDot={{ r: 5, fill: CHART.orange, stroke: "white", strokeWidth: 2 }}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </IconSectionCard>
  );
}

export default MrrChartCard;
