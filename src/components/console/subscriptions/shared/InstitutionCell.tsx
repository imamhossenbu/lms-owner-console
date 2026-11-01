import React from "react";
import Link from "next/link";
import type { Institution } from "@/types/saas";
import { SAAS_ROOT_DOMAIN } from "@/types/saas";
import { InstitutionAvatar } from "@/components/console/shared/InstitutionAvatar";

interface InstitutionCellProps {
  institution: Institution | undefined;
  /** Second line (default: `<slug>.edupro.com`). */
  sub?: string;
  /** Link the name to /console/institutions/[id]. */
  link?: boolean;
}

/** Avatar + name + subdomain for console tables (truncates, full text in title). */
export function InstitutionCell({ institution, sub, link = false }: InstitutionCellProps) {
  if (!institution) return <span className="body-sm-regular text-primary-300">Unknown institution</span>;
  const second = sub ?? `${institution.slug}.${SAAS_ROOT_DOMAIN}`;
  const name = (
    <span className="block truncate body-sm-medium text-primary-500" title={institution.name}>
      {institution.name}
    </span>
  );
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <InstitutionAvatar initials={institution.logoInitials} tone={institution.tone} />
      <div className="min-w-0">
        {link ? (
          <Link href={`/institutions/${institution.id}`} onClick={(e) => e.stopPropagation()} className="block min-w-0 hover:underline">
            {name}
          </Link>
        ) : (
          name
        )}
        <span className="block truncate body-xsm-regular text-primary-300" title={second}>
          {second}
        </span>
      </div>
    </div>
  );
}

export default InstitutionCell;
