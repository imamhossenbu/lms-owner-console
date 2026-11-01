"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { PrimaryButton } from "@/components/ui/primary-button";

export interface ConsoleEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  onReset?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

/** Empty / no-results state used inside console tables and cards. */
export function ConsoleEmptyState({ icon, title, message, onReset, actionLabel, actionIcon, onAction }: ConsoleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-bg text-primary-300">{icon}</span>
      <p className="mt-3 body-medium text-primary-500">{title}</p>
      <p className="mt-1 max-w-sm body-sm-regular text-primary-300">{message}</p>
      <div className="mt-4 flex gap-2.5">
        {onReset && (
          <SecondaryButton size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>
            Reset filters
          </SecondaryButton>
        )}
        {actionLabel && onAction && (
          <PrimaryButton size="sm" leftIcon={actionIcon} onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

export default ConsoleEmptyState;
