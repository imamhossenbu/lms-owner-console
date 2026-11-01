"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CalendarRange, Plus } from "lucide-react";
import { useUrlParams } from "@/lib/useUrlParams";
import { revenueByPlan, planDistribution, mrr, formatMoney } from "@/lib/saasStats";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { useConsoleSaas } from "@/components/console/subscriptions/shared/useConsoleSaas";
import { PricingCard } from "./PricingCard";
import { PlanCardFooter } from "./PlanCardFooter";
import { PlanComparisonTable } from "./PlanComparisonTable";
import { PlansSkeleton } from "./PlansSkeleton";
import { usePlanArchive } from "./usePlanArchive";
import { cycleFromParam, yearlyDiscountPct } from "./planUtils";

/** /console/plans — pricing cards as institutions see them (+ owner stats) and the comparison matrix. */
export function PlansView() {
  const router = useRouter();
  const { get, set } = useUrlParams();
  const { store, ready } = useConsoleSaas();
  const cycle = cycleFromParam(get("cycle"));
  const archive = usePlanArchive(store);

  const stats = useMemo(() => {
    const revenue = Object.fromEntries(revenueByPlan(store).map((r) => [r.planId, r]));
    const dist = Object.fromEntries(planDistribution(store).map((d) => [d.planId, d]));
    return { revenue, dist, total: mrr(store) };
  }, [store]);

  if (!ready) return <PlansSkeleton />;

  const plans = store.plans;
  const maxDiscount = Math.max(0, ...plans.map((p) => yearlyDiscountPct(p.priceMonthly, p.priceYearly)));

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Plans & pricing" }]}
        title="Plans & pricing"
        subtitle="What institutions pay, the limits they get and which features each tier unlocks."
        actions={
          <PrimaryButton type="button" size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/plans/new")}>
            Create plan
          </PrimaryButton>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SegmentedControl
            options={[
              { value: "MONTHLY" as const, label: "Monthly", icon: <CalendarDays /> },
              { value: "YEARLY" as const, label: "Yearly", icon: <CalendarRange /> },
            ]}
            value={cycle}
            onChange={(next) => set({ cycle: next === "YEARLY" ? "yearly" : null })}
          />
          {maxDiscount > 0 && (
            <ToneBadge tone="green" variant="pill">
              Save {maxDiscount}% yearly
            </ToneBadge>
          )}
        </div>
        <p className="body-sm-regular text-primary-300">
          Total MRR <span className="body-sm-medium text-primary-500">{formatMoney(stats.total)}</span> across {plans.length} plans
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-3 md:grid-cols-2 2xl:grid-cols-4">
        <AnimatePresence initial={false}>
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              index={i}
              footer={
                <PlanCardFooter
                  planId={plan.id}
                  subscribers={stats.dist[plan.id]?.count ?? 0}
                  trialing={stats.dist[plan.id]?.trialing ?? 0}
                  mrr={stats.revenue[plan.id]?.mrr ?? 0}
                  archived={!!plan.archived}
                  onArchive={() => archive.requestArchive(plan)}
                  onRestore={() => void archive.restore(plan)}
                />
              }
            />
          ))}
        </AnimatePresence>
      </div>

      <section className="rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <h2 className="heading-h5 font-semibold! text-primary-500">Feature comparison</h2>
        <p className="mb-4 mt-0.5 body-sm-regular text-primary-300">Limits and features included in each plan.</p>
        <PlanComparisonTable plans={plans} />
      </section>

      {archive.modals}
    </motion.div>
  );
}

export default PlansView;
