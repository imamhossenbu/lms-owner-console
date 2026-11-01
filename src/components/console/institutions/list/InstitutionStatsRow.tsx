import React from "react";
import { Building2, CircleCheck, CircleX, Clock, Hourglass } from "lucide-react";
import type { Institution } from "@/types/saas";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

const pct = (part: number, total: number) => `${total ? Math.round((part / total) * 100) : 0}%`;

/** Institutions KPI row — same 5-card TrendStatCard row as the panel's OrderStatsRow. */
export function InstitutionStatsRow({ institutions }: { institutions: Institution[] }) {
  const total = institutions.length;
  const count = (...s: Institution["subscription"]["status"][]) => institutions.filter((i) => s.includes(i.subscription.status)).length;
  const active = count("ACTIVE");
  const trialing = count("TRIALING");
  const pastDue = count("PAST_DUE");
  const churned = count("CANCELLED", "SUSPENDED");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
      <TrendStatCard icon={<Building2 />} iconClassName="bg-blue-14 text-blue" label="Total Institutions" value={total.toLocaleString()} trend={{ direction: "up", value: "100%", caption: "all tenants" }} />
      <TrendStatCard icon={<CircleCheck />} iconClassName="bg-green-bg text-green" label="Active" value={active.toLocaleString()} trend={{ direction: "up", value: pct(active, total), caption: "of institutions" }} />
      <TrendStatCard icon={<Hourglass />} iconClassName="bg-purple-14 text-purple" label="Trialing" value={trialing.toLocaleString()} trend={{ direction: "up", value: pct(trialing, total), caption: "of institutions" }} />
      <TrendStatCard icon={<Clock />} iconClassName="bg-yellow-bg text-yellow" label="Past Due" value={pastDue.toLocaleString()} trend={{ direction: "down", value: pct(pastDue, total), caption: "of institutions" }} />
      <TrendStatCard icon={<CircleX />} iconClassName="bg-red-14 text-red" label="Cancelled / Suspended" value={churned.toLocaleString()} trend={{ direction: "down", value: pct(churned, total), caption: "of institutions" }} />
    </div>
  );
}

export default InstitutionStatsRow;
