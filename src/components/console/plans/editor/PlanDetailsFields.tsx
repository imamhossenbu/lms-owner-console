"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Tag } from "lucide-react";
import { TAGLINE_MAX, type PlanFormValues } from "@/validations/saasSchema";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { InputField } from "@/components/ui/InputField";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { FieldLabel } from "@/components/ui/FieldLabel";

interface PlanDetailsFieldsProps {
  /** New custom plans: the id that will be generated from the name (`plan-<slug>`). */
  newPlanId?: string;
}

/** Name, tagline, trial length, generated id (new plans) and visibility toggles. */
export function PlanDetailsFields({ newPlanId }: PlanDetailsFieldsProps) {
  const { register, control, formState } = useFormContext<PlanFormValues>();
  const errors = formState.errors;
  const tagline = useWatch({ control, name: "tagline" }) ?? "";

  return (
    <IconSectionCard icon={<Tag className="h-5 w-5" />} tone="orange" title="Plan details" description="How the plan is named and shown on the pricing page.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField id="plan-name" label="Plan name" required placeholder="e.g. Growth" maxLength={30} error={errors.name?.message} {...register("name")} />
        <InputField
          id="plan-trial"
          label="Free trial"
          type="number"
          min={0}
          max={60}
          rightElement={<span className="body-sm-regular text-primary-300">days</span>}
          error={errors.trialDays?.message}
          {...register("trialDays", { valueAsNumber: true })}
        />
        {newPlanId && (
          <p className="md:col-span-2 -mt-1 body-xsm-regular text-primary-300">
            Plan ID: <span className="body-xsm-medium text-primary-500">{newPlanId}</span> · generated from the name. Custom plans are ordered by monthly price.
          </p>
        )}
        <div className="md:col-span-2">
          <FieldLabel htmlFor="plan-tagline" label="Tagline" required count={tagline.length} max={TAGLINE_MAX} />
          <InputField id="plan-tagline" placeholder="For growing academies with live teaching" error={errors.tagline?.message} {...register("tagline")} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-dash pt-5 md:grid-cols-2">
        <Controller
          control={control}
          name="isPublic"
          render={({ field }) => (
            <SettingToggleRow title="Public plan" description="Listed on the pricing and signup pages. Off = sales-only." checked={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="highlighted"
          render={({ field }) => (
            <SettingToggleRow title='Highlight as "Most popular"' description="Only one plan can be highlighted at a time." checked={field.value} onChange={field.onChange} />
          )}
        />
      </div>
    </IconSectionCard>
  );
}

export default PlanDetailsFields;
