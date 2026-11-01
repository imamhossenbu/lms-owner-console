import React from "react";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Sparkles, TrendingUp, Wallet } from "lucide-react";
import type { CollectionsRow, MrrMovementRow } from "@/lib/saasStats";
import { formatCompactMoney } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";
import { signedMoney } from "./revenueRange";

/** Period totals: net new MRR, new, expansion, churn + contraction, cash collected. */
export function RevenueKpis({ movement, collections }: { movement: MrrMovementRow[]; collections: CollectionsRow[] }) {
  const sum = (k: keyof Pick<MrrMovementRow, "newMrr" | "expansion" | "contraction" | "churned" | "newCount" | "expansionCount" | "churnedCount" | "contractionCount">) =>
    movement.reduce((s, r) => s + r[k], 0);
  const starting = movement[0]?.starting ?? 0;
  const ending = movement.at(-1)?.ending ?? 0;
  const net = ending - starting;
  const lost = sum("churned") + sum("contraction");
  const collected = collections.reduce((s, r) => s + r.collected, 0);
  const growth = starting ? Math.round((net / starting) * 100) : null;
  const months = `${movement.length} months`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
      <TrendStatCard
        icon={<TrendingUp />}
        iconClassName="bg-brand-orange-light text-brand-orange"
        label="Net new MRR"
        value={signedMoney(net, formatCompactMoney)}
        trend={growth !== null ? { direction: net >= 0 ? "up" : "down", value: `${Math.abs(growth)}%`, caption: `over ${months}` } : undefined}
      />
      <TrendStatCard
        icon={<Sparkles />}
        iconClassName="bg-green-bg text-green"
        label="New MRR"
        value={formatCompactMoney(sum("newMrr"))}
        trend={{ direction: "up", value: `${sum("newCount")}`, caption: "new paying accounts" }}
      />
      <TrendStatCard
        icon={<ArrowUpRight />}
        iconClassName="bg-blue-14 text-blue"
        label="Expansion MRR"
        value={formatCompactMoney(sum("expansion"))}
        trend={{ direction: "up", value: `${sum("expansionCount")}`, caption: "upgrades" }}
      />
      <TrendStatCard
        icon={<ArrowDownRight />}
        iconClassName="bg-red-14 text-red"
        label="Churn + contraction"
        value={signedMoney(lost, formatCompactMoney)}
        trend={{ direction: "down", value: `${sum("churnedCount") + sum("contractionCount")}`, caption: "lost / downgraded" }}
      />
      <TrendStatCard
        icon={collected ? <Wallet /> : <CircleDollarSign />}
        iconClassName="bg-purple-14 text-purple"
        label="Cash collected"
        value={formatCompactMoney(collected)}
        trend={{ direction: "up", value: `${collections.reduce((s, r) => s + r.invoices, 0)}`, caption: "invoices issued" }}
      />
    </div>
  );
}

export default RevenueKpis;
