import React from "react";
import { CalendarClock, CircleDollarSign, TicketCheck, TicketPercent } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import { couponStatus, daysUntilExpiry, totalDiscount } from "@/lib/couponMath";
import { formatCompactMoney } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";

/** Active coupons, redemptions, discount given, expiring within 7 days. */
export function CouponKpis({ coupons, now }: { coupons: Coupon[]; now: number }) {
  const active = coupons.filter((c) => couponStatus(c, now) === "ACTIVE");
  const redemptions = coupons.reduce((s, c) => s + c.redemptions.length, 0);
  const last30 = coupons.reduce((s, c) => s + c.redemptions.filter((r) => now - new Date(r.at).getTime() <= 30 * 86_400_000).length, 0);
  const given = coupons.reduce((s, c) => s + totalDiscount(c), 0);
  const expiring = active.filter((c) => {
    const d = daysUntilExpiry(c, now);
    return d !== null && d <= 7;
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <TrendStatCard icon={<TicketPercent />} iconClassName="bg-brand-orange-light text-brand-orange" label="Active coupons" value={active.length.toLocaleString()} trend={{ direction: "up", value: `${coupons.length}`, caption: "coupons in total" }} />
      <TrendStatCard icon={<TicketCheck />} iconClassName="bg-green-bg text-green" label="Redemptions" value={redemptions.toLocaleString()} trend={{ direction: "up", value: `${last30}`, caption: "in the last 30 days" }} />
      <TrendStatCard icon={<CircleDollarSign />} iconClassName="bg-purple-14 text-purple" label="Discount given" value={formatCompactMoney(given)} trend={{ direction: "down", value: redemptions ? formatCompactMoney(given / redemptions) : "$0", caption: "avg. per redemption" }} />
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
