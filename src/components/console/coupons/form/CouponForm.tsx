"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Coupon } from "@/types/coupon";
import type { SaasStore } from "@/types/saas";
import { couponFormSchema, type CouponFormInput, type CouponFormValues } from "@/validations/couponSchema";
import { createCoupon, updateCoupon } from "@/lib/couponStorage";
import { couponToFormValues, NEW_COUPON_DEFAULTS } from "@/lib/couponMath";
import { FormSaveBar } from "../../institutions/form/FormSaveBar";
import { CouponCodeFields } from "./CouponCodeFields";
import { CouponDiscountFields } from "./CouponDiscountFields";
import { CouponRestrictionsFields } from "./CouponRestrictionsFields";
import { CouponPreviewCard } from "./CouponPreviewCard";
import { CouponRedemptionsCard } from "./CouponRedemptionsCard";

/** Coupon create / edit: fields left, live ticket + price preview (+ redemptions) right, sticky save bar. */
export function CouponForm({ coupon, store, now }: { coupon?: Coupon; store: SaasStore; now: number }) {
  const router = useRouter();
  const isNew = !coupon;
  const [isSaving, setIsSaving] = useState(false);
  const defaults = useMemo(() => (coupon ? couponToFormValues(coupon) : NEW_COUPON_DEFAULTS), [coupon]);
  const form = useForm<CouponFormInput, unknown, CouponFormValues>({ resolver: zodResolver(couponFormSchema), mode: "onTouched", defaultValues: defaults });
  const values = { ...defaults, ...(useWatch({ control: form.control }) as Partial<CouponFormValues>) } as CouponFormValues;

  const onSubmit = form.handleSubmit(
    async (data) => {
      setIsSaving(true);
      const id = toast.loading(isNew ? "Creating coupon..." : "Saving coupon...", { description: data.code });
      try {
        if (isNew) {
          const created = await createCoupon(data);
          toast.success("Coupon created", { id, description: `${created.code} is ${created.active ? "ready to share" : "saved as disabled"}.` });
          router.push("/coupons");
        } else {
          const saved = await updateCoupon(coupon.id, data);
          form.reset(couponToFormValues(saved));
          toast.success("Coupon saved", { id, description: `${saved.code} has been updated.` });
        }
      } catch (err) {
        toast.error(isNew ? "Couldn't create the coupon" : "Couldn't save the coupon", { id, description: err instanceof Error ? err.message : "Please try again." });
        if (err instanceof Error && /already used/.test(err.message)) form.setError("code", { message: "This code is already taken." });
      } finally {
        setIsSaving(false);
      }
    },
    () => toast.error("Please fix the highlighted fields", { description: "Some coupon details are missing or invalid." })
  );

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
          <div className="min-w-0 space-y-5 xl:col-span-8">
            <CouponCodeFields codeLocked={!!coupon?.redemptions.length} />
            <CouponDiscountFields />
            <CouponRestrictionsFields plans={store.plans} />
          </div>
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-20 xl:col-span-4">
            <CouponPreviewCard values={values} plans={store.plans} redemptions={coupon?.redemptions.length ?? 0} now={now} />
            {coupon && <CouponRedemptionsCard coupon={coupon} store={store} now={now} />}
          </aside>
        </div>
        <FormSaveBar
          title={isNew ? "New coupon" : form.formState.isDirty ? "You have unsaved changes" : "All changes saved"}
          hint={isNew ? "Institutions can redeem it as soon as it's created (if active)." : "Changes apply to new redemptions; existing discounts keep their terms."}
          submitLabel={isNew ? "Create coupon" : "Save changes"}
          submittingLabel={isNew ? "Creating..." : "Saving..."}
          isSubmitting={isSaving}
          disabled={!isNew && !form.formState.isDirty}
          onCancel={() => router.push("/coupons")}
        />
      </form>
    </FormProvider>
  );
}

export default CouponForm;
