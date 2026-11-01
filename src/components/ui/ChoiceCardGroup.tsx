"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  /** Leading icon. Omit to show a radio dot instead. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ChoiceCardGroupProps<T extends string> {
  name: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  /** Grid columns on wide screens (stacks on mobile). */
  columns?: 2 | 3 | 4 | 5;
  /** "card": bordered tiles. "inline": compact radio row (e.g. "Lesson Access"). */
  variant?: "card" | "inline";
  /** Leading marker when an option has no icon. */
  indicator?: "radio" | "none";
  /** "left": icon beside the text. "top": icon above a single-line title (for narrow, many-column grids). */
  iconPosition?: "left" | "top";
  /** Selected colour: "orange" (app default) or "blue" (assignment wizard). */
  tone?: "orange" | "blue";
  className?: string;
  "aria-label"?: string;
}

const COLS: Record<NonNullable<ChoiceCardGroupProps<string>["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
};

const TONE_STYLE = {
  orange: { dotBorder: "border-brand-orange", dotFill: "bg-brand-orange", card: "border-brand-orange bg-brand-orange-light", title: "text-brand-orange", description: "text-brand-orange" },
  blue: { dotBorder: "border-blue", dotFill: "bg-blue", card: "border-blue bg-blue-14", title: "text-primary-500", description: "text-primary-300" },
} as const;

function RadioDot({ checked, tone = "orange" }: { checked: boolean; tone?: "orange" | "blue" }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white transition-colors",
        checked ? TONE_STYLE[tone].dotBorder : "border-dash"
      )}
    >
      {checked && (
        <motion.span
          layout
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn("h-2.5 w-2.5 rounded-full", TONE_STYLE[tone].dotFill)}
        />
      )}
    </span>
  );
}

/**
 * Single-select group of selectable tiles (orange border + tint when active).
 * Used for lesson type, visibility, release type, price type, enrollment, access duration, etc.
 */
export function ChoiceCardGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 3,
  variant = "card",
  indicator = "radio",
  iconPosition = "left",
  tone = "orange",
  className,
  ...rest
}: ChoiceCardGroupProps<T>) {
  if (variant === "inline") {
    return (
      <div role="radiogroup" aria-label={rest["aria-label"]} className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <motion.button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              name={name}
              disabled={option.disabled}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(option.value)}
              className="inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RadioDot checked={checked} tone={tone} />
              <span className={cn("body-sm-regular whitespace-nowrap", checked ? "text-primary-500" : "text-primary-300")}>
                {option.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={rest["aria-label"]} className={cn("grid grid-cols-1 gap-3", COLS[columns], className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            name={name}
            disabled={option.disabled}
            whileTap={{ scale: 0.97 }}
            whileHover={option.disabled ? undefined : { y: -1 }}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-w-0 rounded-xl border p-3.5 text-left transition-colors",
              iconPosition === "top" ? "flex-col items-start gap-2.5" : "items-start gap-3",
              "disabled:cursor-not-allowed disabled:opacity-50",
              checked ? TONE_STYLE[tone].card : "border-dash bg-white hover:border-primary-300/40"
            )}
          >
            {option.icon ? (
              <span className={cn("shrink-0", iconPosition === "left" && "mt-0.5")}>{option.icon}</span>
            ) : indicator === "radio" ? (
              <RadioDot checked={checked} tone={tone} />
            ) : null}
            <span className="min-w-0 w-full">
              <span
                className={cn(
                  "block body-sm-medium",
                  iconPosition === "top" && "truncate",
                  checked ? TONE_STYLE[tone].title : "text-primary-500"
                )}
              >
                {option.title}
              </span>
              {option.description && (
                <span
                  className={cn(
                    "mt-1 block body-xsm-regular",
                    iconPosition === "top" && "line-clamp-2",
                    checked ? TONE_STYLE[tone].description : "text-primary-300"
                  )}
                >
                  {option.description}
                </span>
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default ChoiceCardGroup;
