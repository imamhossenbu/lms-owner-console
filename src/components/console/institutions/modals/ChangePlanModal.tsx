"use client";

import React, { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightLeft } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { BILLING_CYCLES } from "@/types/saas";
import { ModalShell } from "@/components/ui/ModalShell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { planChangePreview, sortPlans } from "@/lib/saasStats";
import { PlanOptionCard } from "./PlanOptionCard";
import { PlanChangeSummary } from "./PlanChangeSummary";

const schema = z.object({ planId: z.string().min(1, "Choose a plan"), cycle: z.enum(BILLING_CYCLES) });
type Values = z.infer<typeof schema>;

export interface ChangePlanModalProps {
  institution: Institution | null;
  plans: Plan[];
  onClose: () => void;
  onConfirm: (inst: Institution, values: Values) => Promise<unknown>;
}

/** Compare plans side by side, toggle monthly / yearly, see proration; downgrades over the limits are blocked. */
export function ChangePlanModal({ institution, plans, onClose, onConfirm }: ChangePlanModalProps) {
  const sub = institution?.subscription;
  const { control, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { planId: sub?.planId ?? "growth", cycle: sub?.cycle ?? "MONTHLY" },
  });

  useEffect(() => {
    if (sub) reset({ planId: sub.planId, cycle: sub.cycle });
  }, [sub, reset]);

  const planId = useWatch({ control, name: "planId" });
  const cycle = useWatch({ control, name: "cycle" });
  const target = plans.find((p) => p.id === planId);
  const preview = useMemo(() => (institution ? planChangePreview(plans, institution, planId, cycle) : null), [institution, plans, planId, cycle]);

  if (!institution || !sub) return null;

  const disabledReason = (p: Plan) => {
    if (p.id === sub.planId) return undefined;
    if (p.archived) return "Archived — not available for new changes";
    if (p.priceMonthly === 0 && sub.status !== "TRIALING") return "Custom-priced — agree a contract first";
    return undefined;
  };

  const blocked = !preview || preview.kind === "SAME" || preview.blockers.length > 0;
  const submit = handleSubmit(async (values) => {
    try {
      await onConfirm(institution, values);
      onClose();
    } catch {
      /* toast shown by the action */
    }
  });

  return (
    <ModalShell
      isOpen={!!institution}
      onClose={formState.isSubmitting ? () => {} : onClose}
      title="Change plan"
      subtitle={`${institution.name} · changes apply immediately`}
      maxWidth="xl"
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => void submit()} isLoading={formState.isSubmitting} disabled={blocked || formState.isSubmitting} leftIcon={<ArrowRightLeft className="h-4 w-4" />}>
            {formState.isSubmitting ? "Changing..." : preview?.dueNow ? `Confirm & charge $${preview.dueNow.toLocaleString("en-US")}` : "Confirm change"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="body-sm-regular text-primary-400">Pick a plan and billing cycle. Yearly billing gives 2 months free.</p>
          <Controller
            control={control}
            name="cycle"
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "MONTHLY", label: "Monthly" },
                  { value: "YEARLY", label: "Yearly · 2 months free" },
                ]}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="planId"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Plans" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sortPlans(plans)
                .filter((p) => !p.archived || p.id === sub.planId)
                .map((p) => (
                <PlanOptionCard
                  key={p.id}
                  plan={p}
                  cycle={cycle}
                  selected={field.value === p.id}
                  current={sub.planId === p.id}
                  customPrice={p.id === sub.planId && sub.customPrice ? sub.customPrice : null}
                  disabledReason={disabledReason(p)}
                  onSelect={() => field.onChange(p.id)}
                />
              ))}
            </div>
          )}
        />
        {preview && target && <PlanChangeSummary preview={preview} targetName={target.name} periodEnd={sub.currentPeriodEnd} />}
      </form>
    </ModalShell>
  );
}

export default ChangePlanModal;
