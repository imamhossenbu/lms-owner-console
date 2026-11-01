"use client";

import React, { Suspense } from "react";
import { CouponsView } from "@/components/console/coupons/CouponsView";
import { CouponsSkeleton } from "@/components/console/coupons/CouponsSkeleton";

/** Owner Console › Coupons (`?q`, `?status`, `?type`, `?page`, `?size` survive reloads). */
export default function ConsoleCouponsPage() {
  return (
    <Suspense fallback={<CouponsSkeleton />}>
      <CouponsView />
    </Suspense>
  );
}
