"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SaasStore } from "@/types/saas";
import { formatCompactMoney, formatMoney, formatPct, mrr, revenueByPlan } from "@/lib/saasStats";
import { AXIS_TICK, CHART } from "@/components/ui/charts/chartTheme";
import { ChartTooltip } from "@/components/ui/charts/ChartTooltip";
import { ChartEmpty } from "@/components/ui/charts/ChartEmpty";
import { STATUS_META } from "@/components/console/shared/consoleMeta";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { SUBSCRIPTION_STATUSES } from "@/types/saas";

/** MRR contribution per plan (single-series horizontal bars) + subscription status breakdown. */
export function RevenueByPlanCard({ store }: { store: SaasStore }) {
  const total = mrr(store);
  const rows = revenueByPlan(store).map((r) => ({ ...r, share: total ? (r.mrr / total) * 100 : 0 }));
  const counts = SUBSCRIPTION_STATUSES.map((status) => ({ status, count: store.institutions.filter((i) => i.subscription.status === status).length }));
  const all = store.institutions.length || 1;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-w-0 rounded-xl border border-dash bg-white p-5 shadow-2xs xl:col-span-2"
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="heading-h5 font-semibold! text-primary-500">Revenue by plan</h3>
            <p className="mt-0.5 body-sm-regular text-primary-300">Monthly recurring revenue from paying institutions</p>
          </div>
          <ToneBadge tone="green" variant="pill">
            {formatMoney(total)} MRR
          </ToneBadge>
        </header>
        {total === 0 ? (
          <ChartEmpty title="No paying institutions yet" message="MRR by plan appears once institutions start paying." />
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART.grid} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={AXIS_TICK} tickFormatter={(v: number) => formatCompactMoney(v)} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={84} tick={AXIS_TICK} />
                <Tooltip
                  cursor={{ fill: CHART.grid, fillOpacity: 0.35 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as (typeof rows)[number];
                    return (
                      <ChartTooltip title={row.name}>
                        <p className="font-semibold!">{formatMoney(row.mrr)} / mo</p>
                        <p className="mt-0.5 body-2xsm-regular text-primary-300">
                          {formatPct(row.share)} of MRR · {row.count} paying
                        </p>
                      </ChartTooltip>
                    );
                  }}
                />
                <Bar dataKey="mrr" fill={CHART.orange} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
        className="min-w-0 rounded-xl border border-dash bg-white p-5 shadow-2xs"
      >
        <h3 className="heading-h5 font-semibold! text-primary-500">Status breakdown</h3>
        <p className="mb-4 mt-0.5 body-sm-regular text-primary-300">All {store.institutions.length} institutions</p>
        <ul className="space-y-3.5">
          {counts.map(({ status, count }) => (
            <li key={status}>
              <div className="flex items-center justify-between gap-2">
                <ToneBadge tone={STATUS_META[status].tone} size="sm" variant="pill" dot>
                  {STATUS_META[status].label}
                </ToneBadge>
                <span className="body-sm-medium text-primary-500">
                  {count} <span className="body-xsm-regular text-primary-300">· {formatPct((count / all) * 100, 0)}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div className="h-full rounded-full bg-primary-300" initial={{ width: 0 }} animate={{ width: `${(count / all) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}

export default RevenueByPlanCard;
