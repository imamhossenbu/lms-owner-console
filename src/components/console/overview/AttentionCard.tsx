"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { SaasInvoice } from "@/types/saas";
import type { AttentionItem, AttentionKind } from "@/lib/saasStats";
import { DashboardCard } from "../shared/DashboardCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { ATTENTION_KIND, ATTENTION_KINDS, AttentionAction } from "../shared/attentionMeta";
import { InstitutionAvatar } from "../shared/InstitutionAvatar";
import type { InstitutionDialogOpeners } from "../institutions/actions/useInstitutionDialogs";
import type { InstitutionActions } from "../institutions/actions/useInstitutionActions";


export interface AttentionCardProps {
  items: AttentionItem[];
  invoices: SaasInvoice[];
  open: InstitutionDialogOpeners;
  actions: InstitutionActions;
}

/** "Needs attention": trials ending ≤ 3 days, past due, near limits, failing domains — each with its fix action. */
export function AttentionCard({ items, invoices, open, actions }: AttentionCardProps) {
  const counts = items.reduce<Partial<Record<AttentionKind, number>>>((a, i) => ((a[i.kind] = (a[i.kind] ?? 0) + 1), a), {});

  return (
    <DashboardCard
      title="Needs attention"
      description={items.length ? `${items.length} item${items.length === 1 ? "" : "s"} to follow up` : "Everything looks healthy"}
      action={
        <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
          {ATTENTION_KINDS
            .filter((k) => counts[k])
            .map((k) => (
              <ToneBadge key={k} tone={ATTENTION_KIND[k].tone} size="sm" variant="pill">
                {ATTENTION_KIND[k].label} {counts[k]}
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
                  <ToneBadge tone={ATTENTION_KIND[item.kind].tone} size="sm" variant="pill">
                    {item.title}
                  </ToneBadge>
                </div>
                <p className="mt-0.5 truncate body-xsm-regular text-primary-300" title={item.detail}>
                  {item.detail}
                </p>
              </div>
              <AttentionAction item={item} invoices={invoices} open={open} actions={actions} />
            </motion.li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

export default AttentionCard;
