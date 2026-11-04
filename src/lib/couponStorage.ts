"use client";

import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { Coupon } from "@/types/coupon";
import type { CouponFormValues } from "@/validations/couponSchema";
import { api, fetchAllPages } from "@/lib/api/client";

/**
 * Owner Console coupons, backed by `/saas/owner/coupons`. The full list (with redemptions) is cached in memory;
 * `useCoupons()` loads it on first use and every mutation refreshes it. Mutations throw `ApiError`s with
 * friendly messages; toasts are the caller's job.
 */

export const COUPONS_UPDATED_EVENT = "edupro_console_coupons_updated";

let coupons: Coupon[] | null = null;
let inflight: Promise<Coupon[]> | null = null;

function subscribe(cb: () => void) {
  const handler = () => queueMicrotask(cb);
  window.addEventListener(COUPONS_UPDATED_EVENT, handler);
  return () => window.removeEventListener(COUPONS_UPDATED_EVENT, handler);
}

/** Loads every coupon. Concurrent calls share one request. */
export function fetchCoupons(): Promise<Coupon[]> {
  inflight ??= fetchAllPages<Coupon>("/saas/owner/coupons")
    .then((rows) => {
      coupons = rows;
      window.dispatchEvent(new Event(COUPONS_UPDATED_EVENT));
      return rows;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Live coupons; null until the first load finishes (render a skeleton). */
export function useCoupons(): Coupon[] | null {
  const list = useSyncExternalStore<Coupon[] | null>(subscribe, () => coupons, () => null);
  useEffect(() => {
    if (coupons === null)
      fetchCoupons().catch((err: unknown) => {
        coupons = [];
        window.dispatchEvent(new Event(COUPONS_UPDATED_EVENT));
        toast.error("Couldn't load coupons", { id: "coupons-load", description: err instanceof Error ? err.message : "Please refresh the page." });
      });
  }, []);
  return list;
}

async function mutate<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } finally {
    await fetchCoupons().catch(() => undefined);
  }
}

export const createCoupon = (values: CouponFormValues) => mutate(() => api.post<Coupon>("/saas/owner/coupons", values));

/** Saves the whole form. A redeemed coupon's code can't change. */
export const updateCoupon = (id: string, values: CouponFormValues) => mutate(() => api.patch<Coupon>(`/saas/owner/coupons/${encodeURIComponent(id)}`, values));

/** Enable / disable. Running discounts keep going when disabled. */
export const setCouponActive = (id: string, active: boolean) => mutate(() => api.patch<Coupon>(`/saas/owner/coupons/${encodeURIComponent(id)}/active`, { active }));

/** Deletes a never-redeemed coupon (redeemed ones must be disabled instead). */
export const deleteCoupon = (id: string) => mutate(() => api.delete<void>(`/saas/owner/coupons/${encodeURIComponent(id)}`));
