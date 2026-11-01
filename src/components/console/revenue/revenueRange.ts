/** Reporting window for /revenue (`?range=6|12|24`, months). */
export const REVENUE_RANGES = ["6", "12", "24"] as const;
export type RevenueRange = (typeof REVENUE_RANGES)[number];
export const DEFAULT_RANGE: RevenueRange = "12";
export const parseRange = (v: string | null | undefined): RevenueRange => (REVENUE_RANGES.includes(v as RevenueRange) ? (v as RevenueRange) : DEFAULT_RANGE);

/** Signed money for movement cells: +$79 / −$29 / $0. */
export const signedMoney = (n: number, fmt: (v: number) => string) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(Math.abs(n))}` : fmt(0));
