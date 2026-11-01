"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CalendarClock, DollarSign, Infinity as InfinityIcon, Percent, Receipt, Repeat } from "lucide-react";
import type { CouponDuration, CouponType } from "@/types/coupon";
import type { CouponFormInput } from "@/validations/couponSchema";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ChoiceCardGroup } from "@/components/ui/ChoiceCardGroup";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { InputField } from "@/components/ui/InputField";

/** Percentage vs fixed amount, the value, and how long the discount lasts. */
export function CouponDiscountFields() {
  const { register, control, formState } = useFormContext<CouponFormInput>();
  const errors = formState.errors;
  const type = useWatch({ control, name: "type" });
  const duration = useWatch({ control, name: "duration" });

  return (
    <IconSectionCard icon={<Percent className="h-5 w-5" />} tone="green" title="Discount" description="How much is taken off, and for how long.">
      <div className="space-y-5">
        <div>
          <FieldLabel label="Type" required />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <ChoiceCardGroup<CouponType>
                name="coupon-type"
                value={field.value}
                onChange={field.onChange}
                columns={2}
                options={[
                  { value: "PERCENT", title: "Percentage", description: "e.g. 20% off each discounted invoice", icon: <Percent className="h-4 w-4" /> },
                  { value: "FIXED", title: "Fixed amount", description: "e.g. $50 off each discounted invoice", icon: <DollarSign className="h-4 w-4" /> },
                ]}
              />
            )}
          />
        </div>

        <InputField
          id="coupon-value"
          type="number"
          label={type === "PERCENT" ? "Percent off" : "Amount off"}
          required
          min={type === "PERCENT" ? 1 : 0.01}
          max={type === "PERCENT" ? 100 : undefined}
          step={type === "PERCENT" ? 1 : 0.01}
          leftElement={type === "FIXED" ? <span className="body-sm-regular text-primary-300">$</span> : undefined}
          rightElement={<span className="body-sm-regular text-primary-300">{type === "PERCENT" ? "%" : "USD"}</span>}
          error={errors.value?.message}
          containerClassName="max-w-xs"
          {...register("value", { valueAsNumber: true })}
        />

        <div>
          <FieldLabel label="Duration" required />
          <Controller
            control={control}
            name="duration"
            render={({ field }) => (
              <ChoiceCardGroup<CouponDuration>
                name="coupon-duration"
                value={field.value}
                onChange={field.onChange}
                columns={3}
                options={[
                  { value: "ONCE", title: "Once", description: "First invoice only", icon: <Receipt className="h-4 w-4" /> },
                  { value: "REPEATING", title: "Multiple months", description: "The first few months", icon: <Repeat className="h-4 w-4" /> },
                  { value: "FOREVER", title: "Forever", description: "Every invoice", icon: <InfinityIcon className="h-4 w-4" /> },
                ]}
              />
            )}
          />
        </div>

        {duration === "REPEATING" && (
          <InputField
            id="coupon-months"
            type="number"
            label="Number of months"
            required
            min={1}
            max={36}
            leftElement={<CalendarClock className="h-4 w-4 text-primary-300" />}
            rightElement={<span className="body-sm-regular text-primary-300">months</span>}
            error={errors.durationMonths?.message}
            containerClassName="max-w-xs"
            {...register("durationMonths", { valueAsNumber: true })}
          />
        )}
      </div>
    </IconSectionCard>
  );
}

export default CouponDiscountFields;
