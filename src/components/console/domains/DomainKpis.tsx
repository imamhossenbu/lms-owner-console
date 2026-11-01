import React from "react";
import { AlertTriangle, Clock, Globe, Link2, ShieldCheck } from "lucide-react";
import { TrendStatCard } from "@/components/ui/TrendStatCard";
import type { DomainRow } from "./domainUtils";

/** Default subdomains, custom domains, verified, pending, failing. */
export function DomainKpis({ rows, subdomains }: { rows: DomainRow[]; subdomains: number }) {
  const count = (s: string) => rows.filter((r) => r.domain.status === s).length;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <TrendStatCard icon={<Link2 />} iconClassName="bg-gray-bg text-primary-400" label="Default subdomains" value={subdomains.toLocaleString()} />
      <TrendStatCard icon={<Globe />} iconClassName="bg-blue-14 text-blue" label="Custom domains" value={rows.length.toLocaleString()} />
      <TrendStatCard icon={<ShieldCheck />} iconClassName="bg-green-bg text-green" label="Verified" value={count("VERIFIED").toLocaleString()} />
      <TrendStatCard icon={<Clock />} iconClassName="bg-yellow-bg text-yellow" label="Pending DNS" value={count("PENDING_DNS").toLocaleString()} />
      <TrendStatCard icon={<AlertTriangle />} iconClassName="bg-red-14 text-red" label="Failing" value={count("FAILED").toLocaleString()} />
    </div>
  );
}

export default DomainKpis;
