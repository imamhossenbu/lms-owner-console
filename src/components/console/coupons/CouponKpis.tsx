import React from "react";
import { CalendarClock, CircleDollarSign, TicketCheck, TicketPercent } from "lucide-react";
import type { CouponStats } from "@/lib/couponStorage";
import { formatCompactMoney } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

/** Active coupons, redemptions, discount given, expiring within 7 days (computed on the server). */
export function CouponKpis({ stats }: { stats: CouponStats }) {
  const { active, total, redemptions, redemptionsLast30Days: last30, discountGiven: given, avgDiscountPerRedemption: avg, expiringIn7Days: expiring } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <TrendStatCard icon={<TicketPercent />} iconClassName="bg-brand-orange-light text-brand-orange" label="Active coupons" value={active.toLocaleString()} trend={{ direction: "up", value: `${total}`, caption: "coupons in total" }} />
      <TrendStatCard icon={<TicketCheck />} iconClassName="bg-green-bg text-green" label="Redemptions" value={redemptions.toLocaleString()} trend={{ direction: "up", value: `${last30}`, caption: "in the last 30 days" }} />
      <TrendStatCard icon={<CircleDollarSign />} iconClassName="bg-purple-14 text-purple" label="Discount given" value={formatCompactMoney(given)} trend={{ direction: "down", value: redemptions ? formatCompactMoney(avg) : "$0", caption: "avg. per redemption" }} />
      <TrendStatCard
        icon={<CalendarClock />}
        iconClassName="bg-yellow-bg text-yellow"
        label="Expiring in 7 days"
        value={expiring.toLocaleString()}
        trend={expiring ? { direction: "down", value: `${expiring}`, caption: "renew or let lapse" } : undefined}
      />
    </div>
  );
}

export default CouponKpis;
