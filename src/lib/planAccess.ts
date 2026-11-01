import { useMemo, useSyncExternalStore } from "react";
import type { FeatureKey, Institution, LimitKey, Plan, PlanId, SaasStore } from "@/types/saas";
import { PLAN_IDS } from "@/types/saas";
import { sortPlans } from "@/lib/saasStats";
import { buildPlans } from "@/data/mockSaasData";
import { getSaasSnapshot, subscribeSaas } from "@/lib/saasStorage";

/**
 * Plan access & feature gating (pure helpers + React hooks). Safe to import from client components; the pure
 * helpers also work in scripts / server code (the hooks are only *called* in client components).
 *
 * Pure
 *  - `PLAN_ORDER` (starter → enterprise), `FEATURE_META` (label, description, lucide icon name, minPlan),
 *    `LIMIT_META` (label, unit, lucide icon name, description), `formatLimit(n|null, key?)` ("Unlimited", "50 GB").
 *  - `planOf(inst, plans)`, `hasFeature(planOrInst, feature, plans?)` (suspended / cancelled → false),
 *    `limitFor(plan, key)`, `isAtLimit(inst, key, plan)`, `remaining(inst, key, plan)`, `minPlanFor(feature, plans)`.
 * Hooks (client only; empty / null on the server and during hydration — render skeletons until `useSaasReady()`)
 *  - `useSaasStore()` live store, `useSaasReady()`, `useCurrentInstitution()`, `useCurrentPlan()`,
 *    `useHasFeature(feature)`, `useFeatureAccess(feature)` (allowed + required plan for upsell copy),
 *    `useLimitStatus(key)` (usage, limit, pct, atLimit).
 */

/** Built-in tier order. For ordering real plan lists (incl. custom plans) use `sortPlans(plans)` from saasStats. */
export const PLAN_ORDER: readonly PlanId[] = PLAN_IDS;

/** Default plan catalogue (used when a caller doesn't pass the live plans). */
const DEFAULT_PLANS: Plan[] = buildPlans(0);

export interface FeatureMeta {
  label: string;
  description: string;
  /** lucide-react icon component name. */
  icon: "Video" | "Award" | "MessagesSquare" | "Sparkles" | "BarChart3" | "Globe" | "Palette" | "Code2" | "Headphones";
  /** Cheapest default plan that includes the feature. */
  minPlan: PlanId;
}

const minPlanDefault = (feature: FeatureKey): PlanId => PLAN_ORDER.find((id) => DEFAULT_PLANS.find((p) => p.id === id)?.features.includes(feature)) ?? "enterprise";

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  liveClasses: { label: "Live classes", description: "Schedule and host live sessions with attendance and recordings.", icon: "Video", minPlan: minPlanDefault("liveClasses") },
  certificates: { label: "Certificates", description: "Issue branded, verifiable completion certificates.", icon: "Award", minPlan: minPlanDefault("certificates") },
  community: { label: "Community", description: "Discussion spaces, posts and moderation for learners.", icon: "MessagesSquare", minPlan: minPlanDefault("community") },
  aiAssistant: { label: "AI assistant", description: "Generate course outlines, quizzes and lesson drafts with AI.", icon: "Sparkles", minPlan: minPlanDefault("aiAssistant") },
  advancedAnalytics: { label: "Advanced analytics", description: "Cohort, engagement and revenue analytics with exports.", icon: "BarChart3", minPlan: minPlanDefault("advancedAnalytics") },
  customDomain: { label: "Custom domain", description: "Serve your academy on your own domain with free SSL.", icon: "Globe", minPlan: minPlanDefault("customDomain") },
  whiteLabel: { label: "White-label branding", description: "Remove EduPro branding from emails, certificates and pages.", icon: "Palette", minPlan: minPlanDefault("whiteLabel") },
  apiAccess: { label: "API access", description: "REST API and webhooks for integrations.", icon: "Code2", minPlan: minPlanDefault("apiAccess") },
  prioritySupport: { label: "Priority support", description: "Dedicated success manager and 4-hour response SLA.", icon: "Headphones", minPlan: minPlanDefault("prioritySupport") },
};

export interface LimitMeta {
  label: string;
  /** Unit suffix for values ("GB" for storage, "" otherwise). */
  unit: string;
  icon: "Users" | "BookOpen" | "UserCog" | "HardDrive";
  description: string;
}

export const LIMIT_META: Record<LimitKey, LimitMeta> = {
  students: { label: "Students", unit: "", icon: "Users", description: "Active student accounts" },
  courses: { label: "Courses", unit: "", icon: "BookOpen", description: "Published and draft courses" },
  teamMembers: { label: "Team members", unit: "", icon: "UserCog", description: "Admins, instructors and staff seats (incl. pending invites)" },
  storageGb: { label: "Storage", unit: "GB", icon: "HardDrive", description: "Videos, files and media" },
};

/** null → "Unlimited"; storage gets " GB"; numbers use en-US separators. */
export function formatLimit(n: number | null | undefined, key?: LimitKey) {
  if (n === null || n === undefined) return "Unlimited";
  const unit = key ? LIMIT_META[key].unit : "";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ""}`;
}

const isInstitution = (x: Plan | Institution): x is Institution => "subscription" in x;

export const planOf = (inst: Institution, plans: Plan[] = DEFAULT_PLANS) => plans.find((p) => p.id === inst.subscription.planId);

/** Does the plan (or the institution's current plan) include the feature? Suspended / cancelled institutions → false. */
export function hasFeature(target: Plan | Institution | null | undefined, feature: FeatureKey, plans: Plan[] = DEFAULT_PLANS) {
  if (!target) return false;
  if (isInstitution(target)) {
    const status = target.subscription.status;
    if (status === "SUSPENDED" || status === "CANCELLED") return false;
    return !!planOf(target, plans)?.features.includes(feature);
  }
  return target.features.includes(feature);
}

export const limitFor = (plan: Plan | null | undefined, key: LimitKey) => (plan ? plan.limits[key] : null);

/** True when usage has reached (or exceeded) the plan limit. Unlimited → false. */
export function isAtLimit(inst: Institution, key: LimitKey, plan: Plan | null | undefined = planOf(inst)) {
  const limit = limitFor(plan, key);
  return limit !== null && inst.usage[key] >= limit;
}

/** Remaining capacity (null = unlimited, never negative). */
export function remaining(inst: Institution, key: LimitKey, plan: Plan | null | undefined = planOf(inst)) {
  const limit = limitFor(plan, key);
  return limit === null ? null : Math.max(0, limit - inst.usage[key]);
}

/** Cheapest non-archived plan (by `sortPlans` — monthly price, custom plans included) that includes the feature. */
export function minPlanFor(feature: FeatureKey, plans: Plan[] = DEFAULT_PLANS) {
  return sortPlans(plans).find((p) => !p.archived && p.features.includes(feature)) ?? null;
}

// ---------------------------------------------------------------- hooks

const EMPTY_STORE: SaasStore = { plans: [], institutions: [], invoices: [], events: [], currentInstitutionId: "" };
const noopSubscribe = () => () => {};

/** Live SaaS store. Empty on the server and during hydration (pair with `useSaasReady()` for skeletons). */
export function useSaasStore(): SaasStore {
  return useSyncExternalStore(subscribeSaas, getSaasSnapshot, () => EMPTY_STORE);
}

/** false on the server / during hydration, true once the client store can be read. */
export function useSaasReady(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** The institution the admin panel is showing (null until ready). */
export function useCurrentInstitution(): Institution | null {
  const store = useSaasStore();
  return useMemo(() => store.institutions.find((i) => i.id === store.currentInstitutionId) ?? null, [store]);
}

/** Current institution's plan (null until ready). */
export function useCurrentPlan(): Plan | null {
  const store = useSaasStore();
  const inst = useCurrentInstitution();
  return useMemo(() => (inst ? store.plans.find((p) => p.id === inst.subscription.planId) ?? null : null), [store, inst]);
}

/** Feature gate for the current institution. false until the store is ready. */
export function useHasFeature(feature: FeatureKey): boolean {
  const store = useSaasStore();
  const inst = useCurrentInstitution();
  return inst ? hasFeature(inst, feature, store.plans) : false;
}

/** Gate + upsell info: `{ ready, allowed, plan, requiredPlan }`. */
export function useFeatureAccess(feature: FeatureKey) {
  const ready = useSaasReady();
  const store = useSaasStore();
  const inst = useCurrentInstitution();
  const plan = useCurrentPlan();
  return useMemo(
    () => ({
      ready: ready && !!inst,
      allowed: inst ? hasFeature(inst, feature, store.plans) : false,
      plan,
      requiredPlan: minPlanFor(feature, store.plans),
      meta: FEATURE_META[feature],
    }),
    [ready, inst, feature, store.plans, plan]
  );
}

/** Usage vs limit for the current institution: `{ usage, limit, pct (null = unlimited), atLimit }`. */
export function useLimitStatus(key: LimitKey) {
  const inst = useCurrentInstitution();
  const plan = useCurrentPlan();
  return useMemo(() => {
    const usage = inst?.usage[key] ?? 0;
    const limit = limitFor(plan, key);
    return { usage, limit, pct: limit === null ? null : limit > 0 ? (usage / limit) * 100 : 100, atLimit: inst ? isAtLimit(inst, key, plan) : false };
  }, [inst, plan, key]);
}
