import { z } from "zod";
import { COUPON_CYCLES, COUPON_DURATIONS, COUPON_TYPES } from "@/types/coupon";

/**
 * Coupon create / edit form (Console › Coupons). Optional caps are modelled as a switch + value
 * (`limitRedemptions` + `maxRedemptions`, `hasExpiry` + `expiresOn`) and converted in couponStorage.
 * Code uniqueness is checked against the store on submit (couponStorage throws a friendly Error).
 */

export const COUPON_CODE_REGEX = /^[A-Z0-9][A-Z0-9_-]{2,23}$/;
export const COUPON_DESCRIPTION_MAX = 120;
export const MAX_FIXED_OFF = 10_000;

export const normalizeCode = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "");

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .transform(normalizeCode)
      .pipe(z.string().min(3, "Use at least 3 characters.").max(24, "Keep it to 24 characters or fewer.").regex(COUPON_CODE_REGEX, "Letters, numbers, - and _ only.")),
    description: z.string().trim().max(COUPON_DESCRIPTION_MAX, `Keep it under ${COUPON_DESCRIPTION_MAX} characters.`),
    type: z.enum(COUPON_TYPES),
    value: z.number({ error: "Enter a discount." }).positive("Enter a discount above 0."),
    duration: z.enum(COUPON_DURATIONS),
    durationMonths: z.number({ error: "Enter the number of months." }).int("Whole months only.").min(1, "At least 1 month.").max(36, "36 months at most."),
    planIds: z.array(z.string()),
    cycle: z.enum(COUPON_CYCLES),
    limitRedemptions: z.boolean(),
    maxRedemptions: z.number({ error: "Enter a limit." }).int("Whole numbers only.").min(1, "At least 1.").max(100_000, "That's too many."),
    hasExpiry: z.boolean(),
    expiresOn: z.string(),
    newCustomersOnly: z.boolean(),
    active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PERCENT" && v.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "A percentage can't be more than 100." });
    if (v.type === "PERCENT" && !Number.isInteger(v.value)) ctx.addIssue({ code: "custom", path: ["value"], message: "Use a whole percentage." });
    if (v.type === "FIXED" && v.value > MAX_FIXED_OFF) ctx.addIssue({ code: "custom", path: ["value"], message: `At most $${MAX_FIXED_OFF.toLocaleString("en-US")}.` });
    if (v.hasExpiry && !/^\d{4}-\d{2}-\d{2}$/.test(v.expiresOn)) ctx.addIssue({ code: "custom", path: ["expiresOn"], message: "Pick the last day it can be used." });
  });

export type CouponFormInput = z.input<typeof couponFormSchema>;
export type CouponFormValues = z.output<typeof couponFormSchema>;
