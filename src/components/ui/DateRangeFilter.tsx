"use client";

import React from "react";
import { DateRangePicker } from "@/components/ui/date-range/DateRangePicker";
import type { DateRange, DateRangePreset } from "@/components/ui/date-range/dateRangeUtils";

export type { DateRange } from "@/components/ui/date-range/dateRangeUtils";
export { formatDateRange, isInDateRange } from "@/components/ui/date-range/dateRangeUtils";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  presets?: DateRangePreset[];
  align?: "left" | "right";
  className?: string;
}

/** Filter-bar date range: the shared DateRangePicker (kept as the import name used by list pages). */
export function DateRangeFilter({ placeholder = "Select Date Range", ...props }: DateRangeFilterProps) {
  return <DateRangePicker placeholder={placeholder} {...props} />;
}

export default DateRangeFilter;
