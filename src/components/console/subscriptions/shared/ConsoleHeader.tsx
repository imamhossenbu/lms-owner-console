"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";

/** 🏠 Console › … trail root (links to the console overview, not the institution dashboard). */
export const CONSOLE_CRUMB: BreadcrumbItem = { label: "Console", href: "/", icon: <Home className="h-4 w-4" /> };

interface ConsoleHeaderProps {
  /** Trail after "Console", e.g. [{ label: "Invoices", href: "/invoices" }, { label: "EDP-2026-00012" }]. */
  crumbs: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Badge(s) beside the title. */
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Page header for Owner Console pages: console breadcrumb, title (+ badge), subtitle and right-side actions. */
export function ConsoleHeader({ crumbs, title, subtitle, badge, actions }: ConsoleHeaderProps) {
  return (
    <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Breadcrumb showHome={false} items={[CONSOLE_CRUMB, ...crumbs]} className="mb-1.5" />
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="heading-h3 text-primary-500 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1 body-sm-regular text-primary-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export default ConsoleHeader;
