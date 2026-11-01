"use client";

import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CreditCard, FlaskConical, Globe2, Radio, Smartphone } from "lucide-react";
import type { BillingSettings, ConsoleGatewayKey } from "@/validations/consoleSettingsSchema";
import type { IconSectionTone } from "@/components/ui/IconSectionCard";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { SettingsRow } from "@/components/settings/shared/SettingsRow";
import { SecretField } from "@/components/settings/shared/SecretField";
import { InputField } from "@/components/ui/InputField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ToneBadge } from "@/components/ui/ToneBadge";

interface GatewayInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  tone: IconSectionTone;
  publicKeyLabel: string;
  publicKeyPlaceholder: string;
  secretLabel: string;
}

export const CONSOLE_GATEWAYS: Record<ConsoleGatewayKey, GatewayInfo> = {
  stripe: {
    name: "Stripe",
    description: "Recurring card billing for institutions worldwide.",
    icon: <Globe2 className="h-5 w-5" />,
    tone: "purple",
    publicKeyLabel: "Publishable key",
    publicKeyPlaceholder: "pk_live_…",
    secretLabel: "Secret key",
  },
  sslcommerz: {
    name: "SSLCommerz",
    description: "Local cards and mobile banking for institutions in Bangladesh.",
    icon: <CreditCard className="h-5 w-5" />,
    tone: "blue",
    publicKeyLabel: "Store ID",
    publicKeyPlaceholder: "e.g. edupro_saas_live",
    secretLabel: "Store password",
  },
  bkash: {
    name: "bKash",
    description: "Tokenized bKash wallet payments for subscription renewals.",
    icon: <Smartphone className="h-5 w-5" />,
    tone: "red",
    publicKeyLabel: "App key",
    publicKeyPlaceholder: "bKash app key",
    secretLabel: "App secret",
  },
};

const MODE_OPTIONS = [
  { value: "LIVE" as const, label: "Live", icon: <Radio /> },
  { value: "TEST" as const, label: "Test", icon: <FlaskConical /> },
];

/** One subscription-fee gateway: enable toggle, Live/Test mode, public key and write-only secret. */
export function ConsoleGatewayCard({ gatewayKey, secretHint }: { gatewayKey: ConsoleGatewayKey; secretHint?: string }) {
  const info = CONSOLE_GATEWAYS[gatewayKey];
  const { control, register, formState, trigger } = useFormContext<BillingSettings>();
  const [enabled, mode] = useWatch({ control, name: [`${gatewayKey}.enabled`, `${gatewayKey}.mode`] });
  const errors = formState.errors[gatewayKey];
  const enableError = gatewayKey === "stripe" ? formState.errors.stripe?.enabled?.message : undefined;

  return (
    <SettingsCard
      title={info.name}
      description={info.description}
      icon={info.icon}
      tone={info.tone}
      action={
        <div className="flex items-center gap-3">
          {enabled ? (
            <ToneBadge tone={mode === "LIVE" ? "green" : "yellow"} size="sm" dot>
              {mode === "LIVE" ? "Live" : "Test mode"}
            </ToneBadge>
          ) : (
            <ToneBadge tone="gray" size="sm">
              Off
            </ToneBadge>
          )}
          <Controller
            control={control}
            name={`${gatewayKey}.enabled`}
            render={({ field }) => (
              <ToggleSwitch
                id={`console-${gatewayKey}-enabled`}
                tone="orange"
                checked={!!field.value}
                onChange={(next) => {
                  field.onChange(next);
                  if (formState.isSubmitted || formState.errors.stripe?.enabled) void trigger();
                }}
                label={<span className="sr-only">Enable {info.name}</span>}
              />
            )}
          />
        </div>
      }
    >
      {enableError && <p className="py-3 body-xsm-regular text-red">{enableError}</p>}
      <SettingsRow label="Mode" description="Test mode uses sandbox keys and never charges anyone.">
        <Controller
          control={control}
          name={`${gatewayKey}.mode`}
          render={({ field }) => <SegmentedControl options={MODE_OPTIONS} value={field.value} onChange={field.onChange} />}
        />
      </SettingsRow>
      <SettingsRow label={info.publicKeyLabel} htmlFor={`console-${gatewayKey}-public`} required={!!enabled}>
        <InputField
          id={`console-${gatewayKey}-public`}
          placeholder={info.publicKeyPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          error={errors?.publicKey?.message}
          {...register(`${gatewayKey}.publicKey`)}
        />
      </SettingsRow>
      <SettingsRow label={info.secretLabel} description="Write-only. Leave empty to keep the saved one." htmlFor={`console-${gatewayKey}-secret`}>
        <SecretField id={`console-${gatewayKey}-secret`} name={`${gatewayKey}.secretKey`} label={info.secretLabel} hideLabel hint={secretHint} />
      </SettingsRow>
    </SettingsCard>
  );
}

export default ConsoleGatewayCard;
