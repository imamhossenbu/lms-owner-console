"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Info, Mail, Phone, StickyNote, User } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { INSTITUTION_TYPES, SAAS_COUNTRIES } from "@/types/saas";
import { institutionFormDefaults, institutionFormSchema, normalizeSlug, NOTES_MAX, type InstitutionFormValues } from "@/validations/saasSchema";
import { createInstitution, updateInstitution } from "@/lib/saasStorage";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { InputField } from "@/components/ui/InputField";
import { FieldLabel, SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { CharCounter } from "@/components/ui/CharCounter";
import { errorMessage, TYPE_LABEL } from "../../shared/consoleMeta";
import { PlanBadge, SubscriptionStatusBadge } from "../../shared/ConsoleBadges";
import { SlugField, type SlugStatus } from "./SlugField";
import { PlanBillingSection } from "./PlanBillingSection";
import { FormSaveBar } from "./FormSaveBar";

export interface InstitutionFormProps {
  mode: "create" | "edit";
  plans: Plan[];
  institution?: Institution;
  /** ms — base for trial previews. */
  now: number;
}

const toValues = (i: Institution): InstitutionFormValues => ({
  name: i.name,
  type: i.type,
  country: (SAAS_COUNTRIES as readonly string[]).includes(i.country) ? (i.country as InstitutionFormValues["country"]) : "Bangladesh",
  ownerName: i.ownerName,
  ownerEmail: i.ownerEmail,
  phone: i.phone,
  slug: i.slug,
  planId: i.subscription.planId,
  cycle: i.subscription.cycle,
  startWithTrial: false,
  trialDays: 14,
  notes: i.notes,
});

/** Create / edit institution form (react-hook-form + zod, live subdomain availability, sticky save bar). */
export function InstitutionForm({ mode, plans, institution, now }: InstitutionFormProps) {
  const router = useRouter();
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ state: "idle" });
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const onSlugStatus = useCallback((s: SlugStatus) => setSlugStatus(s), []);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    mode: "onTouched",
    defaultValues: institution ? toValues(institution) : institutionFormDefaults,
  });
  const notes = useWatch({ control, name: "notes" }) ?? "";
  const back = institution ? `/institutions/${institution.id}` : "/institutions";

  const nameField = register("name", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!slugTouched) setValue("slug", normalizeSlug(e.target.value), { shouldValidate: true });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (slugStatus.state === "done" && slugStatus.slug === values.slug && !slugStatus.result.available) {
      setError("slug", { message: slugStatus.result.reason });
      return;
    }
    const toastId = toast.loading(mode === "create" ? "Creating institution..." : "Saving changes...", { description: values.name });
    try {
      if (mode === "create") {
        const inst = await createInstitution(values, "OWNER_CREATED");
        toast.success("Institution created", {
          id: toastId,
          description: values.startWithTrial ? `${inst.name} is live at ${inst.slug}.edupro.com with a ${values.trialDays}-day trial.` : `${inst.name} is live at ${inst.slug}.edupro.com. First invoice issued.`,
        });
        router.push(`/institutions/${inst.id}`);
      } else if (institution) {
        const inst = await updateInstitution(institution.id, {
          name: values.name,
          type: values.type,
          country: values.country,
          ownerName: values.ownerName,
          ownerEmail: values.ownerEmail,
          phone: values.phone,
          slug: values.slug,
          notes: values.notes,
        });
        toast.success("Changes saved", { id: toastId, description: `${inst.name} has been updated.` });
        router.push(`/institutions/${inst.id}`);
      }
    } catch (e) {
      const message = errorMessage(e);
      if (/subdomain|taken/i.test(message)) setError("slug", { message });
      if (/email/i.test(message)) setError("ownerEmail", { message });
      toast.error(mode === "create" ? "Couldn't create the institution" : "Couldn't save changes", { id: toastId, description: message });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <IconSectionCard icon={<Building2 className="h-5 w-5" />} title="Institution" description="How the institution appears across EduPro.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField id="inst-name" label="Institution name" required placeholder="Dhaka Coding Academy" error={errors.name?.message} containerClassName="md:col-span-2" {...nameField} />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SelectField id="inst-type" label="Type" value={field.value} onChange={field.onChange} error={errors.type?.message} options={INSTITUTION_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))} />
            )}
          />
          <Controller
            control={control}
            name="country"
            render={({ field }) => <SelectField id="inst-country" label="Country" value={field.value} onChange={field.onChange} error={errors.country?.message} options={SAAS_COUNTRIES.map((c) => ({ value: c, label: c }))} />}
          />
          <div className="md:col-span-2">
            <Controller
              control={control}
              name="slug"
              render={({ field }) => (
                <SlugField
                  id="inst-slug"
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  error={errors.slug?.message}
                  exceptId={institution?.id}
                  status={slugStatus}
                  onStatusChange={onSlugStatus}
                />
              )}
            />
            {mode === "edit" && (
              <p className="mt-2 flex items-center gap-1.5 body-xsm-regular text-yellow">
                <Info className="h-3.5 w-3.5 shrink-0" /> Changing the subdomain breaks old links and bookmarks immediately.
              </p>
            )}
          </div>
        </div>
      </IconSectionCard>

      <IconSectionCard icon={<User className="h-5 w-5" />} tone="purple" title="Owner contact" description="The institution's account owner — receives billing emails.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InputField id="owner-name" label="Owner name" required placeholder="Tanvir Rahman" leftElement={<User className="h-4 w-4" />} error={errors.ownerName?.message} {...register("ownerName")} />
          <InputField id="owner-email" type="email" label="Owner email" required placeholder="owner@school.com" leftElement={<Mail className="h-4 w-4" />} error={errors.ownerEmail?.message} {...register("ownerEmail")} />
          <InputField id="owner-phone" type="tel" label="Phone (optional)" placeholder="+880 1711-000000" leftElement={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register("phone")} />
        </div>
      </IconSectionCard>

      {mode === "create" ? (
        <PlanBillingSection control={control} register={register} errors={errors} plans={plans} now={now} />
      ) : (
        institution && (
          <IconSectionCard icon={<Info className="h-5 w-5" />} tone="yellow" title="Plan & billing" description="Plan, cycle and trial are managed from the institution page (Change plan / Extend trial).">
            <div className="flex flex-wrap items-center gap-2">
              <PlanBadge planId={institution.subscription.planId} plans={plans} cycle={institution.subscription.cycle} size="md" />
              <SubscriptionStatusBadge status={institution.subscription.status} size="md" />
            </div>
          </IconSectionCard>
        )
      )}

      <IconSectionCard icon={<StickyNote className="h-5 w-5" />} tone="green" title="Internal notes" description="Only platform owners see these.">
        <FieldLabel htmlFor="inst-notes">Notes</FieldLabel>
        <TextAreaField id="inst-notes" rows={4} placeholder="Contract details, contacts, follow-ups…" error={errors.notes?.message} {...register("notes")} />
        <CharCounter count={notes.length} max={NOTES_MAX} className="mt-1" />
      </IconSectionCard>

      <FormSaveBar
        title={mode === "create" ? "Ready to create?" : "Save your changes"}
        hint={mode === "create" ? "The institution panel goes live on its subdomain immediately." : "Changes apply to the institution panel immediately."}
        submitLabel={mode === "create" ? "Create institution" : "Save changes"}
        submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
        isSubmitting={isSubmitting}
        disabled={slugStatus.state === "checking"}
        onCancel={() => router.push(back)}
      />
    </form>
  );
}

export default InstitutionForm;
