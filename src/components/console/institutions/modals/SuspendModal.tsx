"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Ban } from "lucide-react";
import type { Institution } from "@/types/saas";
import { ModalShell } from "@/components/ui/ModalShell";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { CharCounter } from "@/components/ui/CharCounter";
import { FieldLabel } from "@/components/ui/SelectField";

const REASON_MAX = 300;
const schema = z.object({
  reason: z.string().trim().min(5, "Add a short reason (at least 5 characters)").max(REASON_MAX, `${REASON_MAX} characters or less`),
});
type Values = z.infer<typeof schema>;
const PRESETS = ["Non-payment — repeated failed charges", "Terms of Service violation", "Security investigation", "Requested by the institution"];

export interface SuspendModalProps {
  institution: Institution | null;
  onClose: () => void;
  onConfirm: (inst: Institution, reason: string) => Promise<unknown>;
}

/** Suspend with a required reason (logged on the timeline; the institution panel is locked until lifted). */
export function SuspendModal({ institution, onClose, onConfirm }: SuspendModalProps) {
  const { register, control, handleSubmit, setValue, reset, formState } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { reason: "" } });
  const reason = useWatch({ control, name: "reason" }) ?? "";

  useEffect(() => {
    if (institution) reset({ reason: "" });
  }, [institution, reset]);

  if (!institution) return null;
  const submit = handleSubmit(async (v) => {
    try {
      await onConfirm(institution, v.reason);
      onClose();
    } catch {
      /* toast shown */
    }
  });

  return (
    <ModalShell
      isOpen
      onClose={formState.isSubmitting ? () => {} : onClose}
      title={`Suspend ${institution.name}?`}
      subtitle="Admins, instructors and students lose access until you lift the suspension."
      maxWidth="md"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton variant="danger" onClick={() => void submit()} isLoading={formState.isSubmitting} disabled={formState.isSubmitting} leftIcon={<Ban className="h-4 w-4" />}>
            {formState.isSubmitting ? "Suspending..." : "Suspend institution"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red/30 bg-red-14 p-3.5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red" />
          <p className="body-sm-regular text-red-dark">Billing pauses while suspended. Data is kept and everything is restored when you unsuspend.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue("reason", p, { shouldValidate: true, shouldDirty: true })}
              className="cursor-pointer rounded-lg border border-dash bg-white px-3 py-1.5 body-xsm-medium text-primary-400 transition-colors hover:bg-slate-50 hover:text-primary-500"
            >
              {p}
            </button>
          ))}
        </div>
        <div>
          <FieldLabel htmlFor="suspend-reason">Reason</FieldLabel>
          <TextAreaField id="suspend-reason" rows={3} placeholder="Why is this institution being suspended?" error={formState.errors.reason?.message} {...register("reason")} />
          <div className="mt-1 flex justify-end">
            <CharCounter count={reason.length} max={REASON_MAX} />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

export default SuspendModal;
