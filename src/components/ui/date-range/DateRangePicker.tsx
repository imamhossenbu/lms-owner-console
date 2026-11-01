"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useViewportFit } from "@/lib/useViewportFit";
import PrimaryButton from "@/components/ui/primary-button";
import SecondaryButton from "@/components/ui/secondary-button";
import { RangeMonth } from "./RangeMonth";
import { RangePresets } from "./RangePresets";
import {
  addDays,
  addMonths,
  DEFAULT_PRESETS,
  daysInRange,
  formatDateRange,
  fromKey,
  startOfMonth,
  toKey,
  type DateRange,
  type DateRangePreset,
} from "./dateRangeUtils";

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  presets?: DateRangePreset[];
  /** Popover edge alignment with the trigger. */
  align?: "left" | "right";
  /** "YYYY-MM-DD" bounds (inclusive). */
  minDate?: string;
  maxDate?: string;
  /** Show the inline × on the trigger when a range is set (default true). */
  clearable?: boolean;
  className?: string;
  /** Custom trigger (e.g. the navbar pill). */
  renderTrigger?: (p: { open: boolean; label: string; toggle: () => void }) => React.ReactNode;
}

/**
 * App-wide date range picker. Quick-select presets (computed from today) on the left, one month
 * (arrows to page) with a continuous range band and live hover preview, keyboard support
 * (arrows, PgUp/PgDn, Home/End, Enter, Esc), a summary line with the day count, and Clear / Cancel / Apply.
 * Nothing is committed until Apply (presets apply instantly).
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  presets = DEFAULT_PRESETS,
  align = "left",
  minDate,
  maxDate,
  clearable = true,
  className,
  renderTrigger,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const [hoverKey, setHoverKey] = useState<string>();
  const [today, setToday] = useState(() => new Date());
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value.to ? fromKey(value.to) : new Date()));
  const [focusKey, setFocusKey] = useState(() => value.to ?? toKey(new Date()));
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Never spill past the screen edge (e.g. a filter bar's right-hand date button).
  useViewportFit(open, panelRef);

  const label = formatDateRange(value);
  const todayKey = toKey(today);

  const openPicker = useCallback(() => {
    const now = new Date();
    const anchor = value.to ? fromKey(value.to) : value.from ? fromKey(value.from) : now;
    setToday(now);
    setDraft(value);
    setHoverKey(undefined);
    // Open on the month the current range ends in.
    setViewMonth(startOfMonth(anchor));
    setFocusKey(toKey(anchor));
    setOpen(true);
  }, [value]);

  const toggle = () => (open ? setOpen(false) : openPicker());

  // Outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (key: string) => {
    if (!draft.from || draft.to) {
      setDraft({ from: key });
    } else {
      setDraft(key < draft.from ? { from: key, to: draft.from } : { from: draft.from, to: key });
      setHoverKey(undefined);
    }
    setFocusKey(key);
  };

  const commit = (range: DateRange) => {
    onChange(range);
    setOpen(false);
  };

  const months = useMemo(() => [viewMonth], [viewMonth]);

  /** Arrow-key navigation (pages the month when focus leaves it). */
  const onDayKey = (e: React.KeyboardEvent<HTMLButtonElement>, key: string) => {
    const d = fromKey(key);
    const moves: Record<string, Date> = {
      ArrowLeft: addDays(d, -1),
      ArrowRight: addDays(d, 1),
      ArrowUp: addDays(d, -7),
      ArrowDown: addDays(d, 7),
      PageUp: new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()),
      PageDown: new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()),
      Home: addDays(d, -d.getDay()),
      End: addDays(d, 6 - d.getDay()),
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    const nextKey = toKey(next);
    if (next < months[0]! || next >= addMonths(months[0]!, 1)) setViewMonth(startOfMonth(next));
    setFocusKey(nextKey);
    if (draft.from && !draft.to) setHoverKey(nextKey);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>(`[data-day="${nextKey}"]`)?.focus());
  };

  const count = daysInRange(draft);
  const summary = draft.from ? (
    <>
      <span className="text-primary-500">{fromKey(draft.from).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary-300" />
      <span className={draft.to ? "text-primary-500" : "text-primary-300"}>
        {draft.to ? fromKey(draft.to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pick an end date"}
      </span>
      {count > 0 && <span className="ml-1 rounded-md bg-gray-bg px-1.5 py-0.5 text-primary-400">{count} {count === 1 ? "day" : "days"}</span>}
    </>
  ) : (
    <span className="text-primary-300">Pick a start date</span>
  );

  return (
    <div ref={ref} className={cn("relative", open && "z-50", className)}>
      {renderTrigger ? (
        renderTrigger({ open, label, toggle })
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border bg-white px-3.5 body-sm-regular transition-colors",
            open ? "border-brand-orange" : "border-dash hover:border-primary-300"
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-primary-400" />
          <span className={cn("flex-1 truncate text-left", label ? "text-primary-500" : "text-primary-300")}>{label || placeholder}</span>
          {label && clearable ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={(e) => {
                e.stopPropagation();
                onChange({});
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange({});
                }
              }}
              className="rounded p-0.5 text-primary-300 transition-colors hover:bg-red-14 hover:text-red"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-primary-400 transition-transform", open && "rotate-180")} />
          )}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Choose a date range"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute top-full z-50 mt-2 w-80 sm:w-120 rounded-2xl border border-dash bg-white p-4 shadow-xl",
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="shrink-0 border-b border-dash pb-3 sm:w-40 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
                <RangePresets presets={presets} today={today} draft={draft} onSelect={commit} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    className="absolute left-0 top-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-gray-bg hover:text-primary-500"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="absolute right-0 top-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-gray-bg hover:text-primary-500"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {months.map((m) => (
                    <div key={m.toISOString()}>
                      <RangeMonth
                        month={m}
                        from={draft.from}
                        to={draft.to}
                        hoverKey={hoverKey}
                        todayKey={todayKey}
                        focusKey={focusKey}
                        minKey={minDate}
                        maxKey={maxDate}
                        onPick={pick}
                        onHover={(k) => draft.from && !draft.to && setHoverKey(k)}
                        onFocusKey={setFocusKey}
                        onKeyDown={onDayKey}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-dash pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 body-xsm-medium" aria-live="polite">
                {summary}
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => commit({})}
                  className="mr-1 cursor-pointer rounded-md px-2 py-1 body-xsm-medium text-primary-300 transition-colors hover:text-red"
                >
                  Clear
                </button>
                <SecondaryButton type="button" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="button" size="sm" disabled={!draft.from || !draft.to} onClick={() => commit(draft)}>
                  Apply
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DateRangePicker;
