import type { PlanId } from "@/types/saas";

/**
 * Subscription coupons (Owner Console › Coupons). Console-only mock data, persisted in localStorage
 * `edupro_console_coupons_v1` (see src/lib/couponStorage.ts). Money is USD.
 */

export type CouponType = "PERCENT" | "FIXED";
/** ONCE = first invoice only · REPEATING = the first `durationMonths` months · FOREVER = every invoice. */
export type CouponDuration = "ONCE" | "REPEATING" | "FOREVER";
export type CouponCycle = "ANY" | "MONTHLY" | "YEARLY";
/** Derived — see `couponStatus()` in src/lib/couponMath.ts. */
export type CouponStatus = "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "DISABLED";

export interface CouponRedemption {
  id: string;
  institutionId: string;
  planId: PlanId;
  at: string;
  /** Total discount granted to this institution so far (USD). */
  amountOff: number;
}

export interface Coupon {
  id: string;
  /** Upper-case code institutions type at checkout, e.g. "LAUNCH20". Unique. */
  code: string;
  description: string;
  type: CouponType;
  /** Percent (1–100) or USD amount off per invoice. */
  value: number;
  duration: CouponDuration;
  /** Months for REPEATING, otherwise null. */
  durationMonths: number | null;
  /** Plans it applies to; empty = every plan. */
  planIds: PlanId[];
  cycle: CouponCycle;
  /** null = unlimited redemptions. */
  maxRedemptions: number | null;
  /** Last day it can be redeemed (ISO, end of day UTC); null = never expires. */
  expiresAt: string | null;
  /** Only institutions that have never paid can redeem. */
  newCustomersOnly: boolean;
  /** Owner switch; disabled coupons can't be redeemed (existing discounts keep running). */
  active: boolean;
  createdAt: string;
  updatedAt: string;
  redemptions: CouponRedemption[];
}

export const COUPON_TYPES = ["PERCENT", "FIXED"] as const satisfies readonly CouponType[];
export const COUPON_DURATIONS = ["ONCE", "REPEATING", "FOREVER"] as const satisfies readonly CouponDuration[];
export const COUPON_CYCLES = ["ANY", "MONTHLY", "YEARLY"] as const satisfies readonly CouponCycle[];
export const COUPON_STATUSES = ["ACTIVE", "EXPIRED", "EXHAUSTED", "DISABLED"] as const satisfies readonly CouponStatus[];
