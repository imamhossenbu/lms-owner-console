"use client";

import React, { Suspense } from "react";
import { InstitutionsView } from "@/components/console/institutions/list/InstitutionsView";
import { InstitutionsSkeleton } from "@/components/console/institutions/list/InstitutionsSkeleton";

/** Owner Console › Institutions (`?q`, `?status`, `?plan`, `?type`, `?sort`, `?page`, `?perPage` survive reloads). */
export default function ConsoleInstitutionsPage() {
  return (
    <Suspense fallback={<InstitutionsSkeleton />}>
      <InstitutionsView />
    </Suspense>
  );
}
