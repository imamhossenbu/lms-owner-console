"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calculator, Scissors } from "lucide-react";
import type { Plan } from "@/types/saas";
import type { CouponFormValues } from "@/validations/couponSchema";
import { couponStatus, couponSummary, cycleLabel, discountLabel, durationLabel } from "@/lib/couponMath";
import { formatMoney, sortPlans } from "@/lib/saasStats";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { cn } from "@/lib/cn";
import { CouponStatusBadge } from "../couponMeta";

/** Live ticket preview + "what institutions pay" on each eligible plan's first discounted invoice. */
export function CouponPreviewCard({ values, plans, redemptions, now }: { values: CouponFormValues; plans: Plan[]; redemptions: number; now: number }) {
  const value = Number.isFinite(values.value) ? values.value : 0;
  const coupon = {
    type: values.type,
    value,
    duration: values.duration,
    durationMonths: values.duration === "REPEATING" && Number.isFinite(values.durationMonths) ? values.durationMonths : null,
    planIds: values.planIds,
    cycle: values.cycle,
    newCustomersOnly: values.newCustomersOnly,
  };
  const status = couponStatus(
    {
      active: values.active,
      expiresAt: values.hasExpiry && values.expiresOn ? `${values.expiresOn}T23:59:59.000Z` : null,
      maxRedemptions: values.limitRedemptions && Number.isFinite(values.maxRedemptions) ? values.maxRedemptions : null,
      redemptions: Array.from({ length: redemptions }),
    } as Parameters<typeof couponStatus>[0],
    now
  );
  const eligible = sortPlans(plans).filter((p) => !p.archived && p.priceMonthly > 0 && (!values.planIds.length || values.planIds.includes(p.id)));
  const cycles = values.cycle === "ANY" ? (["MONTHLY", "YEARLY"] as const) : ([values.cycle] as const);
  const after = (price: number) => Math.max(0, values.type === "PERCENT" ? price * (1 - Math.min(value, 100) / 100) : price - value);

  return (
    <div className="space-y-5">
      <motion.div layout className="relative overflow-hidden rounded-xl border border-dashed border-brand-orange bg-brand-orange-light p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="body-xsm-medium uppercase tracking-wider text-brand-orange">Coupon</p>
            <p className="mt-1 truncate heading-h4 text-primary-500">{values.code || "YOUR-CODE"}</p>
          </div>
          <CouponStatusBadge status={status} />
        </div>
        <div className="my-4 flex items-center gap-2 text-brand-orange">
          <Scissors className="h-4 w-4 shrink-0" />
          <span className="h-px flex-1 border-t border-dashed border-brand-orange" />
        </div>
        <p className="heading-h5 text-brand-orange">
          {value > 0 ? discountLabel(coupon) : "No discount yet"} <span className="body-sm-regular text-primary-400">{durationLabel(coupon)}</span>
        </p>
        <p className="mt-1 body-xsm-regular text-primary-400">{couponSummary(coupon, plans)}</p>
      </motion.div>

      <IconSectionCard icon={<Calculator className="h-5 w-5" />} tone="purple" title="What institutions pay" description={`First discounted invoice · ${cycleLabel(values.cycle).toLowerCase()}`}>
        {eligible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-6 text-center body-sm-regular text-primary-300">Only custom-priced plans selected — the discount applies to their negotiated price.</p>
        ) : (
          <ul className="divide-y divide-dash">
            {eligible.map((p) =>
              cycles.map((cycle) => {
                const price = cycle === "YEARLY" ? p.priceYearly : p.priceMonthly;
                const discounted = after(price);
                return (
                  <li key={`${p.id}-${cycle}`} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block body-sm-medium text-primary-500">{p.name}</span>
                      <span className="block body-xsm-regular text-primary-300">{cycle === "YEARLY" ? "Yearly" : "Monthly"}</span>
                    </span>
                    <span className="whitespace-nowrap text-right">
                      <span className={cn("mr-2 body-xsm-regular text-primary-300", discounted < price && "line-through")}>{formatMoney(price)}</span>
                      <span className="body-sm-medium text-primary-500">{formatMoney(Math.round(discounted * 100) / 100, { cents: discounted % 1 !== 0 })}</span>
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </IconSectionCard>
    </div>
  );
}

export default CouponPreviewCard;
