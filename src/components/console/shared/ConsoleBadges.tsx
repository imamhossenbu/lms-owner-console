import React from "react";
import { ToneBadge } from "@/components/ui/ToneBadge";
import type { BillingCycle, CustomDomainStatus, InvoiceStatus, Plan, PlanId, Subscription, SubscriptionStatus } from "@/types/saas";
import { CYCLE_LABEL, DOMAIN_STATUS_META, INVOICE_STATUS_META, planTone, STATUS_META, subscriptionStatusDisplay } from "./consoleMeta";

/**
 * Subscription status pill (Active / Trialing / Past due / Cancelled / Suspended). Pass `subscription` instead of
 * `status` to show "Cancels <date>" for active subscriptions cancelling at period end.
 */
export function SubscriptionStatusBadge({ status, subscription, size = "sm" }: { status?: SubscriptionStatus; subscription?: Pick<Subscription, "status" | "cancelAtPeriodEnd" | "currentPeriodEnd">; size?: "sm" | "md" }) {
  const meta = subscription ? subscriptionStatusDisplay(subscription) : STATUS_META[status ?? "ACTIVE"];
  return (
    <ToneBadge tone={meta.tone} size={size} variant="pill" dot>
      {meta.label}
    </ToneBadge>
  );
}

/** Plan name badge, optionally with the billing cycle ("Growth · Yearly"). */
export function PlanBadge({ planId, plans, cycle, size = "sm" }: { planId: PlanId; plans: Plan[]; cycle?: BillingCycle; size?: "sm" | "md" }) {
  const name = plans.find((p) => p.id === planId)?.name ?? planId;
  return (
    <ToneBadge tone={planTone(planId)} size={size}>
      {name}
      {cycle ? ` · ${CYCLE_LABEL[cycle]}` : ""}
    </ToneBadge>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const meta = INVOICE_STATUS_META[status];
  return (
    <ToneBadge tone={meta.tone} size="sm" variant="pill" dot>
      {meta.label}
    </ToneBadge>
  );
}

export function DomainStatusBadge({ status, size = "sm" }: { status: CustomDomainStatus; size?: "sm" | "md" }) {
  const meta = DOMAIN_STATUS_META[status];
  return (
    <ToneBadge tone={meta.tone} size={size} variant="pill" dot>
      {meta.label}
    </ToneBadge>
  );
}
