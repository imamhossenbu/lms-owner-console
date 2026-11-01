"use client";

import React, { useState } from "react";
import { LogIn, PlayCircle, RotateCcw } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { ActionConfirmModal } from "../../shared/ActionConfirmModal";
import { tenantHost } from "../../shared/consoleMeta";
import { ChangePlanModal } from "../modals/ChangePlanModal";
import { ExtendTrialModal } from "../modals/ExtendTrialModal";
import { SuspendModal } from "../modals/SuspendModal";
import { CancelSubscriptionModal } from "../modals/CancelSubscriptionModal";
import type { InstitutionActions } from "./useInstitutionActions";

type DialogKind = "changePlan" | "extendTrial" | "suspend" | "unsuspend" | "cancel" | "reactivate" | "impersonate";

export type InstitutionDialogOpeners = Record<DialogKind, (inst: Institution) => void>;

/** Every institution dialog in one place: `open.changePlan(inst)` etc. Render `dialogs` once per page. */
export function useInstitutionDialogs(plans: Plan[], actions: InstitutionActions) {
  const [state, setState] = useState<{ kind: DialogKind; inst: Institution } | null>(null);
  const close = () => setState(null);
  const opener = (kind: DialogKind) => (inst: Institution) => setState({ kind, inst });
  const open: InstitutionDialogOpeners = {
    changePlan: opener("changePlan"),
    extendTrial: opener("extendTrial"),
    suspend: opener("suspend"),
    unsuspend: opener("unsuspend"),
    cancel: opener("cancel"),
    reactivate: opener("reactivate"),
    impersonate: opener("impersonate"),
  };
  const inst = state?.inst ?? null;
  const is = (k: DialogKind) => (state?.kind === k ? inst : null);

  const dialogs = (
    <>
      <ChangePlanModal institution={is("changePlan")} plans={plans} onClose={close} onConfirm={(i, v) => actions.changePlan(i, v.planId, v.cycle)} />
      <ExtendTrialModal institution={is("extendTrial")} onClose={close} onConfirm={actions.extendTrial} />
      <SuspendModal institution={is("suspend")} onClose={close} onConfirm={actions.suspend} />
      <CancelSubscriptionModal institution={is("cancel")} onClose={close} onConfirm={actions.cancel} />
      <ActionConfirmModal
        isOpen={state?.kind === "unsuspend"}
        title="Lift suspension?"
        subtitle={inst?.name}
        message={<>Admins, instructors and students regain access immediately. Unpaid invoices keep the account past due until they are settled.</>}
        confirmLabel="Lift suspension"
        pendingLabel="Lifting..."
        confirmIcon={<PlayCircle className="h-4 w-4" />}
        onClose={close}
        onConfirm={() => actions.unsuspend(inst!)}
      />
      <ActionConfirmModal
        isOpen={state?.kind === "reactivate"}
        title={inst?.subscription.cancelAtPeriodEnd ? "Keep the subscription?" : "Reactivate subscription?"}
        subtitle={inst?.name}
        message={
          inst?.subscription.cancelAtPeriodEnd ? (
            <>The scheduled cancellation is removed and the subscription renews as usual.</>
          ) : (
            <>A new billing period starts today and the first invoice is {inst?.subscription.paymentMethod ? "charged to the card on file" : "issued as open (no payment method on file)"}.</>
          )
        }
        confirmLabel="Reactivate"
        pendingLabel="Reactivating..."
        confirmIcon={<RotateCcw className="h-4 w-4" />}
        onClose={close}
        onConfirm={() => actions.reactivate(inst!)}
      />
      <ActionConfirmModal
        isOpen={state?.kind === "impersonate"}
        title="Open as owner (impersonate)?"
        subtitle={inst ? tenantHost(inst.slug) : undefined}
        message={
          <>
            You&apos;ll switch the admin panel to <span className="body-sm-medium text-primary-500">{inst?.name}</span> and act with full owner permissions. The visit is recorded on the institution&apos;s activity timeline.
          </>
        }
        confirmLabel="Open panel"
        pendingLabel="Opening..."
        confirmIcon={<LogIn className="h-4 w-4" />}
        onClose={close}
        onConfirm={() => actions.impersonate(inst!)}
      />
    </>
  );

  return { open, dialogs };
}
