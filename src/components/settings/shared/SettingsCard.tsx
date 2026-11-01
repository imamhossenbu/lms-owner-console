"use client";

import React from "react";
import { IconSectionCard, type IconSectionTone } from "@/components/ui/IconSectionCard";
import { cn } from "@/lib/cn";

export interface SettingsCardProps {
  title: string;
  description?: string;
  /** Sized lucide icon, e.g. <Globe className="h-5 w-5" />. */
  icon?: React.ReactNode;
  /** Icon tile colour (default orange). */
  tone?: IconSectionTone;
  /** Header right side (CardActionButton, badge, toggle …). */
  action?: React.ReactNode;
  /** Usually a list of SettingsRow / SettingToggleRow — rows get dividers automatically. */
  children: React.ReactNode;
  /** Set false for free-form bodies that shouldn't get row dividers. */
  divided?: boolean;
  className?: string;
}

/**
 * A group of related settings: IconSectionCard header + a container-query body whose direct
 * children (rows) are separated by dashed-token dividers.
 */
export function SettingsCard({ title, description, icon, tone = "orange", action, children, divided = true, className }: SettingsCardProps) {
  if (!icon) {
    return (
      <section className={cn("dashboard-card shadow-2xs p-5", className)}>
        <header className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="body-md-medium font-semibold! text-primary-500">{title}</h3>
            {description && <p className="mt-0.5 body-sm-regular text-primary-300">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
        <div className={cn("@container mt-4", divided && "divide-y divide-dash border-t border-dash")}>{children}</div>
      </section>
    );
  }

  return (
    <IconSectionCard
      icon={icon}
      title={title}
      description={description}
      tone={tone}
      action={action}
      className={className}
      bodyClassName={cn("@container mt-4", divided && "divide-y divide-dash border-t border-dash")}
    >
      {children}
    </IconSectionCard>
  );
}

export default SettingsCard;
