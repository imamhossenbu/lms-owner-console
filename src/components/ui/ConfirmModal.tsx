"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { PrimaryButton } from "./primary-button";
import { SecondaryButton } from "./secondary-button";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  confirmIcon?: React.ReactNode;
  onClose: () => void;
  /** Resolve to close; throw to keep the modal open and re-enable the buttons. */
  onConfirm: () => Promise<void>;
}

/** Destructive-action confirmation built on ModalShell (red warning box + danger button). */
export function ConfirmModal({
  isOpen,
  title,
  subtitle = "This action cannot be undone.",
  message,
  confirmLabel,
  pendingLabel = "Please wait...",
  confirmIcon,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Caller shows the error toast
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
      footer={
        <>
          <SecondaryButton type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isPending}
            disabled={isPending}
            leftIcon={confirmIcon}
          >
            {isPending ? pendingLabel : confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="p-3.5 rounded-xl bg-red-14 border border-red/30 flex items-start gap-3 text-left">
        <AlertTriangle className="w-5 h-5 text-red shrink-0 mt-0.5" />
        <div className="body-sm-regular text-red-dark">{message}</div>
      </div>
    </ModalShell>
  );
}

export default ConfirmModal;
