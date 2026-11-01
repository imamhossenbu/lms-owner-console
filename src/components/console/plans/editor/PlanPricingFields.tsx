"use client";

import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DollarSign, Wand2 } from "lucide-react";
import type { PlanFormValues } from "@/validations/saasSchema";
import { InputField } from "@/components/ui/InputField";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { yearlyDiscountPct, yearlyFromDiscount } from "../planUtils";

const usd = <span className="body-sm-regular text-primary-300">USD</span>;

/** Monthly / yearly price with an "auto yearly = 10× monthly" helper and an editable discount %. */
export function PlanPricingFields({ initialAuto }: { initialAuto: boolean }) {
  const { register, control, setValue, formState } = useFormContext<PlanFormValues>();
  const errors = formState.errors;
  const [monthly, yearly] = useWatch({ control, name: ["priceMonthly", "priceYearly"] });
  const [auto, setAuto] = useState(initialAuto);
  const m = Number(monthly) || 0;
  const discount = yearlyDiscountPct(m, Number(yearly) || 0);
  const custom = m === 0 && (Number(yearly) || 0) === 0;

  const setYearly = (value: number) => setValue("priceYearly", value, { shouldDirty: true, shouldValidate: formState.isSubmitted });

  return (
    <IconSectionCard
      icon={<DollarSign className="h-5 w-5" />}
      tone="green"
      title="Pricing"
      description="Set both prices to 0 for a custom-priced (Contact sales) plan."
      action={
        custom ? (
          <ToneBadge tone="navy">Custom pricing</ToneBadge>
        ) : discount > 0 ? (
          <ToneBadge tone="green" variant="pill">
            Yearly saves {discount}%
          </ToneBadge>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InputField
          id="plan-price-monthly"
          label="Monthly price"
          required
          type="number"
          min={0}
          step="1"
          leftElement={<span className="body-sm-regular">$</span>}
          rightElement={usd}
          error={errors.priceMonthly?.message}
          {...register("priceMonthly", {
            valueAsNumber: true,
            onChange: (e) => {
              const v = Number(e.target.value);
              if (auto && Number.isFinite(v)) setYearly(Math.round(v * 10));
            },
          })}
        />
        <InputField
          id="plan-price-yearly"
          label="Yearly price"
          required
          type="number"
          min={0}
          step="1"
          readOnly={auto}
          className={auto ? "bg-gray-bg! text-primary-400" : ""}
          leftElement={<span className="body-sm-regular">$</span>}
          rightElement={usd}
          error={errors.priceYearly?.message}
          {...register("priceYearly", { valueAsNumber: true })}
        />
        <InputField
          id="plan-discount"
          label="Yearly discount"
          type="number"
          min={0}
          max={50}
          step="1"
          disabled={auto || m === 0}
          value={discount}
          onChange={(e) => {
            const pct = Math.min(50, Math.max(0, Number(e.target.value) || 0));
            setYearly(yearlyFromDiscount(m, pct));
          }}
          rightElement={<span className="body-sm-regular text-primary-300">%</span>}
        />
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dash bg-gray-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SettingToggleRow
          title="Auto-calculate yearly price"
          description="Yearly = 10 × monthly (2 months free, ≈ 17% off)."
          checked={auto}
          onChange={(on) => {
            setAuto(on);
            if (on) setYearly(Math.round(m * 10));
          }}
        />
        {!auto && m > 0 && (
          <CardActionButton icon={<Wand2 />} onClick={() => setYearly(Math.round(m * 10))}>
            Apply 10× monthly
          </CardActionButton>
        )}
      </div>
    </IconSectionCard>
  );
}

export default PlanPricingFields;
