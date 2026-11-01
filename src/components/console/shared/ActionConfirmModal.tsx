"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { ModalShell } from "@/components/ui/ModalShell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

export interface ActionConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  confirmIcon?: React.ReactNode;
  onClose: () => void;
  /** Resolve to close; throw to keep the modal open (caller toasts the error). */
  onConfirm: () => Promise<unknown>;
}

/** Non-destructive confirmation (orange primary + blue info box) — the counterpart of the red ConfirmModal. */
export function ActionConfirmModal({ isOpen, title, subtitle, message, confirmLabel, pendingLabel = "Please wait...", confirmIcon, onClose, onConfirm }: ActionConfirmModalProps) {
  const [pending, setPending] = useState(false);
  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      /* caller toasts */
    } finally {
      setPending(false);
    }
  };
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={pending ? () => {} : onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={pending}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => void confirm()} isLoading={pending} disabled={pending} leftIcon={confirmIcon}>
            {pending ? pendingLabel : confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-blue/30 bg-blue-14 p-3.5 text-left">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
        <div className="body-sm-regular text-primary-400">{message}</div>
      </div>
    </ModalShell>
  );
}

export default ActionConfirmModal;
