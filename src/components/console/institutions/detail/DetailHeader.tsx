"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightLeft, CalendarPlus, ExternalLink, Globe, MoreHorizontal, Pencil, PlayCircle, RotateCcw } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { AppDropdownMenu } from "@/components/ui/AppDropdownMenu";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { InstitutionAvatar } from "../../shared/InstitutionAvatar";
import { DomainStatusBadge, PlanBadge, SubscriptionStatusBadge } from "../../shared/ConsoleBadges";
import { tenantHost, TYPE_LABEL } from "../../shared/consoleMeta";
import type { InstitutionDialogOpeners } from "../actions/useInstitutionDialogs";
import { institutionMenuItems } from "../list/institutionMenuItems";

/** Institution profile header: avatar, name, status / plan badges, URLs and status-aware owner actions. */
export function DetailHeader({ institution: inst, plans, open, trialLeft }: { institution: Institution; plans: Plan[]; open: InstitutionDialogOpeners; trialLeft: number | null }) {
  const router = useRouter();
  const s = inst.subscription;
  const canChangePlan = s.status !== "CANCELLED" && s.status !== "SUSPENDED";
  const primaryKey = s.status === "SUSPENDED" ? "unsuspend" : s.status === "CANCELLED" || s.cancelAtPeriodEnd ? "reactivate" : "plan";
  // The primary button and "Extend trial" are already visible — keep everything else in the ⋮ menu.
  const menu = institutionMenuItems(inst, open, null).filter((i) => i.key !== primaryKey && i.key !== "trial");

  let primary: React.ReactNode = null;
  if (s.status === "SUSPENDED")
    primary = (
      <PrimaryButton leftIcon={<PlayCircle className="h-4 w-4" />} onClick={() => open.unsuspend(inst)}>
        Unsuspend
      </PrimaryButton>
    );
  else if (s.status === "CANCELLED" || s.cancelAtPeriodEnd)
    primary = (
      <PrimaryButton leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => open.reactivate(inst)}>
        {s.cancelAtPeriodEnd ? "Undo cancellation" : "Reactivate"}
      </PrimaryButton>
    );
  else if (canChangePlan)
    primary = (
      <PrimaryButton leftIcon={<ArrowRightLeft className="h-4 w-4" />} onClick={() => open.changePlan(inst)}>
        Change plan
      </PrimaryButton>
    );

  return (
    <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="dashboard-card p-5 shadow-2xs">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <InstitutionAvatar initials={inst.logoInitials} tone={inst.tone} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate heading-h5 text-primary-500" title={inst.name}>
                {inst.name}
              </h1>
              <SubscriptionStatusBadge subscription={s} size="md" />
              <PlanBadge planId={s.planId} plans={plans} cycle={s.cycle} size="md" />
              {trialLeft !== null && (
                <ToneBadge tone={trialLeft <= 3 ? "red" : "blue"} variant="pill">
                  {trialLeft <= 0 ? "Trial ends today" : `${trialLeft} trial day${trialLeft === 1 ? "" : "s"} left`}
                </ToneBadge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="body-sm-regular text-primary-300">
                {TYPE_LABEL[inst.type]} · {inst.country}
              </span>
              <a href={`https://${tenantHost(inst.slug)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 body-sm-medium text-blue hover:underline">
                {tenantHost(inst.slug)} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {inst.customDomain && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary-300" />
                  <a href={`https://${inst.customDomain.domain}`} target="_blank" rel="noreferrer" className="body-sm-medium text-blue hover:underline">
                    {inst.customDomain.domain}
                  </a>
                  <DomainStatusBadge status={inst.customDomain.status} />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {s.status === "TRIALING" && (
            <SecondaryButton leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => open.extendTrial(inst)}>
              Extend trial
            </SecondaryButton>
          )}
          <SecondaryButton leftIcon={<Pencil className="h-4 w-4" />} onClick={() => router.push(`/institutions/${inst.id}/edit`)}>
            Edit
          </SecondaryButton>
          {menu.length > 0 && (
            <AppDropdownMenu
              items={menu}
              trigger={
                <button type="button" aria-label="More actions" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-dash bg-white text-primary-500 transition-colors hover:bg-slate-50">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
          )}
          {primary}
        </div>
      </div>
    </motion.section>
  );
}

export default DetailHeader;
