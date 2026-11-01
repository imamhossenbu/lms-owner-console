"use client";

import React from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";

interface ConsoleHeaderProps {
  /** Trail after the 🏠 icon, e.g. [{ label: "Invoices", href: "/invoices" }, { label: "EDP-2026-00012" }]. Empty = no breadcrumb (Overview). */
  crumbs: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Badge(s) beside the title. */
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Page header — identical to the panel's list/detail headers (OrdersHeader): 🏠 › trail, heading-h3 title, subtitle, actions. */
export function ConsoleHeader({ crumbs, title, subtitle, badge, actions }: ConsoleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
      <div className="min-w-0">
        {crumbs.length > 0 && <Breadcrumb items={crumbs} className="mb-1.5" />}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="heading-h3 text-primary-500 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="body-sm-regular text-primary-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export default ConsoleHeader;
