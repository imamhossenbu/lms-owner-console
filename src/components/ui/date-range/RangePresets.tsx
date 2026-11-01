"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { sameRange, type DateRange, type DateRangePreset } from "./dateRangeUtils";

export interface RangePresetsProps {
  presets: DateRangePreset[];
  today: Date;
  draft: DateRange;
  onSelect: (range: DateRange) => void;
}

/** Quick ranges (computed from today); the one matching the current draft is ticked. */
export function RangePresets({ presets, today, draft, onSelect }: RangePresetsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
      <span className="hidden px-2.5 pb-1 body-2xsm-regular font-semibold! uppercase tracking-wider text-primary-300 sm:block">Quick select</span>
      {presets.map((p) => {
        const range = p.range(today);
        const active = sameRange(range, draft);
        return (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(range)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left body-xsm-medium transition-colors",
              active ? "bg-brand-orange-light text-brand-orange" : "text-primary-400 hover:bg-gray-bg hover:text-primary-500"
            )}
          >
            {p.label}
            {active && <Check className="h-3.5 w-3.5 shrink-0" />}
          </motion.button>
        );
      })}
    </div>
  );
}

export default RangePresets;
