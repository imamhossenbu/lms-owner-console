"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Archive, Users } from "lucide-react";
import type { Plan, SaasStore } from "@/types/saas";
import { archivePlan } from "@/lib/saasStorage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ModalShell } from "@/components/ui/ModalShell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";
import { SubStatusBadge } from "@/components/console/subscriptions/shared/SubscriptionBadges";
import { planSubscribers } from "./planUtils";

/**
 * Archive / restore a plan. Archiving is blocked while institutions are still on the plan
 * (they have to be moved first) — the blocked modal lists them with links.
 */
export function usePlanArchive(store: SaasStore, onArchived?: (plan: Plan) => void) {
  const [confirming, setConfirming] = useState<Plan | null>(null);
  const [blocked, setBlocked] = useState<Plan | null>(null);

  const requestArchive = (plan: Plan) => (planSubscribers(store, plan.id).length > 0 ? setBlocked(plan) : setConfirming(plan));

  const restore = async (plan: Plan) => {
    const id = toast.loading(`Restoring ${plan.name}...`);
    try {
      await archivePlan(plan.id, false);
      toast.success(`${plan.name} restored`, { id, description: plan.isPublic ? "It's available for new signups again." : "It's available to assign again." });
    } catch (err) {
      toast.error("Couldn't restore the plan", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const blockedSubs = blocked ? planSubscribers(store, blocked.id) : [];

  const modals = (
    <>
      <ConfirmModal
        isOpen={!!confirming}
        title={`Archive ${confirming?.name ?? "plan"}?`}
        subtitle="You can restore it at any time."
        message="The plan disappears from the pricing page, signup and plan pickers. No institution is currently subscribed to it."
        confirmLabel="Archive plan"
        pendingLabel="Archiving..."
        confirmIcon={<Archive className="h-4 w-4" />}
        onClose={() => setConfirming(null)}
        onConfirm={async () => {
          if (!confirming) return;
          const plan = confirming;
          const id = toast.loading(`Archiving ${plan.name}...`);
          try {
            await archivePlan(plan.id, true);
            toast.success(`${plan.name} archived`, { id, description: "Hidden from new signups." });
            onArchived?.(plan);
          } catch (err) {
            toast.error("Couldn't archive the plan", { id, description: err instanceof Error ? err.message : "Please try again." });
            throw err;
          }
        }}
      />
      <ModalShell
        isOpen={!!blocked}
        onClose={() => setBlocked(null)}
        title={`${blocked?.name ?? "This plan"} still has subscribers`}
        subtitle="Move these institutions to another plan before archiving."
        maxWidth="md"
        footer={
          <PrimaryButton type="button" onClick={() => setBlocked(null)}>
            Got it
          </PrimaryButton>
        }
      >
        <div className="mb-3 flex items-center gap-2 body-sm-regular text-primary-400">
          <Users className="h-4 w-4 text-primary-300" />
          {blockedSubs.length} institution{blockedSubs.length === 1 ? "" : "s"} on this plan
        </div>
        <ul className="max-h-72 divide-y divide-dash overflow-y-auto rounded-xl border border-dash">
          {blockedSubs.map((inst) => (
            <li key={inst.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <InstitutionAvatar initials={inst.logoInitials} tone={inst.tone} size="sm" />
              <Link href={`/institutions/${inst.id}`} className="min-w-0 flex-1 truncate body-sm-medium text-primary-500 hover:text-brand-orange" title={inst.name}>
                {inst.name}
              </Link>
              <SubStatusBadge status={inst.subscription.status} cancelling={inst.subscription.cancelAtPeriodEnd} />
            </li>
          ))}
        </ul>
      </ModalShell>
    </>
  );

  return { requestArchive, restore, modals };
}

export default usePlanArchive;
