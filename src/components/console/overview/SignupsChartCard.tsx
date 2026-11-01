"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardCard } from "../shared/DashboardCard";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import type { newSignupsSeries } from "@/lib/saasStats";

type Row = ReturnType<typeof newSignupsSeries>[number];

/** New institutions per month, stacked by source (self-signup vs created by the owner). */
export function SignupsChartCard({ series }: { series: Row[] }) {
  const total = series.reduce((s, r) => s + r.signups, 0);
  return (
    <DashboardCard
      title="New signups"
      description={`${total} institutions in ${series.length} months`}
      bodyClassName="flex flex-col"
      action={
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1.5 body-xsm-medium text-primary-400 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-blue" /> Self-signup
          </span>
          <span className="flex items-center gap-1.5 body-xsm-medium text-primary-400 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-purple" /> Created by owner
          </span>
        </div>
      }
    >
      {total === 0 ? (
        <ChartEmpty title="No signups yet" message="New institutions appear here month by month." />
      ) : (
        <div className="w-full flex-1 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} dy={6} interval="preserveStartEnd" minTickGap={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip
                  cursor={{ fill: CHART.grid, opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as Row;
                    return (
                      <ChartTooltip title={row.fullLabel}>
                        {row.signups} new · {row.selfSignup} self-signup · {row.ownerCreated} by owner
                      </ChartTooltip>
                    );
                  }}
                />
                <Bar dataKey="selfSignup" stackId="s" fill={CHART.blue} radius={[0, 0, 0, 0]} maxBarSize={26} animationDuration={700} />
                <Bar dataKey="ownerCreated" stackId="s" fill={CHART.purple} radius={[4, 4, 0, 0]} maxBarSize={26} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      )}
    </DashboardCard>
  );
}

export default SignupsChartCard;
