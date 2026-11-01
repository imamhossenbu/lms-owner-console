import React from "react";
import { CircleAlert, CircleDollarSign, Clock, Undo2 } from "lucide-react";
import type { SaasInvoice } from "@/types/saas";
import { formatCompactMoney } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

const sum = (list: SaasInvoice[]) => list.reduce((s, i) => s + i.total, 0);

/** Collected this month, Outstanding (open), Failed and Refunded totals. */
export function InvoiceKpis({ invoices }: { invoices: SaasInvoice[] }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const paidIn = (from: number, to: number) => invoices.filter((i) => i.status === "PAID" && i.paidAt && new Date(i.paidAt).getTime() >= from && new Date(i.paidAt).getTime() < to);
  const collected = sum(paidIn(monthStart, Infinity));
  const previous = sum(paidIn(lastMonthStart, monthStart));
  const change = previous ? Math.round(((collected - previous) / previous) * 100) : null;
  const open = invoices.filter((i) => i.status === "OPEN");
  const failed = invoices.filter((i) => i.status === "FAILED");
  const refunded = invoices.filter((i) => i.status === "REFUNDED");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <TrendStatCard
        icon={<CircleDollarSign />}
        iconClassName="bg-green-bg text-green"
        label="Collected this month"
        value={formatCompactMoney(collected)}
        trend={change !== null ? { direction: change >= 0 ? "up" : "down", value: `${Math.abs(change)}%`, caption: "vs last month" } : undefined}
      />
      <TrendStatCard icon={<Clock />} iconClassName="bg-blue-14 text-blue" label="Outstanding" value={formatCompactMoney(sum(open))} trend={{ direction: "up", value: `${open.length}`, caption: "open invoices" }} />
      <TrendStatCard icon={<CircleAlert />} iconClassName="bg-red-14 text-red" label="Failed" value={formatCompactMoney(sum(failed))} trend={{ direction: "down", value: `${failed.length}`, caption: "failed invoices" }} />
      <TrendStatCard icon={<Undo2 />} iconClassName="bg-purple-14 text-purple" label="Refunded" value={formatCompactMoney(sum(refunded))} trend={{ direction: "down", value: `${refunded.length}`, caption: "refunds" }} />
    </div>
  );
}

export default InvoiceKpis;
