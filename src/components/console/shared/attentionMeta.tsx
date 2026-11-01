"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRightLeft, CalendarPlus, Gauge, Globe, Hourglass, RefreshCcw } from "lucide-react";
import type { SaasInvoice } from "@/types/saas";
import type { AttentionItem, AttentionKind } from "@/lib/saasStats";
import type { Tone } from "@/components/ui/ToneBadge";
import { CardActionButton } from "@/components/ui/CardActionButton";
import type { InstitutionDialogOpeners } from "../institutions/actions/useInstitutionDialogs";
import type { InstitutionActions } from "../institutions/actions/useInstitutionActions";

/** Label, tone, icon tile and deep link for each "needs attention" kind (Overview card, navbar bell, /alerts). */
export const ATTENTION_KIND: Record<
  AttentionKind,
  { tone: Tone; label: string; plural: string; icon: React.ComponentType<{ className?: string }>; tile: string; href: (i: AttentionItem) => string }
> = {
  PAST_DUE: { tone: "yellow", label: "Past due", plural: "Past due", icon: AlertTriangle, tile: "bg-yellow-bg text-yellow", href: (i) => `/institutions/${i.institution.id}?tab=billing` },
  TRIAL_ENDING: { tone: "blue", label: "Trial ending", plural: "Trials ending", icon: Hourglass, tile: "bg-blue-14 text-blue", href: (i) => `/institutions/${i.institution.id}` },
  NEAR_LIMIT: { tone: "orange", label: "Limits", plural: "Plan limits", icon: Gauge, tile: "bg-brand-orange-light text-brand-orange", href: (i) => `/institutions/${i.institution.id}?tab=usage` },
  DOMAIN_FAILED: { tone: "red", label: "Domain", plural: "Domains", icon: Globe, tile: "bg-red-14 text-red", href: (i) => `/institutions/${i.institution.id}?tab=domain` },
};

export const ATTENTION_KINDS = Object.keys(ATTENTION_KIND) as AttentionKind[];

/** Latest unpaid invoice of an institution (target of "Retry"). */
export const latestUnpaid = (invoices: SaasInvoice[], institutionId: string) =>
  invoices.filter((i) => i.institutionId === institutionId && (i.status === "FAILED" || i.status === "OPEN")).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))[0];

interface AttentionActionProps {
  item: AttentionItem;
  invoices: SaasInvoice[];
  open: InstitutionDialogOpeners;
  actions: InstitutionActions;
  /** Called after the owner starts the fix (e.g. to mark the alert read). */
  onAct?: () => void;
}

/** The one-click fix for an alert: Extend trial · Retry payment · Upgrade plan · Review domain. */
export function AttentionAction({ item, invoices, open, actions, onAct }: AttentionActionProps) {
  const router = useRouter();
  const inst = item.institution;
  const act = (fn: () => void) => () => {
    onAct?.();
    fn();
  };
  switch (item.kind) {
    case "TRIAL_ENDING":
      return (
        <CardActionButton icon={<CalendarPlus className="h-4 w-4" />} onClick={act(() => open.extendTrial(inst))}>
          Extend
        </CardActionButton>
      );
    case "PAST_DUE": {
      const unpaid = latestUnpaid(invoices, inst.id);
      const busy = !!unpaid && actions.busy === `invoice-${unpaid.id}`;
      return (
        <CardActionButton icon={<RefreshCcw className="h-4 w-4" />} disabled={!unpaid || busy} onClick={act(() => unpaid && void actions.retryInvoice(unpaid).catch(() => {}))}>
          {busy ? "Retrying..." : "Retry"}
        </CardActionButton>
      );
    }
    case "NEAR_LIMIT":
      return (
        <CardActionButton icon={<ArrowRightLeft className="h-4 w-4" />} onClick={act(() => open.changePlan(inst))}>
          Upgrade
        </CardActionButton>
      );
    case "DOMAIN_FAILED":
      return (
        <CardActionButton icon={<Globe className="h-4 w-4" />} onClick={act(() => router.push(`/institutions/${inst.id}?tab=domain`))}>
          Review
        </CardActionButton>
      );
  }
}
