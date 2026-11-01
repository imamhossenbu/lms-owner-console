"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Check, ListChecks } from "lucide-react";
import type { FeatureKey } from "@/types/saas";
import { FEATURE_KEYS } from "@/types/saas";
import type { PlanFormValues } from "@/validations/saasSchema";
import { FEATURE_META } from "@/lib/planAccess";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { featureIcon } from "../planUtils";

/** Feature checklist (FEATURE_META label + description), as selectable cards. */
export function PlanFeaturesField() {
  const { control } = useFormContext<PlanFormValues>();
  return (
    <Controller
      control={control}
      name="features"
      render={({ field, fieldState }) => {
        const value = field.value ?? [];
        const toggle = (key: FeatureKey) => field.onChange(value.includes(key) ? value.filter((f) => f !== key) : FEATURE_KEYS.filter((f) => f === key || value.includes(f)));
        return (
          <IconSectionCard
            icon={<ListChecks className="h-5 w-5" />}
            tone="purple"
            title="Features"
            description="Modules institutions on this plan can use."
            action={
              <ToneBadge tone="purple" variant="pill">
                {value.length} of {FEATURE_KEYS.length}
              </ToneBadge>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {FEATURE_KEYS.map((key) => {
                const on = value.includes(key);
                return (
                  <motion.button
                    key={key}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggle(key)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      on ? "border-brand-orange bg-brand-orange-light" : "border-dash bg-white hover:bg-slate-50"
                    )}
                  >
                    <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", on ? "border-brand-orange bg-brand-orange text-white" : "border-dash bg-white")}>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 body-sm-medium text-primary-500">
                        <span className={on ? "text-brand-orange" : "text-primary-300"}>{featureIcon(key, "h-3.5 w-3.5")}</span>
                        {FEATURE_META[key].label}
                      </span>
                      <span className="mt-0.5 block body-xsm-regular text-primary-300">{FEATURE_META[key].description}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {fieldState.error && <p className="mt-2 body-xsm-regular text-red">{fieldState.error.message}</p>}
          </IconSectionCard>
        );
      }}
    />
  );
}

export default PlanFeaturesField;
