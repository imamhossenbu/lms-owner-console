"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";
import type { Institution } from "@/types/saas";
import { ModalShell } from "@/components/ui/ModalShell";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { cn } from "@/lib/cn";
import { formatDate } from "../../shared/consoleMeta";

const schema = z.object({
  days: z.number({ error: "Enter a number of days" }).int("Whole days only").min(1, "At least 1 day").max(60, "60 days at most"),
});
type Values = z.infer<typeof schema>;
const QUICK = [3, 7, 14, 30];

export interface ExtendTrialModalProps {
  institution: Institution | null;
  onClose: () => void;
  onConfirm: (inst: Institution, days: number) => Promise<unknown>;
}

/** Extend a free trial by N days (quick picks + custom), showing the new end date. */
export function ExtendTrialModal({ institution, onClose, onConfirm }: ExtendTrialModalProps) {
  const { register, control, handleSubmit, setValue, reset, formState } = useForm<Values>({ resolver: zodResolver(schema), mode: "onChange", defaultValues: { days: 7 } });
  const days = useWatch({ control, name: "days" });

  useEffect(() => {
    if (institution) reset({ days: 7 });
  }, [institution, reset]);

  if (!institution) return null;
  const currentEnd = institution.subscription.trialEndsAt;
  const base = currentEnd ? new Date(currentEnd).getTime() : new Date(institution.subscription.currentPeriodEnd).getTime();
  const newEnd = Number.isFinite(days) && days > 0 ? new Date(base + days * 86_400_000).toISOString() : null;

  const submit = handleSubmit(async (v) => {
    try {
      await onConfirm(institution, v.days);
      onClose();
    } catch {
      /* toast shown */
    }
  });

  return (
    <ModalShell
      isOpen
      onClose={formState.isSubmitting ? () => {} : onClose}
      title="Extend trial"
      subtitle={`${institution.name} · currently ends ${formatDate(currentEnd)}`}
      maxWidth="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => void submit()} isLoading={formState.isSubmitting} disabled={formState.isSubmitting || !formState.isValid} leftIcon={<CalendarPlus className="h-4 w-4" />}>
            {formState.isSubmitting ? "Extending..." : "Extend trial"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK.map((d) => (
            <motion.button
              key={d}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setValue("days", d, { shouldValidate: true })}
              className={cn(
                "cursor-pointer rounded-lg border px-3.5 py-1.5 body-sm-medium transition-colors",
                days === d ? "border-brand-orange bg-brand-orange-light text-brand-orange" : "border-dash bg-white text-primary-400 hover:bg-slate-50"
              )}
            >
              +{d} days
            </motion.button>
          ))}
        </div>
        <InputField id="extend-days" type="number" min={1} max={60} label="Days to add" required error={formState.errors.days?.message} {...register("days", { valueAsNumber: true })} />
        <div className="rounded-xl border border-dash bg-gray-bg px-4 py-3 body-sm-regular text-primary-400">
          New trial end: <span className="body-sm-medium text-primary-500">{newEnd ? formatDate(newEnd) : "—"}</span>
        </div>
      </form>
    </ModalShell>
  );
}

export default ExtendTrialModal;
