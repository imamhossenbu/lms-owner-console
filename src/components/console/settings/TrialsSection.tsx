"use client";

import React from "react";
import { Controller, FormProvider, useWatch } from "react-hook-form";
import { Hourglass, RefreshCw, Timer } from "lucide-react";
import { SettingsSectionLayout } from "@/components/settings/shared/SettingsSectionLayout";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { SettingsBlockRow, SettingsRow } from "@/components/settings/shared/SettingsRow";
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar";
import { InputField } from "@/components/ui/InputField";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { useConsoleSettingsSection } from "./useConsoleSettingsSection";
import { RetryScheduleChips } from "./RetryScheduleChips";
import { DunningTimelineCard } from "./DunningTimelineCard";

const daysSuffix = <span className="body-sm-regular text-primary-300">days</span>;

/** Console › Settings › Trials & dunning: default trial, card requirement, grace period and retry schedule. */
export function TrialsSection() {
  const { form, store, isSaving, save, discard } = useConsoleSettingsSection("trials");
  const { register, control, formState, trigger } = form;
  const errors = formState.errors;
  const [retryDays, graceDays, suspend] = useWatch({ control, name: ["retryScheduleDays", "gracePeriodDays", "suspendAfterGrace"] });

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
          title="Trials & dunning"
          description="Free-trial defaults and how failed renewals are retried before suspension."
          icon={<Hourglass className="h-5 w-5" />}
          updatedAt={store.updatedAt.trials}
          aside={<DunningTimelineCard retryDays={retryDays ?? []} graceDays={Number(graceDays) || 0} suspend={!!suspend} />}
        >
          <SettingsCard title="Free trial" description="Applied to new self-signups (plans can override the length)." icon={<Timer className="h-5 w-5" />} tone="blue">
            <SettingsRow label="Default trial length" description="0 disables trials for new signups." htmlFor="trials-days" required>
              <InputField
                id="trials-days"
                type="number"
                min={0}
                max={90}
                rightElement={daysSuffix}
                error={errors.defaultTrialDays?.message}
                {...register("defaultTrialDays", { valueAsNumber: true })}
              />
            </SettingsRow>
            <SettingsBlockRow>
              <Controller
                control={control}
                name="requireCardForTrial"
                render={({ field }) => (
                  <SettingToggleRow
                    title="Require a payment method to start a trial"
                    description="Fewer signups, but more trials convert automatically when they end."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </SettingsBlockRow>
          </SettingsCard>

          <SettingsCard title="Failed payments" description="Dunning rules for past-due subscriptions." icon={<RefreshCw className="h-5 w-5" />} tone="red">
            <SettingsRow label="Grace period" description="Days a past-due institution keeps full access." htmlFor="trials-grace" required>
              <InputField
                id="trials-grace"
                type="number"
                min={0}
                max={60}
                rightElement={daysSuffix}
                error={errors.gracePeriodDays?.message}
                {...register("gracePeriodDays", { valueAsNumber: true, onChange: () => formState.errors.retryScheduleDays && void trigger("retryScheduleDays") })}
              />
            </SettingsRow>
            <SettingsRow label="Retry schedule" description="Days after the failure to charge again.">
              <Controller
                control={control}
                name="retryScheduleDays"
                render={({ field, fieldState }) => (
                  <RetryScheduleChips
                    value={field.value}
                    onChange={(days) => {
                      field.onChange(days);
                      void trigger("retryScheduleDays");
                    }}
                    error={fieldState.error?.message ?? (errors.retryScheduleDays as { root?: { message?: string } } | undefined)?.root?.message}
                  />
                )}
              />
            </SettingsRow>
            <SettingsBlockRow>
              <Controller
                control={control}
                name="suspendAfterGrace"
                render={({ field }) => (
                  <SettingToggleRow
                    title="Suspend when the grace period ends"
                    description="Locks the institution's admin panel until the outstanding invoice is paid. Students keep read-only access."
                    checked={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      void trigger("retryScheduleDays");
                    }}
                  />
                )}
              />
            </SettingsBlockRow>
          </SettingsCard>

          <SettingsSaveBar isDirty={formState.isDirty} isSaving={isSaving} onSave={save} onDiscard={discard} />
        </SettingsSectionLayout>
      </form>
    </FormProvider>
  );
}

export default TrialsSection;
