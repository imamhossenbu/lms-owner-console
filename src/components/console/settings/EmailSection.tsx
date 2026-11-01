"use client";

import React, { useState } from "react";
import { Controller, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { BellRing, Mail, Send } from "lucide-react";
import type { EmailSettings } from "@/validations/consoleSettingsSchema";
import { sendConsoleTestEmail } from "@/lib/consoleSettingsStorage";
import { SettingsSectionLayout } from "@/components/settings/shared/SettingsSectionLayout";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { SettingsBlockRow, SettingsRow } from "@/components/settings/shared/SettingsRow";
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar";
import { InputField } from "@/components/ui/InputField";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { useConsoleSettingsSection } from "./useConsoleSettingsSection";

type LifecycleKey = "welcome" | "trialEnding" | "renewalReminder" | "receipt" | "paymentFailed" | "cancellation";

const LIFECYCLE: { key: LifecycleKey; title: string; description: string }[] = [
  { key: "welcome", title: "Welcome & trial started", description: "Sent right after an institution signs up." },
  { key: "trialEnding", title: "Trial ending soon", description: "Reminds the owner to add a payment method before the trial ends." },
  { key: "renewalReminder", title: "Upcoming renewal", description: "7 days before a yearly subscription renews." },
  { key: "receipt", title: "Payment receipt", description: "Invoice PDF after every successful charge." },
  { key: "paymentFailed", title: "Payment failed", description: "Sent on the failure and before each retry." },
  { key: "cancellation", title: "Cancellation confirmation", description: "Confirms the end date and how to reactivate." },
];

/** Console › Settings › Emails: sender identity + which lifecycle emails institutions receive. */
export function EmailSection() {
  const { form, store, isSaving, save, discard } = useConsoleSettingsSection("email");
  const { register, control, formState } = form;
  const errors = formState.errors;
  const values = useWatch({ control }) as Partial<EmailSettings>;
  const [testTo, setTestTo] = useState(store.settings.company.supportEmail);
  const [sending, setSending] = useState(false);
  const enabledCount = LIFECYCLE.filter((e) => values[e.key]).length;

  const sendTest = async () => {
    setSending(true);
    const id = toast.loading("Sending test email...", { description: testTo });
    try {
      await sendConsoleTestEmail(testTo);
      toast.success("Test email sent", { id, description: `Check the inbox of ${testTo}.` });
    } catch (err) {
      toast.error("Couldn't send the test email", { id, description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSending(false);
    }
  };

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
          title="Emails"
          description="Billing lifecycle emails sent to institution owners."
          icon={<Mail className="h-5 w-5" />}
          updatedAt={store.updatedAt.email}
          aside={
            <SettingsCard title="Send a test" description="Preview the trial-ending email." icon={<Send className="h-5 w-5" />} tone="blue" divided={false}>
              <div className="space-y-3">
                <InputField id="email-test-to" type="email" label="Recipient" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <CardActionButton icon={<Send />} onClick={sendTest} disabled={sending || !testTo.trim()}>
                  {sending ? "Sending..." : "Send test email"}
                </CardActionButton>
              </div>
            </SettingsCard>
          }
        >
          <SettingsCard title="Sender" description="Shown in the From and Reply-To headers." icon={<Mail className="h-5 w-5" />}>
            <SettingsRow label="Sender name" htmlFor="email-sender" required>
              <InputField id="email-sender" placeholder="EduPro Billing" error={errors.senderName?.message} {...register("senderName")} />
            </SettingsRow>
            <SettingsRow label="Reply-to" htmlFor="email-reply" required>
              <InputField id="email-reply" type="email" placeholder="billing@edupro.com" error={errors.replyTo?.message} {...register("replyTo")} />
            </SettingsRow>
          </SettingsCard>

          <SettingsCard
            title="Lifecycle emails"
            description="Turn individual emails on or off."
            icon={<BellRing className="h-5 w-5" />}
            tone="purple"
            action={
              <ToneBadge tone="purple" variant="pill">
                {enabledCount} of {LIFECYCLE.length} on
              </ToneBadge>
            }
          >
            {LIFECYCLE.map((item) => (
              <SettingsBlockRow key={item.key}>
                <Controller
                  control={control}
                  name={item.key}
                  render={({ field }) => (
                    <SettingToggleRow title={item.title} description={item.description} checked={!!field.value} onChange={field.onChange} />
                  )}
                />
                {item.key === "trialEnding" && values.trialEnding && (
                  <div className="mt-3 ml-14 max-w-56">
                    <InputField
                      id="email-trial-days"
                      type="number"
                      min={1}
                      max={14}
                      label="Days before the trial ends"
                      rightElement={<span className="body-sm-regular text-primary-300">days</span>}
                      error={errors.trialEndingDays?.message}
                      {...register("trialEndingDays", { valueAsNumber: true })}
                    />
                  </div>
                )}
              </SettingsBlockRow>
            ))}
          </SettingsCard>

          <SettingsSaveBar isDirty={formState.isDirty} isSaving={isSaving} onSave={save} onDiscard={discard} />
        </SettingsSectionLayout>
      </form>
    </FormProvider>
  );
}

export default EmailSection;
