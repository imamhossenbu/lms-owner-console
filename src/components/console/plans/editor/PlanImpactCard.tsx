"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";
import type { FeatureKey, Institution, LimitKey } from "@/types/saas";
import type { PlanFormValues } from "@/validations/saasSchema";
import { FEATURE_META, LIMIT_META, formatLimit } from "@/lib/planAccess";
import { formatMoney } from "@/lib/saasStats";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";
import { limitViolations } from "../planUtils";

interface PlanImpactCardProps {
  subscribers: Institution[];
  mrr: number;
  limits: PlanFormValues["limits"];
  /** Features removed compared with the saved plan. */
  removedFeatures: FeatureKey[];
  isNew: boolean;
}

/** Who is affected by this edit: subscribers, MRR, institutions over the new limits, features being taken away. */
export function PlanImpactCard({ subscribers, mrr, limits, removedFeatures, isNew }: PlanImpactCardProps) {
  const violations = useMemo(() => limitViolations(subscribers, limits), [subscribers, limits]);
  const byInstitution = useMemo(() => {
    const map = new Map<string, { institution: Institution; items: { key: LimitKey; usage: number; limit: number }[] }>();
    violations.forEach((v) => {
      const entry = map.get(v.institution.id) ?? { institution: v.institution, items: [] };
      entry.items.push({ key: v.key, usage: v.usage, limit: v.limit });
      map.set(v.institution.id, entry);
    });
    return [...map.values()];
  }, [violations]);
  const trialing = subscribers.filter((i) => i.subscription.status === "TRIALING").length;

  return (
    <IconSectionCard icon={<Users className="h-5 w-5" />} tone="blue" title="Impact" description={isNew ? "A new plan has no subscribers yet." : "Institutions affected by these changes."}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
          <p className="body-2xsm-regular text-primary-300">On this plan</p>
          <p className="heading-h5 font-semibold! text-primary-500">{subscribers.length}</p>
          {trialing > 0 && <p className="body-2xsm-regular text-primary-300">{trialing} trialing</p>}
        </div>
        <div className="rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
          <p className="body-2xsm-regular text-primary-300">MRR</p>
          <p className="heading-h5 font-semibold! text-primary-500">{formatMoney(mrr)}</p>
        </div>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {byInstitution.length > 0 ? (
          <motion.div key="warn" layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 rounded-xl border border-red bg-red-14 p-3.5">
            <p className="flex items-center gap-2 body-sm-medium text-red-dark">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {byInstitution.length} institution{byInstitution.length === 1 ? " is" : "s are"} over the new limits
            </p>
            <p className="mt-0.5 body-xsm-regular text-red-dark">They keep their data but can&apos;t add more until they upgrade or reduce usage.</p>
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {byInstitution.map(({ institution, items }) => (
                <li key={institution.id} className="rounded-lg border border-dash bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <InstitutionAvatar initials={institution.logoInitials} tone={institution.tone} size="sm" />
                    <Link href={`/institutions/${institution.id}`} className="min-w-0 flex-1 truncate body-sm-medium text-primary-500 hover:text-brand-orange" title={institution.name}>
                      {institution.name}
                    </Link>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <ToneBadge key={it.key} tone="red" size="sm">
                        {LIMIT_META[it.key].label} {formatLimit(it.usage, it.key)} / {formatLimit(it.limit, it.key)}
                      </ToneBadge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          subscribers.length > 0 && (
            <motion.p key="ok" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 body-xsm-regular text-green">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Every subscriber fits within these limits.
            </motion.p>
          )
        )}
      </AnimatePresence>

      {removedFeatures.length > 0 && subscribers.length > 0 && (
        <div className="mt-3 rounded-xl border border-yellow bg-yellow-bg p-3.5">
          <p className="body-sm-medium text-yellow">Features being removed</p>
          <p className="mt-0.5 body-xsm-regular text-primary-400">
            {subscribers.length} institution{subscribers.length === 1 ? "" : "s"} will lose access to {removedFeatures.map((f) => FEATURE_META[f].label).join(", ")}.
          </p>
        </div>
      )}

      {!isNew && subscribers.length > 0 && <p className="mt-3 body-xsm-regular text-primary-300">Price changes apply from each institution&apos;s next renewal.</p>}
    </IconSectionCard>
  );
}

export default PlanImpactCard;
