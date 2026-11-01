"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Clock, Globe, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { customDomainSchema, type CustomDomainFormInput, type CustomDomainFormValues } from "@/validations/saasSchema";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { hasFeature, minPlanFor } from "@/lib/planAccess";
import { DomainStatusBadge } from "../../../shared/ConsoleBadges";
import { formatDateTime, tenantHost } from "../../../shared/consoleMeta";
import type { InstitutionActions } from "../../actions/useInstitutionActions";
import { DnsRecordsTable } from "./DnsRecordsTable";

const STATUS_NOTE = {
  PENDING_DNS: { icon: Clock, box: "border-yellow/30 bg-yellow-bg", iconClass: "text-yellow", text: "Waiting for DNS. Add both records below, then verify. Changes can take up to 24 hours to propagate." },
  VERIFIED: { icon: CheckCircle2, box: "border-green/30 bg-green-bg", iconClass: "text-green", text: "Verified and live. An SSL certificate is issued and renewed automatically." },
  FAILED: { icon: AlertTriangle, box: "border-red/30 bg-red-14", iconClass: "text-red", text: "Verification failed — the CNAME / TXT records were not found. Check them at the registrar and verify again." },
} as const;

/** Custom domain: plan gate, add form (zod hostname), status, DNS records, verify / remove. */
export function DomainTab({ institution: inst, plans, actions, onChangePlan }: { institution: Institution; plans: Plan[]; actions: InstitutionActions; onChangePlan?: () => void }) {
  const [removing, setRemoving] = useState(false);
  const allowed = hasFeature(plans.find((p) => p.id === inst.subscription.planId), "customDomain");
  const domain = inst.customDomain;
  const busy = actions.busy === `domain-${inst.id}`;
  const { register, handleSubmit, reset, formState } = useForm<CustomDomainFormInput, unknown, CustomDomainFormValues>({ resolver: zodResolver(customDomainSchema), mode: "onTouched", defaultValues: { domain: "" } });

  const submit = handleSubmit(async (v) => {
    try {
      await actions.addDomain(inst, v.domain);
      reset({ domain: "" });
    } catch {
      /* toast shown */
    }
  });

  if (!domain && !allowed) {
    const needed = minPlanFor("customDomain", plans);
    return (
      <IconSectionCard icon={<Lock className="h-5 w-5" />} tone="purple" title="Custom domain" description={`Available on ${needed?.name ?? "Pro"} and above.`}>
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-dash bg-gray-bg p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="body-sm-regular text-primary-400">
            {inst.name} is reachable at <span className="body-sm-medium text-primary-500">{tenantHost(inst.slug)}</span>. Upgrade to {needed?.name ?? "Pro"} to serve it on its own domain.
          </p>
          {onChangePlan && (
            <PrimaryButton size="sm" onClick={onChangePlan}>
              Upgrade plan
            </PrimaryButton>
          )}
        </div>
      </IconSectionCard>
    );
  }

  if (!domain)
    return (
      <IconSectionCard icon={<Globe className="h-5 w-5" />} tone="purple" title="Connect a custom domain" description={`Currently served at ${tenantHost(inst.slug)}.`}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <InputField id="custom-domain" aria-label="Domain" placeholder="learn.yourschool.com" leftElement={<Globe className="h-4 w-4" />} error={formState.errors.domain?.message} containerClassName="flex-1" {...register("domain")} />
          <PrimaryButton type="submit" leftIcon={<Plus className="h-4 w-4" />} isLoading={formState.isSubmitting} disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Adding..." : "Add domain"}
          </PrimaryButton>
        </form>
        <p className="mt-3 body-xsm-regular text-primary-300">Use a subdomain such as learn.yourschool.com. Root domains need a registrar that supports CNAME flattening.</p>
      </IconSectionCard>
    );

  const note = STATUS_NOTE[domain.status];
  const NoteIcon = note.icon;
  return (
    <div className="space-y-5">
      <IconSectionCard
        icon={<Globe className="h-5 w-5" />}
        tone="purple"
        title={domain.domain}
        description={`Added ${formatDateTime(domain.addedAt)}${domain.lastCheckedAt ? ` · last checked ${formatDateTime(domain.lastCheckedAt)}` : ""}`}
        action={<DomainStatusBadge status={domain.status} size="md" />}
      >
        <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${note.box}`}>
          <NoteIcon className={`mt-0.5 h-5 w-5 shrink-0 ${note.iconClass}`} />
          <p className="body-sm-regular text-primary-400">{note.text}</p>
        </div>
        {!allowed && (
          <p className="mt-3 rounded-xl border border-yellow/30 bg-yellow-bg px-3.5 py-2.5 body-sm-regular text-yellow">The current plan no longer includes custom domains — the domain keeps working until it is removed.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {domain.status !== "VERIFIED" && (
            <PrimaryButton leftIcon={<ShieldCheck className="h-4 w-4" />} isLoading={busy} disabled={busy} onClick={() => void actions.verifyDomain(inst).catch(() => {})}>
              {busy ? "Checking DNS..." : "Verify DNS"}
            </PrimaryButton>
          )}
          <SecondaryButton leftIcon={<Trash2 className="h-4 w-4" />} disabled={busy} onClick={() => setRemoving(true)}>
            Remove domain
          </SecondaryButton>
        </div>
      </IconSectionCard>

      <IconSectionCard icon={<ShieldCheck className="h-5 w-5" />} title="DNS records" description="Add these at the domain registrar (Cloudflare, Namecheap, GoDaddy …).">
        <DnsRecordsTable domain={domain} />
      </IconSectionCard>

      <ConfirmModal
        isOpen={removing}
        title={`Remove ${domain.domain}?`}
        message={<>Visitors to {domain.domain} will stop reaching the academy. The panel stays available at {tenantHost(inst.slug)}.</>}
        confirmLabel="Remove domain"
        pendingLabel="Removing..."
        confirmIcon={<Trash2 className="h-4 w-4" />}
        onClose={() => setRemoving(false)}
        onConfirm={async () => {
          await actions.removeDomain(inst);
        }}
      />
    </div>
  );
}

export default DomainTab;
