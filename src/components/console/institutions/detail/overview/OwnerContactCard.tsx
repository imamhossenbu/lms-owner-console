import React from "react";
import { CalendarDays, Clock, Mail, MapPin, Phone, User, UserPlus } from "lucide-react";
import type { Institution } from "@/types/saas";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { formatDate, relativeTime } from "../../../shared/consoleMeta";

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-bg text-primary-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="w-24 shrink-0 body-sm-regular text-primary-300">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 body-sm-medium text-primary-500">{children}</div>
    </div>
  );
}

/** Owner contact + account facts (country, created, source, last active). */
export function OwnerContactCard({ institution: i, now }: { institution: Institution; now: number }) {
  return (
    <IconSectionCard icon={<User className="h-5 w-5" />} tone="purple" title="Owner contact" description="Account owner — receives billing emails.">
      <div className="divide-y divide-dash">
        <Row icon={<User />} label="Name">
          <span className="truncate">{i.ownerName}</span>
        </Row>
        <Row icon={<Mail />} label="Email">
          <a href={`mailto:${i.ownerEmail}`} className="truncate text-blue hover:underline" title={i.ownerEmail}>
            {i.ownerEmail}
          </a>
          <CopyButton value={i.ownerEmail} label="Email copied" />
        </Row>
        <Row icon={<Phone />} label="Phone">
          {i.phone ? <span className="truncate">{i.phone}</span> : <span className="body-sm-regular text-primary-300">Not provided</span>}
        </Row>
        <Row icon={<MapPin />} label="Country">
          <span className="truncate">{i.country}</span>
        </Row>
        <Row icon={<CalendarDays />} label="Created">
          <span className="truncate">{formatDate(i.createdAt)}</span>
          <ToneBadge tone={i.source === "SELF_SIGNUP" ? "blue" : "purple"} size="sm" variant="pill" icon={<UserPlus className="h-3 w-3" />}>
            {i.source === "SELF_SIGNUP" ? "Self-signup" : "Created by owner"}
          </ToneBadge>
        </Row>
        <Row icon={<Clock />} label="Last active">
          <span className="truncate" title={formatDate(i.lastActiveAt)}>
            {relativeTime(i.lastActiveAt, now)}
          </span>
        </Row>
      </div>
    </IconSectionCard>
  );
}

export default OwnerContactCard;
