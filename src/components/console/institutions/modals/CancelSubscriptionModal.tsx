"use client";

import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarClock, XCircle, Zap } from "lucide-react";
import type { Institution } from "@/types/saas";
import { ModalShell } from "@/components/ui/ModalShell";
import { ChoiceCardGroup } from "@/components/ui/ChoiceCardGroup";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { formatDate } from "../../shared/consoleMeta";

const schema = z.object({ mode: z.enum(["PERIOD_END", "NOW"], { error: "Choose when to cancel" }) });
type Values = z.infer<typeof schema>;

export interface CancelSubscriptionModalProps {
  institution: Institution | null;
  onClose: () => void;
  onConfirm: (inst: Institution, atPeriodEnd: boolean) => Promise<unknown>;
}

/** Cancel at period end (keeps access, no further charges) or immediately (closes the workspace, voids unpaid invoices). */
export function CancelSubscriptionModal({ institution, onClose, onConfirm }: CancelSubscriptionModalProps) {
  const canScheduleEnd = institution?.subscription.status === "ACTIVE" && !institution.subscription.cancelAtPeriodEnd;
  const { control, handleSubmit, reset, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { mode: canScheduleEnd ? "PERIOD_END" : "NOW" } });

  useEffect(() => {
    if (institution) reset({ mode: canScheduleEnd ? "PERIOD_END" : "NOW" });
  }, [institution, canScheduleEnd, reset]);

  const mode = useWatch({ control, name: "mode" });
  if (!institution) return null;
  const submit = handleSubmit(async (v) => {
    try {
      await onConfirm(institution, v.mode === "PERIOD_END");
      onClose();
    } catch {
      /* toast shown */
    }
  });

  return (
    <ModalShell
      isOpen
      onClose={formState.isSubmitting ? () => {} : onClose}
      title="Cancel subscription"
      subtitle={institution.name}
      maxWidth="md"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={formState.isSubmitting}>
            Keep subscription
          </SecondaryButton>
          <PrimaryButton variant="danger" onClick={() => void submit()} isLoading={formState.isSubmitting} disabled={formState.isSubmitting} leftIcon={<XCircle className="h-4 w-4" />}>
            {formState.isSubmitting ? "Cancelling..." : mode === "NOW" ? "Cancel now" : "Schedule cancellation"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <ChoiceCardGroup<Values["mode"]>
              name="cancel-mode"
              aria-label="When to cancel"
              value={field.value}
              onChange={field.onChange}
              columns={2}
              options={[
                {
                  value: "PERIOD_END",
                  title: "At period end",
                  description: canScheduleEnd ? `Access until ${formatDate(institution.subscription.currentPeriodEnd)}, then no renewal.` : "Only for active subscriptions without a scheduled cancellation.",
                  icon: <CalendarClock className="h-5 w-5" />,
                  disabled: !canScheduleEnd,
                },
                { value: "NOW", title: "Immediately", description: "Closes the workspace today and voids unpaid invoices. No refund.", icon: <Zap className="h-5 w-5" /> },
              ]}
            />
          )}
        />
        {formState.errors.mode && <p className="body-xsm-regular text-red">{formState.errors.mode.message}</p>}
      </form>
    </ModalShell>
  );
}

export default CancelSubscriptionModal;
