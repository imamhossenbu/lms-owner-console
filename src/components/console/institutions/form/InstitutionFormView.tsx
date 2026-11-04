"use client";

import React from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { ConsolePageHeader } from "../../shared/ConsolePageHeader";
import { ConsoleEmptyState } from "../../shared/ConsoleEmptyState";
import { useNow } from "../../shared/useNow";
import { InstitutionForm } from "./InstitutionForm";
import { InstitutionFormSkeleton } from "./InstitutionFormSkeleton";

/** /console/institutions/new and /console/institutions/[id]/edit. */
export function InstitutionFormView({ institutionId }: { institutionId?: string }) {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  if (!ready || !store.plans.length || !now) return <InstitutionFormSkeleton mode={institutionId ? "edit" : "create"} />;

  const institution = institutionId ? store.institutions.find((i) => i.id === institutionId) : undefined;
  const editing = !!institutionId;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsolePageHeader
        trail={[
          { label: "Institutions", href: "/institutions" },
          ...(editing ? [{ label: institution?.name ?? "Not found", href: institution ? `/institutions/${institution.id}` : undefined }, { label: "Edit" }] : [{ label: "Add institution" }]),
        ]}
        title={editing ? (institution ? `Edit ${institution.name}` : "Institution not found") : "Add institution"}
        subtitle={editing ? "Update details, owner contact and subdomain." : "Create a tenant manually — it goes live on its own subdomain right away."}
      />
      {editing && !institution ? (
        <div className="dashboard-card shadow-2xs">
          <ConsoleEmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="This institution doesn't exist"
            message="It may have been removed. Pick one from the list."
            actionLabel="All institutions"
            onAction={() => router.push("/institutions")}
          />
        </div>
      ) : (
        <InstitutionForm key={institution?.id ?? "new"} mode={editing ? "edit" : "create"} plans={store.plans} institution={institution} now={now} />
      )}
    </motion.div>
  );
}

export default InstitutionFormView;
