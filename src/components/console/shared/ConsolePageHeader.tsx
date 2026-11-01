"use client";

import React from "react";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";

export interface ConsolePageHeaderProps {
  /** Trail after "🏠 Console", e.g. [{ label: "Institutions", href: "/institutions" }, { label: "Add" }]. */
  trail: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

const CONSOLE_HOME: BreadcrumbItem = { label: "Console", href: "/", icon: <Home className="h-4 w-4" /> };

/** Shared PageHeader with the console breadcrumb (🏠 Console › …). No back buttons. */
export function ConsolePageHeader({ trail, title, subtitle, badge, actions }: ConsolePageHeaderProps) {
  const items = trail.length ? [CONSOLE_HOME, ...trail] : [{ ...CONSOLE_HOME, href: undefined }];
  return (
    <div className="space-y-2.5">
      <Breadcrumb items={items} showHome={false} />
      <PageHeader title={title} subtitle={subtitle} badge={badge} action={actions} className="mb-0" />
    </div>
  );
}

export default ConsolePageHeader;
