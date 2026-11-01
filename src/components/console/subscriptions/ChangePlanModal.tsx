"use client";

import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CalendarDays, CalendarRange, RefreshCw } from "lucide-react";
import type { Institution, Plan } from "@/types/saas";
import { BILLING_CYCLES } from "@/types/saas";
import { changePlan } from "@/lib/saasStorage";
import { formatMoney, planChangePreview, priceFor } from "@/lib/saasStats";
import { LIMIT_META, formatLimit } from "@/lib/planAccess";
import { ModalShell } from "@/components/ui/ModalShell";
import { ChoiceCardGroup } from "@/components/ui/ChoiceCardGroup";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ToneBadge, type Tone } from "@/components/ui/ToneBadge";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";

const changePlanSchema = z.object({ planId: z.string({ error: "Choose a plan" }).min(1, "Choose a plan"), cycle: z.enum(BILLING_CYCLES) });
type ChangePlanValues = z.infer<typeof changePlanSchema>;

const KIND: Record<string, { label: string; tone: Tone }> = {
  UPGRADE: { label: "Upgrade", tone: "green" },
  DOWNGRADE: { label: "Downgrade", tone: "yellow" },
  CYCLE: { label: "Cycle change", tone: "blue" },
  SAME: { label: "No change", tone: "gray" },
};

interface ChangePlanModalProps {
  institution: Institution | null;
  plans: Plan[];
  onClose: () => void;
}

/** Owner-initiated plan / cycle change with a live proration preview and limit blockers. */
export function ChangePlanModal({ institution, plans, onClose }: ChangePlanModalProps) {
  const form = useForm<ChangePlanValues>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: { planId: institution?.subscription.planId ?? "growth", cycle: institution?.subscription.cycle ?? "MONTHLY" },
  });
  const { control, handleSubmit, reset, formState } = form;
  const [planId, cycle] = useWatch({ control, name: ["planId", "cycle"] });

  useEffect(() => {
    if (institution) reset({ planId: institution.subscription.planId, cycle: institution.subscription.cycle });
  }, [institution, reset]);

  if (!institution) return null;
  const preview = planChangePreview(plans, institution, planId, cycle);
  const options = plans
    .filter((p) => !p.archived || p.id === institution.subscription.planId)
    .map((p) => ({
      value: p.id,
      title: p.name,
      description: priceFor(p, cycle) > 0 ? `${formatMoney(priceFor(p, cycle))}/${cycle === "YEARLY" ? "yr" : "mo"}` : "Custom price",
    }));
  const delta = preview.nextMonthly - preview.currentMonthly;
  const blocked = preview.blockers.length > 0 || preview.kind === "SAME";

  const submit = handleSubmit(async (values) => {
    const id = toast.loading("Changing plan...", { description: institution.name });
    try {
      const result = await changePlan(institution.id, values.planId, values.cycle);
      toast.success("Plan changed", {
        id,
        description: result.invoice ? `${institution.name} was charged ${formatMoney(result.invoice.total, { cents: true })} (${result.invoice.number}).` : `${institution.name} is now on the new plan.`,
      });
      onClose();
    } catch (err) {
      toast.error("Couldn't change the plan", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  });

  return (
    <ModalShell
      isOpen={!!institution}
      onClose={formState.isSubmitting ? () => {} : onClose}
      title="Change plan"
      subtitle="Upgrades are prorated for the rest of the current period."
      maxWidth="lg"
      footer={
        <>
          <SecondaryButton type="button" onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" onClick={submit} isLoading={formState.isSubmitting} disabled={formState.isSubmitting || blocked} leftIcon={<RefreshCw className="h-4 w-4" />}>
            {formState.isSubmitting ? "Changing..." : "Change plan"}
          </PrimaryButton>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-dash bg-gray-bg px-3.5 py-3">
          <InstitutionAvatar initials={institution.logoInitials} tone={institution.tone} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate body-sm-medium text-primary-500">{institution.name}</p>
            <p className="body-xsm-regular text-primary-300">
              Currently {plans.find((p) => p.id === institution.subscription.planId)?.name} · {institution.subscription.cycle === "YEARLY" ? "Yearly" : "Monthly"}
            </p>
          </div>
          <Controller
            control={control}
            name="cycle"
            render={({ field }) => (
              <SegmentedControl
                options={[
                  { value: "MONTHLY" as const, label: "Monthly", icon: <CalendarDays /> },
                  { value: "YEARLY" as const, label: "Yearly", icon: <CalendarRange /> },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="planId"
          render={({ field, fieldState }) => (
            <>
              <ChoiceCardGroup name="change-plan" value={field.value} onChange={field.onChange} options={options} columns={options.length >= 4 ? 4 : 3} aria-label="Plan" />
              {fieldState.error && <p className="body-xsm-regular text-red">{fieldState.error.message}</p>}
            </>
          )}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${planId}-${cycle}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3 rounded-xl border border-dash p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <ToneBadge tone={KIND[preview.kind].tone}>{KIND[preview.kind].label}</ToneBadge>
              <p className="flex items-center gap-1.5 body-sm-medium text-primary-500">
                {formatMoney(preview.currentPrice)} <ArrowRight className="h-3.5 w-3.5 text-primary-300" /> {formatMoney(preview.nextPrice)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 body-xsm-regular">
              <div>
                <dt className="text-primary-300">MRR impact</dt>
                <dd className={delta >= 0 ? "body-sm-medium text-green" : "body-sm-medium text-red"}>
                  {delta >= 0 ? "+" : "−"}
                  {formatMoney(Math.abs(Math.round(delta * 100) / 100))}/mo
                </dd>
              </div>
              <div>
                <dt className="text-primary-300">Charged now</dt>
                <dd className="body-sm-medium text-primary-500">{preview.trialing ? "Nothing (trial)" : formatMoney(preview.dueNow, { cents: true })}</dd>
              </div>
            </dl>
            {preview.kind === "DOWNGRADE" && !preview.trialing && <p className="body-xsm-regular text-primary-300">Downgrades apply immediately with no refund for the current period.</p>}
            {preview.blockers.length > 0 && (
              <div className="rounded-lg border border-red bg-red-14 p-3">
                <p className="flex items-center gap-1.5 body-xsm-medium text-red-dark">
                  <AlertTriangle className="h-3.5 w-3.5" /> Usage exceeds this plan&apos;s limits
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {preview.blockers.map((b) => (
                    <ToneBadge key={b.key} tone="red" size="sm">
                      {LIMIT_META[b.key].label} {formatLimit(b.usage, b.key)} / {formatLimit(b.limit, b.key)}
                    </ToneBadge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>
    </ModalShell>
  );
}

export default ChangePlanModal;
