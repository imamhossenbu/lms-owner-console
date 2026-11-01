"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, HardDrive, Info, UserCog, Users, type LucideIcon } from "lucide-react";
import type { Institution, LimitKey, Plan } from "@/types/saas";
import { LIMIT_KEYS } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { formatLimit, LIMIT_META, remaining } from "@/lib/planAccess";
import { usagePct } from "@/lib/saasStats";
import { UsageBar, usageTone } from "../../../shared/UsageBar";

const ICONS: Record<LimitKey, LucideIcon> = { students: Users, courses: BookOpen, teamMembers: UserCog, storageGb: HardDrive };
const TILE: Record<string, string> = {
  "bg-blue": "bg-blue-14 text-blue",
  "bg-yellow": "bg-yellow-bg text-yellow",
  "bg-brand-orange": "bg-brand-orange-light text-brand-orange",
  "bg-red": "bg-red-14 text-red",
  "bg-green": "bg-green-bg text-green",
};

/** One meter per plan limit with % and colour thresholds (75 / 90 / 100). */
export function UsageTab({ institution: inst, plan, onChangePlan }: { institution: Institution; plan: Plan | undefined; onChangePlan?: () => void }) {
  const anyHigh = LIMIT_KEYS.some((k) => (usagePct(inst, k, plan) ?? 0) >= 90);
  return (
    <div className="space-y-5">
      {anyHigh && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange-light p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
            <p className="body-sm-regular text-primary-400">
              <span className="body-sm-medium text-primary-500">{inst.name} is close to its {plan?.name} limits.</span> At 100 % new students, courses, seats or uploads are blocked until they upgrade.
            </p>
          </div>
          {onChangePlan && <CardActionButton onClick={onChangePlan}>Suggest upgrade</CardActionButton>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {LIMIT_KEYS.map((key, i) => {
          const limit = plan?.limits[key] ?? null;
          const pct = usagePct(inst, key, plan);
          const tone = usageTone(pct);
          const Icon = ICONS[key];
          const left = remaining(inst, key, plan);
          return (
            <motion.section
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.22, delay: i * 0.04 }}
              className="dashboard-card p-5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TILE[tone.bar] ?? TILE["bg-blue"]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="body-md-medium font-semibold! text-primary-500">{LIMIT_META[key].label}</p>
                    <p className="body-xsm-regular text-primary-300">{LIMIT_META[key].description}</p>
                  </div>
                </div>
                <ToneBadge tone={pct === null ? "green" : pct >= 100 ? "red" : pct >= 90 ? "orange" : pct >= 75 ? "yellow" : "blue"} size="sm" variant="pill">
                  {tone.label}
                </ToneBadge>
              </div>
              <p className="mt-4 heading-h4 text-primary-500">
                {formatLimit(inst.usage[key], key)}
                <span className="body-sm-regular text-primary-300"> / {formatLimit(limit, key)}</span>
              </p>
              <UsageBar usage={inst.usage[key]} limit={limit} limitKey={key} className="mt-3" />
              <p className="mt-2 body-xsm-regular text-primary-300">
                {left === null ? "No cap on this plan." : left === 0 ? "Limit reached — no room left." : `${formatLimit(left, key)} remaining`}
              </p>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

export default UsageTab;
