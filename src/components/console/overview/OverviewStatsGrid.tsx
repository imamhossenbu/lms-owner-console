"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertOctagon, Building2, CircleDollarSign, Hourglass, Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { kpiSparks, overviewKpis } from "@/lib/saasStats";
import { formatCompactMoney, formatMoney, formatPct, pctChange } from "@/lib/saasStats";
import { OverviewStatCard, type OverviewStat } from "./OverviewStatCard";

const CAPTION = "vs 30 days ago";

/** The 8 platform KPIs as panel-style stat cards (two rows of four, staggered in like the panel's StatCardsGrid). */
export function OverviewStatsGrid({ kpis, sparks }: { kpis: ReturnType<typeof overviewKpis>; sparks: ReturnType<typeof kpiSparks> }) {
  const stats: OverviewStat[] = [
    { id: "mrr", label: "MRR", value: formatMoney(Math.round(kpis.mrr.value)), icon: <CircleDollarSign />, color: "orange", change: pctChange(kpis.mrr.value, kpis.mrr.previous), caption: CAPTION, spark: sparks.mrr },
    { id: "arr", label: "ARR", value: formatCompactMoney(kpis.arr.value), icon: <TrendingUp />, color: "green", change: pctChange(kpis.arr.value, kpis.arr.previous), caption: CAPTION, spark: sparks.arr },
    {
      id: "active",
      label: kpis.pastDue ? `Paying institutions · ${kpis.pastDue} past due` : "Paying institutions",
      value: kpis.active.value.toLocaleString("en-US"),
      icon: <Building2 />,
      color: "blue",
      change: pctChange(kpis.active.value, kpis.active.previous),
      caption: CAPTION,
      spark: sparks.active,
    },
    {
      id: "trials",
      label: kpis.trialsEndingSoon ? `Trials · ${kpis.trialsEndingSoon} ending in ≤ 3 days` : "Active trials",
      value: kpis.trials.value.toLocaleString("en-US"),
      icon: <Hourglass />,
      color: "purple",
      change: pctChange(kpis.trials.value, kpis.trials.previous),
      caption: CAPTION,
      spark: sparks.trials,
    },
    { id: "conversion", label: "Trial → paid (180 days)", value: formatPct(kpis.conversion.value), icon: <Percent />, color: "green", change: pctChange(kpis.conversion.value, kpis.conversion.previous), caption: CAPTION, spark: sparks.conversion },
    { id: "churn", label: "Churn (30 days)", value: formatPct(kpis.churn.value), icon: <TrendingDown />, color: "red", change: pctChange(kpis.churn.value, kpis.churn.previous), inverse: true, caption: CAPTION, spark: sparks.churn },
    { id: "arpa", label: "ARPA / month", value: formatMoney(Math.round(kpis.arpa.value)), icon: <Wallet />, color: "blue", change: pctChange(kpis.arpa.value, kpis.arpa.previous), caption: CAPTION, spark: sparks.arpa },
    {
      id: "failed",
      label: `Failed payments · ${kpis.failedCount} unpaid`,
      value: formatMoney(Math.round(kpis.failed.value)),
      icon: <AlertOctagon />,
      color: "yellow",
      change: pctChange(kpis.failed.value, kpis.failed.previous),
      inverse: true,
      caption: CAPTION,
      spark: sparks.failed,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div key={stat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}>
          <OverviewStatCard stat={stat} />
        </motion.div>
      ))}
    </div>
  );
}

export default OverviewStatsGrid;
