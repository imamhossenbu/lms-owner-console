import type { Tone } from "@/components/ui/ToneBadge";

/**
 * SaaS (multi-tenant subscription) domain types — shared by the Owner Console (/console/**) and the
 * institution admin panel (Billing & Plan, feature gating, trial banner, Domain settings, /signup).
 *
 * - A `Plan` defines prices (monthly + yearly), hard `limits` (null = unlimited) and the `features` it unlocks.
 * - An `Institution` is one tenant (school, coaching centre, company…) reachable at `<slug>.edupro.com` or
 *   its verified `customDomain`. It always carries exactly one `Subscription`.
 * - `SaasInvoice` is a bill for one paid period; `SaasEvent` is the per-institution lifecycle timeline.
 * - `SaasStore` is the whole persisted mock state (see src/lib/saasStorage.ts, localStorage `edupro_saas_v1`).
 * All timestamps are ISO-8601 strings. Money is in USD (whole dollars, may have cents for proration).
 */

/** The four built-in tiers seeded on every platform. */
export type TierPlanId = "starter" | "growth" | "pro" | "enterprise";
/**
 * Any plan id: a built-in tier ("starter" … "enterprise") or an owner-created custom plan ("plan-<slug>").
 * Order plans with `sortPlans()` / `planRank()` from src/lib/saasStats.ts (tiers + custom plans by monthly price).
 */
export type PlanId = string;

export type FeatureKey =
  | "liveClasses"
  | "certificates"
  | "community"
  | "aiAssistant"
  | "advancedAnalytics"
  | "customDomain"
  | "whiteLabel"
  | "apiAccess"
  | "prioritySupport";

export type LimitKey = "students" | "courses" | "teamMembers" | "storageGb";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD per month. 0 on Enterprise = custom pricing ("Contact sales"). */
  priceMonthly: number;
  /** USD per year (≈ 10 × monthly, i.e. 2 months free). 0 = custom pricing. */
  priceYearly: number;
  /** null = unlimited. */
  limits: Record<LimitKey, number | null>;
  features: FeatureKey[];
  /** Shown as "Most popular" on pricing pages. */
  highlighted?: boolean;
  /** Listed on the public pricing / signup page. Enterprise is sales-only (false). */
  isPublic: boolean;
  trialDays: number;
  /** Set when the owner archives a plan: hidden from new signups, existing subscribers keep it. */
  archived?: boolean;
  updatedAt: string;
}

export type BillingCycle = "MONTHLY" | "YEARLY";

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "SUSPENDED";

export type PaymentBrand = "Visa" | "Mastercard" | "bKash" | "SSLCommerz";

export interface PaymentMethod {
  brand: PaymentBrand;
  last4: string;
}

export interface Subscription {
  planId: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  startedAt: string;
  /** End of the free trial (set while TRIALING; kept afterwards for history). */
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  /** ACTIVE subscription scheduled to end at currentPeriodEnd. */
  cancelAtPeriodEnd: boolean;
  /** When the subscription was cancelled (CANCELLED status). Optional for backward compatibility. */
  cancelledAt?: string | null;
  /** When the institution was suspended (SUSPENDED status). Optional for backward compatibility. */
  suspendedAt?: string | null;
  /** Owner-entered reason while SUSPENDED. */
  suspendedReason?: string | null;
  /** Status before suspension, restored by unsuspend. */
  statusBeforeSuspend?: Exclude<SubscriptionStatus, "SUSPENDED"> | null;
  /** Negotiated price PER BILLING CYCLE (Enterprise / custom deals). Overrides the plan price when set. */
  customPrice?: number | null;
  paymentMethod: PaymentMethod | null;
}

export type CustomDomainStatus = "PENDING_DNS" | "VERIFIED" | "FAILED";

export interface CustomDomain {
  domain: string;
  status: CustomDomainStatus;
  addedAt: string;
  verifiedAt: string | null;
  /** CNAME target, always "cname.edupro.com". */
  dnsTarget: string;
  /** Value of the `_edupro-verify.<domain>` TXT record. */
  txtToken: string;
  /** Last verification attempt (optional). */
  lastCheckedAt?: string | null;
}

export type InstitutionType = "SCHOOL" | "COACHING" | "UNIVERSITY" | "COMPANY" | "CREATOR";

export type InstitutionSource = "SELF_SIGNUP" | "OWNER_CREATED";

export interface Institution {
  id: string;
  name: string;
  slug: string;
  logoInitials: string;
  /** ToneBadge tone used for the initials avatar. */
  tone: Tone;
  type: InstitutionType;
  country: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  createdAt: string;
  lastActiveAt: string;
  subscription: Subscription;
  customDomain: CustomDomain | null;
  usage: Record<LimitKey, number>;
  notes: string;
  source: InstitutionSource;
}

export type InvoiceStatus = "PAID" | "OPEN" | "FAILED" | "REFUNDED" | "VOID";

export interface SaasInvoice {
  id: string;
  /** e.g. "EDP-2026-00123". */
  number: string;
  institutionId: string;
  planId: PlanId;
  cycle: BillingCycle;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  periodStart: string;
  periodEnd: string;
  /** Free-text line, e.g. "Prorated upgrade Starter → Growth". Optional. */
  description?: string;
}

export type SaasEventType =
  | "SIGNED_UP"
  | "TRIAL_STARTED"
  | "TRIAL_CONVERTED"
  | "TRIAL_EXPIRED"
  | "PLAN_UPGRADED"
  | "PLAN_DOWNGRADED"
  | "CYCLE_CHANGED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "REACTIVATED"
  | "SUSPENDED"
  | "DOMAIN_ADDED"
  | "DOMAIN_VERIFIED"
  | "NOTE";

export type SaasActor = "Owner" | "Institution" | "System";

export interface SaasEvent {
  id: string;
  institutionId: string;
  type: SaasEventType;
  message: string;
  at: string;
  actor: SaasActor;
}

export interface SaasStore {
  plans: Plan[];
  institutions: Institution[];
  invoices: SaasInvoice[];
  events: SaasEvent[];
  /** The institution the admin panel (non-console routes) is currently showing. */
  currentInstitutionId: string;
}

// ---------------------------------------------------------------- runtime constants (zod enums, selects, ordering)

/** Built-in tier ids only — use the store's `plans` (sorted with `sortPlans`) for pickers and filters. */
export const PLAN_IDS = ["starter", "growth", "pro", "enterprise"] as const satisfies readonly TierPlanId[];
export const FEATURE_KEYS = [
  "liveClasses",
  "certificates",
  "community",
  "aiAssistant",
  "advancedAnalytics",
  "customDomain",
  "whiteLabel",
  "apiAccess",
  "prioritySupport",
] as const satisfies readonly FeatureKey[];
export const LIMIT_KEYS = ["students", "courses", "teamMembers", "storageGb"] as const satisfies readonly LimitKey[];
export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const satisfies readonly BillingCycle[];
export const SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "SUSPENDED"] as const satisfies readonly SubscriptionStatus[];
export const INSTITUTION_TYPES = ["SCHOOL", "COACHING", "UNIVERSITY", "COMPANY", "CREATOR"] as const satisfies readonly InstitutionType[];
export const INVOICE_STATUSES = ["PAID", "OPEN", "FAILED", "REFUNDED", "VOID"] as const satisfies readonly InvoiceStatus[];
export const PAYMENT_BRANDS = ["Visa", "Mastercard", "bKash", "SSLCommerz"] as const satisfies readonly PaymentBrand[];

/** Countries offered in institution / signup forms. */
export const SAAS_COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "United Arab Emirates",
  "Saudi Arabia",
  "Malaysia",
  "Singapore",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "Nigeria",
  "Kenya",
] as const;

/** Root domain tenants live under and the CNAME target for custom domains. */
export const SAAS_ROOT_DOMAIN = "edupro.com";
export const SAAS_CNAME_TARGET = "cname.edupro.com";
