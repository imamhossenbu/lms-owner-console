import type { Tone } from "@/components/ui/ToneBadge";
import type { BillingCycle, CustomDomainStatus, InstitutionType, InvoiceStatus, PlanId, SaasEventType, Subscription, SubscriptionStatus } from "@/types/saas";
import { SAAS_ROOT_DOMAIN } from "@/types/saas";

/** Labels, tones and formatters shared by every Owner Console screen. */

export const STATUS_META: Record<SubscriptionStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "green" },
  TRIALING: { label: "Trialing", tone: "blue" },
  PAST_DUE: { label: "Past due", tone: "yellow" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  SUSPENDED: { label: "Suspended", tone: "red" },
};

/** Built-in tier tones; custom plans fall back to indigo via `planTone()`. */
export const PLAN_TONE: Record<string, Tone> = { starter: "gray", growth: "blue", pro: "purple", enterprise: "orange" };
export const planTone = (id: PlanId): Tone => PLAN_TONE[id] ?? "indigo";

/**
 * Display status for a subscription badge: like STATUS_META, but an ACTIVE subscription that is cancelling at
 * period end reads "Cancels Mar 3" (yellow) so badges don't need an extra wrapper.
 */
export function subscriptionStatusDisplay(sub: Pick<Subscription, "status" | "cancelAtPeriodEnd" | "currentPeriodEnd">): { label: string; tone: Tone } {
  if (sub.status === "ACTIVE" && sub.cancelAtPeriodEnd)
    return { label: `Cancels ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, tone: "yellow" };
  return STATUS_META[sub.status];
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  PAID: { label: "Paid", tone: "green" },
  OPEN: { label: "Open", tone: "blue" },
  FAILED: { label: "Failed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "purple" },
  VOID: { label: "Void", tone: "gray" },
};

export const DOMAIN_STATUS_META: Record<CustomDomainStatus, { label: string; tone: Tone }> = {
  PENDING_DNS: { label: "Pending DNS", tone: "yellow" },
  VERIFIED: { label: "Verified", tone: "green" },
  FAILED: { label: "Failed", tone: "red" },
};

export const TYPE_LABEL: Record<InstitutionType, string> = {
  SCHOOL: "School",
  COACHING: "Coaching centre",
  UNIVERSITY: "University",
  COMPANY: "Company",
  CREATOR: "Creator",
};

export const CYCLE_LABEL: Record<BillingCycle, string> = { MONTHLY: "Monthly", YEARLY: "Yearly" };

export const EVENT_TONE: Record<SaasEventType, Tone> = {
  SIGNED_UP: "blue",
  TRIAL_STARTED: "blue",
  TRIAL_CONVERTED: "green",
  TRIAL_EXPIRED: "gray",
  PLAN_UPGRADED: "green",
  PLAN_DOWNGRADED: "yellow",
  CYCLE_CHANGED: "indigo",
  PAYMENT_SUCCEEDED: "green",
  PAYMENT_FAILED: "red",
  CANCELLED: "gray",
  REACTIVATED: "green",
  SUSPENDED: "red",
  DOMAIN_ADDED: "purple",
  DOMAIN_VERIFIED: "purple",
  NOTE: "orange",
};

export const EVENT_LABEL: Record<SaasEventType, string> = {
  SIGNED_UP: "Signed up",
  TRIAL_STARTED: "Trial started",
  TRIAL_CONVERTED: "Trial converted",
  TRIAL_EXPIRED: "Trial expired",
  PLAN_UPGRADED: "Upgraded",
  PLAN_DOWNGRADED: "Downgraded",
  CYCLE_CHANGED: "Cycle changed",
  PAYMENT_SUCCEEDED: "Payment",
  PAYMENT_FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  REACTIVATED: "Reactivated",
  SUSPENDED: "Suspended",
  DOMAIN_ADDED: "Domain added",
  DOMAIN_VERIFIED: "Domain verified",
  NOTE: "Note",
};

export const tenantHost = (slug: string) => `${slug}.${SAAS_ROOT_DOMAIN}`;

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

/** "just now", "5m ago", "3h ago", "2d ago", then a date. Future dates: "in 3d". */
export function relativeTime(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "—";
  const diff = now - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const fmt = (n: number, unit: string) => (diff >= 0 ? `${n}${unit} ago` : `in ${n}${unit}`);
  if (abs < 60_000) return diff >= 0 ? "just now" : "in a moment";
  if (abs < 3_600_000) return fmt(Math.round(abs / 60_000), "m");
  if (abs < 86_400_000) return fmt(Math.round(abs / 3_600_000), "h");
  if (abs < 30 * 86_400_000) return fmt(Math.round(abs / 86_400_000), "d");
  return formatDate(iso);
}

export const errorMessage = (e: unknown, fallback = "Something went wrong. Please try again.") => (e instanceof Error && e.message ? e.message : fallback);
