"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Pencil, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { Institution } from "@/types/saas";
import { PAYMENT_BRANDS } from "@/types/saas";
import { paymentMethodSchema, type PaymentMethodFormValues } from "@/validations/saasSchema";
import { updatePaymentMethod } from "@/lib/saasStorage";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { ModalShell } from "@/components/ui/ModalShell";
import { SelectField } from "@/components/ui/SelectField";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { errorMessage, formatDate } from "../../../shared/consoleMeta";

/** Card / wallet on file + next charge, with an "Update" modal (react-hook-form + zod). */
export function PaymentMethodCard({ institution: inst, nextCharge }: { institution: Institution; nextCharge: string | null }) {
  const [open, setOpen] = useState(false);
  const pm = inst.subscription.paymentMethod;
  const { control, register, handleSubmit, reset, formState } = useForm<PaymentMethodFormValues>({ resolver: zodResolver(paymentMethodSchema), defaultValues: pm ?? { brand: "Visa", last4: "" } });

  const submit = handleSubmit(async (v) => {
    const id = toast.loading("Updating payment method...", { description: inst.name });
    try {
      await updatePaymentMethod(inst.id, v);
      toast.success("Payment method updated", { id, description: `${v.brand} •••• ${v.last4} will be charged from the next invoice.` });
      setOpen(false);
    } catch (e) {
      toast.error("Couldn't update the payment method", { id, description: errorMessage(e) });
    }
  });

  return (
    <IconSectionCard
      icon={<Wallet className="h-5 w-5" />}
      tone="green"
      title="Payment method"
      description="Charged automatically at each renewal."
      action={
        <CardActionButton
          icon={<Pencil className="h-4 w-4" />}
          onClick={() => {
            reset(pm ?? { brand: "Visa", last4: "" });
            setOpen(true);
          }}
        >
          Update
        </CardActionButton>
      }
    >
      {pm ? (
        <div className="flex items-center gap-4 rounded-xl border border-dash bg-gray-bg p-4">
          <span className="flex h-11 w-16 items-center justify-center rounded-lg bg-brand-navy text-white">
            <CreditCard className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="body-medium text-primary-500">
              {pm.brand} •••• {pm.last4}
            </p>
            <p className="body-xsm-regular text-primary-300">{nextCharge ? `Next charge ${formatDate(nextCharge)}` : "No upcoming charge"}</p>
          </div>
          {pm.last4 === "0002" && (
            <ToneBadge tone="red" size="sm" variant="pill">
              Declining
            </ToneBadge>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-6 text-center body-sm-regular text-primary-300">No payment method on file — renewals will fail.</p>
      )}

      <ModalShell
        isOpen={open}
        onClose={formState.isSubmitting ? () => {} : () => setOpen(false)}
        title="Update payment method"
        subtitle={inst.name}
        maxWidth="sm"
        footer={
          <>
            <SecondaryButton onClick={() => setOpen(false)} disabled={formState.isSubmitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => void submit()} isLoading={formState.isSubmitting} disabled={formState.isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {formState.isSubmitting ? "Saving..." : "Save method"}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Controller
            control={control}
            name="brand"
            render={({ field }) => <SelectField id="pm-brand" label="Method" value={field.value} onChange={field.onChange} error={formState.errors.brand?.message} options={PAYMENT_BRANDS.map((b) => ({ value: b, label: b }))} />}
          />
          <InputField id="pm-last4" label="Last 4 digits" required inputMode="numeric" maxLength={4} placeholder="4242" error={formState.errors.last4?.message} {...register("last4")} />
        </form>
      </ModalShell>
    </IconSectionCard>
  );
}

export default PaymentMethodCard;
