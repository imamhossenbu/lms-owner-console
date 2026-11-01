"use client";

import React, { Suspense } from "react";
import { OverviewView } from "@/components/console/overview/OverviewView";
import { OverviewSkeleton } from "@/components/console/overview/OverviewSkeleton";

/** Owner Console › Overview. */
export default function ConsoleOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewView />
    </Suspense>
  );
}
