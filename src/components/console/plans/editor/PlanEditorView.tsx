"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { useConsoleSaas } from "@/components/console/subscriptions/shared/useConsoleSaas";
import { PlanEditorForm } from "./PlanEditorForm";
import { PlanEditorSkeleton } from "./PlanEditorSkeleton";

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-light text-brand-orange">{icon}</span>
      <p className="mt-3 body-medium text-primary-500">{title}</p>
      <div className="mt-1 max-w-md body-sm-regular text-primary-300">{message}</div>
      <Link href="/plans" className="mt-4 body-sm-medium text-brand-orange hover:underline">
        Go to Plans & pricing
      </Link>
    </div>
  );
}

/** /console/plans/[id]/edit and /console/plans/new. */
export function PlanEditorView({ planId }: { planId?: string }) {
  const { store, ready } = useConsoleSaas();
  if (!ready) return <PlanEditorSkeleton />;

  const plan = planId ? store.plans.find((p) => p.id === planId) : undefined;
  const title = planId ? (plan ? `Edit ${plan.name}` : "Plan not found") : "Create plan";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Plans & pricing", href: "/plans" }, { label: planId ? plan?.name ?? "Not found" : "Create plan" }]}
        title={title}
        badge={
          plan?.archived ? (
            <ToneBadge tone="gray">Archived</ToneBadge>
          ) : plan && !plan.isPublic ? (
            <ToneBadge tone="navy">Sales only</ToneBadge>
          ) : undefined
        }
        subtitle={planId ? "Changes go live on the pricing page as soon as you save." : "Define pricing, limits and features for a new custom plan."}
      />
      {planId && !plan ? (
        <EmptyState icon={<SearchX className="h-6 w-6" />} title="This plan doesn't exist" message="It may have been removed. Pick a plan from the list to edit it." />
      ) : (
        <PlanEditorForm key={plan?.id ?? "new"} store={store} plan={plan} />
      )}
    </motion.div>
  );
}

export default PlanEditorView;
