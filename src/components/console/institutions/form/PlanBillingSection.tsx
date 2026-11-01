"use client";

import React from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister, useWatch } from "react-hook-form";
import { CreditCard } from "lucide-react";
import type { Plan } from "@/types/saas";
import type { InstitutionFormValues } from "@/validations/saasSchema";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { InputField } from "@/components/ui/InputField";
import { formatDate } from "../../shared/consoleMeta";
import { sortPlans } from "@/lib/saasStats";
import { PlanOptionCard } from "../modals/PlanOptionCard";

export interface PlanBillingSectionProps {
  control: Control<InstitutionFormValues>;
  register: UseFormRegister<InstitutionFormValues>;
  errors: FieldErrors<InstitutionFormValues>;
  plans: Plan[];
  /** Base time for the "trial ends" preview (ms). */
  now: number;
}

/** Create-only: plan cards, billing cycle and "start with a free trial" toggle + days. */
export function PlanBillingSection({ control, register, errors, plans, now }: PlanBillingSectionProps) {
  const cycle = useWatch({ control, name: "cycle" });
  const startWithTrial = useWatch({ control, name: "startWithTrial" });
  const trialDays = useWatch({ control, name: "trialDays" });
  const available = sortPlans(plans).filter((p) => !p.archived);

  return (
    <IconSectionCard
      icon={<CreditCard className="h-5 w-5" />}
      tone="orange"
      title="Plan & billing"
      description="Choose the starting plan. Without a trial, the first invoice is issued as open."
      action={
        <Controller
          control={control}
          name="cycle"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "MONTHLY", label: "Monthly" },
                { value: "YEARLY", label: "Yearly" },
              ]}
            />
          )}
        />
      }
    >
      <div className="space-y-5">
        <Controller
          control={control}
          name="planId"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Plan" className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {available.map((p) => (
                <PlanOptionCard key={p.id} plan={p} cycle={cycle} selected={field.value === p.id} current={false} onSelect={() => field.onChange(p.id)} />
              ))}
            </div>
          )}
        />
        {errors.planId && <p className="body-xsm-regular text-red">{errors.planId.message}</p>}

        <div className="flex flex-col gap-4 rounded-xl border border-dash bg-gray-bg p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Controller control={control} name="startWithTrial" render={({ field }) => <ToggleSwitch id="start-trial" checked={field.value} onChange={field.onChange} tone="orange" label="Start with a free trial" />} />
            <p className="mt-1.5 body-xsm-regular text-primary-300">
              {startWithTrial && Number.isFinite(trialDays) && trialDays > 0
                ? `No charge until ${formatDate(new Date(now + trialDays * 86_400_000).toISOString())}. The institution adds a payment method to convert.`
                : "The subscription starts today and the first invoice is issued (open, due in 7 days)."}
            </p>
          </div>
          {startWithTrial && (
            <div className="w-full sm:w-40">
              <InputField id="trial-days" type="number" min={1} max={60} label="Trial days" required error={errors.trialDays?.message} {...register("trialDays", { valueAsNumber: true })} />
            </div>
          )}
        </div>
      </div>
    </IconSectionCard>
  );
}

export default PlanBillingSection;
