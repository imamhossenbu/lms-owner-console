"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { UserPlus } from "lucide-react";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import type { newSignupsSeries } from "@/lib/saasStats";

type Row = ReturnType<typeof newSignupsSeries>[number];

/** New institutions per month, stacked by source (self-signup vs created by the owner). */
export function SignupsChartCard({ series }: { series: Row[] }) {
  const total = series.reduce((s, r) => s + r.signups, 0);
  return (
    <IconSectionCard icon={<UserPlus className="h-5 w-5" />} title="New signups" description={`${total} institutions in ${series.length} months`}>
      {total === 0 ? (
        <ChartEmpty title="No signups yet" message="New institutions appear here month by month." />
      ) : (
        <>
          <div className="h-56 w-full">
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
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 body-xsm-regular text-primary-400">
              <span className="h-2.5 w-2.5 rounded-full bg-blue" /> Self-signup
            </span>
            <span className="flex items-center gap-2 body-xsm-regular text-primary-400">
              <span className="h-2.5 w-2.5 rounded-full bg-purple" /> Created by owner
            </span>
          </div>
        </>
      )}
    </IconSectionCard>
  );
}

export default SignupsChartCard;
