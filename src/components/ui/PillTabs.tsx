"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { ToneBadge } from "./ToneBadge";

export interface PillTabItem<K extends string = string> {
  id: K;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  /** Shows a red dot (e.g. the section has validation errors). */
  hasError?: boolean;
  disabled?: boolean;
}

export interface PillTabsProps<K extends string = string> {
  tabs: PillTabItem<K>[];
  activeId?: K;
  /** Alias of `activeId`, kept for existing call sites. */
  activeTab?: K;
  onChange: (id: K) => void;
  className?: string;
  /** Stretch the track and split it evenly between tabs (e.g. source pickers). */
  fullWidth?: boolean;
  /** Accessible name of the tab list. */
  ariaLabel?: string;
  /** When set, tabs get id `${idPrefix}-tab-${id}` and aria-controls `${idPrefix}-panel-${id}`. */
  idPrefix?: string;
}

/** Sizes a lucide icon (or any element accepting className) to 16px without arbitrary selectors. */
function sizedIcon(icon: React.ReactNode) {
  if (!React.isValidElement<{ className?: string }>(icon)) return icon;
  return React.cloneElement(icon, { className: cn("h-4 w-4", icon.props.className) });
}

/**
 * THE app-wide tab bar (use it for every tabbed UI — never build a custom one): bordered grey capsule
 * track with a sliding white (bordered) pill on the active tab, optional icon, count badge and error dot.
 */
export function PillTabs<K extends string = string>({
  tabs,
  activeId,
  activeTab,
  onChange,
  className,
  fullWidth = false,
  ariaLabel,
  idPrefix,
}: PillTabsProps<K>) {
  // Unique per instance so two tab bars on one page don't animate into each other
  const layoutId = useId();
  const currentActive = activeId ?? activeTab ?? tabs[0]?.id;

  return (
    <div className={cn("overflow-x-auto scrollbar-none max-w-full", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn("bg-gray-bg border border-dash p-1.5 rounded-2xl flex items-center gap-1.5", fullWidth ? "w-full min-w-max" : "w-fit")}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentActive;

          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              id={idPrefix ? `${idPrefix}-tab-${tab.id}` : undefined}
              aria-controls={idPrefix ? `${idPrefix}-panel-${tab.id}` : undefined}
              aria-selected={isActive}
              disabled={tab.disabled}
              whileTap={tab.disabled ? undefined : { scale: 0.97 }}
              onClick={() => !isActive && onChange(tab.id)}
              className={cn(
                "relative whitespace-nowrap px-4 py-2 rounded-xl body-sm-medium transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 shrink-0 z-10 select-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                fullWidth && "flex-1",
                isActive ? "text-primary-500" : "text-primary-400 hover:text-primary-500 hover:bg-white/60"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`pill-tab-${layoutId}`}
                  className="absolute inset-0 rounded-xl bg-white border border-dash -z-10 shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              {tab.icon && (
                <span className={cn("shrink-0 flex", isActive ? "text-primary-500" : "text-primary-400")}>
                  {sizedIcon(tab.icon)}
                </span>
              )}

              <span>{tab.label}</span>

              {typeof tab.count === "number" && (
                <ToneBadge
                  tone="navy"
                  size="sm"
                  variant="pill"
                  className={isActive ? "bg-slate-100 text-primary-500" : "bg-slate-200 text-primary-400"}
                >
                  {tab.count.toLocaleString()}
                </ToneBadge>
              )}

              {tab.hasError && <span className="h-2 w-2 shrink-0 rounded-full bg-red" aria-label="Has errors" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default PillTabs;
