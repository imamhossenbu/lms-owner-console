"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Minus, Sparkles } from "lucide-react";
import type { BillingCycle, FeatureKey, LimitKey, Plan } from "@/types/saas";
import { FEATURE_KEYS, LIMIT_KEYS } from "@/types/saas";
import { FEATURE_META, LIMIT_META, formatLimit } from "@/lib/planAccess";
import { formatMoney } from "@/lib/saasStats";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { cn } from "@/lib/cn";
import { isCustomPriced, yearlyDiscountPct } from "./planUtils";

export type PricingCardPlan = Pick<Plan, "name" | "tagline" | "priceMonthly" | "priceYearly" | "trialDays" | "highlighted" | "isPublic" | "archived"> & {
  limits: Record<LimitKey, number | null>;
  features: FeatureKey[];
};

interface PricingCardProps {
  plan: PricingCardPlan;
  cycle: BillingCycle;
  /** Owner-only strip under the card (subscribers, MRR, actions). */
  footer?: React.ReactNode;
  /** Show features the plan lacks (greyed) — on for the editor preview. */
  showMissing?: boolean;
  index?: number;
  className?: string;
}

/** Plan card exactly as institutions see it on the pricing / signup page (+ an optional owner footer). */
export function PricingCard({ plan, cycle, footer, showMissing = false, index = 0, className }: PricingCardProps) {
  const custom = isCustomPriced(plan);
  const yearly = cycle === "YEARLY";
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const discount = yearlyDiscountPct(plan.priceMonthly, plan.priceYearly);
  const features = showMissing ? FEATURE_KEYS : FEATURE_KEYS.filter((f) => plan.features.includes(f));
  const ctaLabel = custom ? "Contact sales" : plan.trialDays > 0 ? `Start ${plan.trialDays}-day free trial` : "Choose plan";
  const Cta = plan.highlighted ? PrimaryButton : SecondaryButton;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.05, ease: "easeOut" }}
      className={cn(
        "relative flex min-w-0 flex-col rounded-2xl border bg-white shadow-2xs",
        plan.highlighted ? "border-brand-orange ring-4 ring-brand-orange/10" : "border-dash",
        plan.archived && "opacity-70",
        className
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2">
          <ToneBadge tone="orange" variant="pill" className="shadow-xs" icon={<Sparkles className="h-3 w-3" />}>
            Most popular
          </ToneBadge>
        </span>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate heading-h5 font-semibold! text-primary-500" title={plan.name}>
            {plan.name || "Untitled plan"}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {plan.archived && (
              <ToneBadge tone="gray" size="sm">
                Archived
              </ToneBadge>
            )}
            {!plan.isPublic && !plan.archived && (
              <ToneBadge tone="navy" size="sm">
                Sales only
              </ToneBadge>
            )}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 min-h-10 body-sm-regular text-primary-300">{plan.tagline || "Add a short tagline"}</p>

        <div className="mt-4 min-h-16">
          {custom ? (
            <>
              <p className="heading-h3 text-primary-500">Custom</p>
              <p className="body-xsm-regular text-primary-300">Tailored pricing & contract</p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="heading-h3 text-primary-500">{formatMoney(price)}</span>
                <span className="body-sm-regular text-primary-300">/{yearly ? "year" : "month"}</span>
                {yearly && discount > 0 && (
                  <ToneBadge tone="green" size="sm" variant="pill">
                    Save {discount}%
                  </ToneBadge>
                )}
              </div>
              <p className="body-xsm-regular text-primary-300">
                {yearly ? `${formatMoney(Math.round((plan.priceYearly / 12) * 100) / 100)}/mo billed yearly` : `or ${formatMoney(plan.priceYearly)}/year`}
              </p>
            </>
          )}
        </div>

        <div className="mt-4" aria-hidden>
          <Cta type="button" fullWidth tabIndex={-1} className="pointer-events-none">
            {ctaLabel}
          </Cta>
        </div>

        <ul className="mt-5 space-y-2 border-t border-dash pt-4">
          {LIMIT_KEYS.map((key) => (
            <li key={key} className="flex items-center justify-between gap-2 body-sm-regular">
              <span className="text-primary-400">{LIMIT_META[key].label}</span>
              <span className="body-sm-medium text-primary-500">{formatLimit(plan.limits[key], key)}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-4 space-y-2 border-t border-dash pt-4">
          {features.map((key) => {
            const has = plan.features.includes(key);
            return (
              <li key={key} className={cn("flex items-center gap-2 body-sm-regular", has ? "text-primary-500" : "text-primary-300")}>
                <span className={cn("flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full", has ? "bg-green-bg text-green" : "bg-gray-bg text-primary-300")}>
                  {has ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </span>
                <span className={cn("truncate", !has && "line-through")}>{FEATURE_META[key].label}</span>
              </li>
            );
          })}
          {features.length === 0 && <li className="body-xsm-regular text-primary-300">No extra features</li>}
        </ul>
      </div>

      {footer && <div className="border-t border-dash bg-gray-bg/60 px-5 py-3.5 rounded-b-2xl">{footer}</div>}
    </motion.article>
  );
}

export default PricingCard;
