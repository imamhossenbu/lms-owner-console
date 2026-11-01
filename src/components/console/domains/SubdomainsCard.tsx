"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import type { Institution } from "@/types/saas";
import { SAAS_ROOT_DOMAIN } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";
import { relativeTime, tenantHost } from "@/components/console/shared/consoleMeta";

/** Default `<slug>.edupro.com` addresses — count + the newest ones. */
export function SubdomainsCard({ institutions }: { institutions: Institution[] }) {
  const live = institutions.filter((i) => i.subscription.status !== "CANCELLED");
  const latest = [...live].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="dashboard-card shadow-2xs p-5">
      <header className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-bg text-primary-400">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="body-md-medium font-semibold! text-primary-500">Default subdomains</h3>
          <p className="mt-0.5 body-sm-regular text-primary-300">Issued automatically on *.{SAAS_ROOT_DOMAIN} with wildcard SSL.</p>
        </div>
        <ToneBadge tone="gray" variant="pill">
          {live.length} live
        </ToneBadge>
      </header>
      <ul className="mt-4 divide-y divide-dash">
        {latest.map((i) => (
          <li key={i.id} className="flex items-center gap-3 py-2.5">
            <InstitutionAvatar initials={i.logoInitials} tone={i.tone} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono body-xsm-medium text-primary-500" title={tenantHost(i.slug)}>
                {tenantHost(i.slug)}
              </p>
              <p className="truncate body-2xsm-regular text-primary-300">{i.name}</p>
            </div>
            <span className="shrink-0 body-2xsm-regular text-primary-300">{relativeTime(i.createdAt)}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

export default SubdomainsCard;
