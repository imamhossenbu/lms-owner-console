import React from "react";
import { CreditCard } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { formatMoney, monthlyValue, subscriptionPrice } from "@/lib/saasStats";
import { PlanBadge, SubscriptionStatusBadge } from "../../../shared/ConsoleBadges";
import { CYCLE_LABEL, formatDate } from "../../../shared/consoleMeta";

function Fact({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
      <p className="truncate body-xsm-regular text-primary-300">{label}</p>
      <div className="mt-1 truncate body-sm-medium text-primary-500">{value}</div>
      {hint && <p className="mt-0.5 truncate body-2xsm-regular text-primary-300">{hint}</p>}
    </div>
  );
}

/** Plan, price, MRR, period and renewal / trial / cancellation facts. */
export function SubscriptionCard({ institution: i, plans, onChangePlan }: { institution: Institution; plans: Plan[]; onChangePlan?: () => void }) {
  const s = i.subscription;
  const price = subscriptionPrice(plans, i);
  const mrrValue = s.status === "ACTIVE" || s.status === "PAST_DUE" ? monthlyValue(plans, i) : 0;
  const periodLabel =
    s.status === "TRIALING" ? "Trial ends" : s.status === "CANCELLED" ? "Ended" : s.cancelAtPeriodEnd ? "Access until" : s.status === "SUSPENDED" ? "Period end" : "Renews";

  return (
    <IconSectionCard
      icon={<CreditCard className="h-5 w-5" />}
      tone="orange"
      title="Subscription"
      description={s.customPrice ? "Custom contract price" : "Standard plan pricing"}
      action={
        onChangePlan ? (
          <CardActionButton onClick={onChangePlan} icon={<CreditCard className="h-4 w-4" />}>
            Change
          </CardActionButton>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PlanBadge planId={s.planId} plans={plans} size="md" />
        <SubscriptionStatusBadge subscription={s} size="md" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Fact label="Price" value={price > 0 ? `${formatMoney(price)} / ${s.cycle === "YEARLY" ? "yr" : "mo"}` : "Custom"} hint={CYCLE_LABEL[s.cycle]} />
        <Fact label="MRR contribution" value={mrrValue ? formatMoney(Math.round(mrrValue * 100) / 100) : "—"} hint={mrrValue ? "Counts toward platform MRR" : "Not counted"} />
        <Fact label="Current period" value={`${formatDate(s.currentPeriodStart)}`} hint={`to ${formatDate(s.currentPeriodEnd)}`} />
        <Fact label={periodLabel} value={formatDate(s.status === "TRIALING" ? s.trialEndsAt : s.status === "CANCELLED" ? s.cancelledAt ?? s.currentPeriodEnd : s.currentPeriodEnd)} />
        <Fact label="Customer since" value={formatDate(s.startedAt)} hint={s.trialEndsAt && s.status !== "TRIALING" ? `Trial ended ${formatDate(s.trialEndsAt)}` : undefined} />
        <Fact label="Payment method" value={s.paymentMethod ? `${s.paymentMethod.brand} •••• ${s.paymentMethod.last4}` : "None on file"} />
      </div>
      {s.status === "SUSPENDED" && s.suspendedReason && (
        <p className="mt-3 rounded-xl border border-red/30 bg-red-14 px-3.5 py-2.5 body-sm-regular text-red-dark">
          Suspended {s.suspendedAt ? `on ${formatDate(s.suspendedAt)}` : ""}: {s.suspendedReason}
        </p>
      )}
    </IconSectionCard>
  );
}

export default SubscriptionCard;
