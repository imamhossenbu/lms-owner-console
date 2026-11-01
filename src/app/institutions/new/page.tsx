"use client";

import React, { Suspense } from "react";
import { InstitutionFormView } from "@/components/console/institutions/form/InstitutionFormView";
import { InstitutionFormSkeleton } from "@/components/console/institutions/form/InstitutionFormSkeleton";

/** Owner Console › Institutions › Add institution. */
export default function NewInstitutionPage() {
  return (
    <Suspense fallback={<InstitutionFormSkeleton mode="create" />}>
      <InstitutionFormView />
    </Suspense>
  );
}
