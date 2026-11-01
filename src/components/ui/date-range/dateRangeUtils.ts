/** Pure date helpers for the shared DateRangePicker (local days, "YYYY-MM-DD" keys). */

export interface DateRange {
  /** "YYYY-MM-DD", inclusive. */
  from?: string;
  /** "YYYY-MM-DD", inclusive. */
  to?: string;
}

export interface DateRangePreset {
  id: string;
  label: string;
  /** Computed from "today" when the picker opens; empty range = All time. */
  range: (today: Date) => DateRange;
}

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Whole days in an inclusive range. */
export const daysInRange = (r: DateRange) =>
  r.from && r.to ? Math.round((fromKey(r.to).getTime() - fromKey(r.from).getTime()) / 86400000) + 1 : 0;

const fmtShort = (key: string) => fromKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtLong = (key: string) => fromKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Oct 20 – Nov 20, 2026" (year once when shared), "Oct 20, 2026", "From …", "Until …", "". */
export function formatDateRange(r: DateRange) {
  if (r.from && r.to) {
    if (r.from === r.to) return fmtLong(r.from);
    const sameYear = r.from.slice(0, 4) === r.to.slice(0, 4);
    return `${sameYear ? fmtShort(r.from) : fmtLong(r.from)} – ${fmtLong(r.to)}`;
  }
  if (r.from) return `From ${fmtLong(r.from)}`;
  if (r.to) return `Until ${fmtLong(r.to)}`;
  return "";
}

/** Is an ISO timestamp inside the range (inclusive, local days)? */
export const isInDateRange = (iso: string, r: DateRange) => {
  const key = toKey(new Date(iso));
  return (!r.from || key >= r.from) && (!r.to || key <= r.to);
};

export const sameRange = (a: DateRange, b: DateRange) => (a.from ?? "") === (b.from ?? "") && (a.to ?? "") === (b.to ?? "");

/** 6×7 grid of days for a month (leading/trailing days of neighbour months included, flagged outside). */
export function monthGrid(month: Date) {
  const first = startOfMonth(month);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i);
    return { date: d, key: toKey(d), outside: d.getMonth() !== first.getMonth() };
  });
}

export const DEFAULT_PRESETS: DateRangePreset[] = [
  { id: "today", label: "Today", range: (t) => ({ from: toKey(t), to: toKey(t) }) },
  { id: "yesterday", label: "Yesterday", range: (t) => ({ from: toKey(addDays(t, -1)), to: toKey(addDays(t, -1)) }) },
  { id: "last7", label: "Last 7 days", range: (t) => ({ from: toKey(addDays(t, -6)), to: toKey(t) }) },
  { id: "last30", label: "Last 30 days", range: (t) => ({ from: toKey(addDays(t, -29)), to: toKey(t) }) },
  { id: "thisMonth", label: "This month", range: (t) => ({ from: toKey(startOfMonth(t)), to: toKey(t) }) },
  {
    id: "lastMonth",
    label: "Last month",
    range: (t) => ({ from: toKey(addMonths(t, -1)), to: toKey(addDays(startOfMonth(t), -1)) }),
  },
  {
    id: "thisQuarter",
    label: "This quarter",
    range: (t) => ({ from: toKey(new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1)), to: toKey(t) }),
  },
  { id: "thisYear", label: "This year", range: (t) => ({ from: toKey(new Date(t.getFullYear(), 0, 1)), to: toKey(t) }) },
  { id: "all", label: "All time", range: () => ({}) },
];

/** Forward-looking presets for schedule filters (live classes, due dates). */
export const UPCOMING_PRESETS: DateRangePreset[] = [
  { id: "today", label: "Today", range: (t) => ({ from: toKey(t), to: toKey(t) }) },
  { id: "next7", label: "Next 7 days", range: (t) => ({ from: toKey(t), to: toKey(addDays(t, 6)) }) },
  { id: "next30", label: "Next 30 days", range: (t) => ({ from: toKey(t), to: toKey(addDays(t, 29)) }) },
  { id: "last7", label: "Last 7 days", range: (t) => ({ from: toKey(addDays(t, -6)), to: toKey(t) }) },
  { id: "last30", label: "Last 30 days", range: (t) => ({ from: toKey(addDays(t, -29)), to: toKey(t) }) },
  { id: "thisMonth", label: "This month", range: (t) => ({ from: toKey(startOfMonth(t)), to: toKey(addDays(addMonths(t, 1), -1)) }) },
  { id: "all", label: "All time", range: () => ({}) },
];
