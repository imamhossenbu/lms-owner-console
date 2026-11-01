"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";

export interface KpiTileProps {
  icon: React.ReactNode;
  /** Token classes for the icon tile, e.g. "bg-blue-14 text-blue". */
  iconClassName: string;
  label: string;
  value: string;
  /** % change vs the previous period (null = not comparable). */
  change: number | null;
  /** When true a decrease is good (churn, failed payments). */
  inverse?: boolean;
  caption: string;
  /** Extra line under the value (e.g. "2 ending in ≤ 3 days"). */
  hint?: React.ReactNode;
  index?: number;
}

/** Overview KPI: icon tile + label, big value, change chip (green good / red bad) + caption. */
export function KpiTile({ icon, iconClassName, label, value, change, inverse = false, caption, hint, index = 0 }: KpiTileProps) {
  const flat = change === null || Math.abs(change) < 0.05;
  const up = (change ?? 0) > 0;
  const good = flat ? null : inverse ? !up : up;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.03 }}
      className="dashboard-card flex flex-col p-4 shadow-2xs transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4.5 [&>svg]:w-4.5", iconClassName)}>{icon}</span>
        <p className="truncate body-sm-regular text-primary-400">{label}</p>
      </div>
      <p className="mt-3 truncate heading-h4 text-primary-500" title={value}>
        {value}
      </p>
      {hint && <div className="mt-0.5 truncate body-xsm-regular text-primary-300">{hint}</div>}
      <div className="mt-auto flex items-center gap-2 pt-3">
        <ToneBadge
          tone={good === null ? "gray" : good ? "green" : "red"}
          size="sm"
          variant="pill"
          icon={flat ? <Minus className="h-3 w-3" /> : up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        >
          {change === null ? "New" : `${Math.abs(change).toFixed(1).replace(/\.0$/, "")}%`}
        </ToneBadge>
        <span className="truncate body-2xsm-regular text-primary-300">{caption}</span>
      </div>
    </motion.div>
  );
}

export default KpiTile;
