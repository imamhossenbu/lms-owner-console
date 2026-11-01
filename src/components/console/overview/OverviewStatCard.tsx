"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sparkline, type SparkColor } from "./Sparkline";

export interface OverviewStat {
  id: string;
  label: string;
  /** Formatted value. */
  value: string;
  icon: React.ReactNode;
  color: SparkColor;
  /** % change vs the previous period (null = not comparable). */
  change: number | null;
  /** When true a decrease is good (churn, failed payments). */
  inverse?: boolean;
  caption: string;
  spark: number[];
}

const SCHEME: Record<SparkColor, string> = {
  orange: "bg-brand-orange-light text-brand-orange",
  blue: "bg-blue-14 text-blue",
  green: "bg-green-bg text-green",
  purple: "bg-purple-14 text-purple",
  red: "bg-red-14 text-red",
  yellow: "bg-yellow-bg text-yellow",
};

/** KPI card — identical to the panel dashboard's StatCard: icon tile + value/label, change + caption, sparkline. */
export function OverviewStatCard({ stat }: { stat: OverviewStat }) {
  const flat = stat.change === null || Math.abs(stat.change) < 0.05;
  const up = (stat.change ?? 0) > 0;
  const good = flat ? null : stat.inverse ? !up : up;
  const TrendIcon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const trendClass = good === null ? "text-primary-300" : good ? "text-green" : "text-red";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-xl border border-dash py-3.5 px-4 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between h-full"
    >
      <div className="flex items-start gap-3.5">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5", SCHEME[stat.color])}>{stat.icon}</div>
        <div className="flex flex-col text-left min-w-0">
          <span className="h3-semibold font-bold! text-primary-500 tracking-tight leading-none! truncate" title={stat.value}>
            {stat.value}
          </span>
          <span className="body-xsm-medium text-primary-400 mt-1 truncate">{stat.label}</span>
        </div>
      </div>

      <div className="flex items-end justify-between mt-3 pt-0.5">
        <div className="flex items-center min-w-0">
          {stat.change !== null && (
            <span className={cn("body-xsm-medium flex items-center gap-0.5 whitespace-nowrap", trendClass)}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
              {Math.abs(stat.change).toLocaleString("en-US", { maximumFractionDigits: 1 })}%
            </span>
          )}
          <span className={cn("body-2xsm-regular text-primary-300 truncate", stat.change !== null && "ml-1.5")}>
            {stat.change === null ? "No data in previous period" : stat.caption}
          </span>
        </div>
        <div className="shrink-0 pl-2">
          <Sparkline data={stat.spark} color={stat.color} width={84} height={26} />
        </div>
      </div>
    </motion.div>
  );
}

export default OverviewStatCard;
