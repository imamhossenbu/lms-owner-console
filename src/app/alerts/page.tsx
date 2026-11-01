"use client";

import React, { Suspense } from "react";
import { AlertsView } from "@/components/console/alerts/AlertsView";
import { AlertsSkeleton } from "@/components/console/alerts/AlertsSkeleton";

/** Owner Console › Alerts (`?tab`, `?status`, `?q`, `?page`, `?size` survive reloads). */
export default function ConsoleAlertsPage() {
  return (
    <Suspense fallback={<AlertsSkeleton />}>
      <AlertsView />
    </Suspense>
  );
}
