import type { CustomDomain, CustomDomainStatus, Institution } from "@/types/saas";

export interface DomainRow {
  id: string;
  institution: Institution;
  domain: CustomDomain;
}

export const DOMAIN_STATUS_FILTERS: CustomDomainStatus[] = ["VERIFIED", "PENDING_DNS", "FAILED"];

/** Failing first, then pending, then verified; newest first within a status. */
const ORDER: Record<CustomDomainStatus, number> = { FAILED: 0, PENDING_DNS: 1, VERIFIED: 2 };

export function buildDomainRows(institutions: Institution[]): DomainRow[] {
  return institutions
    .filter((i): i is Institution & { customDomain: CustomDomain } => !!i.customDomain)
    .map((i) => ({ id: i.id, institution: i, domain: i.customDomain }))
    .sort((a, b) => ORDER[a.domain.status] - ORDER[b.domain.status] || b.domain.addedAt.localeCompare(a.domain.addedAt));
}

/** Plain-text DNS records for the clipboard. */
export const dnsRecordsText = (d: CustomDomain) => `CNAME  ${d.domain}  →  ${d.dnsTarget}\nTXT    _edupro-verify.${d.domain}  →  ${d.txtToken}`;
