"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { PieChart as PieIcon } from "lucide-react";
import type { PlanId } from "@/types/saas";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import type { planDistribution, revenueByPlan } from "@/lib/saasStats";
import { formatMoney } from "@/lib/saasStats";
import { cn } from "@/lib/cn";

const COLOR: Record<string, { fill: string; dot: string }> = {
  starter: { fill: CHART.tick, dot: "bg-primary-300" },
  growth: { fill: CHART.blue, dot: "bg-blue" },
  pro: { fill: CHART.purple, dot: "bg-purple" },
  enterprise: { fill: CHART.orange, dot: "bg-brand-orange" },
};
const CUSTOM_COLORS = [{ fill: CHART.green, dot: "bg-green" }, { fill: CHART.yellow, dot: "bg-yellow" }, { fill: CHART.red, dot: "bg-red" }];
const colorOf = (id: PlanId, index: number) => COLOR[id] ?? CUSTOM_COLORS[index % CUSTOM_COLORS.length]!;

/** Live institutions per plan (donut) with MRR per plan in the legend. */
export function PlanDonutCard({ distribution, revenue }: { distribution: ReturnType<typeof planDistribution>; revenue: ReturnType<typeof revenueByPlan> }) {
  const total = distribution.reduce((s, d) => s + d.count, 0);
  const slices = distribution.filter((d) => d.count > 0);
  return (
    <IconSectionCard icon={<PieIcon className="h-5 w-5" />} tone="purple" title="Plan distribution" description="Live institutions (incl. trials) per plan">
      {total === 0 ? (
        <ChartEmpty title="No institutions yet" message="Plans appear once institutions subscribe." />
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="count" nameKey="name" innerRadius={58} outerRadius={82} startAngle={90} endAngle={-270} stroke="white" strokeWidth={2} animationDuration={700}>
                  {slices.map((d) => (
                    <Cell key={d.planId} fill={colorOf(d.planId, distribution.indexOf(d)).fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as (typeof slices)[number];
                    return (
                      <ChartTooltip title={row.name}>
                        {row.count} institution{row.count === 1 ? "" : "s"}
                        {row.trialing ? ` · ${row.trialing} trialing` : ""}
                      </ChartTooltip>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="heading-h4 text-primary-500">{total}</span>
              <span className="body-2xsm-regular text-primary-300">Institutions</span>
            </div>
          </div>
          <ul className="w-full space-y-3">
            {distribution.map((d, i) => {
              const mrr = revenue.find((r) => r.planId === d.planId)?.mrr ?? 0;
              return (
                <motion.li
                  key={d.planId}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2.5 body-sm-regular text-primary-400">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", colorOf(d.planId, i).dot)} />
                    <span className="truncate">{d.name}</span>
                    <span className="body-xsm-regular text-primary-300">({d.count})</span>
                  </span>
                  <span className="shrink-0 tabular-nums body-sm-medium text-primary-500">{formatMoney(Math.round(mrr))}/mo</span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}
    </IconSectionCard>
  );
}

export default PlanDonutCard;
