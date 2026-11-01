"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Building2 } from "lucide-react";
import type { Institution, Plan, SaasEvent, SaasInvoice } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { PlanBadge } from "@/components/console/shared/ConsoleBadges";
import { EVENT_LABEL, EVENT_TONE, formatDateTime, relativeTime } from "@/components/console/shared/consoleMeta";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";
import { SubStatusBadge } from "@/components/console/subscriptions/shared/SubscriptionBadges";

interface InvoiceSidePanelProps {
  invoice: SaasInvoice;
  institution: Institution | undefined;
  plans: Plan[];
  events: SaasEvent[];
}

const card = "dashboard-card shadow-2xs p-5";

/** Institution summary + payment activity related to this invoice. */
export function InvoiceSidePanel({ invoice, institution, plans, events }: InvoiceSidePanelProps) {
  const related = events
    .filter((e) => e.institutionId === invoice.institutionId && (e.message.includes(invoice.number) || e.type === "PAYMENT_FAILED" || e.type === "PAYMENT_SUCCEEDED"))
    .filter((e) => new Date(e.at).getTime() >= new Date(invoice.issuedAt).getTime() - 86_400_000)
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={card}>
        <h3 className="flex items-center gap-2 body-md-medium font-semibold! text-primary-500">
          <Building2 className="h-4 w-4 text-primary-300" /> Institution
        </h3>
        {institution ? (
          <>
            <div className="mt-4 flex items-center gap-3">
              <InstitutionAvatar initials={institution.logoInitials} tone={institution.tone} />
              <div className="min-w-0">
                <p className="truncate body-sm-medium text-primary-500" title={institution.name}>
                  {institution.name}
                </p>
                <p className="truncate body-xsm-regular text-primary-300">{institution.ownerEmail}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 body-sm-regular">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-primary-400">Plan</dt>
                <dd>
                  <PlanBadge planId={institution.subscription.planId} plans={plans} cycle={institution.subscription.cycle} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-primary-400">Status</dt>
                <dd>
                  <SubStatusBadge status={institution.subscription.status} cancelling={institution.subscription.cancelAtPeriodEnd} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-primary-400">Payment method</dt>
                <dd className="truncate text-primary-500">
                  {institution.subscription.paymentMethod ? `${institution.subscription.paymentMethod.brand} •••• ${institution.subscription.paymentMethod.last4}` : "None"}
                </dd>
              </div>
            </dl>
            <Link
              href={`/institutions/${institution.id}`}
              className="mt-4 inline-flex h-8.5 w-full items-center justify-center gap-1.5 rounded-lg border border-dash bg-white body-xsm-medium text-primary-500 shadow-2xs transition-colors hover:bg-slate-50"
            >
              View institution <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <p className="mt-3 body-sm-regular text-primary-300">This institution no longer exists.</p>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} className={card}>
        <h3 className="flex items-center gap-2 body-md-medium font-semibold! text-primary-500">
          <Activity className="h-4 w-4 text-primary-300" /> Payment activity
        </h3>
        {related.length ? (
          <ol className="mt-4 space-y-3.5 border-l border-dash pl-4">
            {related.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-5.5 top-1.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-primary-300" />
                <div className="flex items-center gap-2">
                  <ToneBadge tone={EVENT_TONE[e.type]} size="sm">
                    {EVENT_LABEL[e.type]}
                  </ToneBadge>
                  <span className="body-2xsm-regular text-primary-300" title={formatDateTime(e.at)}>
                    {relativeTime(e.at)}
                  </span>
                </div>
                <p className="mt-1 body-xsm-regular text-primary-400">{e.message}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 body-sm-regular text-primary-300">No payment activity recorded for this invoice yet.</p>
        )}
      </motion.section>
    </div>
  );
}

export default InvoiceSidePanel;
