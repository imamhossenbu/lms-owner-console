"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";
import type { Plan } from "@/types/saas";
import { FEATURE_KEYS } from "@/types/saas";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { FEATURE_META, minPlanFor } from "@/lib/planAccess";
import { cn } from "@/lib/cn";

/** Every feature with a tick (included) or lock + the cheapest plan that unlocks it. */
export function PlanFeaturesCard({ plan, plans }: { plan: Plan | undefined; plans: Plan[] }) {
  const included = plan?.features ?? [];
  return (
    <IconSectionCard icon={<Sparkles className="h-5 w-5" />} tone="blue" title="Plan features" description={`${included.length} of ${FEATURE_KEYS.length} features on ${plan?.name ?? "this plan"}`}>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FEATURE_KEYS.map((key, i) => {
          const on = included.includes(key);
          const unlock = on ? null : minPlanFor(key, plans);
          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.02 }}
              className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2", on ? "border-green/30 bg-green-bg" : "border-dash bg-white")}
              title={FEATURE_META[key].description}
            >
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", on ? "bg-green text-white" : "bg-gray-bg text-primary-300")}>
                {on ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              </span>
              <span className={cn("min-w-0 flex-1 truncate body-sm-medium", on ? "text-primary-500" : "text-primary-300")}>{FEATURE_META[key].label}</span>
              {unlock && (
                <ToneBadge tone="gray" size="sm">
                  {unlock.name}+
                </ToneBadge>
              )}
            </motion.li>
          );
        })}
      </ul>
    </IconSectionCard>
  );
}

export default PlanFeaturesCard;
