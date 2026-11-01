"use client";

import React, { Suspense, use } from "react";
import { InstitutionFormView } from "@/components/console/institutions/form/InstitutionFormView";
import { InstitutionFormSkeleton } from "@/components/console/institutions/form/InstitutionFormSkeleton";

/** Owner Console › Institutions › [name] › Edit. */
export default function EditInstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<InstitutionFormSkeleton mode="edit" />}>
      <InstitutionFormView institutionId={decodeURIComponent(id)} />
    </Suspense>
  );
}
