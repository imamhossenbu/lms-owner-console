"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, BarChart3, CreditCard, Globe, LayoutGrid, SearchX } from "lucide-react";
import { PillTabs } from "@/components/ui/PillTabs";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { useUrlParams } from "@/lib/useUrlParams";
import { nearLimit, trialDaysLeft } from "@/lib/saasStats";
import { ConsoleEmptyState } from "../../shared/ConsoleEmptyState";
import { ConsolePageHeader } from "../../shared/ConsolePageHeader";
import { useNow } from "../../shared/useNow";
import { useInstitutionActions } from "../actions/useInstitutionActions";
import { useInstitutionDialogs } from "../actions/useInstitutionDialogs";
import { DetailHeader } from "./DetailHeader";
import { DetailSkeleton } from "./DetailSkeleton";
import { DETAIL_TABS, parseDetailTab, type DetailTab } from "./detailTabs";
import { OwnerContactCard } from "./overview/OwnerContactCard";
import { SubscriptionCard } from "./overview/SubscriptionCard";
import { PlanFeaturesCard } from "./overview/PlanFeaturesCard";
import { NotesCard } from "./overview/NotesCard";
import { UsageTab } from "./usage/UsageTab";
import { BillingTab } from "./billing/BillingTab";
import { DomainTab } from "./domain/DomainTab";
import { ActivityTab } from "./activity/ActivityTab";
import { Home } from "lucide-react";

const TAB_ICON: Record<DetailTab, React.ReactNode> = {
  overview: <LayoutGrid />,
  usage: <BarChart3 />,
  billing: <CreditCard />,
  domain: <Globe />,
  activity: <Activity />,
};

/** /console/institutions/[id] — profile header + ?tab=overview|usage|billing|domain|activity. Render inside <Suspense>. */
export function InstitutionDetailView({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const { get, set } = useUrlParams();
  const tab = parseDetailTab(get("tab"));
  const actions = useInstitutionActions();
  const { open, dialogs } = useInstitutionDialogs(store.plans, actions);
  const inst = useMemo(() => store.institutions.find((i) => i.id === institutionId), [store.institutions, institutionId]);

  if (!ready || !store.institutions.length || !now) return <DetailSkeleton tab={tab} />;

  if (!inst)
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
        <ConsolePageHeader trail={[{ label: "Institutions", href: "/institutions" }, { label: "Not found" }]} title="Institution not found" />
        <div className="dashboard-card shadow-2xs">
          <ConsoleEmptyState icon={<SearchX className="h-6 w-6" />} title="This institution doesn't exist" message="It may have been removed or the link is wrong." actionLabel="All institutions" onAction={() => router.push("/institutions")} />
        </div>
      </motion.div>
    );

  const plan = store.plans.find((p) => p.id === inst.subscription.planId);
  const s = inst.subscription;
  const canChangePlan = s.status !== "CANCELLED" && s.status !== "SUSPENDED";
  const changePlan = canChangePlan ? () => open.changePlan(inst) : undefined;
  const invoiceCount = store.invoices.filter((i) => i.institutionId === inst.id).length;
  const unpaid = store.invoices.some((i) => i.institutionId === inst.id && (i.status === "FAILED" || i.status === "OPEN"));
  const tabs = DETAIL_TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: TAB_ICON[t.id],
    count: t.id === "billing" ? invoiceCount : undefined,
    hasError: (t.id === "billing" && unpaid) || (t.id === "domain" && inst.customDomain?.status === "FAILED") || (t.id === "usage" && nearLimit(inst, plan, 100).length > 0),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <Breadcrumb
        showHome={false}
        items={[{ label: "Console", href: "/", icon: <Home className="h-4 w-4" /> }, { label: "Institutions", href: "/institutions" }, { label: inst.name }]}
      />
      <DetailHeader institution={inst} plans={store.plans} open={open} trialLeft={trialDaysLeft(inst, now)} />

      <PillTabs<DetailTab> ariaLabel="Institution sections" idPrefix="inst" tabs={tabs} activeId={tab} onChange={(next) => set({ tab: next === "overview" ? null : next, events: null })} />

      <motion.div key={tab} role="tabpanel" id={`inst-panel-${tab}`} aria-labelledby={`inst-tab-${tab}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="space-y-5">
              <OwnerContactCard institution={inst} now={now} />
              <NotesCard notes={inst.notes} onSave={(notes) => actions.saveNotes(inst, notes)} />
            </div>
            <div className="space-y-5">
              <SubscriptionCard institution={inst} plans={store.plans} onChangePlan={changePlan} />
              <PlanFeaturesCard plan={plan} plans={store.plans} />
            </div>
          </div>
        )}
        {tab === "usage" && <UsageTab institution={inst} plan={plan} onChangePlan={changePlan} />}
        {tab === "billing" && <BillingTab institution={inst} invoices={store.invoices} plans={store.plans} actions={actions} />}
        {tab === "domain" && <DomainTab institution={inst} plans={store.plans} actions={actions} onChangePlan={changePlan} />}
        {tab === "activity" && <ActivityTab institution={inst} events={store.events} now={now} />}
      </motion.div>
      {dialogs}
    </motion.div>
  );
}

export default InstitutionDetailView;
