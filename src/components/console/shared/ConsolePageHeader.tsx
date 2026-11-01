"use client";

import React from "react";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { ConsoleHeader } from "../subscriptions/shared/ConsoleHeader";

export interface ConsolePageHeaderProps {
  /** Trail after the 🏠 icon, e.g. [{ label: "Institutions", href: "/institutions" }, { label: "Add" }]. */
  trail: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Alias of ConsoleHeader (kept for existing callers) — one header design across the console, matching the panel. */
export function ConsolePageHeader({ trail, ...rest }: ConsolePageHeaderProps) {
  return <ConsoleHeader crumbs={trail} {...rest} />;
}

export default ConsolePageHeader;
