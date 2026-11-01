"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TrendStatCardProps {
  icon: React.ReactNode;
  /** Token classes for the icon tile, e.g. "bg-blue-14 text-blue". */
  iconClassName: string;
  label: string;
  value: React.ReactNode;
  trend?: {
    direction: "up" | "down";
    value: string;
    /** Small caption under the trend, e.g. "vs last month" or "of total orders". */
    caption?: string;
  };
  className?: string;
}

/** KPI card: tinted icon tile, label, big value with an inline trend and caption. */
export function TrendStatCard({ icon, iconClassName, label, value, trend, className }: TrendStatCardProps) {
  const isUp = trend?.direction === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("bg-white rounded-xl border border-dash shadow-2xs p-4 flex items-center gap-4 hover:shadow-md transition-shadow", className)}
    >
      <span className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-7 [&>svg]:h-7", iconClassName)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="body-sm-regular text-primary-400 truncate">{label}</p>
        <div className="flex items-end justify-between gap-2 mt-0.5">
          <p className="heading-h4 text-primary-500 truncate">{value}</p>
          {trend && (
            <div className="text-right shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 body-sm-medium whitespace-nowrap",
                  isUp ? "text-green" : "text-red"
                )}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trend.value}
              </span>
              {trend.caption && <p className="body-2xsm-regular text-primary-300 whitespace-nowrap">{trend.caption}</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TrendStatCard;
