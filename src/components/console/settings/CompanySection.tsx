"use client";

import React from "react";
import { Controller, FormProvider, useWatch } from "react-hook-form";
import { Building2, FileText, Mail } from "lucide-react";
import { SettingsSectionLayout } from "@/components/settings/shared/SettingsSectionLayout";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { SettingsRow } from "@/components/settings/shared/SettingsRow";
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar";
import { UploadTile } from "@/components/settings/shared/UploadTile";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { ProTipCard } from "@/components/ui/ProTipCard";
import { useConsoleSettingsSection } from "./useConsoleSettingsSection";
import { InvoiceHeaderPreview } from "./InvoiceHeaderPreview";

/** Console › Settings › Company: legal entity printed on every subscription invoice. */
export function CompanySection() {
  const { form, store, isSaving, save, discard } = useConsoleSettingsSection("company");
  const { register, control, formState } = form;
  const errors = formState.errors;
  const company = useWatch({ control });
  const billing = store.settings.billing;

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <SettingsSectionLayout
          title="Company"
          description="The legal entity that bills institutions for their EduPro subscription."
          icon={<Building2 className="h-5 w-5" />}
          updatedAt={store.updatedAt.company}
          aside={
            <>
              <InvoiceHeaderPreview
                legalName={company.legalName ?? ""}
                address={company.address ?? ""}
                supportEmail={company.supportEmail ?? ""}
                taxId={company.taxId ?? ""}
                invoicePrefix={billing.invoicePrefix}
                taxRate={billing.taxRate}
              />
              <ProTipCard title="Use your registered details">
                Institutions often need your exact legal name, address and tax ID to claim subscription invoices as a business expense.
              </ProTipCard>
            </>
          }
        >
          <SettingsCard title="Legal entity" description="Shown in the invoice header and the billing footer of emails." icon={<FileText className="h-5 w-5" />}>
            <SettingsRow label="Legal name" description="Registered company name." htmlFor="company-legal-name" required>
              <InputField id="company-legal-name" placeholder="EduPro Technologies Ltd." error={errors.legalName?.message} {...register("legalName")} />
            </SettingsRow>
            <SettingsRow label="Registered address" htmlFor="company-address" required>
              <TextAreaField id="company-address" rows={3} placeholder="Street, city, postcode, country" error={errors.address?.message} {...register("address")} />
            </SettingsRow>
            <SettingsRow label="Tax / BIN number" description="Optional. Printed on invoices." htmlFor="company-tax-id">
              <InputField id="company-tax-id" placeholder="e.g. BIN 004512398-0101" error={errors.taxId?.message} {...register("taxId")} />
            </SettingsRow>
          </SettingsCard>

          <SettingsCard title="Contact & branding" description="Where institutions reach you about billing." icon={<Mail className="h-5 w-5" />} tone="blue">
            <SettingsRow label="Billing support email" htmlFor="company-support-email" required>
              <InputField id="company-support-email" type="email" placeholder="billing@edupro.com" error={errors.supportEmail?.message} {...register("supportEmail")} />
            </SettingsRow>
            <SettingsRow label="Website" htmlFor="company-website">
              <InputField id="company-website" placeholder="https://edupro.com" error={errors.website?.message} {...register("website")} />
            </SettingsRow>
            <SettingsRow label="Invoice logo" description="PNG or SVG, shown top-left on invoices.">
              <Controller
                control={control}
                name="logoUrl"
                render={({ field }) => (
                  <UploadTile
                    label="Invoice logo"
                    value={field.value}
                    onChange={(url) => field.onChange(url)}
                    accept="image/png,image/svg+xml,image/jpeg"
                    maxMb={2}
                    aspect="wide"
                    helper="Recommended 400 × 120 px on a transparent background."
                  />
                )}
              />
            </SettingsRow>
          </SettingsCard>

          <SettingsSaveBar isDirty={formState.isDirty} isSaving={isSaving} onSave={save} onDiscard={discard} />
        </SettingsSectionLayout>
      </form>
    </FormProvider>
  );
}

export default CompanySection;
