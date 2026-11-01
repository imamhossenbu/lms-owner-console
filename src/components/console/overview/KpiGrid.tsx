"use client";

import React from "react";
import { AlertOctagon, Building2, CircleDollarSign, Hourglass, Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { overviewKpis } from "@/lib/saasStats";
import { formatCompactMoney, formatMoney, formatPct, pctChange } from "@/lib/saasStats";
import { KpiTile } from "./KpiTile";

/** The 8 Overview KPIs with change vs the previous 30 days. */
export function KpiGrid({ kpis }: { kpis: ReturnType<typeof overviewKpis> }) {
  const caption = "vs 30 days ago";
  const tiles = [
    { label: "MRR", icon: <CircleDollarSign />, iconClassName: "bg-brand-orange-light text-brand-orange", value: formatMoney(Math.round(kpis.mrr.value)), change: pctChange(kpis.mrr.value, kpis.mrr.previous), caption },
    { label: "ARR", icon: <TrendingUp />, iconClassName: "bg-green-bg text-green", value: formatCompactMoney(kpis.arr.value), change: pctChange(kpis.arr.value, kpis.arr.previous), caption },
    {
      label: "Active institutions",
      icon: <Building2 />,
      iconClassName: "bg-blue-14 text-blue",
      value: kpis.active.value.toLocaleString("en-US"),
      hint: kpis.pastDue ? `incl. ${kpis.pastDue} past due` : "All paying on time",
      change: pctChange(kpis.active.value, kpis.active.previous),
      caption,
    },
    {
      label: "Trials",
      icon: <Hourglass />,
      iconClassName: "bg-purple-14 text-purple",
      value: kpis.trials.value.toLocaleString("en-US"),
      hint: kpis.trialsEndingSoon ? `${kpis.trialsEndingSoon} ending in ≤ 3 days` : "None ending soon",
      change: pctChange(kpis.trials.value, kpis.trials.previous),
      caption,
    },
    { label: "Trial → paid conversion", icon: <Percent />, iconClassName: "bg-green-bg text-green", value: formatPct(kpis.conversion.value), hint: "Last 180 days", change: pctChange(kpis.conversion.value, kpis.conversion.previous), caption },
    { label: "Churn (30 days)", icon: <TrendingDown />, iconClassName: "bg-red-14 text-red", value: formatPct(kpis.churn.value), hint: "Paid cancellations", change: pctChange(kpis.churn.value, kpis.churn.previous), caption, inverse: true },
    { label: "ARPA", icon: <Wallet />, iconClassName: "bg-blue-14 text-blue", value: formatMoney(Math.round(kpis.arpa.value)), hint: "Avg. revenue per account / mo", change: pctChange(kpis.arpa.value, kpis.arpa.previous), caption },
    {
      label: "Failed payments",
      icon: <AlertOctagon />,
      iconClassName: "bg-yellow-bg text-yellow",
      value: formatMoney(Math.round(kpis.failed.value)),
      hint: `${kpis.failedCount} unpaid invoice${kpis.failedCount === 1 ? "" : "s"}`,
      change: pctChange(kpis.failed.value, kpis.failed.previous),
      caption,
      inverse: true,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t, i) => (
        <KpiTile key={t.label} index={i} {...t} />
      ))}
    </div>
  );
}

export default KpiGrid;
