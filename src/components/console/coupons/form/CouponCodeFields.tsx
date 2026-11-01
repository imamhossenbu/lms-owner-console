"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { Shuffle, Ticket } from "lucide-react";
import { COUPON_DESCRIPTION_MAX, type CouponFormInput } from "@/validations/couponSchema";
import { generateCouponCode } from "@/lib/couponMath";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { InputField } from "@/components/ui/InputField";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";

/** Code (with generator), description and the active switch. The code is locked once redeemed. */
export function CouponCodeFields({ codeLocked }: { codeLocked: boolean }) {
  const { register, control, setValue, formState } = useFormContext<CouponFormInput>();
  const errors = formState.errors;
  const description = useWatch({ control, name: "description" }) ?? "";
  const codeField = register("code", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue("code", e.target.value.toUpperCase().replace(/\s+/g, ""), { shouldDirty: true }),
  });

  return (
    <IconSectionCard icon={<Ticket className="h-5 w-5" />} tone="orange" title="Coupon code" description="What institutions type at checkout.">
      <div className="space-y-4">
        <InputField
          id="coupon-code"
          label="Code"
          required
          placeholder="e.g. LAUNCH20"
          maxLength={24}
          autoComplete="off"
          disabled={codeLocked}
          error={errors.code?.message}
          rightElement={
            !codeLocked ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setValue("code", generateCouponCode(), { shouldDirty: true, shouldValidate: true })}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 body-xsm-medium text-brand-orange hover:bg-brand-orange-light"
              >
                <Shuffle className="h-3.5 w-3.5" /> Generate
              </motion.button>
            ) : undefined
          }
          {...codeField}
        />
        {codeLocked && <p className="-mt-2 body-xsm-regular text-primary-300">This coupon has been redeemed, so its code can&apos;t change. Create a new coupon for a different code.</p>}
        <div>
          <FieldLabel htmlFor="coupon-description" label="Internal description" count={description.length} max={COUPON_DESCRIPTION_MAX} />
          <InputField id="coupon-description" placeholder="e.g. Launch offer for new academies" error={errors.description?.message} {...register("description")} />
        </div>
        <div className="border-t border-dash pt-4">
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <SettingToggleRow title="Active" description="Off = can't be redeemed. Discounts already applied keep running." checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>
    </IconSectionCard>
  );
}

export default CouponCodeFields;
