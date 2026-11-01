"use client";

import React, { Suspense } from "react";
import { SubscriptionsView } from "@/components/console/subscriptions/SubscriptionsView";
import { SubscriptionsSkeleton } from "@/components/console/subscriptions/SubscriptionsSkeleton";

/** Owner Console › Subscriptions (`?tab=`, `?q=`, `?plan=`, `?sort=`, `?page=` survive reloads). */
export default function ConsoleSubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsSkeleton />}>
      <SubscriptionsView />
    </Suspense>
  );
}
