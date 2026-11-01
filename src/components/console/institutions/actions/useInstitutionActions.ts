"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { BillingCycle, Institution, PlanId, SaasInvoice } from "@/types/saas";
import * as saas from "@/lib/saasStorage";
import { errorMessage, tenantHost } from "../../shared/consoleMeta";
import { impersonateUrl } from "@/lib/adminPanel";

/**
 * Owner actions on institutions with the standard sonner lifecycle (loading → success / error).
 * Every action re-throws on failure so modals can stay open; `busy` holds the running action key.
 */
export function useInstitutionActions() {
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(key: string, loading: [string, string], success: (r: T) => [string, string], errorTitle: string, fn: () => Promise<T>): Promise<T> => {
      setBusy(key);
      const id = toast.loading(loading[0], { description: loading[1] });
      try {
        const result = await fn();
        const [title, description] = success(result);
        toast.success(title, { id, description });
        return result;
      } catch (e) {
        toast.error(errorTitle, { id, description: errorMessage(e) });
        throw e;
      } finally {
        setBusy(null);
      }
    },
    []
  );

  const planName = (id: PlanId) => saas.getPlan(id)?.name ?? id;

  return {
    busy,
    changePlan: (inst: Institution, planId: PlanId, cycle: BillingCycle) =>
      run(
        `plan-${inst.id}`,
        ["Changing plan...", `${inst.name} → ${planName(planId)} (${cycle.toLowerCase()})`],
        (r) => [
          r.kind === "UPGRADE" ? "Plan upgraded" : r.kind === "DOWNGRADE" ? "Plan downgraded" : "Billing cycle changed",
          r.invoice ? `${inst.name} is now on ${planName(planId)}. Invoice ${r.invoice.number} (${r.invoice.status === "PAID" ? "paid" : "open"}) for $${r.invoice.total.toLocaleString("en-US")}.` : `${inst.name} is now on ${planName(planId)}.`,
        ],
        "Couldn't change the plan",
        () => saas.changePlan(inst.id, planId, cycle)
      ),
    extendTrial: (inst: Institution, days: number) =>
      run(`trial-${inst.id}`, ["Extending trial...", `${inst.name} +${days} days`], (r) => ["Trial extended", `${inst.name}'s trial now ends ${new Date(r.subscription.trialEndsAt ?? "").toLocaleDateString("en-US", { dateStyle: "medium" })}.`], "Couldn't extend the trial", () =>
        saas.extendTrial(inst.id, days)
      ),
    suspend: (inst: Institution, reason: string) =>
      run(`suspend-${inst.id}`, ["Suspending institution...", inst.name], () => ["Institution suspended", `${inst.name} can no longer access its panel.`], "Couldn't suspend", () => saas.suspendInstitution(inst.id, reason)),
    unsuspend: (inst: Institution) =>
      run(`unsuspend-${inst.id}`, ["Lifting suspension...", inst.name], () => ["Suspension lifted", `${inst.name} has access again.`], "Couldn't lift the suspension", () => saas.unsuspendInstitution(inst.id)),
    cancel: (inst: Institution, atPeriodEnd: boolean) =>
      run(
        `cancel-${inst.id}`,
        ["Cancelling subscription...", inst.name],
        () => (atPeriodEnd ? ["Cancellation scheduled", `${inst.name} keeps access until the end of the billing period.`] : ["Subscription cancelled", `${inst.name}'s workspace has been closed.`]),
        "Couldn't cancel",
        () => saas.cancelSubscription(inst.id, atPeriodEnd)
      ),
    reactivate: (inst: Institution) =>
      run(`reactivate-${inst.id}`, ["Reactivating...", inst.name], () => ["Subscription reactivated", `${inst.name} will keep renewing.`], "Couldn't reactivate", () => saas.reactivateSubscription(inst.id)),
    retryInvoice: (inv: SaasInvoice) =>
      run(`invoice-${inv.id}`, ["Retrying payment...", `${inv.number} · $${inv.total.toLocaleString("en-US")}`], () => ["Payment succeeded", `${inv.number} is now paid.`], "Payment failed again", () => saas.retryInvoice(inv.id)),
    refundInvoice: (inv: SaasInvoice) =>
      run(`invoice-${inv.id}`, ["Refunding...", inv.number], () => ["Invoice refunded", `$${inv.total.toLocaleString("en-US")} will return to the customer in 5–10 days.`], "Couldn't refund", () => saas.refundInvoice(inv.id)),
    markInvoicePaid: (inv: SaasInvoice) =>
      run(`invoice-${inv.id}`, ["Recording payment...", inv.number], () => ["Marked as paid", `${inv.number} recorded as an offline payment.`], "Couldn't mark as paid", () => saas.markInvoicePaid(inv.id)),
    addDomain: (inst: Institution, domain: string) =>
      run(`domain-${inst.id}`, ["Adding domain...", domain], (r) => ["Domain added", `Add the DNS records, then verify ${r.customDomain?.domain}.`], "Couldn't add the domain", () => saas.addCustomDomain(inst.id, domain)),
    verifyDomain: (inst: Institution) =>
      run(`domain-${inst.id}`, ["Checking DNS records...", inst.customDomain?.domain ?? ""], (r) => ["Domain verified", `${r.customDomain?.domain} is live with SSL.`], "Verification failed", () => saas.verifyCustomDomain(inst.id)),
    removeDomain: (inst: Institution) =>
      run(`domain-${inst.id}`, ["Removing domain...", inst.customDomain?.domain ?? ""], () => ["Domain removed", `${inst.name} is back on ${tenantHost(inst.slug)}.`], "Couldn't remove the domain", () => saas.removeCustomDomain(inst.id)),
    saveNotes: (inst: Institution, notes: string) =>
      run(`notes-${inst.id}`, ["Saving notes...", inst.name], () => ["Notes saved", "Only platform owners can see these notes."], "Couldn't save notes", () => saas.updateInstitution(inst.id, { notes })),
    impersonate: (inst: Institution) =>
      run(`open-${inst.id}`, ["Opening institution panel...", inst.name], () => ["Opened as owner", `You're now viewing ${inst.name}'s admin panel.`], "Couldn't open the panel", async () => {
        // The panel is a separate app: it switches to this institution from `?impersonate=`.
        window.open(impersonateUrl(inst.id), "_blank", "noopener");
        return inst;
      }),
  };
}

export type InstitutionActions = ReturnType<typeof useInstitutionActions>;
