import React from "react";
import { AlertCircle, CalendarClock, CircleDollarSign, Hourglass, TrendingUp, Users } from "lucide-react";
import type { SaasStore } from "@/types/saas";
import { activeCount, arr, failedPaymentsAmount, formatCompactMoney, mrr, trialCount, upcomingRenewals } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

/** MRR, ARR, Active, Trialing, Past-due amount, Renewals in the next 30 days. */
export function SubscriptionKpis({ store }: { store: SaasStore }) {
  const renewals = upcomingRenewals(store, 30);
  const renewalValue = renewals.reduce((s, r) => s + r.amount, 0);
  const pastDue = store.institutions.filter((i) => i.subscription.status === "PAST_DUE").length;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <TrendStatCard icon={<CircleDollarSign />} iconClassName="bg-green-bg text-green" label="MRR" value={formatCompactMoney(mrr(store))} />
      <TrendStatCard icon={<TrendingUp />} iconClassName="bg-blue-14 text-blue" label="ARR" value={formatCompactMoney(arr(store))} />
      <TrendStatCard icon={<Users />} iconClassName="bg-purple-14 text-purple" label="Active" value={activeCount(store).toLocaleString()} />
      <TrendStatCard icon={<Hourglass />} iconClassName="bg-brand-orange-light text-brand-orange" label="Trialing" value={trialCount(store).toLocaleString()} />
      <TrendStatCard
        icon={<AlertCircle />}
        iconClassName="bg-red-14 text-red"
        label="Past due amount"
        value={formatCompactMoney(failedPaymentsAmount(store))}
        trend={pastDue ? { direction: "down", value: `${pastDue}`, caption: "institutions" } : undefined}
      />
      <TrendStatCard
        icon={<CalendarClock />}
        iconClassName="bg-yellow-bg text-yellow"
        label="Renewals · 30 days"
        value={renewals.length.toLocaleString()}
        trend={renewals.length ? { direction: "up", value: formatCompactMoney(renewalValue), caption: "to collect" } : undefined}
      />
    </div>
  );
}

export default SubscriptionKpis;
