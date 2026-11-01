"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { CalendarDays, Check, Hash, ShieldCheck } from "lucide-react";
import type { CouponCycle } from "@/types/coupon";
import type { Plan } from "@/types/saas";
import type { CouponFormInput } from "@/validations/couponSchema";
import { formatMoney, sortPlans } from "@/lib/saasStats";
import { cn } from "@/lib/cn";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ChoiceCardGroup } from "@/components/ui/ChoiceCardGroup";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { InputField } from "@/components/ui/InputField";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";

/** Which plans / billing cycles it applies to, redemption cap, expiry and new-customer rule. */
export function CouponRestrictionsFields({ plans }: { plans: Plan[] }) {
  const { register, control, formState } = useFormContext<CouponFormInput>();
  const errors = formState.errors;
  const limit = useWatch({ control, name: "limitRedemptions" });
  const hasExpiry = useWatch({ control, name: "hasExpiry" });
  const selectable = sortPlans(plans).filter((p) => !p.archived);

  return (
    <IconSectionCard icon={<ShieldCheck className="h-5 w-5" />} tone="blue" title="Restrictions" description="Who can use it, and until when.">
      <div className="space-y-5">
        <Controller
          control={control}
          name="planIds"
          render={({ field }) => {
            const value = field.value ?? [];
            const toggle = (id: string) => field.onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
            return (
              <div>
                <FieldLabel label="Plans" />
                <p className="-mt-1 mb-2.5 body-xsm-regular text-primary-300">{value.length ? `${value.length} selected` : "None selected = every plan."}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectable.map((p) => {
                    const on = value.includes(p.id);
                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggle(p.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                          on ? "border-brand-orange bg-brand-orange-light" : "border-dash bg-white hover:bg-slate-50"
                        )}
                      >
                        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", on ? "border-brand-orange bg-brand-orange text-white" : "border-dash bg-white")}>
                          {on && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block body-sm-medium text-primary-500">{p.name}</span>
                          <span className="block body-xsm-regular text-primary-300">{p.priceMonthly ? `${formatMoney(p.priceMonthly)}/mo · ${formatMoney(p.priceYearly)}/yr` : "Custom pricing"}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          }}
        />

        <div>
          <FieldLabel label="Billing cycle" />
          <Controller
            control={control}
            name="cycle"
            render={({ field }) => (
              <ChoiceCardGroup<CouponCycle>
                name="coupon-cycle"
                value={field.value}
                onChange={field.onChange}
                columns={3}
                variant="inline"
                options={[
                  { value: "ANY", title: "Monthly & yearly" },
                  { value: "MONTHLY", title: "Monthly only" },
                  { value: "YEARLY", title: "Yearly only" },
                ]}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-dash pt-5 md:grid-cols-2">
          <div className="space-y-3">
            <Controller
              control={control}
              name="limitRedemptions"
              render={({ field }) => <SettingToggleRow title="Limit redemptions" description="Stop after this many institutions use it." checked={field.value} onChange={field.onChange} />}
            />
            {limit && (
              <InputField
                id="coupon-max"
                type="number"
                min={1}
                leftElement={<Hash className="h-4 w-4 text-primary-300" />}
                rightElement={<span className="body-sm-regular text-primary-300">uses</span>}
                error={errors.maxRedemptions?.message}
                {...register("maxRedemptions", { valueAsNumber: true })}
              />
            )}
          </div>
          <div className="space-y-3">
            <Controller
              control={control}
              name="hasExpiry"
              render={({ field }) => <SettingToggleRow title="Expiry date" description="Last day the code can be redeemed." checked={field.value} onChange={field.onChange} />}
            />
            {hasExpiry && (
              <InputField
                id="coupon-expiry"
                type="date"
                leftElement={<CalendarDays className="h-4 w-4 text-primary-300" />}
                error={errors.expiresOn?.message}
                {...register("expiresOn")}
              />
            )}
          </div>
        </div>

        <div className="border-t border-dash pt-5">
          <Controller
            control={control}
            name="newCustomersOnly"
            render={({ field }) => (
              <SettingToggleRow title="New customers only" description="Only institutions that have never paid can redeem it (trials included)." checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>
    </IconSectionCard>
  );
}

export default CouponRestrictionsFields;
