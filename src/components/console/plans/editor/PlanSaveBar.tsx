"use client";

import React from "react";
import { motion } from "framer-motion";
import { Archive, ArchiveRestore, CircleAlert, CircleCheck, Save } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

interface PlanSaveBarProps {
  isNew: boolean;
  isDirty: boolean;
  isSaving: boolean;
  archived?: boolean;
  onCancel: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}

/** Sticky bottom bar of the plan editor: status + Cancel, Archive/Restore and the orange Save / Create. */
export function PlanSaveBar({ isNew, isDirty, isSaving, archived, onCancel, onArchive, onRestore }: PlanSaveBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="sticky bottom-4 z-30"
      role="region"
      aria-label="Plan actions"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-dash bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:pl-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={isDirty ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-bg text-yellow" : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-bg text-green"}>
            {isDirty ? <CircleAlert className="h-4.5 w-4.5" /> : <CircleCheck className="h-4.5 w-4.5" />}
          </span>
          <div className="min-w-0">
            <p className="body-sm-medium font-semibold! text-primary-500">{isNew ? "New plan" : isDirty ? "You have unsaved changes" : "All changes saved"}</p>
            <p className="body-xsm-regular text-primary-300">{isNew ? "It goes live on the pricing page as soon as you create it." : "Saved changes apply to the pricing page immediately."}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5">
          {!isNew && (archived ? (
            <SecondaryButton type="button" onClick={onRestore} disabled={isSaving} leftIcon={<ArchiveRestore className="h-4 w-4" />}>
              Restore
            </SecondaryButton>
          ) : (
            <SecondaryButton type="button" onClick={onArchive} disabled={isSaving} leftIcon={<Archive className="h-4 w-4" />}>
              Archive plan
            </SecondaryButton>
          ))}
          <SecondaryButton type="button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" isLoading={isSaving} disabled={isSaving || (!isNew && !isDirty)} leftIcon={<Save className="h-4 w-4" />}>
            {isSaving ? (isNew ? "Creating..." : "Saving...") : isNew ? "Create plan" : "Save changes"}
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanSaveBar;
