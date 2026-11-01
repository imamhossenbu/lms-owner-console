"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRightLeft, CalendarPlus, CheckCircle2, Globe, RefreshCcw } from "lucide-react";
import type { SaasInvoice } from "@/types/saas";
import type { AttentionItem, AttentionKind } from "@/lib/saasStats";
import type { Tone } from "@/components/ui/ToneBadge";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { InstitutionAvatar } from "../shared/InstitutionAvatar";
import type { InstitutionDialogOpeners } from "../institutions/actions/useInstitutionDialogs";
import type { InstitutionActions } from "../institutions/actions/useInstitutionActions";

const KIND: Record<AttentionKind, { tone: Tone; label: string }> = {
  PAST_DUE: { tone: "yellow", label: "Past due" },
  TRIAL_ENDING: { tone: "blue", label: "Trial ending" },
  NEAR_LIMIT: { tone: "orange", label: "Limits" },
  DOMAIN_FAILED: { tone: "red", label: "Domain" },
};

export interface AttentionCardProps {
  items: AttentionItem[];
  invoices: SaasInvoice[];
  open: InstitutionDialogOpeners;
  actions: InstitutionActions;
}

/** "Needs attention": trials ending ≤ 3 days, past due, near limits, failing domains — each with its fix action. */
export function AttentionCard({ items, invoices, open, actions }: AttentionCardProps) {
  const router = useRouter();
  const counts = items.reduce<Partial<Record<AttentionKind, number>>>((a, i) => ((a[i.kind] = (a[i.kind] ?? 0) + 1), a), {});

  const action = (item: AttentionItem) => {
    const inst = item.institution;
    switch (item.kind) {
      case "TRIAL_ENDING":
        return (
          <CardActionButton icon={<CalendarPlus className="h-4 w-4" />} onClick={() => open.extendTrial(inst)}>
            Extend
          </CardActionButton>
        );
      case "PAST_DUE": {
        const unpaid = invoices.filter((i) => i.institutionId === inst.id && (i.status === "FAILED" || i.status === "OPEN")).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))[0];
        return (
          <CardActionButton
            icon={<RefreshCcw className="h-4 w-4" />}
            disabled={!unpaid || actions.busy === `invoice-${unpaid.id}`}
            onClick={() => unpaid && void actions.retryInvoice(unpaid).catch(() => {})}
          >
            {unpaid && actions.busy === `invoice-${unpaid.id}` ? "Retrying..." : "Retry"}
          </CardActionButton>
        );
      }
      case "NEAR_LIMIT":
        return (
          <CardActionButton icon={<ArrowRightLeft className="h-4 w-4" />} onClick={() => open.changePlan(inst)}>
            Upgrade
          </CardActionButton>
        );
      case "DOMAIN_FAILED":
        return (
          <CardActionButton icon={<Globe className="h-4 w-4" />} onClick={() => router.push(`/institutions/${inst.id}?tab=domain`)}>
            Review
          </CardActionButton>
        );
    }
  };

  return (
    <IconSectionCard
      icon={<AlertTriangle className="h-5 w-5" />}
      tone="yellow"
      title="Needs attention"
      description={items.length ? `${items.length} item${items.length === 1 ? "" : "s"} to follow up` : "Everything looks healthy"}
      action={
        <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
          {(Object.keys(KIND) as AttentionKind[])
            .filter((k) => counts[k])
            .map((k) => (
              <ToneBadge key={k} tone={KIND[k].tone} size="sm" variant="pill">
                {KIND[k].label} {counts[k]}
              </ToneBadge>
            ))}
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-10 text-center">
          <CheckCircle2 className="h-7 w-7 text-green" />
          <p className="mt-2 body-sm-medium text-primary-500">Nothing needs your attention</p>
          <p className="mt-0.5 body-xsm-regular text-primary-300">No ending trials, failed payments, full plans or broken domains.</p>
        </div>
      ) : (
        <ul className="custom-scrollbar max-h-96 divide-y divide-dash overflow-y-auto pr-1">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
              className="flex items-center gap-3 py-3"
            >
              <InstitutionAvatar initials={item.institution.logoInitials} tone={item.institution.tone} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <Link href={`/institutions/${item.institution.id}`} className="truncate body-sm-medium text-primary-500 hover:text-brand-orange" title={item.institution.name}>
                    {item.institution.name}
                  </Link>
                  <ToneBadge tone={KIND[item.kind].tone} size="sm" variant="pill">
                    {item.title}
                  </ToneBadge>
                </div>
                <p className="mt-0.5 truncate body-xsm-regular text-primary-300" title={item.detail}>
                  {item.detail}
                </p>
              </div>
              {action(item)}
            </motion.li>
          ))}
        </ul>
      )}
    </IconSectionCard>
  );
}

export default AttentionCard;
