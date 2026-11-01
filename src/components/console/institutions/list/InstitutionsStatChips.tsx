"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Institution, SubscriptionStatus } from "@/types/saas";
import { SUBSCRIPTION_STATUSES } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { STATUS_META } from "../../shared/consoleMeta";

/** Quick status filter chips with live counts ("All 42 · Active 26 · Trialing 6 …"). */
export function InstitutionsStatChips({ institutions, value, onChange }: { institutions: Institution[]; value: SubscriptionStatus | "All"; onChange: (v: SubscriptionStatus | "All") => void }) {
  const count = (s: SubscriptionStatus) => institutions.filter((i) => i.subscription.status === s).length;
  const chips: { id: SubscriptionStatus | "All"; label: string; n: number; tone: React.ComponentProps<typeof ToneBadge>["tone"] }[] = [
    { id: "All", label: "All", n: institutions.length, tone: "navy" },
    ...SUBSCRIPTION_STATUSES.map((s) => ({ id: s, label: STATUS_META[s].label, n: count(s), tone: STATUS_META[s].tone })),
  ];
  return (
    <div role="radiogroup" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const active = value === c.id;
        return (
          <motion.button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(c.id)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 body-sm-medium transition-colors",
              active ? "border-brand-orange bg-brand-orange-light text-brand-orange" : "border-dash bg-white text-primary-400 hover:bg-slate-50 hover:text-primary-500"
            )}
          >
            {c.label}
            <ToneBadge tone={active ? "orange" : c.tone} size="sm" variant="pill">
              {c.n}
            </ToneBadge>
          </motion.button>
        );
      })}
    </div>
  );
}

export default InstitutionsStatChips;
