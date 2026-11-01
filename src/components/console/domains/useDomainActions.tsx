"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, ClipboardCopy, ShieldCheck, Trash2 } from "lucide-react";
import { removeCustomDomain, verifyCustomDomain } from "@/lib/saasStorage";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { tenantHost } from "@/components/console/shared/consoleMeta";
import { dnsRecordsText, type DomainRow } from "./domainUtils";

/** Verify / copy DNS / remove actions for custom domains. */
export function useDomainActions() {
  const router = useRouter();
  const [verifying, setVerifying] = useState<string | null>(null);
  const [removing, setRemoving] = useState<DomainRow | null>(null);

  const verify = async (row: DomainRow) => {
    setVerifying(row.id);
    const id = toast.loading("Checking DNS records...", { description: row.domain.domain });
    try {
      await verifyCustomDomain(row.id);
      toast.success("Domain verified", { id, description: `${row.domain.domain} is live with SSL.` });
    } catch (err) {
      toast.error("Verification failed", { id, description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setVerifying(null);
    }
  };

  const copyDns = async (row: DomainRow) => {
    try {
      await navigator.clipboard.writeText(dnsRecordsText(row.domain));
      toast.success("DNS records copied", { description: "Send them to the institution's IT contact." });
    } catch {
      toast.error("Couldn't copy", { description: "Your browser blocked clipboard access." });
    }
  };

  const getMenuItems = (row: DomainRow): DropdownActionItem[] => [
    { key: "verify", label: row.domain.status === "VERIFIED" ? "Re-check DNS" : "Verify now", icon: <ShieldCheck className="h-4 w-4" />, disabled: verifying === row.id, onClick: () => void verify(row) },
    { key: "copy", label: "Copy DNS records", icon: <ClipboardCopy className="h-4 w-4" />, onClick: () => void copyDns(row) },
    { key: "view", label: "View institution", icon: <Building2 className="h-4 w-4" />, onClick: () => router.push(`/institutions/${row.id}`) },
    { key: "remove", label: "Remove domain", icon: <Trash2 className="h-4 w-4" />, danger: true, separatorBefore: true, onClick: () => setRemoving(row) },
  ];

  const modals = (
    <ConfirmModal
      isOpen={!!removing}
      title={`Remove ${removing?.domain.domain ?? "domain"}?`}
      subtitle={removing?.institution.name}
      message={`Visitors to this domain will stop reaching the academy. It stays available at ${removing ? tenantHost(removing.institution.slug) : "its subdomain"}.`}
      confirmLabel="Remove domain"
      pendingLabel="Removing..."
      confirmIcon={<Trash2 className="h-4 w-4" />}
      onClose={() => setRemoving(null)}
      onConfirm={async () => {
        if (!removing) return;
        const id = toast.loading("Removing domain...", { description: removing.domain.domain });
        try {
          await removeCustomDomain(removing.id);
          toast.success("Domain removed", { id, description: `${removing.institution.name} is back on ${tenantHost(removing.institution.slug)}.` });
        } catch (err) {
          toast.error("Couldn't remove the domain", { id, description: err instanceof Error ? err.message : "Please try again." });
          throw err;
        }
      }}
    />
  );

  return { verify, verifying, getMenuItems, modals };
}

export default useDomainActions;
