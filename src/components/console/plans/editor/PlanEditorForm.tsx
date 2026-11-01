"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays, CalendarRange, Gauge, Save } from "lucide-react";
import type { BillingCycle, Plan, SaasStore } from "@/types/saas";
import { LIMIT_KEYS } from "@/types/saas";
import { planFormSchema, type PlanFormValues } from "@/validations/saasSchema";
import { createPlan, customPlanId, savePlan } from "@/lib/saasStorage";
import { revenueByPlan } from "@/lib/saasStats";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PricingCard } from "../PricingCard";
import { usePlanArchive } from "../usePlanArchive";
import { limitViolations, planSubscribers, planToFormValues, NEW_PLAN_DEFAULTS } from "../planUtils";
import { PlanDetailsFields } from "./PlanDetailsFields";
import { PlanPricingFields } from "./PlanPricingFields";
import { PlanFeaturesField } from "./PlanFeaturesField";
import { LimitField } from "./LimitField";
import { PlanImpactCard } from "./PlanImpactCard";
import { PlanSaveBar } from "./PlanSaveBar";

interface PlanEditorFormProps {
  store: SaasStore;
  /** Existing plan (edit) or undefined (new custom plan, id `plan-<slug>`). */
  plan?: Plan;
}

/** Plan editor form (edit + new): fields left, live pricing-card preview + impact right, sticky save bar. */
export function PlanEditorForm({ store, plan }: PlanEditorFormProps) {
  const router = useRouter();
  const isNew = !plan;
  const [previewCycle, setPreviewCycle] = useState<BillingCycle>("MONTHLY");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOver, setConfirmOver] = useState(false);
  const archive = usePlanArchive(store);

  const defaults = useMemo(() => (plan ? planToFormValues(plan) : NEW_PLAN_DEFAULTS), [plan]);
  const form = useForm<PlanFormValues>({ resolver: zodResolver(planFormSchema), mode: "onTouched", defaultValues: defaults });
  const values = useWatch({ control: form.control }) as PlanFormValues;

  const subscribers = useMemo(() => (plan ? planSubscribers(store, plan.id) : []), [store, plan]);
  const planMrr = useMemo(() => (plan ? revenueByPlan(store).find((r) => r.planId === plan.id)?.mrr ?? 0 : 0), [store, plan]);
  const limits = values.limits ?? defaults.limits;
  const violations = useMemo(() => limitViolations(subscribers, limits), [subscribers, limits]);
  const removedFeatures = plan ? plan.features.filter((f) => !(values.features ?? []).includes(f)) : [];

  const persist = async (data: PlanFormValues) => {
    setIsSaving(true);
    const id = toast.loading(isNew ? "Creating plan..." : "Saving plan...", { description: data.name });
    try {
      if (isNew) {
        const created = await createPlan(data);
        toast.success("Plan created", { id, description: `${created.name} is ${created.isPublic ? "live on the pricing page" : "available to assign"}.` });
        router.push("/plans");
      } else {
        const saved = await savePlan(plan.id, data);
        form.reset(planToFormValues(saved));
        toast.success("Plan saved", { id, description: `${saved.name} has been updated.` });
      }
    } catch (err) {
      toast.error(isNew ? "Couldn't create the plan" : "Couldn't save the plan", { id, description: err instanceof Error ? err.message : "Please try again." });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = form.handleSubmit(
    async (data) => {
      if (violations.length) return setConfirmOver(true);
      await persist(data).catch(() => undefined);
    },
    () => toast.error("Please fix the highlighted fields", { description: "Some plan details are missing or invalid." })
  );

  const preview = { ...defaults, ...values, limits, features: values.features ?? [], archived: plan?.archived };
  const overCount = new Set(violations.map((v) => v.institution.id)).size;

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
          <div className="min-w-0 space-y-5 xl:col-span-8">
            <PlanDetailsFields newPlanId={isNew ? customPlanId(values.name?.trim() || "custom", store.plans) : undefined} />
            <PlanPricingFields initialAuto={isNew || (defaults.priceMonthly > 0 && defaults.priceYearly === defaults.priceMonthly * 10)} />
            <IconSectionCard icon={<Gauge className="h-5 w-5" />} tone="blue" title="Limits" description="Hard caps per institution. Toggle Unlimited to remove a cap.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {LIMIT_KEYS.map((key) => (
                  <LimitField key={key} limitKey={key} />
                ))}
              </div>
            </IconSectionCard>
            <PlanFeaturesField />
          </div>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-6 xl:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <p className="body-sm-medium text-primary-500">Live preview</p>
              <SegmentedControl
                options={[
                  { value: "MONTHLY" as const, label: "Monthly", icon: <CalendarDays /> },
                  { value: "YEARLY" as const, label: "Yearly", icon: <CalendarRange /> },
                ]}
                value={previewCycle}
                onChange={setPreviewCycle}
              />
            </div>
            <div className="pt-3">
              <PricingCard plan={preview} cycle={previewCycle} showMissing />
            </div>
            <PlanImpactCard subscribers={subscribers} mrr={planMrr} limits={limits} removedFeatures={removedFeatures} isNew={isNew} />
          </aside>
        </div>

        <PlanSaveBar
          isNew={isNew}
          isDirty={form.formState.isDirty}
          isSaving={isSaving}
          archived={!!plan?.archived}
          onCancel={() => router.push("/plans")}
          onArchive={plan ? () => archive.requestArchive(plan) : undefined}
          onRestore={plan ? () => void archive.restore(plan) : undefined}
        />
      </form>

      <ConfirmModal
        isOpen={confirmOver}
        title="Save with lower limits?"
        subtitle={`${overCount} institution${overCount === 1 ? " is" : "s are"} already over the new limits.`}
        message="They keep their existing data but won't be able to add more students, courses, seats or files until they upgrade or reduce usage."
        confirmLabel="Save anyway"
        pendingLabel="Saving..."
        confirmIcon={<Save className="h-4 w-4" />}
        onClose={() => setConfirmOver(false)}
        onConfirm={() => persist(form.getValues())}
      />
      {archive.modals}
    </FormProvider>
  );
}

export default PlanEditorForm;
