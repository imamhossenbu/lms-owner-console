"use client";

import React, { Suspense } from "react";
import { PlansView } from "@/components/console/plans/PlansView";
import { PlansSkeleton } from "@/components/console/plans/PlansSkeleton";

/** Owner Console › Plans & pricing (`?cycle=yearly` survives reloads). */
export default function ConsolePlansPage() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <PlansView />
    </Suspense>
  );
}
