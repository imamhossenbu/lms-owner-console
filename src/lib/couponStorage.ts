"use client";

import { useSyncExternalStore } from "react";
import type { Coupon } from "@/types/coupon";
import type { CouponFormValues } from "@/validations/couponSchema";
import { couponFormSchema, normalizeCode } from "@/validations/couponSchema";
import { buildCouponSeed } from "@/data/mockCoupons";

/**
 * Mock-first persistence for coupons (localStorage `edupro_console_coupons_v1` + simulated latency).
 * Snapshot is cached until COUPONS_UPDATED_EVENT so `useCoupons()` is stable for useSyncExternalStore.
 */

const STORAGE_KEY = "edupro_console_coupons_v1";
export const COUPONS_UPDATED_EVENT = "edupro_console_coupons_updated";
const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));

let cachedRaw: string | null | undefined;
let cached: Coupon[] = [];

function read(): Coupon[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw && raw === cachedRaw) return cached;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        cachedRaw = raw;
        cached = parsed as Coupon[];
        return cached;
      }
    } catch {
      /* re-seed below */
    }
  }
  const seed = buildCouponSeed();
  write(seed, false);
  return cached;
}

function write(coupons: Coupon[], notify = true) {
  const raw = JSON.stringify(coupons);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    throw new Error("Your browser storage is full. Remove some data and try again.");
  }
  cachedRaw = raw;
  cached = coupons;
  if (notify) window.dispatchEvent(new Event(COUPONS_UPDATED_EVENT));
}

function subscribe(cb: () => void) {
  const handler = () => queueMicrotask(cb);
  window.addEventListener(COUPONS_UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(COUPONS_UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

const SERVER_SNAPSHOT: Coupon[] | null = null;

/** Live coupons; null on the server and during hydration (render a skeleton). */
export function useCoupons(): Coupon[] | null {
  return useSyncExternalStore<Coupon[] | null>(subscribe, read, () => SERVER_SNAPSHOT);
}

export const getCoupon = (id: string) => read().find((c) => c.id === id) ?? null;

export const isCodeTaken = (code: string, exceptId?: string) => read().some((c) => c.code === normalizeCode(code) && c.id !== exceptId);

function fromForm(values: CouponFormValues): Omit<Coupon, "id" | "createdAt" | "updatedAt" | "redemptions"> {
  const v = couponFormSchema.parse(values);
  return {
    code: v.code,
    description: v.description,
    type: v.type,
    value: v.value,
    duration: v.duration,
    durationMonths: v.duration === "REPEATING" ? v.durationMonths : null,
    planIds: v.planIds,
    cycle: v.cycle,
    maxRedemptions: v.limitRedemptions ? v.maxRedemptions : null,
    expiresAt: v.hasExpiry ? `${v.expiresOn}T23:59:59.000Z` : null,
    newCustomersOnly: v.newCustomersOnly,
    active: v.active,
  };
}

export async function createCoupon(values: CouponFormValues): Promise<Coupon> {
  await wait();
  if (isCodeTaken(values.code)) throw new Error(`The code ${normalizeCode(values.code)} is already used by another coupon.`);
  const now = new Date().toISOString();
  const coupon: Coupon = { ...fromForm(values), id: `cpn-${Date.now().toString(36)}`, createdAt: now, updatedAt: now, redemptions: [] };
  write([coupon, ...read()]);
  return coupon;
}

export async function updateCoupon(id: string, values: CouponFormValues): Promise<Coupon> {
  await wait();
  const current = getCoupon(id);
  if (!current) throw new Error("This coupon no longer exists.");
  if (isCodeTaken(values.code, id)) throw new Error(`The code ${normalizeCode(values.code)} is already used by another coupon.`);
  if (current.redemptions.length && normalizeCode(values.code) !== current.code) throw new Error("A redeemed coupon's code can't be changed — create a new coupon instead.");
  const next: Coupon = { ...current, ...fromForm(values), updatedAt: new Date().toISOString() };
  write(read().map((c) => (c.id === id ? next : c)));
  return next;
}

export async function setCouponActive(id: string, active: boolean): Promise<Coupon> {
  await wait(400);
  const current = getCoupon(id);
  if (!current) throw new Error("This coupon no longer exists.");
  const next = { ...current, active, updatedAt: new Date().toISOString() };
  write(read().map((c) => (c.id === id ? next : c)));
  return next;
}

export async function deleteCoupon(id: string): Promise<void> {
  await wait(400);
  const current = getCoupon(id);
  if (!current) throw new Error("This coupon no longer exists.");
  if (current.redemptions.length) throw new Error("This coupon has been redeemed — disable it instead so its history is kept.");
  write(read().filter((c) => c.id !== id));
}
