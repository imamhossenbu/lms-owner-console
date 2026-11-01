"use client";

import React, { Suspense, use } from "react";
import { InstitutionDetailView } from "@/components/console/institutions/detail/InstitutionDetailView";
import { DetailSkeleton } from "@/components/console/institutions/detail/DetailSkeleton";

/** Owner Console › Institutions › [name] (`?tab=overview|usage|billing|domain|activity`, `?events=` survive reloads). */
export default function InstitutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InstitutionDetailView key={id} institutionId={decodeURIComponent(id)} />
    </Suspense>
  );
}
