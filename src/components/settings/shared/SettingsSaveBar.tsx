"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Save, Undo2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useReportSettingsDirty } from "./SettingsDirtyContext";

export interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void | Promise<unknown>;
  onDiscard: () => void;
}

/**
 * Sticky bottom bar that slides up only while the section has unsaved edits:
 * "You have unsaved changes" + Discard + orange Save changes. Also warns before the tab is
 * closed/reloaded, supports ⌘/Ctrl+S and reports dirtiness to the page shell.
 */
export function SettingsSaveBar({ isDirty, isSaving, onSave, onDiscard }: SettingsSaveBarProps) {
  const reportDirty = useReportSettingsDirty();

  useEffect(() => {
    reportDirty?.(isDirty);
  }, [isDirty, reportDirty]);

  useEffect(() => () => reportDirty?.(false), [reportDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSaving) void onSave();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDirty, isSaving, onSave]);

  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          key="settings-save-bar"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="sticky bottom-4 z-30"
          role="region"
          aria-label="Unsaved changes"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-dash bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:pl-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-bg text-yellow">
                <CircleAlert className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="body-sm-medium font-semibold! text-primary-500">You have unsaved changes</p>
                <p className="body-xsm-regular text-primary-300">Save them before leaving this section, or discard to undo.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2.5">
              <SecondaryButton type="button" onClick={onDiscard} disabled={isSaving} leftIcon={<Undo2 className="h-4 w-4" />}>
                Discard
              </SecondaryButton>
              <PrimaryButton type="button" onClick={() => void onSave()} isLoading={isSaving} disabled={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                {isSaving ? "Saving..." : "Save changes"}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsSaveBar;
