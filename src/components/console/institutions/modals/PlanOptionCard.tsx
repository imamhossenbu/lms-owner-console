"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { BillingCycle, Plan } from "@/types/saas";
import { LIMIT_KEYS } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { formatLimit, LIMIT_META } from "@/lib/planAccess";
import { formatMoney, priceFor } from "@/lib/saasStats";
import { cn } from "@/lib/cn";

export interface PlanOptionCardProps {
  plan: Plan;
  cycle: BillingCycle;
  selected: boolean;
  current: boolean;
  /** Negotiated price per cycle when this is the institution's custom-priced current plan. */
  customPrice?: number | null;
  disabledReason?: string;
  onSelect: () => void;
}

/** Selectable plan card for the Change plan modal (price for the chosen cycle + limits). */
export function PlanOptionCard({ plan, cycle, selected, current, customPrice, disabledReason, onSelect }: PlanOptionCardProps) {
  const price = customPrice ?? priceFor(plan, cycle);
  const disabled = !!disabledReason;
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      whileHover={disabled ? undefined : { y: -2 }}
      title={disabledReason}
      className={cn(
        "relative flex h-full flex-col rounded-xl border bg-white p-4 text-left transition-colors",
        selected ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-dash hover:border-slate-300",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="body-medium font-semibold! text-primary-500">{plan.name}</p>
          <p className="mt-0.5 line-clamp-2 body-2xsm-regular text-primary-300">{plan.tagline}</p>
        </div>
        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-brand-orange bg-brand-orange text-white" : "border-dash bg-white")}>
          {selected && <Check className="h-3 w-3" />}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {current && (
          <ToneBadge tone="green" size="sm" variant="pill">
            Current
          </ToneBadge>
        )}
        {plan.highlighted && (
          <ToneBadge tone="orange" size="sm" variant="pill">
            Popular
          </ToneBadge>
        )}
        {plan.archived && (
          <ToneBadge tone="gray" size="sm" variant="pill">
            Archived
          </ToneBadge>
        )}
      </div>
      <p className="mt-3 heading-h5 text-primary-500">
        {price > 0 ? formatMoney(price) : "Custom"}
        {price > 0 && <span className="body-xsm-regular text-primary-300"> /{cycle === "YEARLY" ? "yr" : "mo"}</span>}
      </p>
      <ul className="mt-3 space-y-1.5 border-t border-dash pt-3">
        {LIMIT_KEYS.map((key) => (
          <li key={key} className="flex items-center justify-between gap-2 body-2xsm-regular text-primary-400">
            <span className="truncate">{LIMIT_META[key].label}</span>
            <span className="shrink-0 body-xsm-medium text-primary-500">{formatLimit(plan.limits[key], key)}</span>
          </li>
        ))}
      </ul>
      {disabledReason && <p className="mt-3 body-2xsm-regular text-primary-300">{disabledReason}</p>}
    </motion.button>
  );
}

export default PlanOptionCard;
