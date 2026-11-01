import React from "react";
import type { BillingCycle, SubscriptionStatus } from "@/types/saas";
import { ToneBadge, type Tone } from "@/components/ui/ToneBadge";
import { SubscriptionStatusBadge } from "@/components/console/shared/ConsoleBadges";

/** A's status pill, plus "Cancelling" for active subscriptions scheduled to end. */
export function SubStatusBadge({ status, cancelling }: { status: SubscriptionStatus; cancelling?: boolean }) {
  if (status === "ACTIVE" && cancelling)
    return (
      <ToneBadge tone="yellow" size="sm" variant="pill" dot>
        Cancelling
      </ToneBadge>
    );
  return <SubscriptionStatusBadge status={status} />;
}

export function CycleBadge({ cycle }: { cycle: BillingCycle }) {
  return (
    <ToneBadge tone={cycle === "YEARLY" ? "green" : "gray"} size="sm">
      {cycle === "YEARLY" ? "Yearly" : "Monthly"}
    </ToneBadge>
  );
}

/** "12d left" / "Today" / "3d overdue". Red ≤ 3 days, yellow ≤ 7. */
export function DaysLeftBadge({ days }: { days: number }) {
  const tone: Tone = days <= 3 ? "red" : days <= 7 ? "yellow" : "gray";
  const label = days < 0 ? `${-days}d overdue` : days === 0 ? "Today" : `${days}d left`;
  return (
    <ToneBadge tone={tone} size="sm" variant="pill">
      {label}
    </ToneBadge>
  );
}
