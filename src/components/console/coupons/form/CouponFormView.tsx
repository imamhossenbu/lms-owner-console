"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useCoupons } from "@/lib/couponStorage";
import { couponStatus } from "@/lib/couponMath";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { ConsoleHeader } from "../../subscriptions/shared/ConsoleHeader";
import { useNow } from "../../shared/useNow";
import { CouponStatusBadge } from "../couponMeta";
import { CouponForm } from "./CouponForm";
import { CouponFormSkeleton } from "./CouponFormSkeleton";

/** /coupons/new and /coupons/[id]/edit. */
export function CouponFormView({ couponId }: { couponId?: string }) {
  const coupons = useCoupons();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  if (!coupons || !ready || !now) return <CouponFormSkeleton />;

  const coupon = couponId ? coupons.find((c) => c.id === couponId) : undefined;
  const missing = !!couponId && !coupon;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Coupons", href: "/coupons" }, { label: couponId ? coupon?.code ?? "Not found" : "Create coupon" }]}
        title={couponId ? (coupon ? `Edit ${coupon.code}` : "Coupon not found") : "Create coupon"}
        badge={coupon ? <CouponStatusBadge status={couponStatus(coupon, now)} /> : undefined}
        subtitle={couponId ? "Changes apply to new redemptions." : "Create a discount code institutions can redeem on their subscription."}
      />
      {missing ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-light text-brand-orange">
            <SearchX className="h-6 w-6" />
          </span>
          <p className="mt-3 body-medium text-primary-500">This coupon doesn&apos;t exist</p>
          <p className="mt-1 max-w-md body-sm-regular text-primary-300">It may have been deleted. Pick a coupon from the list.</p>
          <Link href="/coupons" className="mt-4 body-sm-medium text-brand-orange hover:underline">
            Go to Coupons
          </Link>
        </div>
      ) : (
        <CouponForm key={coupon?.id ?? "new"} coupon={coupon} store={store} now={now} />
      )}
    </motion.div>
  );
}

export default CouponFormView;
