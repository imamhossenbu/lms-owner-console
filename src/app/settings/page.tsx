"use client";

import React, { Suspense } from "react";
import { ConsoleSettingsView } from "@/components/console/settings/ConsoleSettingsView";
import { ConsoleSettingsSkeleton } from "@/components/console/settings/ConsoleSettingsSkeleton";

/** Owner Console › Settings (`?tab=company|billing|trials|email` survives reloads). */
export default function ConsoleSettingsPage() {
  return (
    <Suspense fallback={<ConsoleSettingsSkeleton />}>
      <ConsoleSettingsView />
    </Suspense>
  );
}
