"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

// ---------------------------------------------------------------- coupons page (server-paged)

export interface CouponStats {
  total: number;
  active: number;
  redemptions: number;
  redemptionsLast30Days: number;
  discountGiven: number;
  avgDiscountPerRedemption: number;
  expiringIn7Days: number;
}

export interface CouponFilters {
  q?: string;
  status?: string;
  type?: string;
}

/**
 * The /coupons table: one page from the API (`?q`, `?status`, `?type`, `?page`, `?limit`) plus the KPI stats;
 * re-read after every coupon change.
 */
export function useCouponPage(filters: CouponFilters, page: number, limit: number) {
  const key = JSON.stringify([filters, page, limit]);
  const [state, setState] = useState<{ rows: Coupon[]; total: number; stats: CouponStats | null } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(COUPONS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(COUPONS_UPDATED_EVENT, bump);
  }, []);
  useEffect(() => {
    let alive = true;
    const [f, p, l] = JSON.parse(key) as [CouponFilters, number, number];
    const query = { ...(f.q ? { q: f.q } : {}), ...(f.status ? { status: f.status } : {}), ...(f.type ? { type: f.type } : {}), page: p, limit: l };
    Promise.all([api.get<{ data: Coupon[]; meta: { total: number } }>("/saas/owner/coupons", query), api.get<CouponStats>("/saas/owner/coupons/stats")]).then(
      ([res, stats]) => alive && setState({ rows: res.data, total: res.meta.total, stats }),
      (err) => {
        if (!alive) return;
        setState((prev) => prev ?? { rows: [], total: 0, stats: null });
        toast.error("Couldn't load coupons", { id: "coupons-load", description: err instanceof Error ? err.message : "Please refresh the page." });
      }
    );
    return () => {
      alive = false;
    };
  }, [key, tick]);
  return { rows: state?.rows ?? [], total: state?.total ?? 0, stats: state?.stats ?? null, isLoading: state === null };
}
