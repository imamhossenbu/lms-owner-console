"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface SegmentedOption<K extends string> {
  value: K;
  /** Visible text; for icon-only segments it is used as the accessible name and tooltip. */
  label: string;
  icon?: React.ReactNode;
  /** Render the icon without visible text. */
  iconOnly?: boolean;
}

export interface SegmentedControlProps<K extends string> {
  options: SegmentedOption<K>[];
  value: K;
  onChange: (value: K) => void;
  className?: string;
}

/** Joined button group (Month / Week / Day, Table / Grid) with an animated active segment. */
export function SegmentedControl<K extends string>({ options, value, onChange, className }: SegmentedControlProps<K>) {
  const layoutId = useId();

  return (
    <div role="radiogroup" className={cn("inline-flex rounded-lg border border-dash bg-white p-1 gap-1 shrink-0", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.iconOnly ? option.label : undefined}
            title={option.iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "relative h-8 rounded-md body-sm-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
              option.iconOnly ? "w-9" : "px-3.5",
              isActive ? "text-white" : "text-primary-400 hover:text-primary-500 hover:bg-slate-50"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`segment-${layoutId}`}
                className="absolute inset-0 rounded-md bg-blue"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {option.icon && <span className="relative z-10 flex [&>svg]:w-4 [&>svg]:h-4">{option.icon}</span>}
            {!option.iconOnly && <span className="relative z-10">{option.label}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
