"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Building2, CalendarX2, RefreshCw, RotateCcw, Undo2, Repeat } from "lucide-react";
import type { Institution, SaasStore } from "@/types/saas";
import { cancelSubscription, reactivateSubscription, retryInvoice } from "@/lib/saasStorage";
import { formatMoney } from "@/lib/saasStats";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ModalShell } from "@/components/ui/ModalShell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { formatDate } from "@/components/console/shared/consoleMeta";
import { ChangePlanModal } from "./ChangePlanModal";

type CancelMode = "period_end" | "now";

/** Unpaid (FAILED / OPEN) invoice to retry, newest first. */
export const unpaidInvoiceOf = (store: SaasStore, institutionId: string) =>
  store.invoices
    .filter((i) => i.institutionId === institutionId && (i.status === "FAILED" || i.status === "OPEN"))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))[0];

/** Row actions for subscriptions: view, change plan, retry payment, cancel (period end / now), reactivate. */
export function useSubscriptionActions(store: SaasStore) {
  const router = useRouter();
  const [changing, setChanging] = useState<Institution | null>(null);
  const [cancelling, setCancelling] = useState<{ inst: Institution; mode: CancelMode } | null>(null);
  const [reactivating, setReactivating] = useState<Institution | null>(null);
  const [reactivatePending, setReactivatePending] = useState(false);

  const retry = async (inst: Institution) => {
    const invoice = unpaidInvoiceOf(store, inst.id);
    if (!invoice) return;
    const id = toast.loading("Retrying payment...", { description: `${invoice.number} · ${formatMoney(invoice.total, { cents: true })}` });
    try {
      await retryInvoice(invoice.id);
      toast.success("Payment collected", { id, description: `${inst.name} paid ${invoice.number}.` });
    } catch (err) {
      toast.error("Payment failed again", { id, description: err instanceof Error ? err.message : "Please try again later." });
    }
  };

  const getMenuItems = (inst: Institution): DropdownActionItem[] => {
    const s = inst.subscription;
    const unpaid = unpaidInvoiceOf(store, inst.id);
    const items: DropdownActionItem[] = [
      { key: "view", label: "View institution", icon: <Building2 className="h-4 w-4" />, onClick: () => router.push(`/institutions/${inst.id}`) },
    ];
    if (s.status !== "CANCELLED" && s.status !== "SUSPENDED") items.push({ key: "change", label: "Change plan", icon: <Repeat className="h-4 w-4" />, onClick: () => setChanging(inst) });
    if (unpaid) items.push({ key: "retry", label: "Retry payment", icon: <RefreshCw className="h-4 w-4" />, onClick: () => void retry(inst) });
    if (s.status === "CANCELLED" || s.cancelAtPeriodEnd)
      items.push({ key: "reactivate", label: s.cancelAtPeriodEnd ? "Undo cancellation" : "Reactivate", icon: <RotateCcw className="h-4 w-4" />, onClick: () => setReactivating(inst) });
    if (s.status === "ACTIVE" && !s.cancelAtPeriodEnd)
      items.push({ key: "cancel-end", label: "Cancel at period end", icon: <CalendarX2 className="h-4 w-4" />, separatorBefore: true, onClick: () => setCancelling({ inst, mode: "period_end" }) });
    if (s.status !== "CANCELLED")
      items.push({ key: "cancel-now", label: "Cancel immediately", icon: <Ban className="h-4 w-4" />, danger: true, separatorBefore: !(s.status === "ACTIVE" && !s.cancelAtPeriodEnd), onClick: () => setCancelling({ inst, mode: "now" }) });
    return items;
  };

  const doReactivate = async () => {
    if (!reactivating) return;
    const inst = reactivating;
    setReactivatePending(true);
    const id = toast.loading(inst.subscription.cancelAtPeriodEnd ? "Removing cancellation..." : "Reactivating subscription...", { description: inst.name });
    try {
      await reactivateSubscription(inst.id);
      toast.success(inst.subscription.cancelAtPeriodEnd ? "Cancellation removed" : "Subscription reactivated", { id, description: `${inst.name} will renew as normal.` });
      setReactivating(null);
    } catch (err) {
      toast.error("Couldn't reactivate", { id, description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setReactivatePending(false);
    }
  };

  const c = cancelling;
  const modals = (
    <>
      <ChangePlanModal institution={changing} plans={store.plans} onClose={() => setChanging(null)} />
      <ConfirmModal
        isOpen={!!c}
        title={c?.mode === "now" ? "Cancel subscription now?" : "Cancel at period end?"}
        subtitle={c?.inst.name}
        message={
          c?.mode === "now"
            ? "Access ends immediately and any unpaid invoices are voided. The institution's data is kept so it can be reactivated later."
            : `The institution keeps full access until ${formatDate(c?.inst.subscription.currentPeriodEnd)} and won't be charged again.`
        }
        confirmLabel={c?.mode === "now" ? "Cancel now" : "Schedule cancellation"}
        pendingLabel="Cancelling..."
        confirmIcon={<Ban className="h-4 w-4" />}
        onClose={() => setCancelling(null)}
        onConfirm={async () => {
          if (!c) return;
          const id = toast.loading("Cancelling subscription...", { description: c.inst.name });
          try {
            await cancelSubscription(c.inst.id, c.mode === "period_end");
            toast.success(c.mode === "now" ? "Subscription cancelled" : "Cancellation scheduled", {
              id,
              description: c.mode === "now" ? `${c.inst.name} no longer has access.` : `${c.inst.name} stays active until ${formatDate(c.inst.subscription.currentPeriodEnd)}.`,
            });
          } catch (err) {
            toast.error("Couldn't cancel", { id, description: err instanceof Error ? err.message : "Please try again." });
            throw err;
          }
        }}
      />
      <ModalShell
        isOpen={!!reactivating}
        onClose={reactivatePending ? () => {} : () => setReactivating(null)}
        title={reactivating?.subscription.cancelAtPeriodEnd ? "Undo cancellation?" : "Reactivate subscription?"}
        subtitle={reactivating?.name}
        maxWidth="sm"
        footer={
          <>
            <SecondaryButton type="button" onClick={() => setReactivating(null)} disabled={reactivatePending}>
              Not now
            </SecondaryButton>
            <PrimaryButton type="button" onClick={doReactivate} isLoading={reactivatePending} leftIcon={<Undo2 className="h-4 w-4" />}>
              {reactivatePending ? "Please wait..." : reactivating?.subscription.cancelAtPeriodEnd ? "Keep subscription" : "Reactivate"}
            </PrimaryButton>
          </>
        }
      >
        <p className="body-sm-regular text-primary-400">
          {reactivating?.subscription.cancelAtPeriodEnd
            ? "The scheduled cancellation is removed and the subscription renews at the end of the current period."
            : "A new billing period starts today and the first invoice is charged to the saved payment method."}
        </p>
      </ModalShell>
    </>
  );

  return { getMenuItems, modals };
}

export default useSubscriptionActions;
