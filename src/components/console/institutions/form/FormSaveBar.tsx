"use client";

import React from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

export interface FormSaveBarProps {
  title: string;
  hint: string;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  onCancel: () => void;
}

/** Sticky bottom action bar for console forms (Cancel + orange submit). Must sit inside the <form>. */
export function FormSaveBar({ title, hint, submitLabel, submittingLabel, isSubmitting, disabled, onCancel }: FormSaveBarProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="sticky bottom-4 z-30">
      <div className="flex flex-col gap-3 rounded-2xl border border-dash bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:pl-4">
        <div className="min-w-0">
          <p className="body-sm-medium font-semibold! text-primary-500">{title}</p>
          <p className="body-xsm-regular text-primary-300">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2.5">
          <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting} leftIcon={<X className="h-4 w-4" />}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" isLoading={isSubmitting} disabled={isSubmitting || disabled} leftIcon={<Save className="h-4 w-4" />}>
            {isSubmitting ? submittingLabel : submitLabel}
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  );
}

export default FormSaveBar;
