"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { monthGrid, WEEKDAYS } from "./dateRangeUtils";

export interface RangeMonthProps {
  month: Date;
  /** Committed/draft selection. */
  from?: string;
  to?: string;
  /** Day under the pointer while picking the end (live preview). */
  hoverKey?: string;
  todayKey: string;
  /** Keyboard focus (roving tabindex). */
  focusKey: string;
  minKey?: string;
  maxKey?: string;
  onPick: (key: string) => void;
  onHover: (key: string | undefined) => void;
  onFocusKey: (key: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, key: string) => void;
}

/**
 * One month of the range calendar. The selected span renders as one continuous band
 * (rounded only at its ends and at week edges); start/end are solid orange chips.
 */
export function RangeMonth({ month, from, to, hoverKey, todayKey, focusKey, minKey, maxKey, onPick, onHover, onFocusKey, onKeyDown }: RangeMonthProps) {
  const days = monthGrid(month);
  // While only `from` is chosen, the hovered day previews the end.
  const end = to ?? (from && hoverKey ? hoverKey : undefined);
  const [lo, hi] = from && end ? (from <= end ? [from, end] : [end, from]) : [from, from];
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="w-full min-w-0" role="grid" aria-label={title}>
      <p className="mb-3 text-center body-sm-medium font-semibold! text-primary-500">{title}</p>
      <div className="mb-1 grid grid-cols-7" role="row">
        {WEEKDAYS.map((w) => (
          <span key={w} role="columnheader" className="py-1 text-center body-2xsm-regular text-primary-300">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => onHover(undefined)}>
        {days.map(({ date, key, outside }, i) => {
          if (outside) return <span key={key} className="h-9" aria-hidden />;
          const disabled = (minKey && key < minKey) || (maxKey && key > maxKey);
          const isEdge = key === lo || key === hi;
          const inBand = !!lo && !!hi && key > lo && key < hi;
          const preview = !to && !!hoverKey;
          const col = i % 7;
          const bandLeft = (inBand || (key === hi && lo !== hi)) && (col === 0 || date.getDate() === 1);
          const bandRight = (inBand || (key === lo && lo !== hi)) && (col === 6 || date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
          return (
            <div
              key={key}
              className={cn(
                "relative h-9",
                // Continuous band behind the cells.
                (inBand || (isEdge && lo !== hi)) && (preview ? "bg-brand-orange-light/60" : "bg-brand-orange-light"),
                key === lo && lo !== hi && "rounded-l-lg",
                key === hi && lo !== hi && "rounded-r-lg",
                bandLeft && "rounded-l-lg",
                bandRight && "rounded-r-lg"
              )}
            >
              <button
                type="button"
                role="gridcell"
                aria-selected={isEdge || inBand}
                aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                tabIndex={key === focusKey ? 0 : -1}
                disabled={!!disabled}
                data-day={key}
                onClick={() => onPick(key)}
                onMouseEnter={() => onHover(key)}
                onFocus={() => onFocusKey(key)}
                onKeyDown={(e) => onKeyDown(e, key)}
                className={cn(
                  "relative mx-auto flex h-9 w-full cursor-pointer select-none items-center justify-center rounded-lg body-xsm-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40",
                  "disabled:cursor-not-allowed disabled:opacity-30",
                  isEdge
                    ? "bg-brand-orange text-white shadow-xs"
                    : inBand
                      ? "text-brand-orange"
                      : "text-primary-500 hover:bg-gray-bg"
                )}
              >
                {date.getDate()}
                {key === todayKey && (
                  <span className={cn("absolute bottom-1 h-1 w-1 rounded-full", isEdge ? "bg-white" : "bg-brand-orange")} aria-hidden />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RangeMonth;
