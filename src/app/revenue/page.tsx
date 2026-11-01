"use client";

import React, { Suspense } from "react";
import { RevenueView } from "@/components/console/revenue/RevenueView";
import { RevenueSkeleton } from "@/components/console/revenue/RevenueSkeleton";

/** Owner Console › Revenue (`?range=6|12|24` survives reloads). */
export default function ConsoleRevenuePage() {
  return (
    <Suspense fallback={<RevenueSkeleton />}>
      <RevenueView />
    </Suspense>
  );
}
