"use client";

import React, { Suspense } from "react";
import { DomainsView } from "@/components/console/domains/DomainsView";
import { DomainsSkeleton } from "@/components/console/domains/DomainsSkeleton";

/** Owner Console › Domains (`?q=`, `?status=` survive reloads). */
export default function ConsoleDomainsPage() {
  return (
    <Suspense fallback={<DomainsSkeleton />}>
      <DomainsView />
    </Suspense>
  );
}
