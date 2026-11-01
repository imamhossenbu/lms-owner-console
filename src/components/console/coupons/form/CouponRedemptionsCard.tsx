"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import type { SaasStore } from "@/types/saas";
import { formatMoney } from "@/lib/saasStats";
import { totalDiscount } from "@/lib/couponMath";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { InstitutionAvatar } from "../../shared/InstitutionAvatar";
import { PlanBadge } from "../../shared/ConsoleBadges";
import { formatDate, relativeTime } from "../../shared/consoleMeta";

/** Institutions that redeemed the coupon (newest first) with the discount each received. */
export function CouponRedemptionsCard({ coupon, store, now }: { coupon: Coupon; store: SaasStore; now: number }) {
  const rows = [...coupon.redemptions].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <IconSectionCard
      icon={<Users className="h-5 w-5" />}
      tone="blue"
      title="Redemptions"
      description={rows.length ? `${formatMoney(Math.round(totalDiscount(coupon)))} discount given in total` : "Nobody has used this code yet."}
      action={
        <ToneBadge tone="blue" variant="pill">
          {rows.length}
          {coupon.maxRedemptions !== null ? ` / ${coupon.maxRedemptions}` : ""}
        </ToneBadge>
      }
    >
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-6 text-center body-sm-regular text-primary-300">Share the code and redemptions will appear here.</p>
      ) : (
        <ul className="custom-scrollbar max-h-96 divide-y divide-dash overflow-y-auto pr-1">
          {rows.map((r, i) => {
            const inst = store.institutions.find((x) => x.id === r.institutionId);
            return (
              <motion.li key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: Math.min(i, 10) * 0.03 }} className="flex items-center gap-3 py-3">
                <InstitutionAvatar initials={inst?.logoInitials ?? "?"} tone={inst?.tone ?? "gray"} size="sm" />
                <div className="min-w-0 flex-1">
                  {inst ? (
                    <Link href={`/institutions/${inst.id}`} className="block truncate body-sm-medium text-primary-500 hover:text-brand-orange">
                      {inst.name}
                    </Link>
                  ) : (
                    <p className="truncate body-sm-medium text-primary-400">Deleted institution</p>
                  )}
                  <p className="body-xsm-regular text-primary-300" title={formatDate(r.at)}>
                    {relativeTime(r.at, now)}
                  </p>
                </div>
                <PlanBadge planId={r.planId} plans={store.plans} />
                <span className="w-20 shrink-0 text-right body-sm-medium text-green">−{formatMoney(r.amountOff, { cents: r.amountOff % 1 !== 0 })}</span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </IconSectionCard>
  );
}

export default CouponRedemptionsCard;
