"use client";

import React, { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Infinity as InfinityIcon } from "lucide-react";
import type { LimitKey } from "@/types/saas";
import type { PlanFormValues } from "@/validations/saasSchema";
import { LIMIT_META } from "@/lib/planAccess";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { cn } from "@/lib/cn";
import { limitIcon } from "../planUtils";

const FALLBACK: Record<LimitKey, number> = { students: 500, courses: 25, teamMembers: 5, storageGb: 50 };

/** One plan limit: number input + "Unlimited" toggle (null = unlimited). Remembers the last number. */
export function LimitField({ limitKey }: { limitKey: LimitKey }) {
  const { control } = useFormContext<PlanFormValues>();
  const meta = LIMIT_META[limitKey];
  const last = useRef<number>(FALLBACK[limitKey]);
  const id = `plan-limit-${limitKey}`;

  return (
    <Controller
      control={control}
      name={`limits.${limitKey}`}
      render={({ field, fieldState }) => {
        const unlimited = field.value === null;
        if (typeof field.value === "number" && Number.isFinite(field.value)) last.current = field.value;
        return (
          <div className={cn("rounded-xl border p-3.5 transition-colors", fieldState.error ? "border-red bg-red-14" : "border-dash bg-white")}>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={id} className="flex min-w-0 items-center gap-2 body-sm-medium text-primary-500">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-bg text-primary-400">{limitIcon(limitKey, "h-3.5 w-3.5")}</span>
                <span className="truncate">{meta.label}</span>
              </label>
              <ToggleSwitch
                checked={unlimited}
                tone="orange"
                onChange={(on) => field.onChange(on ? null : last.current)}
                label={<span className="body-xsm-regular text-primary-400">Unlimited</span>}
                className="gap-2"
              />
            </div>
            <p className="mt-1 body-xsm-regular text-primary-300">{meta.description}</p>
            <div className="relative mt-2.5">
              <AnimatePresence mode="wait" initial={false}>
                {unlimited ? (
                  <motion.div
                    key="unlimited"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-10 items-center gap-2 rounded-lg border border-dashed border-dash bg-gray-bg px-3.5 body-sm-medium text-primary-400"
                  >
                    <InfinityIcon className="h-4 w-4" /> Unlimited {meta.label.toLowerCase()}
                  </motion.div>
                ) : (
                  <motion.div key="number" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="relative">
                    <input
                      id={id}
                      type="number"
                      min={1}
                      step={1}
                      value={Number.isFinite(field.value as number) ? (field.value as number) : ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
                      onBlur={field.onBlur}
                      aria-invalid={!!fieldState.error}
                      className={cn(
                        "h-10 w-full rounded-lg border bg-white pl-3.5 pr-12 body-sm-regular text-primary-500 outline-none shadow-xs focus:border-brand-orange",
                        fieldState.error ? "border-red" : "border-dash"
                      )}
                    />
                    {meta.unit && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 body-sm-regular text-primary-300">{meta.unit}</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {fieldState.error && <p className="mt-1.5 body-xsm-regular text-red">{fieldState.error.message}</p>}
          </div>
        );
      }}
    />
  );
}

export default LimitField;
