import type { Coupon, CouponStatus } from "@/types/coupon";
import type { Plan } from "@/types/saas";
import type { CouponFormValues } from "@/validations/couponSchema";
import { formatMoney } from "@/lib/saasStats";

/** Derived status: DISABLED (owner switch) › EXPIRED (past expiry) › EXHAUSTED (max reached) › ACTIVE. */
export function couponStatus(c: Pick<Coupon, "active" | "expiresAt" | "maxRedemptions" | "redemptions">, now = Date.now()): CouponStatus {
  if (!c.active) return "DISABLED";
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return "EXPIRED";
  if (c.maxRedemptions !== null && c.redemptions.length >= c.maxRedemptions) return "EXHAUSTED";
  return "ACTIVE";
}

/** "20% off" / "$50 off". */
export const discountLabel = (c: Pick<Coupon, "type" | "value">) => (c.type === "PERCENT" ? `${c.value}% off` : `${formatMoney(c.value, { cents: c.value % 1 !== 0 })} off`);

/** "first invoice" / "for 3 months" / "forever". */
export const durationLabel = (c: Pick<Coupon, "duration" | "durationMonths">) =>
  c.duration === "ONCE" ? "first invoice" : c.duration === "FOREVER" ? "forever" : `for ${c.durationMonths} month${c.durationMonths === 1 ? "" : "s"}`;

/** "All plans" / "Growth, Pro". */
export const plansLabel = (planIds: string[], plans: Plan[]) => (planIds.length ? planIds.map((id) => plans.find((p) => p.id === id)?.name ?? id).join(", ") : "All plans");

export const cycleLabel = (cycle: Coupon["cycle"]) => (cycle === "ANY" ? "Monthly & yearly" : cycle === "MONTHLY" ? "Monthly only" : "Yearly only");

/** One-line summary, e.g. "20% off for 3 months · All plans · new customers only". */
export function couponSummary(c: Pick<Coupon, "type" | "value" | "duration" | "durationMonths" | "planIds" | "cycle" | "newCustomersOnly">, plans: Plan[]) {
  const parts = [`${discountLabel(c)} ${durationLabel(c)}`, plansLabel(c.planIds, plans)];
  if (c.cycle !== "ANY") parts.push(cycleLabel(c.cycle).toLowerCase());
  if (c.newCustomersOnly) parts.push("new customers only");
  return parts.join(" · ");
}

export const totalDiscount = (c: Pick<Coupon, "redemptions">) => c.redemptions.reduce((s, r) => s + r.amountOff, 0);

/** Days until expiry (ceil); null when it never expires. */
export const daysUntilExpiry = (c: Pick<Coupon, "expiresAt">, now = Date.now()) => (c.expiresAt ? Math.ceil((new Date(c.expiresAt).getTime() - now) / 86_400_000) : null);

/** Form defaults for a new coupon. */
export const NEW_COUPON_DEFAULTS: CouponFormValues = {
  code: "",
  description: "",
  type: "PERCENT",
  value: 20,
  duration: "ONCE",
  durationMonths: 3,
  planIds: [],
  cycle: "ANY",
  limitRedemptions: false,
  maxRedemptions: 100,
  hasExpiry: false,
  expiresOn: "",
  newCustomersOnly: false,
  active: true,
};

export function couponToFormValues(c: Coupon): CouponFormValues {
  return {
    code: c.code,
    description: c.description,
    type: c.type,
    value: c.value,
    duration: c.duration,
    durationMonths: c.durationMonths ?? 3,
    planIds: [...c.planIds],
    cycle: c.cycle,
    limitRedemptions: c.maxRedemptions !== null,
    maxRedemptions: c.maxRedemptions ?? 100,
    hasExpiry: !!c.expiresAt,
    expiresOn: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    newCustomersOnly: c.newCustomersOnly,
    active: c.active,
  };
}

/** Random readable code, e.g. "EDU-7KQ2X". */
export function generateCouponCode(prefix = "EDU") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}
