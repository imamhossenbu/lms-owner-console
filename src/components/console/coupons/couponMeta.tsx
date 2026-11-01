import React from "react";
import type { CouponStatus } from "@/types/coupon";
import { COUPON_STATUSES } from "@/types/coupon";
import { ToneBadge, type Tone } from "@/components/ui/ToneBadge";

export const COUPON_STATUS_META: Record<CouponStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "green" },
  EXPIRED: { label: "Expired", tone: "gray" },
  EXHAUSTED: { label: "Limit reached", tone: "yellow" },
  DISABLED: { label: "Disabled", tone: "red" },
};

export const COUPON_STATUS_OPTIONS = [{ value: "All", label: "All statuses" }, ...COUPON_STATUSES.map((s) => ({ value: s, label: COUPON_STATUS_META[s].label }))];
export const COUPON_TYPE_OPTIONS = [
  { value: "All", label: "All types" },
  { value: "PERCENT", label: "Percentage" },
  { value: "FIXED", label: "Fixed amount" },
];

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  const meta = COUPON_STATUS_META[status];
  return <ToneBadge tone={meta.tone}>{meta.label}</ToneBadge>;
}
