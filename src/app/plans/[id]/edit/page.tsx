"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PlanEditorView } from "@/components/console/plans/editor/PlanEditorView";

/** Owner Console › Plans & pricing › Edit plan. */
export default function EditPlanPage() {
  const params = useParams<{ id: string }>();
  return <PlanEditorView planId={params.id} />;
}
