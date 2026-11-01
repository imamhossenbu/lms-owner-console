"use client";

import React from "react";
import { motion } from "framer-motion";
import type { LimitKey } from "@/types/saas";
import { formatLimit } from "@/lib/planAccess";
import { cn } from "@/lib/cn";

/** Colour thresholds for usage meters: < 75 % blue, 75–90 % yellow, 90–100 % orange, ≥ 100 % red. */
export function usageTone(pct: number | null) {
  if (pct === null) return { bar: "bg-green", text: "text-green", label: "Unlimited" };
  if (pct >= 100) return { bar: "bg-red", text: "text-red", label: "Over limit" };
  if (pct >= 90) return { bar: "bg-brand-orange", text: "text-brand-orange", label: "Near limit" };
  if (pct >= 75) return { bar: "bg-yellow", text: "text-yellow", label: "Getting close" };
  return { bar: "bg-blue", text: "text-blue", label: "Healthy" };
}

export interface UsageBarProps {
  usage: number;
  limit: number | null;
  limitKey: LimitKey;
  /** "compact" = table cell (value line + thin bar). */
  variant?: "compact" | "default";
  className?: string;
}

/** Usage meter: "642 / 1,000" + animated bar coloured by threshold. Unlimited limits show a short green bar. */
export function UsageBar({ usage, limit, limitKey, variant = "default", className }: UsageBarProps) {
  const pct = limit === null ? null : limit > 0 ? (usage / limit) * 100 : 100;
  const tone = usageTone(pct);
  const width = pct === null ? 12 : Math.min(100, Math.max(pct, 2));
  const value = `${formatLimit(usage, limitKey)} / ${formatLimit(limit, limitKey)}`;

  return (
    <div className={cn("min-w-0", className)} title={pct === null ? `${value}` : `${value} (${Math.round(pct)}%)`}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("truncate text-primary-500", variant === "compact" ? "body-xsm-medium" : "body-sm-medium")}>{value}</span>
        {pct !== null && <span className={cn("shrink-0 tabular-nums body-2xsm-regular font-semibold!", tone.text)}>{Math.round(pct)}%</span>}
      </div>
      <div className={cn("mt-1.5 w-full overflow-hidden rounded-full bg-slate-100", variant === "compact" ? "h-1.5" : "h-2")}>
        <motion.div
          className={cn("h-full rounded-full", tone.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default UsageBar;
