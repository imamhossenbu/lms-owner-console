"use client";

import React from "react";
import { FormProvider, useWatch } from "react-hook-form";
import { CreditCard, Receipt } from "lucide-react";
import { GATEWAY_KEYS } from "@/validations/consoleSettingsSchema";
import { SettingsSectionLayout } from "@/components/settings/shared/SettingsSectionLayout";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { SettingsRow } from "@/components/settings/shared/SettingsRow";
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar";
import { InputField } from "@/components/ui/InputField";
import { AppSelect } from "@/components/ui/AppSelect";
import { ProTipCard } from "@/components/ui/ProTipCard";
import { useConsoleSettingsSection } from "./useConsoleSettingsSection";
import { ConsoleGatewayCard } from "./ConsoleGatewayCard";
import { InvoiceHeaderPreview } from "./InvoiceHeaderPreview";

/** Console › Settings › Billing: currency, tax, invoice numbering and the gateways that collect subscription fees. */
export function BillingSection() {
  const { form, store, isSaving, save, discard } = useConsoleSettingsSection("billing");
  const { register, control, formState } = form;
  const errors = formState.errors;
  const [taxRate, invoicePrefix] = useWatch({ control, name: ["taxRate", "invoicePrefix"] });
  const company = store.settings.company;

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
          title="Billing"
          description="How subscription fees are priced, taxed, numbered and collected."
          icon={<CreditCard className="h-5 w-5" />}
          updatedAt={store.updatedAt.billing}
          aside={
            <>
              <InvoiceHeaderPreview
                legalName={company.legalName}
                address={company.address}
                supportEmail={company.supportEmail}
                taxId={company.taxId}
                invoicePrefix={invoicePrefix ?? ""}
                taxRate={Number(taxRate) || 0}
              />
              <ProTipCard title="Keep two gateways on">
                With a second gateway enabled, institutions can switch payment method themselves when a card renewal fails — fewer
                subscriptions slip into past due.
              </ProTipCard>
            </>
          }
        >
          <SettingsCard title="Invoicing" description="Applies to every new subscription invoice." icon={<Receipt className="h-5 w-5" />} tone="green">
            <SettingsRow label="Currency" description="All plan prices are billed in this currency.">
              <AppSelect value="USD" onValueChange={() => undefined} options={[{ value: "USD", label: "USD — US Dollar" }]} disabled fullWidth />
            </SettingsRow>
            <SettingsRow label="Tax rate" description="Added on top of the plan price (0 to disable)." htmlFor="billing-tax" required>
              <InputField
                id="billing-tax"
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                max={30}
                rightElement={<span className="body-sm-regular text-primary-300">%</span>}
                error={errors.taxRate?.message}
                {...register("taxRate", { valueAsNumber: true })}
              />
            </SettingsRow>
            <SettingsRow label="Invoice prefix" description="Invoices are numbered PREFIX-YEAR-00001." htmlFor="billing-prefix" required>
              <InputField
                id="billing-prefix"
                placeholder="EDP"
                maxLength={6}
                className="font-mono uppercase"
                error={errors.invoicePrefix?.message}
                {...register("invoicePrefix", { setValueAs: (v: string) => v.toUpperCase() })}
              />
            </SettingsRow>
            <SettingsRow label="Invoice footer" description="Short note printed at the bottom." htmlFor="billing-footer">
              <InputField id="billing-footer" placeholder="Thank you for your business." error={errors.invoiceFooter?.message} {...register("invoiceFooter")} />
            </SettingsRow>
          </SettingsCard>

          {GATEWAY_KEYS.map((key) => (
            <ConsoleGatewayCard key={key} gatewayKey={key} secretHint={store.secretHints[`billing.${key}.secretKey`]} />
          ))}

          <SettingsSaveBar isDirty={formState.isDirty} isSaving={isSaving} onSave={save} onDiscard={discard} />
        </SettingsSectionLayout>
      </form>
    </FormProvider>
  );
}

export default BillingSection;
