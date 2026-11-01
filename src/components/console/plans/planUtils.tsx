import React from "react";
import { Award, BarChart3, BookOpen, Code2, Globe, HardDrive, Headphones, MessagesSquare, Palette, Sparkles, UserCog, Users, Video } from "lucide-react";
import type { BillingCycle, FeatureKey, Institution, LimitKey, Plan, PlanId, SaasStore } from "@/types/saas";
import { LIMIT_KEYS } from "@/types/saas";
import type { PlanFormValues } from "@/validations/saasSchema";
import { FEATURE_META, LIMIT_META } from "@/lib/planAccess";

const ICONS = { Video, Award, MessagesSquare, Sparkles, BarChart3, Globe, Palette, Code2, Headphones, Users, BookOpen, UserCog, HardDrive };

export const featureIcon = (key: FeatureKey, className = "h-4 w-4") => {
  const Icon = ICONS[FEATURE_META[key].icon];
  return <Icon className={className} />;
};

export const limitIcon = (key: LimitKey, className = "h-4 w-4") => {
  const Icon = ICONS[LIMIT_META[key].icon];
  return <Icon className={className} />;
};

/** Custom-priced ("Contact sales") when both prices are 0. */
export const isCustomPriced = (p: Pick<Plan, "priceMonthly" | "priceYearly">) => p.priceMonthly <= 0 && p.priceYearly <= 0;

/** Yearly saving vs paying monthly for 12 months, rounded % (0 when n/a). 10× monthly → 17. */
export const yearlyDiscountPct = (monthly: number, yearly: number) =>
  monthly > 0 && yearly > 0 ? Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100)) : 0;

/** Yearly price for a discount % off 12 × monthly (whole dollars). */
export const yearlyFromDiscount = (monthly: number, pct: number) => Math.round(monthly * 12 * (1 - pct / 100));

export const cycleFromParam = (v: string): BillingCycle => (v === "yearly" ? "YEARLY" : "MONTHLY");

export const planToFormValues = (p: Plan): PlanFormValues => ({
  name: p.name,
  tagline: p.tagline,
  priceMonthly: p.priceMonthly,
  priceYearly: p.priceYearly,
  limits: { ...p.limits },
  features: [...p.features],
  highlighted: !!p.highlighted,
  isPublic: p.isPublic,
  trialDays: p.trialDays,
});

export const NEW_PLAN_DEFAULTS: PlanFormValues = {
  name: "",
  tagline: "",
  priceMonthly: 49,
  priceYearly: 490,
  limits: { students: 500, courses: 25, teamMembers: 5, storageGb: 50 },
  features: ["certificates", "community"],
  highlighted: false,
  isPublic: true,
  trialDays: 14,
};

/** Live (not cancelled) institutions on the plan. */
export const planSubscribers = (store: SaasStore, planId: PlanId) =>
  store.institutions.filter((i) => i.subscription.planId === planId && i.subscription.status !== "CANCELLED");

export interface LimitViolation {
  institution: Institution;
  key: LimitKey;
  usage: number;
  limit: number;
}

/** Institutions whose current usage would exceed the edited limits. */
export function limitViolations(subscribers: Institution[], limits: PlanFormValues["limits"]): LimitViolation[] {
  return subscribers.flatMap((institution) =>
    LIMIT_KEYS.flatMap((key) => {
      const limit = limits[key];
      return limit !== null && limit !== undefined && Number.isFinite(limit) && institution.usage[key] > limit
        ? [{ institution, key, usage: institution.usage[key], limit }]
        : [];
    })
  );
}
