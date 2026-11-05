import React from "react";
import { CircleAlert, CircleDollarSign, Clock, Undo2 } from "lucide-react";
import type { InvoiceStats } from "@/lib/invoicePages";
import { formatCompactMoney } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

/** Invoices page KPIs, computed on the server over every invoice (GET /saas/owner/invoices/stats). */
export function InvoiceKpis({ stats }: { stats: InvoiceStats }) {
  const collected = stats.collectedThisMonth;
  const previous = stats.collectedLastMonth;
  const change = previous ? Math.round(((collected - previous) / previous) * 100) : null;
  const { open, failed, refunded } = stats;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <TrendStatCard
        icon={<CircleDollarSign />}
        iconClassName="bg-green-bg text-green"
        label="Collected this month"
        value={formatCompactMoney(collected)}
        trend={change !== null ? { direction: change >= 0 ? "up" : "down", value: `${Math.abs(change)}%`, caption: "vs last month" } : undefined}
      />
      <TrendStatCard icon={<Clock />} iconClassName="bg-blue-14 text-blue" label="Outstanding" value={formatCompactMoney(open.total)} trend={{ direction: "up", value: `${open.count}`, caption: "open invoices" }} />
      <TrendStatCard icon={<CircleAlert />} iconClassName="bg-red-14 text-red" label="Failed" value={formatCompactMoney(failed.total)} trend={{ direction: "down", value: `${failed.count}`, caption: "failed invoices" }} />
      <TrendStatCard icon={<Undo2 />} iconClassName="bg-purple-14 text-purple" label="Refunded" value={formatCompactMoney(refunded.total)} trend={{ direction: "down", value: `${refunded.count}`, caption: "refunds" }} />
    </div>
  );
}

export default InvoiceKpis;
