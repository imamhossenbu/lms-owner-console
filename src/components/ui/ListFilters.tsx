"use client";

import React from "react";
import { Search } from "lucide-react";
import { AppSelect, AppSelectOption } from "@/components/ui/AppSelect";
import { DateRange, DateRangeFilter } from "@/components/ui/DateRangeFilter";
import type { DateRangePreset } from "@/components/ui/date-range/dateRangeUtils";
import { cn } from "@/lib/cn";

export interface ListSelectFilter {
  key: string;
  value: string;
  options: (string | AppSelectOption)[];
  onChange: (value: string) => void;
  className?: string;
  /** Shown when `value` matches no option (e.g. a dependent filter that is not ready yet). */
  placeholder?: string;
  disabled?: boolean;
}

interface ListFiltersProps {
  query: string;
  searchPlaceholder: string;
  onQueryChange: (value: string) => void;
  selects: ListSelectFilter[];
  /** Optional date range picker (omit both to hide it). */
  dateRange?: DateRange;
  /** Quick-select presets for the date range (defaults to past-looking presets). */
  dateRangePresets?: DateRangePreset[];
  onDateRangeChange?: (range: DateRange) => void;
  onReset: () => void;
  /** Disables Reset when nothing is filtered. */
  isFiltered: boolean;
}

/** Search + dropdown filters + optional date range + Reset, shared by list pages. */
export function ListFilters({
  query,
  searchPlaceholder,
  onQueryChange,
  selects,
  dateRange,
  dateRangePresets,
  onDateRangeChange,
  onReset,
  isFiltered,
}: ListFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
      <div className="relative xl:flex-1 min-w-0">
        <Search className="w-4 h-4 text-primary-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-dash bg-white body-sm-regular text-primary-500 placeholder:text-primary-300 focus:outline-none focus:border-brand-orange transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex items-center gap-3">
        {selects.map((select) => (
          <AppSelect
            key={select.key}
            value={select.value}
            onValueChange={select.onChange}
            options={select.options}
            placeholder={select.placeholder}
            disabled={select.disabled}
            className={cn("w-full", select.className ?? "xl:w-44")}
            triggerClassName="w-full bg-white"
          />
        ))}
        {dateRange && onDateRangeChange && (
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} presets={dateRangePresets} className="w-full xl:w-64" />
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={!isFiltered}
        className="h-10 px-5 rounded-lg border border-dash bg-white body-sm-medium text-blue hover:bg-blue-14 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        Reset
      </button>
    </div>
  );
}

export default ListFilters;
